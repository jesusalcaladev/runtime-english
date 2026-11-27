import { bumpPhraseStatus } from './phraseStatus'
import { getSpeechLanguage, getSpeechRate } from './platform'
import { setSpeaking } from './ui'
import { TTS_BUFFER_TIMEOUT_MS, ttsAttemptDeadlineMs } from './watchdog'

/**
 * Voz online rápida y gratuita (Google Translate TTS). No necesita API key ni
 * modelos locales: devuelve MP3 y funciona en navegadores sin voces del sistema
 * (caso típico de Brave en Linux).
 *
 * Los MP3 se descargan con antelación (`prefetchGooglePhrase`) y se reutilizan
 * al reproducir. La descarga va por una cola con concurrencia limitada: pedir
 * 40 frases a la vez saturaba las conexiones del navegador y casi ninguna
 * llegaba a tiempo. Ahora se descargan de 4 en 4, con dedupe y un reintento.
 */
const MAX_CHARS = 180
const MAX_PARALLEL_PREFETCH = 4
const AUDIO_CACHE_LIMIT = 160
const MAX_PREFETCH_RETRIES = 1
/** A chunk that cannot start streaming within this window is treated as failed. */
const GOOGLE_START_TIMEOUT_MS = 2_000
let currentAudio: HTMLAudioElement | null = null
let cancelActivePlay: (() => void) | null = null
const audioCache = new Map<string, HTMLAudioElement>()
const inFlight = new Set<string>()
const prefetchQueue: {
  chunk: string
  key: string
  lang: ReturnType<typeof getSpeechLanguage>
  priority: boolean
  attempts: number
}[] = []
let activePrefetches = 0

/** Cache entries are per accent: `en` and `en-GB` return different audio. */
function audioKey(text: string, lang = getSpeechLanguage()): string {
  return `${lang}::${text}`
}

export function splitGoogleText(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  if (clean.length <= MAX_CHARS) return [clean]

  const sentences = clean.match(/[^.!?]+[.!?]*\s*/g) ?? [clean]
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    const candidate = `${current}${sentence}`.trim()
    if (candidate.length <= MAX_CHARS) {
      current = candidate
      continue
    }
    if (current) chunks.push(current)
    const words = sentence.trim().split(' ')
    current = ''
    for (const word of words) {
      if (`${current} ${word}`.trim().length > MAX_CHARS && current) {
        chunks.push(current)
        current = word
      } else {
        current = `${current} ${word}`.trim()
      }
    }
  }
  if (current) chunks.push(current)
  return chunks
}

function googleAudioUrl(text: string, lang = getSpeechLanguage()): string {
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`
}

function createAudio(text: string, lang = getSpeechLanguage()): HTMLAudioElement {
  const audio = new Audio()
  audio.preload = 'auto'
  audio.src = googleAudioUrl(text, lang)
  try {
    audio.load?.()
  } catch {
    // Some test/legacy environments do not implement load().
  }
  return audio
}

function evictOldest(): void {
  while (audioCache.size > AUDIO_CACHE_LIMIT) {
    const oldestKey = audioCache.keys().next().value
    if (!oldestKey) return
    const oldest = audioCache.get(oldestKey)
    audioCache.delete(oldestKey)
    if (oldest && oldest !== currentAudio) {
      try {
        oldest.removeAttribute('src')
        oldest.load?.()
      } catch {
        // Best effort memory release.
      }
    }
  }
}

function cacheAudio(text: string, audio: HTMLAudioElement): void {
  const previous = audioCache.get(text)
  if (previous && previous !== audio) {
    try {
      previous.removeAttribute('src')
      previous.load?.()
    } catch {
      // Best effort.
    }
  }
  audioCache.set(text, audio)
  evictOldest()
}

/** Processes queued chunks with a small, bounded number of parallel downloads. */
function pumpPrefetch(): void {
  while (activePrefetches < MAX_PARALLEL_PREFETCH) {
    const index = prefetchQueue.findIndex(
      (item) => !inFlight.has(item.key) && !audioCache.has(item.key),
    )
    if (index < 0) return
    const [item] = prefetchQueue.splice(index, 1)
    inFlight.add(item.key)
    activePrefetches += 1

    const audio = createAudio(item.chunk, item.lang)
    cacheAudio(item.key, audio)
    let settled = false
    const finish = (success: boolean) => {
      if (settled) return
      settled = true
      inFlight.delete(item.key)
      activePrefetches -= 1
      if (!success && item.attempts < MAX_PREFETCH_RETRIES) {
        prefetchQueue.unshift({ ...item, attempts: item.attempts + 1 })
      }
      bumpPhraseStatus()
      pumpPrefetch()
    }

    audio.onerror = () => {
      if (audioCache.get(item.key) === audio) audioCache.delete(item.key)
      finish(false)
    }
    audio.oncanplaythrough = () => finish(true)
    audio.onloadeddata = () => finish(true)
  }
}

export function stopGooglePlayback(): void {
  // Settle any in-flight play() promise first, otherwise a stopped chunk could
  // leave speakWithGoogle() pending and block the caller forever.
  const cancel = cancelActivePlay
  cancelActivePlay = null
  cancel?.()
  if (!currentAudio) return
  try {
    currentAudio.pause()
    currentAudio.currentTime = 0
  } catch {
    // El audio ya terminó o no permite seek.
  }
  currentAudio = null
}

/**
 * Encola el MP3 de una frase (y de sus chunks). Las frases prioritarias se
 * descargan primero; el resto se procesa con concurrencia limitada.
 */
export function prefetchGooglePhrase(text: string, priority = false): void {
  if (typeof window === 'undefined') return
  const lang = getSpeechLanguage()
  for (const chunk of splitGoogleText(text)) {
    const key = audioKey(chunk, lang)
    if (!chunk || audioCache.has(key) || inFlight.has(key)) continue
    if (prefetchQueue.some((item) => item.key === key)) continue
    const item = { chunk, key, lang, priority, attempts: 0 }
    if (priority) prefetchQueue.unshift(item)
    else prefetchQueue.push(item)
  }
  pumpPrefetch()
  bumpPhraseStatus()
}

/** How many of the given phrases are already downloaded and playable. */
export function getGooglePhraseStatus(texts: string[]): { ready: number; total: number } {
  let ready = 0
  let total = 0
  const lang = getSpeechLanguage()
  for (const text of texts) {
    for (const chunk of splitGoogleText(text)) {
      total += 1
      const audio = audioCache.get(audioKey(chunk, lang))
      // 2 === HAVE_CURRENT_DATA (kept as a literal for non-DOM test runtimes).
      if (audio && (audio.readyState ?? 0) >= 2) ready += 1
    }
  }
  return { ready, total }
}

/** Waits for a queued download to be playable before starting playback. */
async function waitForBuffer(audio: HTMLAudioElement): Promise<void> {
  if ((audio.readyState ?? 0) >= 2 || typeof audio.addEventListener !== 'function') return
  await new Promise<void>((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve()
    }
    const timer = setTimeout(finish, TTS_BUFFER_TIMEOUT_MS)
    audio.addEventListener('canplaythrough', finish, { once: true })
    audio.addEventListener('loadeddata', finish, { once: true })
    audio.addEventListener('error', finish, { once: true })
  })
}

async function playChunk(text: string, lang = getSpeechLanguage()): Promise<void> {
  const key = audioKey(text, lang)
  const cached = audioCache.get(key)
  const audio = cached ?? createAudio(text, lang)
  if (!cached) cacheAudio(key, audio)
  await waitForBuffer(audio)
  audio.playbackRate = Math.min(2, Math.max(0.5, getSpeechRate()))
  currentAudio = audio

  return new Promise((resolve, reject) => {
    let settled = false
    let watchdog: ReturnType<typeof setTimeout> | undefined
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(watchdog)
      if (cancelActivePlay === cancel) cancelActivePlay = null
      if (currentAudio === audio) currentAudio = null
      if (!ok) audioCache.delete(key)
      if (ok) resolve()
      else reject(new Error('Google TTS no disponible'))
    }
    const cancel = () => finish(false)
    cancelActivePlay = cancel
    // Short start watchdog: a stream that never begins falls back quickly.
    // Once play() actually starts we re-arm it with a length-based deadline so
    // a normal 180-char chunk (~12s of speech) is never cut off at 5s.
    watchdog = setTimeout(cancel, GOOGLE_START_TIMEOUT_MS)

    audio.onended = () => finish(true)
    audio.onerror = () => finish(false)
    try {
      audio.currentTime = 0
    } catch {
      // Ignorar si el navegador aún no permite seek.
    }
    try {
      void audio
        .play()
        .then(() => {
          if (settled) return
          clearTimeout(watchdog)
          watchdog = setTimeout(() => finish(true), ttsAttemptDeadlineMs(text))
        })
        .catch(() => finish(false))
    } catch {
      finish(false)
    }
  })
}

export async function speakWithGoogle(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (typeof window === 'undefined') return false
  stopGooglePlayback()
  const lang = getSpeechLanguage()
  const chunks = splitGoogleText(text)
  if (!chunks.length) return false

  // Queue every chunk of this phrase at once so the bounded downloader fills all
  // of its parallel slots while the first chunk plays. Enqueueing one chunk per
  // loop iteration left three slots idle and made long lines stop and wait.
  prefetchGooglePhrase(text, true)

  setSpeaking(button, true)
  try {
    for (const chunk of chunks) {
      // Re-queue a chunk if its download failed or was evicted meanwhile.
      if (!audioCache.has(audioKey(chunk, lang))) prefetchGooglePhrase(chunk, true)
      await playChunk(chunk, lang)
    }
    return true
  } catch {
    setSpeaking(button, false)
    return false
  } finally {
    setSpeaking(button, false)
  }
}
