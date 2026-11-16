import { getSpeechRate } from './platform'
import type { SpeechStyle } from './types'
import { setSpeaking, setSpeakLoading } from './ui'

export const PIPER_VOICE = 'en_US-libritts_r-medium'

const ONNX_WASM_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/'
const PHONEMIZE_BASE = 'https://cdn.jsdelivr.net/npm/piper-tts-web@1.1.2/dist/piper/'

export type PiperStatus = {
  state: 'idle' | 'loading' | 'ready' | 'error'
  message: string
}

let status: PiperStatus = { state: 'idle', message: '' }
const listeners = new Set<(next: PiperStatus) => void>()
let enginePromise: Promise<unknown> | null = null
let audio: HTMLAudioElement | null = null
let objectUrl: string | null = null

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

export function stopPiperPlayback(): void {
  if (audio) {
    try {
      audio.pause()
    } catch {
      // Best effort.
    }
    audio = null
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
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

    const response = await engine.generate(text, PIPER_VOICE, 0)
    objectUrl = URL.createObjectURL(response.file)
    audio = new Audio(objectUrl)
    audio.playbackRate = Math.min(2, Math.max(0.5, getSpeechRate() * (style?.rateScale ?? 1)))
    await new Promise<void>((resolve, reject) => {
      if (!audio) {
        reject(new Error('Audio no disponible'))
        return
      }
      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error('No se pudo reproducir el audio'))
      audio.play().catch(() => reject(new Error('No se pudo reproducir el audio')))
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
