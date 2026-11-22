import { getWebVoices, hasUsableWebVoice, stopNativeSpeech } from './browser'
import { speakWithGoogle, stopGooglePlayback } from './google'
import { stopKokoroPlayback } from './kokoro'
import { stopPiperPlayback } from './piper'
import { getPreferredVoiceName, getSpeechPitch, getSpeechRate } from './platform'
import { TTS_ATTEMPT_TIMEOUT_MS, TTS_START_TIMEOUT_MS, withFallback } from './watchdog'

/** Detiene cualquier reproducción en curso (web y nativa). */
export async function stopTts(): Promise<void> {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Best effort.
    }
  }
  await stopNativeSpeech()
  stopPiperPlayback()
  stopGooglePlayback()
  stopKokoroPlayback()
}

/**
 * Reproduce una frase corta con la voz elegida, sin depender del motor HQ.
 * Útil para probar voices del dispositivo antes de guardar la preferencia.
 */
export async function previewVoice(text: string, voiceName?: string): Promise<boolean> {
  await stopTts()

  // Browsers without host voices (Brave/Linux) cannot preview a device voice.
  // Use the fast online voice so the button always produces audible feedback
  // instead of spinning and failing silently.
  if (!hasUsableWebVoice()) {
    return withFallback(
      speakWithGoogle(text).catch(() => false),
      TTS_ATTEMPT_TIMEOUT_MS,
      false,
      () => stopGooglePlayback(),
    )
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false

  const voices = await getWebVoices(2000)
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
      const finish = (ok: boolean) => {
        if (settled) return
        settled = true
        resolve(ok)
      }
      utterance.onend = () => finish(true)
      utterance.onerror = () => finish(false)
      try {
        window.speechSynthesis.speak(utterance)
      } catch {
        finish(false)
      }
    }),
    TTS_START_TIMEOUT_MS + 2_000,
    false,
    () => {
      try {
        window.speechSynthesis.cancel()
      } catch {
        // Best effort.
      }
    },
  )
  if (spoke) return true

  // The device voice was present but failed to start: still give the learner
  // audible feedback through the fast online voice.
  return withFallback(
    speakWithGoogle(text).catch(() => false),
    TTS_ATTEMPT_TIMEOUT_MS,
    false,
    () => stopGooglePlayback(),
  )
}
