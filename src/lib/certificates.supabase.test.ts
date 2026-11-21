import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }))

vi.mock('./supabase', () => ({
  supabase: { rpc: mocks.rpc },
}))

import { displayCertificateLevel, verifyCertificate } from './certificates'

const row = {
  id: 'abc123-a1a2',
  name: 'Ana Dev',
  issued_at: '2026-01-10T12:00:00.000Z',
  program: 'RuntimeEnglish',
  level: 'A1-A2',
  status: 'valid',
  user_id: null,
  completion_date: 'January 9, 2026',
}

beforeEach(() => {
  mocks.rpc.mockReset()
  vi.stubEnv('PUBLIC_CERTIFICATE_VERIFY_URL', '')
  vi.stubEnv('PUBLIC_APP_URL', '')
})

describe('verifyCertificate (Supabase RPC)', () => {
  it('verifica un certificado por nivel y normaliza el ID a mayúsculas', async () => {
    mocks.rpc.mockResolvedValue({ data: [row], error: null })

    const res = await verifyCertificate(' abc123-a1a2 ')

    expect(mocks.rpc).toHaveBeenCalledTimes(1)
    expect(mocks.rpc).toHaveBeenCalledWith('verify_certificate', { cert_id: 'ABC123-A1A2' })
    expect(res.ok).toBe(true)
    expect(res.certificate).toMatchObject({
      id: 'ABC123-A1A2',
      name: 'Ana Dev',
      level: 'A1-A2',
      status: 'valid',
    })
    expect(displayCertificateLevel(res.certificate?.level)).toBe('A1-A2')
  })

  it('devuelve el nivel B1-B2 del registro', async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ ...row, id: 'EF34GH-B1B2', level: 'B1-B2' }],
      error: null,
    })

    const res = await verifyCertificate('ef34gh-b1b2')

    expect(res.ok).toBe(true)
    expect(res.certificate?.id).toBe('EF34GH-B1B2')
    expect(res.certificate?.level).toBe('B1-B2')
  })

  it('normaliza la etiqueta legacy A1 — B2 para mostrar A1-A2', async () => {
    mocks.rpc.mockResolvedValue({ data: [{ ...row, level: 'A1 — B2' }], error: null })

    const res = await verifyCertificate('ABC123-A1A2')

    expect(res.ok).toBe(true)
    expect(displayCertificateLevel(res.certificate?.level)).toBe('A1-A2')
  })

  it('acepta la respuesta RPC como objeto único', async () => {
    mocks.rpc.mockResolvedValue({ data: row, error: null })

    const res = await verifyCertificate('ABC123-A1A2')

    expect(res.ok).toBe(true)
    expect(res.certificate?.name).toBe('Ana Dev')
  })

  it('devuelve not_found cuando el RPC no encuentra la fila', async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null })

    const res = await verifyCertificate('NOPE123')

    expect(res).toEqual({ ok: false, error: 'not_found' })
  })

  it('propaga el error del RPC', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'permission denied' } })

    const res = await verifyCertificate('ABC123-A1A2')

    expect(res).toEqual({ ok: false, error: 'permission denied' })
  })
})
