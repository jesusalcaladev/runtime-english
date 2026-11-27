import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TtsStudio from './TtsStudio'

const mocks = vi.hoisted(() => ({
  setSettings: vi.fn(),
  previewVoice: vi.fn().mockResolvedValue(true),
  stopTts: vi.fn(),
  emitToast: vi.fn(),
}))

vi.mock('../../lib/useProgress', () => ({
  useProgress: () => ({
    completedSessions: {},
    completedExercises: {},
    attempts: {},
    exerciseSrs: {},
    xp: 0,
    settings: {
      ttsEnabled: true,
      ttsRate: 1,
      ttsPitch: 1,
      ttsEngine: 'system',
      immersion: 'es',
    },
  }),
}))

vi.mock('../../lib/progress', () => ({ progressStore: { setSettings: mocks.setSettings } }))

vi.mock('../../lib/toast', () => ({ emitToast: mocks.emitToast }))

vi.mock('../../hooks/useKokoroStatus', () => ({
  useKokoroStatus: () => ({ state: 'idle', progress: 0, message: '' }),
}))

vi.mock('../../lib/speech', () => ({
  getWebVoices: vi.fn().mockResolvedValue([
    { name: 'Samantha', lang: 'en-US' },
    { name: 'Daniel', lang: 'en-GB' },
  ]),
  previewVoice: mocks.previewVoice,
  stopTts: mocks.stopTts,
  stopSpeech: vi.fn(),
  warmSpeechEngine: vi.fn(),
  kokoroIsCached: vi.fn().mockReturnValue(false),
  loadKokoro: vi.fn(),
  loadPiper: vi.fn(),
  getPiperStatus: vi.fn().mockReturnValue({ state: 'idle', message: '' }),
  subscribePiperStatus: vi.fn().mockReturnValue(() => {}),
  maybeWarmKokoroInBackground: vi.fn(),
}))

afterEach(() => {
  cleanup()
  mocks.setSettings.mockClear()
  mocks.previewVoice.mockClear()
  mocks.stopTts.mockClear()
  mocks.emitToast.mockClear()
})

describe('TtsStudio', () => {
  it('lets the learner choose and preview a voice, and switch to easy mode', async () => {
    render(<TtsStudio />)

    await waitFor(() => expect(screen.getByRole('combobox')).toBeTruthy())
    const select = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'Daniel' } })
    expect(mocks.setSettings).toHaveBeenCalledWith({ ttsVoiceName: 'Daniel' })

    fireEvent.click(screen.getByRole('button', { name: 'Probar esta voz' }))
    await waitFor(() => expect(mocks.previewVoice).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Detener voz' }))
    expect(mocks.stopTts).toHaveBeenCalled()

    fireEvent.click(screen.getAllByRole('button', { name: 'Modo fácil' })[0])
    expect(mocks.setSettings).toHaveBeenCalledWith({
      ttsEngine: 'google',
      ttsRate: 1,
      ttsPitch: 1,
      ttsVoiceName: '',
      ttsEnabled: true,
    })
  })

  it('shows an error when the voice preview cannot be played', async () => {
    mocks.previewVoice.mockResolvedValueOnce(false)
    render(<TtsStudio />)

    fireEvent.click(screen.getByRole('button', { name: 'Probar esta voz' }))

    await waitFor(() =>
      expect(mocks.emitToast).toHaveBeenCalledWith(expect.stringContaining('No se pudo'), 'error'),
    )
  })
})
