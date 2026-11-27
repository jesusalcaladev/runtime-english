import {
  getPreferredVoiceName,
  getSpeechLanguage,
  getSpeechPitch,
  getSpeechRate,
  isNativePlatform,
} from './platform'
import type { SpeechStyle } from './types'
import { setSpeaking } from './ui'
import {
  TTS_REMOTE_START_TIMEOUT_MS,
  TTS_START_TIMEOUT_MS,
  TTS_UTTERANCE_TIMEOUT_MS,
  ttsAttemptDeadlineMs,
  withFallback,
} from './watchdog'

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
  void getWebVoices(300)
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

/** Network voices need a longer first-word window than local ones. */
export function ttsStartTimeoutForVoice(voice: SpeechSynthesisVoice | null): number {
  return voice && !voice.localService ? TTS_REMOTE_START_TIMEOUT_MS : TTS_START_TIMEOUT_MS
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
/** One entry per accent: switching en-US/en-GB must not reuse the old voice. */
const nativeVoicePromises = new Map<string, Promise<NativeVoiceChoice>>()

/** Resuelve la voz nativa una sola vez por idioma (evita consultarla en cada línea). */
function resolveNativeVoice(): Promise<NativeVoiceChoice> {
  const preferredLang = getSpeechLanguage()
  const cached = nativeVoicePromises.get(preferredLang)
  if (cached) return cached

  const promise = import('@capacitor-community/text-to-speech')
    .then(async ({ TextToSpeech }) => {
      try {
        const supported = await TextToSpeech.getSupportedVoices()
        const voices = Array.isArray((supported as { voices?: unknown[] })?.voices)
          ? ((supported as { voices: Array<{ lang?: string; index?: number; name?: string }> })
              .voices ?? [])
          : []
        const matchesLang = voices.filter(
          (item) => (item.lang ?? '').toLowerCase() === preferredLang.toLowerCase(),
        )
        const pool = matchesLang.length
          ? matchesLang
          : voices.filter((item) => (item.lang ?? '').toLowerCase().startsWith('en'))
        const preferredName = getPreferredVoiceName()?.toLowerCase()
        const pick =
          (preferredName
            ? pool.find((item) => (item.name ?? '').toLowerCase() === preferredName)
            : undefined) ??
          pool[0] ??
          voices.find((item) => (item.lang ?? '').toLowerCase().startsWith('en'))
        return {
          lang: pick?.lang ?? preferredLang,
          ...(typeof pick?.index === 'number' ? { voice: pick.index } : {}),
        }
      } catch {
        return { lang: preferredLang }
      }
    })
    .catch((): NativeVoiceChoice => ({ lang: preferredLang }))
  nativeVoicePromises.set(preferredLang, promise)
  return promise
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

    const makeOptions = (useVoice: boolean): Record<string, unknown> => ({
      text,
      lang,
      rate: getSpeechRate() * (style?.rateScale ?? 1),
      pitch: (style?.pitch ?? 1) * getSpeechPitch(),
      volume: 1,
      ...(useVoice && typeof voice === 'number' ? { voice } : {}),
      queueStrategy: 0,
    })

    // The plugin resolves `speak()` only on onDone/onError, and `stop()` clears
    // pending callbacks without settling them. Bound each attempt so a frozen
    // engine (or an interrupted utterance) can never hang a preview or a lesson.
    const speakOnce = (useVoice: boolean): Promise<boolean> =>
      withFallback(
        TextToSpeech.speak(makeOptions(useVoice) as never)
          .then(() => true)
          .catch(() => false),
        ttsAttemptDeadlineMs(text),
        false,
        () => {
          void TextToSpeech.stop().catch(() => undefined)
        },
      )

    await TextToSpeech.stop().catch(() => undefined)
    setSpeaking(button, true)
    try {
      if (await speakOnce(true)) return true
      // A stale/unsupported voice index is a common failure: let Android pick
      // its own default voice once before giving up.
      await TextToSpeech.stop().catch(() => undefined)
      return await speakOnce(false)
    } finally {
      setSpeaking(button, false)
    }
  } catch {
    setSpeaking(button, false)
    return false
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
    voices = await getWebVoices(200)
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

    // Chrome drops an utterance when cancel() and speak() share a tick, so a
    // dirty queue needs a one-frame delay. Most taps hit a clean queue — speak
    // synchronously in that case for the lowest possible time-to-first-word.
    const needsReset = synth.speaking || synth.pending
    if (needsReset) {
      try {
        synth.cancel()
      } catch {}
      try {
        synth.resume()
      } catch {}
    }

    const speakNow = () => {
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

      // If no audio starts quickly, cancel the stuck native queue and report
      // failure so the router can use the fast online voice without delay.
      // Remote voices legitimately take longer on their first word.
      const startTimeout = ttsStartTimeoutForVoice(voice ?? null)
      startTimer = window.setTimeout(() => {
        if (started || finished) return
        abortedByUs = true
        try {
          synth.cancel()
        } catch {}
        finish(false)
      }, startTimeout)

      try {
        synth.speak(utterance)
      } catch {
        finish(false)
        return
      }
      try {
        synth.resume()
      } catch {}
    }

    if (needsReset) window.setTimeout(speakNow, 40)
    else speakNow()
  })
}
