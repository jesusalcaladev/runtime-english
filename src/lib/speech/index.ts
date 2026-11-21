import { emitToast } from '../toast'
import {
  primeWebVoices,
  speakNative,
  speakWeb,
  stopNativeSpeech,
  warmNativeVoices,
} from './browser'
import {
  getGooglePhraseStatus,
  prefetchGooglePhrase,
  speakWithGoogle,
  stopGooglePlayback,
} from './google'
import {
  canAutoLoadKokoroInBackground,
  getKokoroDiagnostics,
  getKokoroPhraseStatus,
  getKokoroStatus,
  isKokoroLoading,
  isKokoroReady,
  kokoroIsCached,
  loadKokoro,
  markKokoroAutoInitStarted,
  maybeWarmKokoroInBackground,
  prepareKokoroPhrase,
  prewarmKokoroPhrases,
  speakWithKokoro,
  stopKokoroPlayback,
  subscribeKokoroPhraseStatus,
  subscribeKokoroStatus,
} from './kokoro'
import { bumpPhraseStatus, subscribePhraseStatus } from './phraseStatus'
import {
  getPiperPhraseStatus,
  loadPiper,
  prefetchPiperPhrase,
  speakWithPiper,
  stopPiperPlayback,
} from './piper'
import { getSpeechEngine, isNativePlatform, isSpeechEnabled, normalizeSpeechText } from './platform'
import type { SpeechStyle } from './types'
import { clearAllSpeakStates, setSpeaking, setSpeakLoading } from './ui'

export { getWebVoices } from './browser'
export { speechMatchScore } from './match'
export {
  getPiperStatus,
  loadPiper,
  PIPER_VOICE,
  stopPiperPlayback,
  subscribePiperStatus,
} from './piper'
export { getSpeechLanguage, getSpeechRate, isSpeechEnabled } from './platform'
export { previewVoice, stopTts } from './preview'
export {
  ensureMicrophonePermission,
  getMicrophonePermissionStatus,
  isSpeechRecognitionSupported,
  recognizeOnce,
  releaseMicStream,
  startMicLevelMeter,
  stopSpeechRecognition,
} from './recognition'
export type { KokoroStatus, SpeechRecognitionResult, SpeechStyle } from './types'
export {
  getKokoroDiagnostics,
  getKokoroPhraseStatus,
  getKokoroStatus,
  kokoroIsCached,
  loadKokoro,
  maybeWarmKokoroInBackground,
  subscribeKokoroPhraseStatus,
  subscribeKokoroStatus,
}

/** First phrases of a session are generated with priority; the rest are queued. */
const SESSION_PRIORITY_PHRASES = 3
/** Bound bulk warming so opening a lesson never queues hundreds of generations/downloads. */
const SESSION_WARM_LIMIT = 24
/** Google downloads small MP3s through a bounded queue, so we can warm a whole lesson. */
const GOOGLE_WARM_LIMIT = 160

const KOKORO_AUTOLOAD_IDLE_TIMEOUT_MS = 6_000
const KOKORO_AUTOLOAD_FALLBACK_DELAY_MS = 2_500
const VOICES_INIT_AUTOLOAD_DELAY_MS = 1_200
const KOKORO_WIFI_PREFETCH_DELAY_MS = 4_000

if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(
    window as Window & { getKokoroDiagnostics?: typeof getKokoroDiagnostics }
  ).getKokoroDiagnostics = getKokoroDiagnostics
}

let kokoroReadyNoticeShown = false

function notifyKokoroReadyOnce(): void {
  if (kokoroReadyNoticeShown || getSpeechEngine() !== 'kokoro') return
  kokoroReadyNoticeShown = true
  emitToast('Voz HQ lista. Se usará en la próxima reproducción.', 'info')
}

export type SpeechPhraseStatus = { ready: number; total: number }

// Kokoro publishes its own phrase-status events; bridge them into the shared signal.
if (typeof window !== 'undefined') {
  subscribeKokoroPhraseStatus(() => bumpPhraseStatus())
}

export function subscribeSpeechPhraseStatus(listener: () => void): () => void {
  return subscribePhraseStatus(listener)
}

/** Readiness of the exact phrases for the currently selected TTS engine. */
export function getSpeechPhraseStatus(texts: string[]): SpeechPhraseStatus {
  if (typeof window === 'undefined') return { ready: 0, total: 0 }
  const engine = getSpeechEngine()
  if (engine === 'kokoro') return getKokoroPhraseStatus(texts)
  if (engine === 'google') return getGooglePhraseStatus(texts)
  if (engine === 'piper') return getPiperPhraseStatus(texts)
  // The device voice is always available: there is nothing to pre-generate.
  return { ready: texts.length, total: texts.length }
}

/** Pre-generate on-screen phrases so the first tap on them is instant. */
export function warmSpeechPhrases(texts: string[]): void {
  if (typeof window === 'undefined' || !isSpeechEnabled() || texts.length === 0) return
  try {
    const engine = getSpeechEngine()
    if (engine === 'kokoro') prewarmKokoroPhrases(texts)
    else if (engine === 'google') texts.forEach((text) => prefetchGooglePhrase(text, true))
    else if (engine === 'piper') texts.forEach((text) => prefetchPiperPhrase(text))
  } catch {
    // Warmup is best effort.
  }
}

/**
 * Start preparing one exact phrase right away (user intent or next dialogue line).
 * Works for every engine: Kokoro generates audio, Google/Piper download/generate
 * and cache it, and the system voice just resolves once and is reused.
 */
export function primeSpeechPhrase(text: string): void {
  if (typeof window === 'undefined') return
  if (!isSpeechEnabled()) return
  try {
    switch (getSpeechEngine()) {
      case 'kokoro':
        // Never trigger a heavy uncached model download just by opening a lesson on native.
        if (isNativePlatform() && !kokoroIsCached()) return
        prepareKokoroPhrase(text)
        break
      case 'google':
        prefetchGooglePhrase(text)
        break
      case 'piper':
        prefetchPiperPhrase(text)
        break
      default:
        if (canUseWebSpeech()) primeWebVoices()
        warmNativeVoices()
        break
    }
    bumpPhraseStatus()
  } catch {
    // Priming is best effort.
  }
}

function canPrefetchModelOnCurrentConnection(): boolean {
  if (typeof navigator === 'undefined') return false
  const connection = (
    navigator as Navigator & {
      connection?: { type?: string; saveData?: boolean; effectiveType?: string }
    }
  ).connection
  if (!connection) return !isNativePlatform()
  if (connection.saveData) return false
  if (connection.type && connection.type !== 'wifi' && connection.type !== 'ethernet') return false
  if (connection.effectiveType && /^(slow-)?2g$/.test(connection.effectiveType)) return false
  return true
}

/** Warm everything a conversation needs: system voices, HQ engine and the exact lines. */
export function warmConversationPhrases(texts: string[]): void {
  if (typeof window === 'undefined') return
  if (!isSpeechEnabled() || texts.length === 0) return
  try {
    if (canUseWebSpeech()) primeWebVoices()
    warmNativeVoices()
    warmSpeechPhrases(texts)
    // Prime the first lines immediately so the dialogue starts without waiting.
    for (const text of texts.slice(0, 3)) primeSpeechPhrase(text)
    // On native, avoid a heavy uncached model download just by opening a lesson.
    if (getSpeechEngine() === 'kokoro' && !(isNativePlatform() && !kokoroIsCached())) {
      void loadKokoro().catch(() => {})
    }
  } catch {
    // Warmup is best effort.
  }
}

/**
 * Warm every phrase a lesson can speak with the engine the learner actually uses.
 * Voice resolution is always cheap; audio generation is limited to the cache size
 * and never forces a heavy uncached model download on native.
 */
export function warmSessionPhrases(texts: string[]): void {
  if (typeof window === 'undefined') return
  if (!isSpeechEnabled() || texts.length === 0) return
  try {
    // The system/native voice is instant once resolved, regardless of the engine.
    if (canUseWebSpeech()) primeWebVoices()
    warmNativeVoices()

    const selected = texts.slice(0, SESSION_WARM_LIMIT)
    const engine = getSpeechEngine()

    if (engine === 'kokoro') {
      // Opening a lesson must not trigger a 90 MB download on native.
      if (!(isNativePlatform() && !kokoroIsCached())) void loadKokoro().catch(() => {})
      for (const text of selected.slice(0, SESSION_PRIORITY_PHRASES)) primeSpeechPhrase(text)
      prewarmKokoroPhrases(selected.slice(SESSION_PRIORITY_PHRASES))
      return
    }

    if (engine === 'google') {
      // Con la cola limitada ya no saturamos la red: en conexión sana se calienta
      // TODA la sesión (hasta el límite de caché); en conexión lenta, las primeras.
      const bulk = canPrefetchModelOnCurrentConnection()
      const limit = bulk ? GOOGLE_WARM_LIMIT : SESSION_WARM_LIMIT
      const googleTexts = texts.slice(0, limit)
      googleTexts
        .slice(0, SESSION_PRIORITY_PHRASES)
        .forEach((text) => prefetchGooglePhrase(text, true))
      googleTexts.slice(SESSION_PRIORITY_PHRASES).forEach((text) => prefetchGooglePhrase(text))
      bumpPhraseStatus()
      return
    }

    if (engine === 'piper') {
      // prefetchPiperPhrase is a no-op until the model is loaded; load it here only
      // when it is safe and the learner explicitly selected Piper.
      if (!isNativePlatform() && canPrefetchModelOnCurrentConnection()) {
        void loadPiper().catch(() => {})
      }
      for (const text of selected) prefetchPiperPhrase(text)
      bumpPhraseStatus()
      return
    }

    bumpPhraseStatus()
  } catch {
    // Warmup is best effort: never break the lesson.
  }
}

/** Awaitable single line, used to play a dialogue in order with natural pauses. */
export async function speakLine(text: string, style?: SpeechStyle): Promise<void> {
  const cleanText = normalizeSpeechText(text)
  if (!cleanText || !isSpeechEnabled()) return
  warmSpeechEngine()
  await playSpeech(cleanText, null, style)
}

function canUseWebSpeech(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function requestIdleOrTimeout(
  callback: () => void,
  timeoutMs: number,
  fallbackDelayMs: number,
): void {
  if (typeof window === 'undefined') return

  const requestIdle = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void
    }
  ).requestIdleCallback

  if (typeof requestIdle === 'function') {
    requestIdle(callback, { timeout: timeoutMs })
    return
  }

  setTimeout(callback, fallbackDelayMs)
}

function notifySpeechUnavailableAfterBrowserFailure(): void {
  emitToast(
    kokoroIsCached()
      ? 'La voz del navegador falló. Carga o usa la voz HQ (Kokoro) en Ajustes.'
      : 'La voz del navegador no está disponible (común en Brave). Descarga y usa la voz HQ (Kokoro) en Ajustes → Pronunciación.',
    'error',
  )
}

export function warmSpeechEngine(): void {
  if (typeof window === 'undefined') return

  try {
    if (isSpeechEnabled() && canUseWebSpeech()) {
      primeWebVoices()
    }

    // Warm/load Kokoro eagerly on user intent when HQ voice is selected.
    // This reduces first-play latency (download/init/warm) compared to waiting for click playback.
    if (getSpeechEngine() === 'kokoro') {
      if (!isKokoroReady() && !isKokoroLoading()) {
        void loadKokoro().catch(() => {})
      } else {
        maybeWarmKokoroInBackground()
      }
    }
  } catch {
    // Warmup is best-effort and must never break user interaction.
  }
}

export function stopSpeech(): void {
  if (typeof window === 'undefined') return

  stopKokoroPlayback()
  stopPiperPlayback()
  stopGooglePlayback()

  try {
    window.speechSynthesis?.cancel()
  } catch {
    // Ignore browser synthesis shutdown errors.
  }

  // Reset previous button states before starting a new playback.
  clearAllSpeakStates()

  if (isNativePlatform()) {
    void stopNativeSpeech()
  }
}

export function maybeAutoLoadKokoro(): void {
  if (typeof window === 'undefined') return
  if (!canAutoLoadKokoroInBackground()) return

  // Only preload when the user explicitly selected Kokoro as engine.
  // Background preloading (even if cached) can be CPU/memory heavy on mobile/WebView.
  if (getSpeechEngine() !== 'kokoro') return

  markKokoroAutoInitStarted()

  const start = () => {
    void loadKokoro().catch((error) => console.warn('Kokoro auto-load failed', error))
  }

  requestIdleOrTimeout(start, KOKORO_AUTOLOAD_IDLE_TIMEOUT_MS, KOKORO_AUTOLOAD_FALLBACK_DELAY_MS)
}

export function initVoices(): void {
  if (typeof window === 'undefined') return

  if (canUseWebSpeech()) {
    primeWebVoices()
  }

  // If HQ engine is selected and cached, preload later in a non-blocking way.
  setTimeout(() => {
    try {
      maybeAutoLoadKokoro()
    } catch {
      // Ignore background preload failures during init.
    }
  }, VOICES_INIT_AUTOLOAD_DELAY_MS)

  // First run with HQ selected: fetch the model in the background only on an
  // unmetered connection, so the very first tap is not a ~92 MB download.
  if (getSpeechEngine() === 'kokoro' && !kokoroIsCached()) {
    window.setTimeout(() => {
      try {
        if (!canPrefetchModelOnCurrentConnection()) return
        if (getSpeechEngine() !== 'kokoro' || kokoroIsCached()) return
        void loadKokoro().catch(() => {})
      } catch {
        // Ignore background prefetch failures during init.
      }
    }, KOKORO_WIFI_PREFETCH_DELAY_MS)
  }
}

async function tryKokoroPlayback(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (!isKokoroReady()) return false

  setSpeakLoading(button, true)
  setSpeaking(button, true)

  const handled = await speakWithKokoro(text, button).catch(() => false)
  if (!handled) {
    setSpeakLoading(button, false)
  }

  return handled
}

async function playWithSystemVoice(
  text: string,
  button?: HTMLElement | null,
  style?: SpeechStyle,
): Promise<boolean> {
  if (isNativePlatform()) {
    return speakNative(text, button, style)
  }

  const webHandled = await speakWeb(text, button, style)
  if (webHandled) return true

  // Brave/Linux often has no Web Speech voices: use the fast online voice first.
  if (await speakWithGoogle(text, button)) return true

  // Last resort: a Kokoro model that is already loaded (never wait for download).
  return tryKokoroPlayback(text, button)
}

async function playSpeech(
  text: string,
  button?: HTMLElement | null,
  style?: SpeechStyle,
): Promise<void> {
  const engine = getSpeechEngine()

  if (engine === 'google') {
    if (await speakWithGoogle(text, button).catch(() => false)) return
    const handledByWeb = await speakWeb(text, button, style).catch(() => false)
    if (handledByWeb) return
    if (await tryKokoroPlayback(text, button)) return
    setSpeaking(button, false)
    setSpeakLoading(button, false)
    emitToast('No se pudo reproducir la voz online. Revisa tu conexión.', 'error')
    return
  }

  if (engine === 'piper') {
    const handledByPiper = await speakWithPiper(text, button, style).catch(() => false)
    if (handledByPiper) return
    // Si Piper falla (sin red para la voz), usamos la voz del dispositivo.
    const handledBySystem = await playWithSystemVoice(text, button, style).catch(() => false)
    if (!handledBySystem) {
      setSpeaking(button, false)
      setSpeakLoading(button, false)
      emitToast('No se pudo reproducir la voz Piper ni la del dispositivo.', 'error')
    }
    return
  }

  if (engine === 'kokoro') {
    if (!isKokoroReady()) {
      // Load (or attach to the in-flight load) in the background. The tap never waits for it.
      void loadKokoro()
        .then((ok) => {
          if (ok) notifyKokoroReadyOnce()
        })
        .catch(() => {})
    }

    if (isKokoroReady()) {
      const handledByKokoro = await speakWithKokoro(text, button).catch(() => false)
      if (handledByKokoro) return
    }

    // HQ model not ready (or generation failed): play immediately with the system voice.
    const handledBySystem = await playWithSystemVoice(text, button, style).catch(() => false)
    if (!handledBySystem) {
      setSpeaking(button, false)
      setSpeakLoading(button, false)
      emitToast('No se pudo reproducir la voz del sistema ni la voz HQ.', 'error')
    }
    return
  }

  if (isNativePlatform()) {
    const handled = await speakNative(text, button, style).catch(() => false)
    if (!handled) {
      setSpeaking(button, false)
      setSpeakLoading(button, false)
      emitToast('No se pudo reproducir la voz nativa.', 'error')
    }
    return
  }

  const webHandled = await speakWeb(text, button, style).catch(() => false)
  if (webHandled) return

  const handledByKokoroFallback = await tryKokoroPlayback(text, button)
  if (handledByKokoroFallback) return

  setSpeaking(button, false)
  setSpeakLoading(button, false)
  notifySpeechUnavailableAfterBrowserFailure()
}

export function speak(text: string, button?: HTMLElement | null, style?: SpeechStyle): void {
  if (typeof window === 'undefined') return

  const cleanText = normalizeSpeechText(text)
  if (!cleanText || !isSpeechEnabled()) return

  // Immediate visual feedback while engine/voices/audio warm up.
  setSpeakLoading(button, true)
  setSpeaking(button, false)
  stopSpeech() // Stop previous playback and clear previous button states.
  setSpeakLoading(button, true)
  setSpeaking(button, false)
  warmSpeechEngine()

  void playSpeech(cleanText, button, style)
    .catch(() => {
      setSpeaking(button, false)
      setSpeakLoading(button, false)
      emitToast(
        'No se pudo reproducir el audio. Prueba otra voz en Ajustes (Google/Kokoro).',
        'error',
      )
    })
    .finally(() => {
      // Keep "playing" icon/state while audio is speaking; clear only loading.
      setSpeakLoading(button, false)
    })
}
