/// <reference lib="webworker" />

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
type IncomingMessage = LoadMessage | GenerateMessage

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

workerScope.onmessage = async (event: MessageEvent<IncomingMessage>) => {
  const message = event.data
  if (!message) return

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
      if (!tts) throw new Error('El modelo HQ aún no está listo.')
      const result = await tts.generate(message.text, {
        voice: message.voice,
        speed: message.speed,
      })
      const buffer = await resultToBuffer(result)
      if (!buffer) throw new Error('No se generó audio.')
      post({ type: 'audio', id: message.id, buffer }, [buffer])
    } catch (error) {
      post({ type: 'gen-error', id: message.id, error: errorMessage(error) })
    }
  }
}
