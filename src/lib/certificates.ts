import { supabase } from './supabase'

export interface CertificateRecord {
  id: string
  name: string
  issued_at: string
  program: string
  level: string
  status?: string
  user_id?: string | null
}

export interface VerifyResult {
  ok: boolean
  certificate?: CertificateRecord
  error?: string
}

function verifyEndpoint(): string | null {
  // Priority: dedicated verification endpoint (if available), otherwise direct RPC via Supabase client
  const ep = import.meta.env.PUBLIC_CERTIFICATE_VERIFY_URL as string | undefined
  return ep || null
}

export async function verifyCertificate(id: string): Promise<VerifyResult> {
  const code = (id || '').trim().toUpperCase()
  if (!code) return { ok: false, error: 'missing_id' }

  const endpoint = verifyEndpoint()
  if (endpoint) {
    try {
      const url = endpoint.includes('?')
        ? `${endpoint}&id=${encodeURIComponent(code)}`
        : `${endpoint}?id=${encodeURIComponent(code)}`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      // Los endpoints de verificación responden 404 con { error: 'not_found' }.
      // Hay que leer el body antes de decidir para mapear el error amigable.
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const code =
          isRecord(data) && typeof data.error === 'string' && data.error
            ? data.error
            : `http_${res.status}`
        return { ok: false, error: code }
      }
      const row = isRecord(data) ? data.certificate || data : null
      if (!isRecord(row) || (isRecord(data) && data.ok === false)) {
        return {
          ok: false,
          error: isRecord(data) && typeof data.error === 'string' ? data.error : 'not_found',
        }
      }
      return { ok: true, certificate: normalizeCert(row) }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'network_error' }
    }
  }

  if (!supabase) return { ok: false, error: 'not_configured' }
  const { data, error } = await supabase.rpc('verify_certificate', { cert_id: code })
  if (error) return { ok: false, error: error.message }
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { ok: false, error: 'not_found' }
  return { ok: true, certificate: normalizeCert(row) }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeCert(row: unknown): CertificateRecord {
  const record = isRecord(row) ? row : {}
  const userId = record.user_id
  return {
    id: String(record.id ?? '').toUpperCase(),
    name: typeof record.name === 'string' ? record.name : '',
    issued_at: typeof record.issued_at === 'string' ? record.issued_at : new Date().toISOString(),
    program: typeof record.program === 'string' ? record.program : 'RuntimeEnglish',
    level: typeof record.level === 'string' ? record.level : 'A1-A2',
    status: typeof record.status === 'string' ? record.status : 'valid',
    user_id: typeof userId === 'string' || userId === null ? userId : null,
  }
}

export interface IssueInput {
  id: string
  name: string
  issued_at: string
  program?: string
  level?: string
  completion_date?: string
}

export interface IssueResult {
  ok: boolean
  error?: string
  certificate?: CertificateRecord
  mode?: 'server' | 'skipped'
}

// "Official" issuance: calls the hardened Edge Function (requires authenticated session + server-side eligibility).
export async function issueCertificate(input: IssueInput): Promise<IssueResult> {
  const endpoint = import.meta.env.PUBLIC_CERTIFICATE_ISSUE_URL as string | undefined
  if (!endpoint) return { ok: false, error: 'issue_endpoint_not_configured', mode: 'skipped' }

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined
    if (anonKey) headers.apikey = anonKey

    // Attach JWT (requerido en producción) para vincular y validar emisión
    if (supabase) {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (token) headers.Authorization = `Bearer ${token}`
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: input.id.trim().toUpperCase(),
        name: input.name,
        issued_at: input.issued_at,
        completion_date: input.completion_date || null,
        program: input.program ?? 'RuntimeEnglish',
        level: input.level ?? 'A1-A2',
      }),
    })
    const text = await res.text().catch(() => '')
    let payload: unknown = null
    try {
      payload = text ? JSON.parse(text) : null
    } catch {
      payload = null
    }

    const payloadRecord = isRecord(payload) ? payload : null
    if (!res.ok) {
      const errorValue = payloadRecord?.error
      const messageValue = payloadRecord?.message
      return {
        ok: false,
        error:
          (typeof errorValue === 'string' && errorValue) ||
          (typeof messageValue === 'string' && messageValue) ||
          text ||
          `http_${res.status}`,
      }
    }

    const cert = payloadRecord?.certificate ? normalizeCert(payloadRecord.certificate) : undefined
    return { ok: true, certificate: cert, mode: 'server' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network_error' }
  }
}

/** Normaliza el nivel legacy ("A1 — B2") al formato usado en la UI. */
export function displayCertificateLevel(level?: string | null): string {
  const raw = (level ?? '').trim()
  if (!raw) return 'A1-A2'
  if (raw === 'A1 — B2' || raw === 'A1 - B2') return 'A1-A2'
  return raw
}

export function certificateShareUrl(id: string): string {
  const code = (id || '').trim().toUpperCase()
  const base =
    (import.meta.env.PUBLIC_APP_URL as string | undefined) ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  const root = base.replace(/\/+$/, '')
  return `${root}/verify?id=${encodeURIComponent(code)}`
}
