/// <reference lib="webworker" />

import { splitIntoChunks } from './speech/chunking'

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX'

type KokoroDevice = 'webgpu' | 'wasm'
type KokoroDtype = 'fp32' | 'q8'

type LoadMessage = { type: 'load'; device: KokoroDevice; dtype: KokoroDtype }
type GenerateMessage = {
  type: 'generate'
  id: number
  text: string
  voice: string
  speed: number
}
type GenerateStreamMessage = {
  type: 'generate-stream'
  id: number
  text: string
  voice: string
  speed: number
  maxChars: number
  priority: boolean
}
type CancelMessage = { type: 'cancel'; id: number }
type IncomingMessage = LoadMessage | GenerateMessage | GenerateStreamMessage | CancelMessage

type KokoroAudioResult = {
  toBlob?: () => Blob
  toWav?: () => ArrayBuffer | Uint8Array | Blob
}

type KokoroTTSLike = {
  generate: (
    text: string,
    options?: { voice?: string; speed?: number },
  ) => Promise<KokoroAudioResult>
}

type KokoroTTSStatic = {
  from_pretrained: (
    modelId: string,
    options: {
      dtype: KokoroDtype
      device: KokoroDevice
      progress_callback?: (info: unknown) => void
    },
  ) => Promise<KokoroTTSLike>
}

const workerScope = self as unknown as DedicatedWorkerGlobalScope

let tts: KokoroTTSLike | null = null
let loadPromise: Promise<void> | null = null
const cancelledGenerations = new Set<number>()

function post(message: unknown, transfer?: Transferable[]): void {
  if (transfer) workerScope.postMessage(message, transfer)
  else workerScope.postMessage(message)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function load(device: KokoroDevice, dtype: KokoroDtype): Promise<void> {
  if (tts) return
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const mod = (await import('kokoro-js')) as { KokoroTTS?: KokoroTTSStatic }
    const KokoroTTS = mod.KokoroTTS
    if (!KokoroTTS?.from_pretrained) throw new Error('KokoroTTS API no disponible.')

    const progress_callback = (info: unknown) => post({ type: 'progress', info })
    try {
      tts = await KokoroTTS.from_pretrained(MODEL_ID, { dtype, device, progress_callback })
    } catch (error) {
      if (device !== 'webgpu') throw error
      post({ type: 'status', message: 'WebGPU no disponible, usando WASM…' })
      tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: 'q8',
        device: 'wasm',
        progress_callback,
      })
    }
    post({ type: 'ready', device })
  })()

  try {
    await loadPromise
  } finally {
    loadPromise = null
  }
}

async function resultToBuffer(result: KokoroAudioResult): Promise<ArrayBuffer | null> {
  try {
    const wav = result.toWav?.()
    if (wav instanceof ArrayBuffer) return wav
    if (wav instanceof Blob) return await wav.arrayBuffer()
    if (wav instanceof Uint8Array) {
      return wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength) as ArrayBuffer
    }
    const blob = result.toBlob?.()
    if (blob instanceof Blob) return await blob.arrayBuffer()
  } catch {}
  return null
}

async function generateOne(text: string, voice: string, speed: number): Promise<ArrayBuffer> {
  if (!tts) throw new Error('El modelo HQ aún no está listo.')
  const result = await tts.generate(text, { voice, speed })
  const buffer = await resultToBuffer(result)
  if (!buffer) throw new Error('No se generó audio.')
  return buffer
}

workerScope.onmessage = async (event: MessageEvent<IncomingMessage>) => {
  const message = event.data
  if (!message) return

  if (message.type === 'cancel') {
    cancelledGenerations.add(message.id)
    return
  }

  if (message.type === 'load') {
    try {
      await load(message.device, message.dtype)
    } catch (error) {
      post({ type: 'error', error: errorMessage(error) })
    }
    return
  }

  if (message.type === 'generate') {
    try {
      const buffer = await generateOne(message.text, message.voice, message.speed)
      post({ type: 'audio', id: message.id, buffer }, [buffer])
    } catch (error) {
      post({ type: 'gen-error', id: message.id, error: errorMessage(error) })
    }
    return
  }

  if (message.type === 'generate-stream') {
    const chunks = splitIntoChunks(message.text, message.maxChars)
    if (chunks.length === 0) {
      post({ type: 'gen-error', id: message.id, error: 'No hay texto para generar.' })
      return
    }
    enqueueStreamJob({
      id: message.id,
      voice: message.voice,
      speed: message.speed,
      priority: message.priority,
      chunks,
      index: 0,
      cancelled: cancelledGenerations.has(message.id),
    })
  }
}

type StreamJob = {
  id: number
  voice: string
  speed: number
  priority: boolean
  chunks: string[]
  index: number
  cancelled: boolean
}

const pendingStreamJobs: StreamJob[] = []
let activeStreamJob: StreamJob | null = null
let streamPumpRunning = false

function enqueueStreamJob(job: StreamJob): void {
  if (job.priority) {
    const firstNormal = pendingStreamJobs.findIndex((item) => !item.priority)
    if (firstNormal === -1) pendingStreamJobs.push(job)
    else pendingStreamJobs.splice(firstNormal, 0, job)
  } else {
    pendingStreamJobs.push(job)
  }
  void pumpStreamJobs()
}

function finishJob(job: StreamJob, failed?: unknown): void {
  cancelledGenerations.delete(job.id)
  if (failed !== undefined) {
    post({ type: 'gen-error', id: job.id, error: errorMessage(failed) })
  } else if (!job.cancelled) {
    post({ type: 'stream-done', id: job.id })
  }
}

async function pumpStreamJobs(): Promise<void> {
  if (streamPumpRunning) return
  streamPumpRunning = true
  try {
    while (activeStreamJob || pendingStreamJobs.length) {
      if (!activeStreamJob) {
        const next = pendingStreamJobs.shift()
        if (!next) break
        if (next.cancelled || cancelledGenerations.has(next.id)) {
          finishJob(next)
          continue
        }
        activeStreamJob = next
      }
      const job = activeStreamJob
      if (cancelledGenerations.has(job.id)) job.cancelled = true
      if (job.cancelled || job.index >= job.chunks.length) {
        finishJob(job)
        activeStreamJob = null
        continue
      }

      try {
        const chunkText = job.chunks[job.index]
        const buffer = await generateOne(chunkText, job.voice, job.speed)
        if (job.cancelled || cancelledGenerations.has(job.id)) continue
        job.index += 1
        post(
          {
            type: 'audio-chunk',
            id: job.id,
            index: job.index - 1,
            total: job.chunks.length,
            text: chunkText,
            buffer,
          },
          [buffer],
        )
        // A user-initiated request takes the worker over between chunks.
        if (!job.priority && pendingStreamJobs.some((item) => item.priority)) {
          activeStreamJob = null
          let lastPriority = -1
          for (let i = 0; i < pendingStreamJobs.length; i += 1) {
            if (pendingStreamJobs[i].priority) lastPriority = i
          }
          if (lastPriority === -1) pendingStreamJobs.unshift(job)
          else pendingStreamJobs.splice(lastPriority + 1, 0, job)
        }
      } catch (error) {
        finishJob(job, error)
        activeStreamJob = null
      }
    }
  } finally {
    streamPumpRunning = false
    if (activeStreamJob || pendingStreamJobs.length) void pumpStreamJobs()
  }
}
