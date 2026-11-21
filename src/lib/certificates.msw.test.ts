import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { displayCertificateLevel, verifyCertificate } from './certificates'

const certificates: Record<string, Record<string, unknown>> = {
  MSW123: {
    id: 'msw123',
    name: 'MSW User',
    issued_at: '2026-01-01T00:00:00.000Z',
    program: 'RuntimeEnglish',
    level: 'A1 — B2',
    status: 'valid',
  },
  A1A2XYZ: {
    id: 'a1a2xyz',
    name: 'Ana A1',
    issued_at: '2026-02-01T00:00:00.000Z',
    program: 'RuntimeEnglish',
    level: 'A1-A2',
    status: 'valid',
  },
  B1B2XYZ: {
    id: 'b1b2xyz',
    name: 'Ana B1',
    issued_at: '2026-03-01T00:00:00.000Z',
    program: 'RuntimeEnglish',
    level: 'B1-B2',
    status: 'valid',
  },
}

const server = setupServer(
  http.get('https://msw.example.test/verify', ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id') ?? ''
    const cert = certificates[id]
    if (!cert) return HttpResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    return HttpResponse.json({ ok: true, certificate: cert })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.unstubAllEnvs()
})
afterAll(() => server.close())

describe('certificates (msw)', () => {
  beforeEach(() => vi.stubEnv('PUBLIC_CERTIFICATE_VERIFY_URL', 'https://msw.example.test/verify'))

  it('verifies via endpoint using msw', async () => {
    const res = await verifyCertificate('msw123')
    expect(res.ok).toBe(true)
    expect(res.certificate?.id).toBe('MSW123')
    expect(displayCertificateLevel(res.certificate?.level)).toBe('A1-A2')
  })

  it('devuelve el nivel A1-A2 del registro verificado', async () => {
    const res = await verifyCertificate('a1a2xyz')
    expect(res.ok).toBe(true)
    expect(res.certificate).toMatchObject({ id: 'A1A2XYZ', level: 'A1-A2' })
  })

  it('devuelve el nivel B1-B2 del registro verificado', async () => {
    const res = await verifyCertificate('b1b2xyz')
    expect(res.ok).toBe(true)
    expect(res.certificate).toMatchObject({ id: 'B1B2XYZ', level: 'B1-B2' })
  })

  it('mapea not_found cuando el ID no existe', async () => {
    const res = await verifyCertificate('UNKNOWN')
    expect(res).toEqual({ ok: false, error: 'not_found' })
  })
})
