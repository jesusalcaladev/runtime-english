import { bumpPhraseStatus } from './phraseStatus'
import { getSpeechRate } from './platform'
import { setSpeaking } from './ui'

/**
 * Voz online rápida y gratuita (Google Translate TTS). No necesita API key ni
 * modelos locales: devuelve MP3 y funciona en navegadores sin voces del sistema
 * (caso típico de Brave en Linux).
 *
 * Los MP3 se descargan con antelación (`prefetchGooglePhrase`) y se reutilizan
 * al reproducir, para que el diálogo no se detenga esperando la red en cada línea.
 */
const MAX_CHARS = 180
const AUDIO_CACHE_LIMIT = 32
let currentAudio: HTMLAudioElement | null = null
const audioCache = new Map<string, HTMLAudioElement>()

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

function googleAudioUrl(text: string): string {
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text)}`
}

function createAudio(text: string): HTMLAudioElement {
  const audio = new Audio()
  audio.preload = 'auto'
  audio.src = googleAudioUrl(text)
  // Kick off the download immediately; play() later reuses the buffered audio.
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

export function stopGooglePlayback(): void {
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
 * Descarga en segundo plano el MP3 de una frase (y de sus chunks).
 * Llamarlo mientras suena la línea anterior deja la siguiente lista para tocar.
 */
export function prefetchGooglePhrase(text: string): void {
  if (typeof window === 'undefined') return
  for (const chunk of splitGoogleText(text)) {
    if (!chunk || audioCache.has(chunk)) continue
    try {
      const audio = createAudio(chunk)
      cacheAudio(chunk, audio)
      audio.onerror = () => {
        if (audioCache.get(chunk) === audio) audioCache.delete(chunk)
      }
      audio.oncanplaythrough = () => bumpPhraseStatus()
    } catch {
      // Prefetch is best effort.
    }
  }
  bumpPhraseStatus()
}

/** How many of the given phrases are already downloaded and playable. */
export function getGooglePhraseStatus(texts: string[]): { ready: number; total: number } {
  let ready = 0
  let total = 0
  for (const text of texts) {
    for (const chunk of splitGoogleText(text)) {
      total += 1
      const audio = audioCache.get(chunk)
      // 2 === HAVE_CURRENT_DATA (kept as a literal for non-DOM test runtimes).
      if (audio && (audio.readyState ?? 0) >= 2) ready += 1
    }
  }
  return { ready, total }
}

function playChunk(text: string): Promise<void> {
  const cached = audioCache.get(text)
  const audio = cached ?? createAudio(text)
  if (!cached) cacheAudio(text, audio)
  audio.playbackRate = Math.min(2, Math.max(0.5, getSpeechRate()))
  currentAudio = audio

  return new Promise((resolve, reject) => {
    const finish = (ok: boolean) => {
      if (currentAudio === audio) currentAudio = null
      if (ok) resolve()
      else reject(new Error('Google TTS no disponible'))
    }

    audio.onended = () => finish(true)
    audio.onerror = () => {
      audioCache.delete(text)
      finish(false)
    }
    try {
      audio.currentTime = 0
    } catch {
      // Ignorar si el navegador aún no permite seek.
    }
    try {
      void audio.play().catch(() => finish(false))
    } catch {
      finish(false)
    }
  })
}

export async function speakWithGoogle(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (typeof window === 'undefined') return false
  stopGooglePlayback()
  const chunks = splitGoogleText(text)
  if (!chunks.length) return false

  setSpeaking(button, true)
  try {
    for (const chunk of chunks) {
      await playChunk(chunk)
    }
    return true
  } catch {
    setSpeaking(button, false)
    return false
  } finally {
    setSpeaking(button, false)
  }
}
