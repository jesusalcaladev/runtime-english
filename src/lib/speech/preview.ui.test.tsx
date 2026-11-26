// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getWebVoices: vi.fn().mockResolvedValue([]),
  hasUsableWebVoice: vi.fn(() => false),
  speakNative: vi.fn().mockResolvedValue(true),
  stopNativeSpeech: vi.fn().mockResolvedValue(undefined),
  speakWithGoogle: vi.fn().mockResolvedValue(true),
  stopGooglePlayback: vi.fn(),
  stopKokoroPlayback: vi.fn(),
  isKokoroReady: vi.fn(() => false),
  speakWithKokoro: vi.fn().mockResolvedValue(true),
  stopPiperPlayback: vi.fn(),
  speakWithPiper: vi.fn().mockResolvedValue(true),
  getPiperStatus: vi.fn(() => ({ state: 'idle', message: '' })),
  getPreferredVoiceName: vi.fn(() => ''),
  getSpeechPitch: vi.fn(() => 1),
  getSpeechRate: vi.fn(() => 1),
  getSpeechEngine: vi.fn(() => 'system'),
  isNativePlatform: vi.fn(() => false),
}))

vi.mock('./browser', () => ({
  getWebVoices: mocks.getWebVoices,
  hasUsableWebVoice: mocks.hasUsableWebVoice,
  speakNative: mocks.speakNative,
  stopNativeSpeech: mocks.stopNativeSpeech,
}))
vi.mock('./google', () => ({
  speakWithGoogle: mocks.speakWithGoogle,
  stopGooglePlayback: mocks.stopGooglePlayback,
}))
vi.mock('./kokoro', () => ({
  stopKokoroPlayback: mocks.stopKokoroPlayback,
  isKokoroReady: mocks.isKokoroReady,
  speakWithKokoro: mocks.speakWithKokoro,
}))
vi.mock('./piper', () => ({
  stopPiperPlayback: mocks.stopPiperPlayback,
  speakWithPiper: mocks.speakWithPiper,
  getPiperStatus: mocks.getPiperStatus,
}))
vi.mock('./platform', () => ({
  getPreferredVoiceName: mocks.getPreferredVoiceName,
  getSpeechPitch: mocks.getSpeechPitch,
  getSpeechRate: mocks.getSpeechRate,
  getSpeechEngine: mocks.getSpeechEngine,
  isNativePlatform: mocks.isNativePlatform,
}))

class FakeUtterance {
  text: string
  lang = ''
  rate = 1
  pitch = 1
  volume = 1
  voice: unknown = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: ((event: { error: string }) => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

const nativeSynth = {
  cancel: vi.fn(),
  speak: vi.fn((utterance: FakeUtterance) => {
    utterance.onerror?.({ error: 'synthesis-failed' })
  }),
}

import { previewVoice } from './preview'

describe('previewVoice online fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.hasUsableWebVoice.mockReturnValue(false)
    mocks.getSpeechEngine.mockReturnValue('system')
    mocks.speakWithPiper.mockResolvedValue(true)
    mocks.getPiperStatus.mockReturnValue({ state: 'idle', message: '' })
    mocks.isKokoroReady.mockReturnValue(false)
    mocks.isNativePlatform.mockReturnValue(false)
    mocks.speakNative.mockResolvedValue(true)
    mocks.speakWithGoogle.mockResolvedValue(true)
    mocks.getWebVoices.mockResolvedValue([])
    nativeSynth.speak.mockImplementation((utterance: FakeUtterance) => {
      utterance.onerror?.({ error: 'synthesis-failed' })
    })
    Object.defineProperty(window, 'speechSynthesis', { value: nativeSynth, configurable: true })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: FakeUtterance,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
      value: FakeUtterance,
      configurable: true,
    })
  })

  it('plays the preview with the online voice when the host has no voices', async () => {
    await expect(previewVoice('Hello there')).resolves.toBe(true)
    expect(mocks.speakWithGoogle).toHaveBeenCalledWith('Hello there')
    expect(nativeSynth.speak).not.toHaveBeenCalled()
  })

  it('does not cut off a device voice that started speaking', async () => {
    const started = Date.now()
    mocks.hasUsableWebVoice.mockReturnValue(true)
    mocks.getWebVoices.mockResolvedValue([{ name: 'Google US English', lang: 'en-US' }])
    nativeSynth.speak.mockImplementation((utterance: FakeUtterance) => {
      // The sample starts but `onend` will not arrive for several seconds.
      utterance.onstart?.()
    })

    await expect(previewVoice('A rather long preview sentence that keeps speaking')).resolves.toBe(
      true,
    )
    expect(Date.now() - started).toBeLessThan(500)
    expect(mocks.speakWithGoogle).not.toHaveBeenCalled()
    // Only the initial stopTts() cancel: no second cancel cutting this sample off.
    expect(nativeSynth.cancel).toHaveBeenCalledTimes(1)
  })

  it('previews with the engine selected in settings', async () => {
    mocks.getSpeechEngine.mockReturnValue('google')
    await expect(previewVoice('Hello there')).resolves.toBe(true)
    expect(mocks.speakWithGoogle).toHaveBeenCalledWith('Hello there')
    expect(nativeSynth.speak).not.toHaveBeenCalled()

    vi.clearAllMocks()
    mocks.getSpeechEngine.mockReturnValue('piper')
    mocks.getPiperStatus.mockReturnValue({ state: 'ready', message: 'Voz Piper lista' })
    mocks.speakWithPiper.mockResolvedValue(true)
    await expect(previewVoice('Hello there')).resolves.toBe(true)
    expect(mocks.speakWithPiper).toHaveBeenCalledWith('Hello there')
    expect(mocks.speakWithGoogle).not.toHaveBeenCalled()
  })

  it('uses the native voice for the preview on Android', async () => {
    mocks.isNativePlatform.mockReturnValue(true)

    await expect(previewVoice('Hello there')).resolves.toBe(true)
    expect(mocks.speakNative).toHaveBeenCalledWith('Hello there')
    expect(mocks.speakWithGoogle).not.toHaveBeenCalled()
  })

  it('falls back online when the native voice fails', async () => {
    mocks.isNativePlatform.mockReturnValue(true)
    mocks.speakNative.mockResolvedValue(false)

    await expect(previewVoice('Hello there')).resolves.toBe(true)
    expect(mocks.speakWithGoogle).toHaveBeenCalledWith('Hello there')
  })

  it('falls back to the native voice when Google preview fails on Android', async () => {
    mocks.isNativePlatform.mockReturnValue(true)
    mocks.getSpeechEngine.mockReturnValue('google')
    mocks.speakWithGoogle.mockResolvedValue(false)
    mocks.speakNative.mockResolvedValue(true)

    await expect(previewVoice('Hello there')).resolves.toBe(true)
    expect(mocks.speakNative).toHaveBeenCalledWith('Hello there')
  })

  it('does not download Piper just to preview when it is not loaded', async () => {
    mocks.getSpeechEngine.mockReturnValue('piper')
    mocks.hasUsableWebVoice.mockReturnValue(false)
    mocks.getPiperStatus.mockReturnValue({ state: 'idle', message: '' })

    await expect(previewVoice('Hello there')).resolves.toBe(true)
    expect(mocks.speakWithPiper).not.toHaveBeenCalled()
    expect(mocks.speakWithGoogle).toHaveBeenCalledWith('Hello there')
  })

  it('falls back online when a present device voice fails to start', async () => {
    mocks.hasUsableWebVoice.mockReturnValue(true)
    mocks.getWebVoices.mockResolvedValue([{ name: 'Google US English', lang: 'en-US' }])

    await expect(previewVoice('Hello there')).resolves.toBe(true)
    expect(nativeSynth.speak).toHaveBeenCalledTimes(1)
    expect(mocks.speakWithGoogle).toHaveBeenCalledWith('Hello there')
  })
})
