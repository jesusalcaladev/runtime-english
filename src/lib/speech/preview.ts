import {
  getWebVoices,
  hasUsableWebVoice,
  noteSpeechCancel,
  speakNative,
  stopNativeSpeech,
} from './browser'
import { speakWithGoogle, stopGooglePlayback } from './google'
import { isKokoroReady, speakWithKokoro, stopKokoroPlayback } from './kokoro'
import { getPiperStatus, speakWithPiper, stopPiperPlayback } from './piper'
import {
  getPreferredVoiceName,
  getSpeechEngine,
  getSpeechPitch,
  getSpeechRate,
  isNativePlatform,
} from './platform'
import { TTS_START_TIMEOUT_MS, ttsAttemptDeadlineMs, withFallback } from './watchdog'

/** Detiene cualquier reproducción en curso (web y nativa). */
export async function stopTts(): Promise<void> {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
      noteSpeechCancel()
    } catch {
      // Best effort.
    }
  }
  await stopNativeSpeech()
  stopPiperPlayback()
  stopGooglePlayback()
  stopKokoroPlayback()
}

function playOnlinePreview(text: string): Promise<boolean> {
  return withFallback(
    speakWithGoogle(text).catch(() => false),
    ttsAttemptDeadlineMs(text),
    false,
    () => stopGooglePlayback(),
  )
}

/**
 * Reproduce una frase corta con la voz elegida.
 *
 * La señal de éxito es `onstart` (el audio ya se oye), no `onend` (que llega al
 * terminar la frase). Esperar a `onend` con un plazo de arranque hacería que una
 * muestra normal se cancelara a los ~1,2 s y saltara a la voz online.
 */
export async function previewVoice(text: string, voiceName?: string): Promise<boolean> {
  await stopTts()

  // La muestra debe probar el motor que realmente se usa en las lecciones.
  const engine = getSpeechEngine()
  if (engine === 'google') {
    if (await playOnlinePreview(text)) return true
    // On Android the device voice is still a valid fallback when the endpoint
    // is blocked; always give audible feedback.
    return isNativePlatform() ? speakNative(text).catch(() => false) : false
  }
  // A preview must not trigger Piper's large model download: use it only when
  // it is already loaded (choosing Piper in Ajustes starts that download).
  if (
    engine === 'piper' &&
    getPiperStatus().state === 'ready' &&
    (await speakWithPiper(text).catch(() => false))
  ) {
    return true
  }
  // Nunca fuerza una descarga pesada sólo por probar: usa Kokoro si ya está listo.
  if (engine === 'kokoro' && isKokoroReady() && (await speakWithKokoro(text).catch(() => false))) {
    return true
  }

  // En el APK la voz que se usa de verdad es la nativa: probar con Google daría
  // una muestra distinta (y fallaría sin red).
  if (isNativePlatform()) {
    const handled = await speakNative(text).catch(() => false)
    return handled ? true : playOnlinePreview(text)
  }

  // Browsers without host voices (Brave/Linux) cannot preview a device voice.
  // Use the fast online voice so the button always produces audible feedback.
  if (!hasUsableWebVoice()) return playOnlinePreview(text)

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false

  const voices = await getWebVoices(300)
  const wanted = (voiceName ?? getPreferredVoiceName() ?? '').toLowerCase()
  const voice =
    (wanted ? voices.find((item) => item.name.toLowerCase() === wanted) : undefined) ??
    voices.find((item) => item.lang.toLowerCase().startsWith('en')) ??
    null

  const utterance = new SpeechSynthesisUtterance(text)
  if (voice) utterance.voice = voice
  utterance.lang = voice?.lang ?? 'en-US'
  utterance.rate = getSpeechRate()
  utterance.pitch = getSpeechPitch()
  utterance.volume = 1

  const spoke = await withFallback(
    new Promise<boolean>((resolve) => {
      let settled = false
      let guard = 0
      const finish = (ok: boolean) => {
        if (settled) return
        settled = true
        if (guard) window.clearTimeout(guard)
        resolve(ok)
      }
      // Resolves as soon as the device voice actually starts: the user can hear
      // the rest of the sample even though onend will not fire for several seconds.
      utterance.onstart = () => finish(true)
      utterance.onend = () => finish(true)
      utterance.onerror = () => finish(false)
      guard = window.setTimeout(() => finish(false), TTS_START_TIMEOUT_MS + 500)
      try {
        window.speechSynthesis.speak(utterance)
      } catch {
        finish(false)
      }
    }),
    TTS_START_TIMEOUT_MS + 1_000,
    false,
    () => {
      try {
        window.speechSynthesis.cancel()
        noteSpeechCancel()
      } catch {
        // Best effort.
      }
    },
  )
  if (spoke) return true

  // The device voice was present but failed to start: still give the learner
  // audible feedback through the fast online voice.
  return playOnlinePreview(text)
}
