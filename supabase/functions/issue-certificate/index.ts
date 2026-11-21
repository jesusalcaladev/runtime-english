// Supabase Edge Function: emisión/registro seguro de certificados (producción)
// - Requiere JWT válido y vincula el certificado al usuario autenticado.
// - Valida elegibilidad en servidor antes de emitir (no emisión abierta).
// - CORS restringido por orígenes permitidos.
// Requiere (entorno): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
// Recomendado (entorno): ALLOWED_ORIGINS, CERT_REQUIRED_SESSIONS, CERT_REQUIRED_EXERCISES
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type LogLevel = "info" | "warn" | "error";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseAllowedOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS") || Deno.env.get("PUBLIC_APP_URL") || "";
  return raw
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

function resolveCorsOrigin(req: Request): { origin: string | null; allowed: boolean } {
  const allowed = parseAllowedOrigins();
  const origin = req.headers.get("Origin");
  // Sin configuración de orígenes: no permitir CORS cross-origin (endurecido por defecto).
  if (!allowed.length) return { origin: null, allowed: !origin };
  if (!origin) return { origin: null, allowed: true }; // requests server-to-server/same-origin sin Origin
  const normalized = origin.replace(/\/+$/, "");
  const ok = allowed.some((o) => o === "*" || o === normalized);
  return { origin: ok ? origin : null, allowed: ok };
}

function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  if (origin) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

function json(body: unknown, status = 200, origin: string | null = null, requestId?: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
      ...(requestId ? { "X-Request-Id": requestId } : {}),
    },
  });
}

function log(level: LogLevel, event: string, meta: Record<string, unknown> = {}) {
  const entry = { ts: new Date().toISOString(), level, event, ...meta };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function getRequestId(req: Request): string {
  return req.headers.get("x-request-id") || crypto.randomUUID();
}

function readCompletedCount(state: unknown, compactKey: string, expandedKey: string): number {
  if (!state || typeof state !== "object") return 0;
  const s = state as Record<string, unknown>;
  const candidate = s[compactKey] ?? s[expandedKey];
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return 0;
  return Object.keys(candidate as Record<string, unknown>).length;
}

function parsePositiveIntEnv(name: string): number | null {
  const raw = Deno.env.get(name);
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

type CertLevel = "A1-A2" | "B1-B2" | "C1-C2";

/** Umbrales por nivel; C1-C2 no está disponible todavía. */
const LEVEL_ELIGIBILITY: Record<CertLevel, { sessions: string; exercises: string } | null> = {
  "A1-A2": {
    sessions: "CERT_REQUIRED_SESSIONS_A1_A2",
    exercises: "CERT_REQUIRED_EXERCISES_A1_A2",
  },
  "B1-B2": {
    sessions: "CERT_REQUIRED_SESSIONS_B1_B2",
    exercises: "CERT_REQUIRED_EXERCISES_B1_B2",
  },
  "C1-C2": {
    sessions: "CERT_REQUIRED_SESSIONS_C1_C2",
    exercises: "CERT_REQUIRED_EXERCISES_C1_C2",
  },
};

/** Acepta también la etiqueta legacy "A1 — B2" de certificados de curso completo. */
function normalizeLevel(value: unknown): CertLevel | null {
  const raw = String(value ?? "").replace(/\s+/g, "");
  if (raw === "A1-A2" || raw === "A1—B2" || raw === "A1-B2") return "A1-A2";
  if (raw === "B1-B2") return "B1-B2";
  if (raw === "C1-C2") return "C1-C2";
  return null;
}

function parseCertLevel(value: unknown): CertLevel {
  return normalizeLevel(value) ?? "A1-A2";
}

function levelSlug(level: CertLevel): string {
  return level.replace(/-/g, "");
}

function requiredCountsFor(level: CertLevel): { sessions: number; exercises: number } | null {
  const config = LEVEL_ELIGIBILITY[level];
  if (!config) return null;
  const sessions =
    parsePositiveIntEnv(config.sessions) ?? parsePositiveIntEnv("CERT_REQUIRED_SESSIONS");
  const exercises =
    parsePositiveIntEnv(config.exercises) ?? parsePositiveIntEnv("CERT_REQUIRED_EXERCISES");
  if (sessions == null || exercises == null) return null;
  return { sessions, exercises };
}

async function validateEligibility(
  admin: ReturnType<typeof createClient>,
  userId: string,
  level: CertLevel,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!LEVEL_ELIGIBILITY[level]) {
    return { ok: false, status: 403, error: "level_not_available" };
  }
  const required = requiredCountsFor(level);
  if (!required) {
    return { ok: false, status: 503, error: "issuance_not_configured" };
  }

  const { data, error } = await admin
    .from("user_progress")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    log("error", "eligibility_progress_read_failed", { userId, message: error.message });
    return { ok: false, status: 500, error: "eligibility_check_failed" };
  }
  if (!data) return { ok: false, status: 403, error: "not_eligible" };

  const completedSessions = readCompletedCount(data.state, "cs", "completedSessions");
  const completedExercises = readCompletedCount(data.state, "ce", "completedExercises");
  if (completedSessions < required.sessions || completedExercises < required.exercises) {
    return { ok: false, status: 403, error: "not_eligible" };
  }

  // Desbloqueo progresivo: cada nivel exige el anterior completo.
  if (level === "B1-B2" || level === "C1-C2") {
    const previousLevel = level === "B1-B2" ? "A1-A2" : "B1-B2";
    const previous = requiredCountsFor(previousLevel);
    if (!previous) return { ok: false, status: 503, error: "issuance_not_configured" };
    if (completedSessions < previous.sessions || completedExercises < previous.exercises) {
      return { ok: false, status: 403, error: "previous_level_incomplete" };
    }
  }
  return { ok: true };
}

Deno.serve(async (req) => {
  const requestId = getRequestId(req);
  const { origin, allowed } = resolveCorsOrigin(req);

  if (req.method === "OPTIONS") {
    if (!allowed) return json({ error: "origin_not_allowed" }, 403, null, requestId);
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (!allowed) {
    log("warn", "origin_rejected", { requestId, origin: req.headers.get("Origin") });
    return json({ error: "origin_not_allowed" }, 403, null, requestId);
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, origin, requestId);
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !serviceKey || !anonKey) {
      log("error", "server_misconfigured", { requestId });
      return json({ error: "server_misconfigured" }, 500, origin, requestId);
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      log("warn", "missing_jwt", { requestId });
      return json({ error: "unauthorized" }, 401, origin, requestId);
    }

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    const userId = userData?.user?.id ?? null;
    if (userErr || !userId || !UUID_RE.test(userId)) {
      log("warn", "invalid_jwt", { requestId, reason: userErr?.message || "no_user" });
      return json({ error: "unauthorized" }, 401, origin, requestId);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ error: "invalid_json" }, 400, origin, requestId);
    }

    const b = body as Record<string, unknown>;
    const id = String(b.id || "").trim().toUpperCase();
    const name = String(b.name || "").trim();
    const issued_at = b.issued_at ? String(b.issued_at) : new Date().toISOString();
    const completion_date = b.completion_date ? String(b.completion_date) : null;
    const program = String(b.program || "RuntimeEnglish");
    const level = parseCertLevel(b.level);

    if (!id || !/^[A-Z0-9-]{4,32}$/.test(id)) return json({ error: "invalid_id" }, 400, origin, requestId);
    if (!name || name.length > 120) return json({ error: "invalid_name" }, 400, origin, requestId);

    const admin = createClient(url, serviceKey);

    // Idempotencia/conflictos primero (sin filtrar elegibilidad para certificados ya propios)
    const { data: existing, error: existingErr } = await admin
      .from("certificates")
      .select("id, name, issued_at, completion_date, program, level, status, user_id")
      .eq("id", id)
      .maybeSingle();
    if (existingErr) {
      log("error", "certificate_lookup_failed", { requestId, userId, message: existingErr.message });
      return json({ error: "issuance_failed" }, 500, origin, requestId);
    }

    if (existing) {
      if (existing.user_id && existing.user_id !== userId) {
        log("warn", "certificate_conflict", { requestId, userId, certId: id });
        return json({ error: "certificate_id_conflict" }, 409, origin, requestId);
      }
      // Un ID pertenece a un único nivel (los registros legacy usan "A1 — B2").
      const existingLevel = normalizeLevel(existing.level);
      if (existingLevel && existingLevel !== level) {
        return json({ error: "certificate_level_conflict" }, 409, origin, requestId);
      }
      // Vincular/actualizar solo si pertenece al usuario o está sin dueño (no hay emisión abierta nueva)
      const patch: Record<string, unknown> = {};
      if (!existing.user_id) {
        patch.user_id = userId;
        patch.issued_by = "user";
      }
      if (completion_date && !existing.completion_date) patch.completion_date = completion_date;
      if (name && existing.name !== name) patch.name = name;
      // Canonicalizar la etiqueta de nivel (p. ej. legacy "A1 — B2" -> "A1-A2").
      if (String(existing.level ?? "") !== level) patch.level = level;
      let cert = existing;
      if (Object.keys(patch).length) {
        const { data: updated, error: upErr } = await admin
          .from("certificates")
          .update(patch)
          .eq("id", id)
          .select("id, name, issued_at, completion_date, program, level, status, user_id")
          .single();
        if (upErr) {
          log("error", "certificate_update_failed", { requestId, userId, certId: id, message: upErr.message });
          return json({ error: "issuance_failed" }, 500, origin, requestId);
        }
        cert = updated as typeof cert;
      }
      log("info", "certificate_reused", { requestId, userId, certId: id, linked: Boolean(cert.user_id) });
      return json({ ok: true, id, certificate: cert, linked: Boolean(cert.user_id) }, 200, origin, requestId);
    }

    // Nueva emisión: el ID debe llevar el sufijo del nivel y superar la elegibilidad.
    if (!id.endsWith(`-${levelSlug(level)}`)) {
      return json({ error: "invalid_id_for_level" }, 400, origin, requestId);
    }
    const eligible = await validateEligibility(admin, userId, level);
    if (!eligible.ok) {
      log("warn", "issuance_denied", { requestId, userId, reason: eligible.error });
      return json({ error: eligible.error }, eligible.status, origin, requestId);
    }

    const record = {
      id,
      name,
      issued_at,
      completion_date,
      program,
      level,
      status: "valid",
      user_id: userId,
      issued_by: "user",
      metadata: { issued_via: "edge-function", linked_account: true },
    };

    const { data, error } = await admin
      .from("certificates")
      .insert(record)
      .select("id, name, issued_at, completion_date, program, level, status, user_id")
      .single();

    if (error) {
      log("error", "certificate_insert_failed", { requestId, userId, certId: id, message: error.message });
      return json({ error: "issuance_failed" }, 500, origin, requestId);
    }

    log("info", "certificate_issued", { requestId, userId, certId: data.id });
    return json({ ok: true, id: data.id, certificate: data, linked: true }, 200, origin, requestId);
  } catch (e) {
    log("error", "unhandled_exception", {
      requestId,
      message: e instanceof Error ? e.message : String(e),
    });
    return json({ error: "internal_error" }, 500, origin, requestId);
  }
});
