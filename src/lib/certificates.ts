import { supabase } from "./supabase";

export interface CertificateRecord {
  id: string;
  name: string;
  issued_at: string;
  program: string;
  level: string;
  status?: string;
  user_id?: string | null;
}

export interface VerifyResult {
  ok: boolean;
  certificate?: CertificateRecord;
  error?: string;
}

function verifyEndpoint(): string | null {
  // Priority: dedicated verification endpoint (if available), otherwise direct RPC via Supabase client
  const ep = import.meta.env.PUBLIC_CERTIFICATE_VERIFY_URL as string | undefined;
  return ep || null;
}

export async function verifyCertificate(id: string): Promise<VerifyResult> {
  const code = (id || "").trim().toUpperCase();
  if (!code) return { ok: false, error: "missing_id" };

  const endpoint = verifyEndpoint();
  if (endpoint) {
    try {
      const url = endpoint.includes("?") ? `${endpoint}&id=${encodeURIComponent(code)}` : `${endpoint}?id=${encodeURIComponent(code)}`;
      const res = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!res.ok) return { ok: false, error: `http_${res.status}` };
      const data = await res.json();
      const row = data?.certificate || data;
      if (!row || data?.ok === false) return { ok: false, error: data?.error || "not_found" };
      return { ok: true, certificate: normalizeCert(row) };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network_error" };
    }
  }

  if (!supabase) return { ok: false, error: "not_configured" };
  const { data, error } = await supabase.rpc("verify_certificate", { cert_id: code });
  if (error) return { ok: false, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ok: false, error: "not_found" };
  return { ok: true, certificate: normalizeCert(row) };
}

function normalizeCert(row: any): CertificateRecord {
  return {
    id: String(row.id || "").toUpperCase(),
    name: row.name || "",
    issued_at: row.issued_at || new Date().toISOString(),
    program: row.program ?? "RuntimeEnglish",
    level: row.level ?? "A1 — B2",
    status: row.status ?? "valid",
    user_id: row.user_id ?? null,
  };
}

export interface IssueInput {
  id: string;
  name: string;
  issued_at: string;
  program?: string;
  level?: string;
  completion_date?: string;
}

export interface IssueResult {
  ok: boolean;
  error?: string;
  certificate?: CertificateRecord;
  mode?: "server" | "skipped";
}

// "Official" issuance: calls the hardened Edge Function (requires authenticated session + server-side eligibility).
export async function issueCertificate(input: IssueInput): Promise<IssueResult> {
  const endpoint = import.meta.env.PUBLIC_CERTIFICATE_ISSUE_URL as string | undefined;
  if (!endpoint) return { ok: false, error: "issue_endpoint_not_configured", mode: "skipped" };

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;
    if (anonKey) headers["apikey"] = anonKey;

    // Attach JWT (requerido en producción) para vincular y validar emisión
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: input.id.trim().toUpperCase(),
        name: input.name,
        issued_at: input.issued_at,
        completion_date: input.completion_date || null,
        program: input.program ?? "RuntimeEnglish",
        level: input.level ?? "A1 — B2",
      }),
    });
    const text = await res.text().catch(() => "");
    let payload: any = null;
    try { payload = text ? JSON.parse(text) : null; } catch {}
    if (!res.ok) {
      return { ok: false, error: payload?.error || payload?.message || text || `http_${res.status}` };
    }
    const cert = payload?.certificate ? normalizeCert(payload.certificate) : undefined;
    return { ok: true, certificate: cert, mode: "server" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network_error" };
  }
}

export function certificateShareUrl(id: string): string {
  const code = (id || "").trim().toUpperCase();
  const base = (import.meta.env.PUBLIC_APP_URL as string | undefined) || (typeof window !== "undefined" ? window.location.origin : "");
  const root = base.replace(/\/+$/, "");
  return `${root}/verify?id=${encodeURIComponent(code)}`;
}
