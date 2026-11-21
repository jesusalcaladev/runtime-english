// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  emitToast: vi.fn(),
  primeWebVoices: vi.fn(),
  warmNativeVoices: vi.fn(),
  speakNative: vi.fn(),
  speakWeb: vi.fn(),
  stopNativeSpeech: vi.fn(),
  getWebVoices: vi.fn(),
  prefetchGooglePhrase: vi.fn(),
  getGooglePhraseStatus: vi.fn(() => ({ ready: 0, total: 0 })),
  speakWithGoogle: vi.fn(),
  stopGooglePlayback: vi.fn(),
  canAutoLoadKokoroInBackground: vi.fn(() => true),
  getKokoroDiagnostics: vi.fn(() => ({})),
  getKokoroPhraseStatus: vi.fn(() => ({ ready: 0, total: 0 })),
  getKokoroStatus: vi.fn(() => ({ state: 'idle' })),
  isKokoroLoading: vi.fn(() => false),
  isKokoroReady: vi.fn(() => false),
  kokoroIsCached: vi.fn(() => false),
  loadKokoro: vi.fn().mockResolvedValue(true),
  markKokoroAutoInitStarted: vi.fn(),
  maybeWarmKokoroInBackground: vi.fn(),
  prepareKokoroPhrase: vi.fn(),
  prewarmKokoroPhrases: vi.fn(),
  speakWithKokoro: vi.fn(),
  stopKokoroPlayback: vi.fn(),
  subscribeKokoroPhraseStatus: vi.fn(() => () => {}),
  subscribeKokoroStatus: vi.fn(() => () => {}),
  bumpPhraseStatus: vi.fn(),
  subscribePhraseStatus: vi.fn(() => () => {}),
  getPiperPhraseStatus: vi.fn(() => ({ ready: 0, total: 0 })),
  getPiperStatus: vi.fn(() => ({ state: 'idle' })),
  loadPiper: vi.fn().mockResolvedValue(true),
  PIPER_VOICE: 'en_US-libritts_r-medium',
  prefetchPiperPhrase: vi.fn(),
  speakWithPiper: vi.fn(),
  stopPiperPlayback: vi.fn(),
  subscribePiperStatus: vi.fn(() => () => {}),
  getSpeechEngine: vi.fn(() => 'google'),
  isNativePlatform: vi.fn(() => false),
  isSpeechEnabled: vi.fn(() => true),
  normalizeSpeechText: vi.fn((value: string) => value),
  getSpeechLanguage: vi.fn(() => 'en-US'),
  getSpeechRate: vi.fn(() => 1),
  clearAllSpeakStates: vi.fn(),
  setSpeaking: vi.fn(),
  setSpeakLoading: vi.fn(),
  previewVoice: vi.fn(),
  stopTts: vi.fn(),
  speechMatchScore: vi.fn(() => 1),
  ensureMicrophonePermission: vi.fn(),
  getMicrophonePermissionStatus: vi.fn(),
  isSpeechRecognitionSupported: vi.fn(),
  recognizeOnce: vi.fn(),
  releaseMicStream: vi.fn(),
  startMicLevelMeter: vi.fn(),
  stopSpeechRecognition: vi.fn(),
}))

vi.mock('../toast', () => ({ emitToast: mocks.emitToast }))
vi.mock('./browser', () => ({
  primeWebVoices: mocks.primeWebVoices,
  speakNative: mocks.speakNative,
  speakWeb: mocks.speakWeb,
  stopNativeSpeech: mocks.stopNativeSpeech,
  warmNativeVoices: mocks.warmNativeVoices,
  getWebVoices: mocks.getWebVoices,
}))
vi.mock('./google', () => ({
  getGooglePhraseStatus: mocks.getGooglePhraseStatus,
  prefetchGooglePhrase: mocks.prefetchGooglePhrase,
  speakWithGoogle: mocks.speakWithGoogle,
  stopGooglePlayback: mocks.stopGooglePlayback,
}))
vi.mock('./kokoro', () => ({
  canAutoLoadKokoroInBackground: mocks.canAutoLoadKokoroInBackground,
  getKokoroDiagnostics: mocks.getKokoroDiagnostics,
  getKokoroPhraseStatus: mocks.getKokoroPhraseStatus,
  getKokoroStatus: mocks.getKokoroStatus,
  isKokoroLoading: mocks.isKokoroLoading,
  isKokoroReady: mocks.isKokoroReady,
  kokoroIsCached: mocks.kokoroIsCached,
  loadKokoro: mocks.loadKokoro,
  markKokoroAutoInitStarted: mocks.markKokoroAutoInitStarted,
  maybeWarmKokoroInBackground: mocks.maybeWarmKokoroInBackground,
  prepareKokoroPhrase: mocks.prepareKokoroPhrase,
  prewarmKokoroPhrases: mocks.prewarmKokoroPhrases,
  speakWithKokoro: mocks.speakWithKokoro,
  stopKokoroPlayback: mocks.stopKokoroPlayback,
  subscribeKokoroPhraseStatus: mocks.subscribeKokoroPhraseStatus,
  subscribeKokoroStatus: mocks.subscribeKokoroStatus,
}))
vi.mock('./phraseStatus', () => ({
  bumpPhraseStatus: mocks.bumpPhraseStatus,
  subscribePhraseStatus: mocks.subscribePhraseStatus,
}))
vi.mock('./piper', () => ({
  getPiperPhraseStatus: mocks.getPiperPhraseStatus,
  getPiperStatus: mocks.getPiperStatus,
  loadPiper: mocks.loadPiper,
  PIPER_VOICE: mocks.PIPER_VOICE,
  prefetchPiperPhrase: mocks.prefetchPiperPhrase,
  speakWithPiper: mocks.speakWithPiper,
  stopPiperPlayback: mocks.stopPiperPlayback,
  subscribePiperStatus: mocks.subscribePiperStatus,
}))
vi.mock('./platform', () => ({
  getSpeechEngine: mocks.getSpeechEngine,
  isNativePlatform: mocks.isNativePlatform,
  isSpeechEnabled: mocks.isSpeechEnabled,
  normalizeSpeechText: mocks.normalizeSpeechText,
  getSpeechLanguage: mocks.getSpeechLanguage,
  getSpeechRate: mocks.getSpeechRate,
}))
vi.mock('./ui', () => ({
  clearAllSpeakStates: mocks.clearAllSpeakStates,
  setSpeaking: mocks.setSpeaking,
  setSpeakLoading: mocks.setSpeakLoading,
}))
vi.mock('./preview', () => ({
  previewVoice: mocks.previewVoice,
  stopTts: mocks.stopTts,
}))
vi.mock('./match', () => ({ speechMatchScore: mocks.speechMatchScore }))
vi.mock('./recognition', () => ({
  ensureMicrophonePermission: mocks.ensureMicrophonePermission,
  getMicrophonePermissionStatus: mocks.getMicrophonePermissionStatus,
  isSpeechRecognitionSupported: mocks.isSpeechRecognitionSupported,
  recognizeOnce: mocks.recognizeOnce,
  releaseMicStream: mocks.releaseMicStream,
  startMicLevelMeter: mocks.startMicLevelMeter,
  stopSpeechRecognition: mocks.stopSpeechRecognition,
}))

import { warmSessionPhrases } from './index'

const texts = Array.from({ length: 30 }, (_, i) => `Phrase ${i}`)

describe('warmSessionPhrases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getSpeechEngine.mockReturnValue('google')
    mocks.isNativePlatform.mockReturnValue(false)
    mocks.isSpeechEnabled.mockReturnValue(true)
    mocks.kokoroIsCached.mockReturnValue(false)
    Object.defineProperty(window, 'speechSynthesis', { value: {}, configurable: true })
  })

  it('prefetches every session phrase for Google and prioritizes the first lines', () => {
    warmSessionPhrases(texts)
    expect(mocks.prefetchGooglePhrase).toHaveBeenCalledTimes(30)
    expect(mocks.prefetchGooglePhrase).toHaveBeenCalledWith('Phrase 0', true)
    expect(mocks.prefetchGooglePhrase).toHaveBeenCalledWith('Phrase 2', true)
    expect(mocks.prefetchGooglePhrase).toHaveBeenCalledWith('Phrase 29')
    expect(mocks.bumpPhraseStatus).toHaveBeenCalled()
  })

  it('loads Piper for the active engine and pre-generates its phrases', () => {
    mocks.getSpeechEngine.mockReturnValue('piper')
    warmSessionPhrases(texts)
    expect(mocks.loadPiper).toHaveBeenCalledTimes(1)
    expect(mocks.prefetchPiperPhrase).toHaveBeenCalledTimes(24)
  })

  it('never forces an uncached Kokoro download on native', () => {
    mocks.getSpeechEngine.mockReturnValue('kokoro')
    mocks.isNativePlatform.mockReturnValue(true)
    warmSessionPhrases(texts)
    expect(mocks.loadKokoro).not.toHaveBeenCalled()
    expect(mocks.prepareKokoroPhrase).not.toHaveBeenCalled()
    expect(mocks.prewarmKokoroPhrases).toHaveBeenCalled()
  })

  it('loads Kokoro when it is cached on native and primes the first lines', () => {
    mocks.getSpeechEngine.mockReturnValue('kokoro')
    mocks.isNativePlatform.mockReturnValue(true)
    mocks.kokoroIsCached.mockReturnValue(true)
    warmSessionPhrases(texts)
    expect(mocks.loadKokoro).toHaveBeenCalledTimes(1)
    expect(mocks.prepareKokoroPhrase).toHaveBeenCalledTimes(3)
    expect(mocks.prewarmKokoroPhrases).toHaveBeenCalledWith(texts.slice(3, 24))
  })

  it('resolves device voices for the system engine', () => {
    mocks.getSpeechEngine.mockReturnValue('system')
    warmSessionPhrases(texts.slice(0, 2))
    expect(mocks.primeWebVoices).toHaveBeenCalled()
    expect(mocks.warmNativeVoices).toHaveBeenCalled()
  })

  it('does nothing when TTS is disabled', () => {
    mocks.isSpeechEnabled.mockReturnValue(false)
    warmSessionPhrases(texts)
    expect(mocks.prefetchGooglePhrase).not.toHaveBeenCalled()
    expect(mocks.loadKokoro).not.toHaveBeenCalled()
  })
})
