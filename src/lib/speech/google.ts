import { getSpeechRate } from './platform'
import { setSpeaking } from './ui'

/**
 * Voz online rápida y gratuita (Google Translate TTS). No necesita API key ni
 * modelos locales: devuelve MP3 y funciona en navegadores sin voces del sistema
 * (caso típico de Brave en Linux).
 */
const MAX_CHARS = 180
let currentAudio: HTMLAudioElement | null = null

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

function playChunk(text: string): Promise<void> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text)}`
  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    audio.playbackRate = Math.min(2, Math.max(0.5, getSpeechRate()))
    currentAudio = audio

    const finish = (ok: boolean) => {
      if (currentAudio === audio) currentAudio = null
      if (ok) resolve()
      else reject(new Error('Google TTS no disponible'))
    }

    audio.onended = () => finish(true)
    audio.onerror = () => finish(false)
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
