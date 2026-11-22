// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getWebVoices: vi.fn().mockResolvedValue([]),
  hasUsableWebVoice: vi.fn(() => false),
  stopNativeSpeech: vi.fn().mockResolvedValue(undefined),
  speakWithGoogle: vi.fn().mockResolvedValue(true),
  stopGooglePlayback: vi.fn(),
  stopKokoroPlayback: vi.fn(),
  stopPiperPlayback: vi.fn(),
  getPreferredVoiceName: vi.fn(() => ''),
  getSpeechPitch: vi.fn(() => 1),
  getSpeechRate: vi.fn(() => 1),
}))

vi.mock('./browser', () => ({
  getWebVoices: mocks.getWebVoices,
  hasUsableWebVoice: mocks.hasUsableWebVoice,
  stopNativeSpeech: mocks.stopNativeSpeech,
}))
vi.mock('./google', () => ({
  speakWithGoogle: mocks.speakWithGoogle,
  stopGooglePlayback: mocks.stopGooglePlayback,
}))
vi.mock('./kokoro', () => ({ stopKokoroPlayback: mocks.stopKokoroPlayback }))
vi.mock('./piper', () => ({ stopPiperPlayback: mocks.stopPiperPlayback }))
vi.mock('./platform', () => ({
  getPreferredVoiceName: mocks.getPreferredVoiceName,
  getSpeechPitch: mocks.getSpeechPitch,
  getSpeechRate: mocks.getSpeechRate,
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

  it('falls back online when a present device voice fails to start', async () => {
    mocks.hasUsableWebVoice.mockReturnValue(true)
    mocks.getWebVoices.mockResolvedValue([{ name: 'Google US English', lang: 'en-US' }])

    await expect(previewVoice('Hello there')).resolves.toBe(true)
    expect(nativeSynth.speak).toHaveBeenCalledTimes(1)
    expect(mocks.speakWithGoogle).toHaveBeenCalledWith('Hello there')
  })
})
