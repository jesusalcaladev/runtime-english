import { emitToast } from '../toast'
import { primeWebVoices, speakNative, speakWeb, stopNativeSpeech } from './browser'
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
import { getSpeechEngine, isNativePlatform, isSpeechEnabled, normalizeSpeechText } from './platform'
import type { SpeechStyle } from './types'
import { clearAllSpeakStates, setSpeaking, setSpeakLoading } from './ui'

export { speechMatchScore } from './match'
export { getSpeechLanguage, getSpeechRate, isSpeechEnabled } from './platform'
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

/** Pre-generate on-screen phrases so the first tap on them is instant. */
export function warmSpeechPhrases(texts: string[]): void {
  if (typeof window === 'undefined') return
  if (!isSpeechEnabled() || getSpeechEngine() !== 'kokoro') return
  try {
    prewarmKokoroPhrases(texts)
  } catch {
    // Warmup is best effort.
  }
}

/** Start generating one exact phrase right away (user intent or next dialogue line). */
export function primeSpeechPhrase(text: string): void {
  if (typeof window === 'undefined') return
  if (!isSpeechEnabled() || getSpeechEngine() !== 'kokoro') return
  // Never trigger a heavy uncached model download just by opening a lesson on native.
  if (isNativePlatform() && !kokoroIsCached()) return
  try {
    prepareKokoroPhrase(text)
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
    warmSpeechPhrases(texts)
    // On native, avoid a heavy uncached model download just by opening a lesson.
    if (getSpeechEngine() === 'kokoro' && !(isNativePlatform() && !kokoroIsCached())) {
      void loadKokoro().catch(() => {})
    }
  } catch {
    // Warmup is best effort.
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

  // Browser voice failed (e.g. Brave without voices): try ready Kokoro as fallback.
  return tryKokoroPlayback(text, button)
}

async function playSpeech(
  text: string,
  button?: HTMLElement | null,
  style?: SpeechStyle,
): Promise<void> {
  const engine = getSpeechEngine()

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
      emitToast('No se pudo reproducir el audio. Prueba la voz HQ (Kokoro) en Ajustes.', 'error')
    })
    .finally(() => {
      // Keep "playing" icon/state while audio is speaking; clear only loading.
      setSpeakLoading(button, false)
    })
}
