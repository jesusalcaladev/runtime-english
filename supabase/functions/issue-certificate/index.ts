// Supabase Edge Function: emitir/registrar un certificado (escritura segura con service role)
// Despliega con: supabase functions deploy issue-certificate
// Requiere (por defecto en Supabase): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json();
    const id = String(body.id || "").trim().toUpperCase();
    const name = String(body.name || "").trim();
    const issued_at = body.issued_at ? String(body.issued_at) : new Date().toISOString();
    const completion_date = body.completion_date ? String(body.completion_date) : null;
    const program = String(body.program || "DevLingo");
    const level = String(body.level || "A1 — B2");

    if (!id || !/^[A-Z0-9-]{4,32}$/.test(id)) return json({ error: "invalid_id" }, 400);
    if (!name || name.length > 120) return json({ error: "invalid_name" }, 400);

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || serviceKey;
    const admin = createClient(url, serviceKey);

    // Intentar resolver usuario autenticado (si envían JWT) para vincular certificado a la cuenta
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      try {
        const userClient = createClient(url, anonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: userData } = await userClient.auth.getUser();
        userId = userData?.user?.id ?? null;
      } catch {
        userId = null;
      }
    }

    // Si ya existe, ser idempotente: permitir mismo usuario/nombre, rechazar colisiones ajenas
    const { data: existing } = await admin
      .from("certificates")
      .select("id, name, issued_at, completion_date, program, level, status, user_id")
      .eq("id", id)
      .maybeSingle();

    if (existing) {
      if (existing.user_id && userId && existing.user_id !== userId) {
        return json({ error: "certificate_id_conflict" }, 409);
      }
      // Si existe sin usuario y ahora hay usuario, vincular
      const patch: Record<string, unknown> = {};
      if (!existing.user_id && userId) patch.user_id = userId;
      if (completion_date && !existing.completion_date) patch.completion_date = completion_date;
      if (name && existing.name !== name) patch.name = name;
      let cert = existing;
      if (Object.keys(patch).length) {
        const { data: updated, error: upErr } = await admin.from("certificates").update(patch).eq("id", id).select("*").single();
        if (upErr) return json({ error: upErr.message }, 400);
        cert = updated as any;
      }
      return json({ ok: true, id, certificate: cert, linked: Boolean(cert.user_id) });
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
      issued_by: userId ? "user" : "system",
      metadata: { issued_via: "edge-function", linked_account: Boolean(userId) },
    };

    const { data, error } = await admin
      .from("certificates")
      .insert(record)
      .select("id, name, issued_at, completion_date, program, level, status, user_id")
      .single();

    if (error) return json({ error: error.message }, 400);

    return json({ ok: true, id: data.id, certificate: data, linked: Boolean(userId) });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
