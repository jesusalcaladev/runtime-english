// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  speak: vi.fn(),
  stop: vi.fn(),
  getSupportedVoices: vi.fn(),
  isNativePlatform: vi.fn(() => true),
  getSpeechLanguage: vi.fn(() => 'en-US'),
  getSpeechRate: vi.fn(() => 1),
  getSpeechPitch: vi.fn(() => 1),
  getPreferredVoiceName: vi.fn(() => ''),
}))

vi.mock('@capacitor-community/text-to-speech', () => ({
  TextToSpeech: {
    speak: mocks.speak,
    stop: mocks.stop,
    getSupportedVoices: mocks.getSupportedVoices,
  },
}))

vi.mock('./platform', () => ({
  isNativePlatform: mocks.isNativePlatform,
  getSpeechLanguage: mocks.getSpeechLanguage,
  getSpeechRate: mocks.getSpeechRate,
  getSpeechPitch: mocks.getSpeechPitch,
  getPreferredVoiceName: mocks.getPreferredVoiceName,
}))

// Keep the timeout path fast without touching the production constants.
vi.mock('./watchdog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./watchdog')>()
  return { ...actual, ttsAttemptDeadlineMs: () => 60 }
})

import { speakNative, ttsStartTimeoutForVoice } from './browser'

describe('speakNative', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isNativePlatform.mockReturnValue(true)
    mocks.getSupportedVoices.mockResolvedValue({ voices: [{ lang: 'en-US', index: 3 }] })
    mocks.speak.mockResolvedValue(undefined)
    mocks.stop.mockResolvedValue(undefined)
  })

  it('returns true once the device engine finishes the utterance', async () => {
    await expect(speakNative('Hello there')).resolves.toBe(true)
    expect(mocks.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Hello there', lang: 'en-US', voice: 3 }),
    )
  })

  it('retries with the default voice when the selected voice fails', async () => {
    mocks.speak.mockRejectedValueOnce(new Error('unsupported voice')).mockResolvedValueOnce(undefined)

    await expect(speakNative('Hello there')).resolves.toBe(true)
    expect(mocks.speak).toHaveBeenCalledTimes(2)
    expect(mocks.speak.mock.calls[0][0]).toHaveProperty('voice', 3)
    expect(mocks.speak.mock.calls[1][0]).not.toHaveProperty('voice')
  })

  it('settles false instead of hanging when the native engine never completes', async () => {
    mocks.speak.mockImplementation(() => new Promise(() => {}))

    await expect(speakNative('Hello there')).resolves.toBe(false)
    expect(mocks.stop).toHaveBeenCalled()
  })

  it('gives remote web voices a longer start window than local ones', () => {
    expect(ttsStartTimeoutForVoice(null)).toBe(700)
    expect(ttsStartTimeoutForVoice({ localService: true } as SpeechSynthesisVoice)).toBe(700)
    expect(ttsStartTimeoutForVoice({ localService: false } as SpeechSynthesisVoice)).toBe(2_500)
  })
})
