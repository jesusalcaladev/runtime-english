import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { verifyCertificate } from './certificates'

const server = setupServer(
  http.get('https://msw.example.test/verify', ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('id') !== 'MSW123') {
      return HttpResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    }
    return HttpResponse.json({
      ok: true,
      certificate: {
        id: 'msw123',
        name: 'MSW User',
        issued_at: '2026-01-01T00:00:00.000Z',
        program: 'RuntimeEnglish',
        level: 'A1 — B2',
        status: 'valid',
      },
    })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.unstubAllEnvs()
})
afterAll(() => server.close())

describe('certificates (msw)', () => {
  it('verifies via endpoint using msw', async () => {
    vi.stubEnv('PUBLIC_CERTIFICATE_VERIFY_URL', 'https://msw.example.test/verify')
    const res = await verifyCertificate('msw123')
    expect(res.ok).toBe(true)
    expect(res.certificate?.id).toBe('MSW123')
  })
})
