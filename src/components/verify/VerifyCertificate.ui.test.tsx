import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import VerifyCertificate from './VerifyCertificate'

const mocks = vi.hoisted(() => ({ verify: vi.fn(), emitToast: vi.fn() }))

vi.mock('../../lib/certificates', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/certificates')>()
  return { ...actual, verifyCertificate: mocks.verify }
})
vi.mock('../../lib/toast', () => ({ emitToast: mocks.emitToast }))

const certificate = (level: string, id = 'A1A2XYZ') => ({
  id,
  name: 'Ana Dev',
  issued_at: '2026-01-10T12:00:00.000Z',
  program: 'RuntimeEnglish',
  level,
  status: 'valid',
  user_id: null,
})

beforeEach(() => {
  mocks.verify.mockReset()
  mocks.emitToast.mockReset()
  vi.stubEnv('PUBLIC_CERTIFICATE_VERIFY_URL', 'https://verify.example.test')
  vi.stubEnv('PUBLIC_APP_URL', 'https://app.example.test')
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe('VerifyCertificate', () => {
  it('verifica automáticamente el ID de la URL y muestra el nivel A1-A2', async () => {
    window.history.replaceState({}, '', '/verify?id=a1a2xyz')
    mocks.verify.mockResolvedValue({ ok: true, certificate: certificate('A1-A2') })

    render(<VerifyCertificate />)

    expect(await screen.findByText('Certificado verificado')).toBeTruthy()
    expect(mocks.verify).toHaveBeenCalledWith('A1A2XYZ')
    expect(screen.getByText('Ana Dev')).toBeTruthy()
    expect(screen.getByText('A1A2XYZ')).toBeTruthy()
    expect(screen.getByText(/RuntimeEnglish · A1-A2 · valid/)).toBeTruthy()
  })

  it('muestra el nivel B1-B2 del certificado verificado', async () => {
    window.history.replaceState({}, '', '/verify?id=B1B2XYZ')
    mocks.verify.mockResolvedValue({
      ok: true,
      certificate: certificate('B1-B2', 'B1B2XYZ'),
    })

    render(<VerifyCertificate />)

    expect(await screen.findByText('Certificado verificado')).toBeTruthy()
    expect(screen.getByText(/RuntimeEnglish · B1-B2 · valid/)).toBeTruthy()
  })

  it('muestra el error cuando el ID no existe en el registro', async () => {
    window.history.replaceState({}, '', '/verify?id=UNKNOWN')
    mocks.verify.mockResolvedValue({ ok: false, error: 'not_found' })

    render(<VerifyCertificate />)

    expect(await screen.findByText(/No se encontró un certificado válido con ese ID/)).toBeTruthy()
    expect(screen.queryByText('Certificado verificado')).toBeNull()
  })

  it('verifica un ID escrito a mano y lo normaliza a mayúsculas', async () => {
    window.history.replaceState({}, '', '/verify')
    mocks.verify.mockResolvedValue({
      ok: true,
      certificate: certificate('A1-A2', 'AB12CD-A1A2'),
    })

    render(<VerifyCertificate />)

    const input = screen.getByLabelText('Certificate ID') as HTMLInputElement
    fireEvent.input(input, { target: { value: 'ab12cd-a1a2' } })
    expect(input.value).toBe('AB12CD-A1A2')

    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    await waitFor(() => expect(mocks.verify).toHaveBeenCalledWith('AB12CD-A1A2'))
    expect(await screen.findByText('Certificado verificado')).toBeTruthy()
    expect(screen.getByText(/RuntimeEnglish · A1-A2 · valid/)).toBeTruthy()
  })

  it('no llama al registro si el ID está vacío', () => {
    window.history.replaceState({}, '', '/verify')

    render(<VerifyCertificate />)
    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(mocks.verify).not.toHaveBeenCalled()
    expect(screen.getByText('Ingresa un ID de certificado.')).toBeTruthy()
  })
})
