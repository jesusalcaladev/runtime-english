import {
  getPreferredVoiceName,
  getSpeechLanguage,
  getSpeechPitch,
  getSpeechRate,
  isNativePlatform,
  wait,
} from './platform'
import type { SpeechStyle } from './types'
import { setSpeaking } from './ui'
import { TTS_START_TIMEOUT_MS, TTS_UTTERANCE_TIMEOUT_MS } from './watchdog'

let cachedVoice: SpeechSynthesisVoice | null = null
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null

const LANG_SCORES: Record<string, number> = {
  'en-us': 40,
  'en-gb': 34,
}

const NAME_RULES: ReadonlyArray<readonly [RegExp, number]> = [
  [/\b(?:natural|neural|premium|enhanced)\b/, 30],
  [/google (?:us|uk) english/, 24],
  [/microsoft (?:.*online|aria|jenny|guy|libby|ryan)\b/, 24],
  [/\b(?:samantha|daniel|alex|karen|moira|tessa|fiona|ava|allison|siri)\b/, 14],
  [/\bgoogle\b/, 10],
  [/\bmicrosoft\b/, 8],
]

function isEnglishVoice(voice: SpeechSynthesisVoice): boolean {
  return voice.lang.toLowerCase().startsWith('en')
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()

  let score = LANG_SCORES[lang] ?? (lang.startsWith('en') ? 20 : 0)

  for (const [pattern, points] of NAME_RULES) {
    if (pattern.test(name)) score += points
  }

  if (!voice.localService) score += 3
  if (voice.default) score += 1

  return score
}

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter(isEnglishVoice)
  if (english.length === 0) return null
  const preferred = getSpeechLanguage().toLowerCase()
  const matching = english.filter((voice) => voice.lang.toLowerCase() === preferred)
  const pool = matching.length > 0 ? matching : english
  const preferredName = getPreferredVoiceName()
  if (preferredName) {
    const exact = pool.find((voice) => voice.name.toLowerCase() === preferredName.toLowerCase())
    if (exact) return exact
  }
  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null
}

export async function getWebVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return []
  }

  const synth = window.speechSynthesis
  const current = synth.getVoices()
  if (current.length > 0) {
    cachedVoice = pickEnglishVoice(current)
    return current
  }

  if (!voicesPromise) {
    voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
      let settled = false

      const finish = () => {
        if (settled) return
        settled = true
        const voices = synth.getVoices()
        if (voices.length > 0) cachedVoice = pickEnglishVoice(voices)
        resolve(voices)
      }

      const previous = synth.onvoiceschanged
      synth.onvoiceschanged = (event) => {
        previous?.call(synth, event)
        finish()
      }

      window.setTimeout(finish, timeoutMs)
    }).finally(() => {
      voicesPromise = null
    })
  }

  return voicesPromise
}

export function primeWebVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  void getWebVoices(1200)
}

/**
 * Synchronous check used by the playback router: when the browser has no
 * English voice *right now* we skip Web Speech entirely and go straight to the
 * fast online voice instead of waiting for `voiceschanged` that may never fire.
 */
export function hasUsableWebVoice(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  try {
    return window.speechSynthesis.getVoices().some(isEnglishVoice)
  } catch {
    return false
  }
}

export async function stopNativeSpeech() {
  if (!isNativePlatform()) return
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
    await TextToSpeech.stop()
  } catch {
    // Best effort.
  }
}

type NativeVoiceChoice = { lang: string; voice?: number }
let nativeVoicePromise: Promise<NativeVoiceChoice> | null = null

/** Resuelve la voz nativa una sola vez por sesión (evita consultarla en cada línea). */
function resolveNativeVoice(): Promise<NativeVoiceChoice> {
  const preferredLang = getSpeechLanguage()
  if (!nativeVoicePromise) {
    nativeVoicePromise = import('@capacitor-community/text-to-speech')
      .then(async ({ TextToSpeech }) => {
        try {
          const supported = await TextToSpeech.getSupportedVoices()
          const voices = Array.isArray((supported as { voices?: unknown[] })?.voices)
            ? ((supported as { voices: Array<{ lang?: string; index?: number }> }).voices ?? [])
            : []
          const pick =
            voices.find(
              (item) => (item.lang ?? '').toLowerCase() === preferredLang.toLowerCase(),
            ) ?? voices.find((item) => (item.lang ?? '').toLowerCase().startsWith('en'))
          return {
            lang: pick?.lang ?? preferredLang,
            ...(typeof pick?.index === 'number' ? { voice: pick.index } : {}),
          }
        } catch {
          return { lang: preferredLang }
        }
      })
      .catch((): NativeVoiceChoice => ({ lang: preferredLang }))
  }
  return nativeVoicePromise
}

/** Calienta la voz nativa antes de que empiece la primera línea del diálogo. */
export function warmNativeVoices(): void {
  if (!isNativePlatform()) return
  void resolveNativeVoice()
}

export async function speakNative(
  text: string,
  button?: HTMLElement | null,
  style?: SpeechStyle,
): Promise<boolean> {
  if (!isNativePlatform()) return false

  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
    const { lang, voice } = await resolveNativeVoice()

    await TextToSpeech.stop().catch(() => undefined)

    const options = {
      text,
      lang,
      rate: getSpeechRate() * (style?.rateScale ?? 1),
      pitch: (style?.pitch ?? 1) * getSpeechPitch(),
      volume: 1,
      ...(typeof voice === 'number' ? { voice } : {}),
      queueStrategy: 0,
    } as Record<string, unknown>

    // Show "playing" state while native TTS is active.
    setSpeaking(button, true)
    try {
      await TextToSpeech.speak(options as never)
      return true
    } catch {
      await wait(350)
      await TextToSpeech.speak(options as never)
      return true
    }
  } catch {
    setSpeaking(button, false)
    return false
  } finally {
    setSpeaking(button, false)
  }
}

export async function speakWeb(
  text: string,
  button?: HTMLElement | null,
  style?: SpeechStyle,
): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    setSpeaking(button, false)
    return false
  }

  const synth = window.speechSynthesis

  // One *short* voice wait only. Waiting 2.5 s for voices that never appear was
  // the main reason a tap on web felt dead (Brave/Linux with no system voices).
  let voices = synth.getVoices()
  if (voices.length === 0) {
    voices = await getWebVoices(500)
  }
  cachedVoice = pickEnglishVoice(voices.length ? voices : synth.getVoices()) ?? cachedVoice

  return new Promise<boolean>((resolve) => {
    let started = false
    let finished = false
    let abortedByUs = false
    let startTimer = 0
    let endTimer = 0
    let keepAlive = 0

    const finish = (ok: boolean) => {
      if (finished) return
      finished = true
      window.clearTimeout(startTimer)
      window.clearTimeout(endTimer)
      window.clearInterval(keepAlive)
      setSpeaking(button, false)
      resolve(ok)
    }

    // Reset the native queue once, then wait a frame before speaking: Chrome
    // silently drops an utterance when cancel() and speak() share a tick.
    try {
      synth.cancel()
    } catch {}
    try {
      synth.resume()
    } catch {}

    window.setTimeout(() => {
      if (finished) return

      let utterance: SpeechSynthesisUtterance
      try {
        utterance = new SpeechSynthesisUtterance(text)
      } catch {
        finish(false)
        return
      }

      const currentVoices = synth.getVoices()
      if (currentVoices.length) cachedVoice = pickEnglishVoice(currentVoices) ?? cachedVoice
      const voice = cachedVoice

      utterance.lang = voice?.lang || getSpeechLanguage()
      utterance.rate = getSpeechRate() * (style?.rateScale ?? 1)
      utterance.pitch = (style?.pitch ?? 1) * getSpeechPitch()
      utterance.volume = 1
      if (voice) utterance.voice = voice

      utterance.onstart = () => {
        if (finished) return
        if (!started) {
          started = true
          window.clearTimeout(startTimer)
          setSpeaking(button, true)
          // Bounded by a generous hard cap so long transcript lines still play,
          // but a stalled utterance can never hang the exercise for minutes.
          const estimate = Math.min(
            TTS_UTTERANCE_TIMEOUT_MS,
            Math.max(2_500, text.length * 100 + 1_500),
          )
          endTimer = window.setTimeout(() => finish(true), estimate)
          keepAlive = window.setInterval(() => {
            try {
              if (synth.speaking && !synth.paused) {
                synth.pause()
                synth.resume()
              }
            } catch {}
          }, 4_000)
        }
      }
      utterance.onend = () => finish(true)
      utterance.onerror = (event) => {
        const error = (event as SpeechSynthesisErrorEvent & { error?: string })?.error
        // A cancellation is expected when the learner stops/replaces playback.
        // (Our own start-timeout cancel is the exception: that means "no audio".)
        if (error === 'interrupted' || error === 'canceled') {
          finish(!abortedByUs)
          return
        }
        // No 3x retry loop: fall back to the online voice immediately.
        finish(false)
      }

      // If no audio starts within ~1.6 s, cancel the stuck native queue and
      // report failure so the router can use the fast online voice.
      startTimer = window.setTimeout(() => {
        if (started || finished) return
        abortedByUs = true
        try {
          synth.cancel()
        } catch {}
        finish(false)
      }, TTS_START_TIMEOUT_MS)

      try {
        synth.speak(utterance)
      } catch {
        finish(false)
        return
      }
      try {
        synth.resume()
      } catch {}
    }, 40)
  })
}
