import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./supabase', () => ({
  supabase: null,
}))

import {
  certificateShareUrl,
  displayCertificateLevel,
  issueCertificate,
  verifyCertificate,
} from './certificates'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('certificates', () => {
  it('returns missing_id for empty input', async () => {
    const res = await verifyCertificate('  ')
    expect(res.ok).toBe(false)
    expect(res.error).toBe('missing_id')
  })

  it('returns not_configured when no verify endpoint and supabase is unavailable', async () => {
    vi.stubEnv('PUBLIC_CERTIFICATE_VERIFY_URL', '')
    const res = await verifyCertificate('ABC123')
    expect(res.ok).toBe(false)
    expect(res.error).toBe('not_configured')
  })

  it('verifies via endpoint when configured', async () => {
    vi.stubEnv('PUBLIC_CERTIFICATE_VERIFY_URL', 'https://example.test/verify')
    const fetchMock: typeof fetch = async (input) => {
      const u = new URL(String(input))
      if (u.searchParams.get('id') !== 'ABC123') {
        return new Response(JSON.stringify({ ok: false, error: 'not_found' }), { status: 404 })
      }
      return new Response(
        JSON.stringify({
          ok: true,
          certificate: {
            id: 'abc123',
            name: 'Test User',
            issued_at: '2026-01-01T00:00:00.000Z',
            program: 'RuntimeEnglish',
            level: 'A1 — B2',
            status: 'valid',
            user_id: null,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }
    globalThis.fetch = vi.fn(fetchMock) as typeof fetch

    const res = await verifyCertificate('abc123')
    expect(res.ok).toBe(true)
    expect(res.certificate?.id).toBe('ABC123')
    expect(res.certificate?.name).toBe('Test User')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('normalizes legacy level labels for display', () => {
    expect(displayCertificateLevel('A1 — B2')).toBe('A1-A2')
    expect(displayCertificateLevel('B1-B2')).toBe('B1-B2')
  })

  it('builds certificate share URL from PUBLIC_APP_URL', () => {
    vi.stubEnv('PUBLIC_APP_URL', 'https://runtimeenglish.dev/')
    expect(certificateShareUrl('ab12cd')).toBe('https://runtimeenglish.dev/verify.html?id=AB12CD')
  })

  it('skips issuance when issue endpoint is not configured', async () => {
    vi.stubEnv('PUBLIC_CERTIFICATE_ISSUE_URL', '')
    const res = await issueCertificate({
      id: 'abc123',
      name: 'User',
      issued_at: '2026-01-01T00:00:00.000Z',
    })
    expect(res).toEqual({ ok: false, error: 'issue_endpoint_not_configured', mode: 'skipped' })
  })

  it('issues certificate via endpoint and normalizes response', async () => {
    vi.stubEnv('PUBLIC_CERTIFICATE_ISSUE_URL', 'https://example.test/issue')
    vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'anon-key')

    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe('POST')
      const headers = init?.headers as Record<string, string>
      expect(headers['Content-Type']).toBe('application/json')
      expect(headers.apikey).toBe('anon-key')
      const body = JSON.parse(String(init?.body))
      expect(body.id).toBe('ABC123')
      expect(body.name).toBe('Test User')
      expect(body.level).toBe('A1-A2')
      return new Response(
        JSON.stringify({
          certificate: {
            id: 'abc123',
            name: 'Test User',
            issued_at: '2026-01-01T00:00:00.000Z',
            program: 'RuntimeEnglish',
            level: 'A1 — B2',
            status: 'issued',
            user_id: 'u1',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const res = await issueCertificate({
      id: 'abc123',
      name: 'Test User',
      issued_at: '2026-01-01T00:00:00.000Z',
    })

    expect(res.ok).toBe(true)
    expect(res.mode).toBe('server')
    expect(res.certificate?.id).toBe('ABC123')
    expect(res.certificate?.status).toBe('issued')
  })
})
