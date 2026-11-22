import { bumpPhraseStatus } from './phraseStatus'
import { getSpeechRate } from './platform'
import type { SpeechStyle } from './types'
import { setSpeaking, setSpeakLoading } from './ui'

export const PIPER_VOICE = 'en_US-libritts_r-medium'

const ONNX_WASM_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/'
const PHONEMIZE_BASE = 'https://cdn.jsdelivr.net/npm/piper-tts-web@1.1.2/dist/piper/'
const PHRASE_CACHE_LIMIT = 24
/** Hard cap for a single generated chunk so a stalled <audio> cannot hang exercises. */
const PIPER_PLAY_TIMEOUT_MS = 5_000

export type PiperStatus = {
  state: 'idle' | 'loading' | 'ready' | 'error'
  message: string
}

let status: PiperStatus = { state: 'idle', message: '' }
const listeners = new Set<(next: PiperStatus) => void>()
let enginePromise: Promise<unknown> | null = null
let audio: HTMLAudioElement | null = null
let activeUrl: string | null = null
const phraseCache = new Map<string, { url: string }>()

function setStatus(next: PiperStatus) {
  status = next
  listeners.forEach((listener) => {
    listener(status)
  })
}

export function getPiperStatus(): PiperStatus {
  return status
}

export function subscribePiperStatus(listener: (next: PiperStatus) => void): () => void {
  listeners.add(listener)
  listener(status)
  return () => listeners.delete(listener)
}

interface PiperEngine {
  generate(text: string, voice: string, speaker?: number): Promise<{ file: Blob; duration: number }>
  destroy(): void
}

/** Carga el motor solo cuando el usuario elige Piper (el bundle es grande). */
export async function loadPiper(): Promise<boolean> {
  if (status.state === 'ready') return true
  if (status.state === 'loading' && enginePromise) {
    try {
      await enginePromise
      return getPiperStatus().state === 'ready'
    } catch {
      return false
    }
  }

  setStatus({ state: 'loading', message: 'Preparando voz Piper…' })
  enginePromise = import('piper-tts-web').then((module) => {
    const onnx = new module.OnnxWebRuntime({ basePath: ONNX_WASM_BASE })
    const phonemize = new module.PhonemizeWebRuntime({ basePath: PHONEMIZE_BASE })
    // El motor de expresiones solo se usa para animaciones faciales; no lo necesitamos.
    const expression = { destroy() {}, generate: async () => ({}) } as never
    const engine = new module.PiperWebEngine({
      onnxRuntime: onnx,
      phonemizeRuntime: phonemize,
      expressionRuntime: expression,
      voiceProvider: new module.HuggingFaceVoiceProvider(),
    }) as PiperEngine
    return engine
  })

  try {
    await enginePromise
    setStatus({ state: 'ready', message: 'Voz Piper lista' })
    return true
  } catch (error) {
    enginePromise = null
    setStatus({
      state: 'error',
      message: error instanceof Error ? error.message : 'No se pudo cargar la voz Piper.',
    })
    return false
  }
}

function isCachedUrl(url: string): boolean {
  for (const entry of phraseCache.values()) {
    if (entry.url === url) return true
  }
  return false
}

export function stopPiperPlayback(): void {
  if (audio) {
    try {
      audio.pause()
    } catch {
      // Best effort.
    }
    audio = null
  }
  if (activeUrl && !isCachedUrl(activeUrl)) {
    URL.revokeObjectURL(activeUrl)
  }
  activeUrl = null
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

async function generatePhrase(engine: PiperEngine, text: string): Promise<{ url: string }> {
  const key = cleanText(text)
  const cached = phraseCache.get(key)
  if (cached) return cached

  const response = await engine.generate(key, PIPER_VOICE, 0)
  const entry = { url: URL.createObjectURL(response.file) }
  phraseCache.set(key, entry)
  while (phraseCache.size > PHRASE_CACHE_LIMIT) {
    const oldestKey = phraseCache.keys().next().value
    if (!oldestKey) break
    const oldest = phraseCache.get(oldestKey)
    phraseCache.delete(oldestKey)
    if (oldest && oldest.url !== activeUrl) URL.revokeObjectURL(oldest.url)
  }
  bumpPhraseStatus()
  return entry
}

/** Pre-genera una frase con Piper si el motor ya está cargado (nunca fuerza la descarga). */
export function prefetchPiperPhrase(text: string): void {
  if (typeof window === 'undefined') return
  const key = cleanText(text)
  if (!key || phraseCache.has(key)) return
  if (status.state !== 'ready' || !enginePromise) return
  void enginePromise
    .then((engine) => generatePhrase(engine as PiperEngine, key))
    .catch(() => undefined)
}

export function getPiperPhraseStatus(texts: string[]): { ready: number; total: number } {
  let ready = 0
  for (const text of texts) {
    if (phraseCache.has(cleanText(text))) ready += 1
  }
  return { ready, total: texts.length }
}

/** Genera y reproduce una frase con Piper. Devuelve false si algo falla. */
export async function speakWithPiper(
  text: string,
  button?: HTMLElement | null,
  style?: SpeechStyle,
): Promise<boolean> {
  setSpeakLoading(button, true)
  setSpeaking(button, true)
  try {
    if (!(await loadPiper())) return false
    const engine = (await enginePromise) as PiperEngine
    stopPiperPlayback()

    const entry = await generatePhrase(engine, text)
    activeUrl = entry.url
    audio = new Audio(activeUrl)
    audio.playbackRate = Math.min(2, Math.max(0.5, getSpeechRate() * (style?.rateScale ?? 1)))
    await new Promise<void>((resolve, reject) => {
      const playingAudio = audio
      if (!playingAudio) {
        reject(new Error('Audio no disponible'))
        return
      }
      let settled = false
      let watchdog: ReturnType<typeof setTimeout> | undefined
      const finish = (ok: boolean) => {
        if (settled) return
        settled = true
        clearTimeout(watchdog)
        if (ok) resolve()
        else reject(new Error('No se pudo reproducir el audio'))
      }
      watchdog = setTimeout(() => finish(false), PIPER_PLAY_TIMEOUT_MS)
      playingAudio.onended = () => finish(true)
      playingAudio.onerror = () => finish(false)
      void playingAudio.play().catch(() => finish(false))
    })
    return true
  } catch (error) {
    setStatus({
      state: 'error',
      message: error instanceof Error ? error.message : 'Error al generar la voz Piper.',
    })
    return false
  } finally {
    stopPiperPlayback()
    setSpeakLoading(button, false)
    setSpeaking(button, false)
  }
}
