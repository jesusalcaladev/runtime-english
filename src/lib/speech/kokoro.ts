import { getSpeechLanguage, getSpeechRate, isConstrainedDevice } from './platform'
import type { KokoroStatus } from './types'
import { setSpeaking } from './ui'
import { withFallback } from './watchdog'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

type StreamChunk = { index: number; total: number; text: string; buffer: ArrayBuffer }
type StreamHandlers = {
  onChunk: (chunk: StreamChunk) => void
  onDone: () => void
  onError: (error: Error) => void
}

type KokoroTTSLike = {
  generateStream: (
    text: string,
    options: { voice: string; priority?: boolean },
    handlers: StreamHandlers,
  ) => () => void
}

const VOICE_EN_US = 'af_heart'
const VOICE_EN_GB = 'bf_emma'

function getKokoroVoice(): string {
  return getSpeechLanguage() === 'en-GB' ? VOICE_EN_GB : VOICE_EN_US
}
const VOICE_CACHE_KEY = 'runtimeenglish_kokoro_voice_cache_v1'
const AUDIO_CACHE_LIMIT_MOBILE = 12
const AUDIO_CACHE_LIMIT_DESKTOP = 24
const AUDIO_PERSISTENT_CACHE_NAME = 'runtimeenglish-kokoro-audio-v2'
const AUDIO_PERSISTENT_LIMIT = 80
const STREAM_MANIFEST_KEY = 'runtimeenglish_kokoro_manifest_v2'
const MANIFEST_LIMIT = 60
const PRELOAD_QUEUE_LIMIT = 24
const PRELOAD_IDLE_TIMEOUT_MS = 1500
/** Safety net for direct callers: a stream that never finishes must not hang. */
const KOKORO_PLAY_TIMEOUT_MS = 8_000
const MODEL_CACHE_HINTS = [
  'transformers-cache',
  'onnx-community/Kokoro-82M-v1.0-ONNX',
  'kokoro-voices',
]

let status: KokoroStatus = {
  state: 'idle',
  progress: 0,
  message: 'Voz HQ no cargada.',
  device: null,
}

let ttsPromise: Promise<KokoroTTSLike | null> | null = null
let ttsInstance: KokoroTTSLike | null = null
let _autoInitStarted = false
let currentAudio: HTMLAudioElement | null = null
let currentAudioUrl: string | null = null
let playToken = 0
const activePlaybacks = new Set<() => void>()
let warmupPromise: Promise<void> | null = null
let lastWarmUtteranceAt = 0

// In-memory LRU of generated audio: instant replay for repeated phrases.
const audioCache = new Map<string, string>()
let currentAudioKey: string | null = null

// Manifest for phrases rendered as several audio chunks: base key -> ordered chunk keys.
const manifestCache = new Map<string, string[]>()

// One generation per phrase: prewarming and playback share the same work.
type StoredChunk = { url: string; key: string; index: number; total: number }
type ChunkListener = (chunk: StoredChunk) => void
type GenerationRecord = {
  key: string
  promise: Promise<string[]>
  chunks: StoredChunk[]
  listeners: Set<ChunkListener>
  error: string | null
}
const generations = new Map<string, GenerationRecord>()

type CachedSequence = { urls: string[]; keys: string[] }

type KokoroDiagnostics = {
  loadMs: number
  lastFirstChunkMs: number
  lastGenerateMs: number
  lastChunks: number
}
const diagnostics: KokoroDiagnostics = {
  loadMs: 0,
  lastFirstChunkMs: 0,
  lastGenerateMs: 0,
  lastChunks: 0,
}

export function getKokoroDiagnostics(): KokoroDiagnostics {
  return { ...diagnostics }
}

type PhraseReadiness = { ready: number; total: number }
const readyPhraseKeys = new Set<string>()
const phraseStatusListeners = new Set<() => void>()

try {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(STREAM_MANIFEST_KEY)
    if (raw) {
      for (const key of Object.keys(JSON.parse(raw) as Record<string, unknown>)) {
        readyPhraseKeys.add(key)
      }
    }
  }
} catch {}

function notifyPhraseStatus(): void {
  for (const listener of phraseStatusListeners) {
    try {
      listener()
    } catch {}
  }
}

function markPhraseReady(key: string): void {
  if (readyPhraseKeys.has(key)) return
  readyPhraseKeys.add(key)
  notifyPhraseStatus()
}

/** Synchronous cache check (no Cache Storage round-trip) for UI indicators. */
export function getKokoroPhraseStatus(texts: string[]): PhraseReadiness {
  let ready = 0
  for (const rawText of texts) {
    const key = getAudioCacheKey(rawText.replace(/\s+/g, ' ').trim())
    if (readyPhraseKeys.has(key)) ready += 1
  }
  return { ready, total: texts.length }
}

export function subscribeKokoroPhraseStatus(listener: () => void): () => void {
  phraseStatusListeners.add(listener)
  return () => phraseStatusListeners.delete(listener)
}

// Keys whose persisted audio was already restored into memory this session.
const restoredAudioKeys = new Set<string>()

function restoreCachedAudio(key: string): void {
  if (restoredAudioKeys.has(key)) return
  restoredAudioKeys.add(key)
  // No model needed: this just moves cached blobs into in-memory object URLs.
  void getCachedAudioSequence(key)
}

// Phrases queued for low-priority pre-generation once the model is ready.
const preloadQueue: string[] = []
const preloadEnqueued = new Set<string>()
let preloading = false
let preloadIdleHandle: number | null = null

// Kokoro inference runs in a module worker so WASM generation never blocks the UI thread.
let kokoroWorker: Worker | null = null
let workerLoadPending: { resolve: () => void; reject: (error: Error) => void } | null = null
const workerGenerations = new Map<
  number,
  { resolve: (buffer: ArrayBuffer) => void; reject: (error: Error) => void }
>()
const workerStreams = new Map<
  number,
  { onChunk: (chunk: StreamChunk) => void; onDone: () => void; onError: (error: Error) => void }
>()
let workerGenerationId = 0

type WorkerOutMessage =
  | { type: 'progress'; info: unknown }
  | { type: 'status'; message: string }
  | { type: 'ready' }
  | { type: 'error'; error: string }
  | { type: 'audio'; id: number; buffer: ArrayBuffer }
  | {
      type: 'audio-chunk'
      id: number
      index: number
      total: number
      text: string
      buffer: ArrayBuffer
    }
  | { type: 'stream-done'; id: number }
  | { type: 'gen-error'; id: number; error: string }

function isWorkerMessage(value: unknown): value is WorkerOutMessage {
  if (!isRecord(value) || typeof value.type !== 'string') return false
  return [
    'progress',
    'status',
    'ready',
    'error',
    'audio',
    'audio-chunk',
    'stream-done',
    'gen-error',
  ].includes(value.type)
}

function terminateWorker(): void {
  try {
    kokoroWorker?.terminate()
  } catch {}
  kokoroWorker = null
  workerLoadPending = null
  for (const pending of workerGenerations.values()) {
    pending.reject(new Error('El motor HQ se detuvo.'))
  }
  for (const stream of workerStreams.values()) {
    stream.onError(new Error('El motor HQ se detuvo.'))
  }
  workerGenerations.clear()
  workerStreams.clear()
}

function createWorkerTts(): KokoroTTSLike {
  return {
    generateStream: (text, options, handlers) => {
      const worker = kokoroWorker
      if (!worker) {
        handlers.onError(new Error('El motor HQ no está disponible.'))
        return () => {}
      }
      const id = ++workerGenerationId
      workerStreams.set(id, handlers)
      worker.postMessage({
        type: 'generate-stream',
        id,
        text,
        voice: options.voice,
        speed: 1,
        maxChars: getPreferredKokoroChunkSize(),
        priority: options.priority === true,
      })
      return () => {
        if (!workerStreams.delete(id)) return
        try {
          worker.postMessage({ type: 'cancel', id })
        } catch {}
      }
    },
  }
}

function startWorker(
  device: 'webgpu' | 'wasm',
  dtype: 'fp32' | 'q8',
  updateProgress: (info: unknown) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let worker: Worker
    try {
      worker = new Worker(new URL('../kokoro.worker.ts', import.meta.url), { type: 'module' })
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)))
      return
    }
    kokoroWorker = worker
    workerLoadPending = { resolve, reject }

    worker.onmessage = (event: MessageEvent<unknown>) => {
      const message = event.data
      if (!isWorkerMessage(message)) return
      switch (message.type) {
        case 'progress':
          updateProgress(message.info)
          break
        case 'status':
          emit({ state: 'loading', progress: status.progress, message: message.message, device })
          break
        case 'ready':
          workerLoadPending?.resolve()
          workerLoadPending = null
          break
        case 'error':
          workerLoadPending?.reject(new Error(message.error))
          workerLoadPending = null
          break
        case 'audio': {
          const pending = workerGenerations.get(message.id)
          if (pending) {
            workerGenerations.delete(message.id)
            pending.resolve(message.buffer)
          }
          break
        }
        case 'audio-chunk': {
          workerStreams.get(message.id)?.onChunk({
            index: message.index,
            total: message.total,
            text: message.text,
            buffer: message.buffer,
          })
          break
        }
        case 'stream-done': {
          const stream = workerStreams.get(message.id)
          if (stream) {
            workerStreams.delete(message.id)
            stream.onDone()
          }
          break
        }
        case 'gen-error': {
          const stream = workerStreams.get(message.id)
          if (stream) {
            workerStreams.delete(message.id)
            stream.onError(new Error(message.error))
          }
          const pending = workerGenerations.get(message.id)
          if (pending) {
            workerGenerations.delete(message.id)
            pending.reject(new Error(message.error))
          }
          break
        }
      }
    }

    worker.onerror = (event) => {
      workerLoadPending?.reject(new Error(event.message || 'Error en el motor HQ.'))
      workerLoadPending = null
    }

    worker.postMessage({ type: 'load', device, dtype })
  })
}

const listeners = new Set<(next: KokoroStatus) => void>()

function emit(next: Partial<KokoroStatus>) {
  status = { ...status, ...next }
  for (const listener of listeners) {
    try {
      listener(status)
    } catch {}
  }
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return status.progress
  return Math.max(0, Math.min(100, Math.round(value)))
}

async function hasWebGpu(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter?: () => Promise<unknown> } }).gpu
  if (!gpu || typeof gpu.requestAdapter !== 'function') return false
  try {
    return (await withTimeout(gpu.requestAdapter(), 900)) != null
  } catch {
    return false
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve, reject) => {
    let done = false
    const timer = window.setTimeout(() => {
      if (done) return
      done = true
      resolve(null)
    }, ms)
    promise.then(
      (value) => {
        if (done) return
        done = true
        window.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        if (done) return
        done = true
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

async function chooseDevice(): Promise<'webgpu' | 'wasm'> {
  // Try WebGPU briefly even on mobile WebViews; fall back instantly to WASM/q8.
  try {
    if (await hasWebGpu()) return 'webgpu'
  } catch {}
  return 'wasm'
}

function chooseDtype(device: 'webgpu' | 'wasm'): 'fp32' | 'q8' {
  // q8 is the smallest available artifact (~92 MB) and the fastest on CPU/WASM.
  if (device === 'wasm') return 'q8'
  return 'fp32'
}

async function detectCached(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    if (window.localStorage.getItem(VOICE_CACHE_KEY) === '1') return true
  } catch {}

  if (typeof caches === 'undefined') return false
  try {
    const keys = await caches.keys()
    return keys.some((key) =>
      MODEL_CACHE_HINTS.some((hint) => key.includes(hint) || hint.includes(key)),
    )
  } catch {
    return false
  }
}

function markCached() {
  try {
    window.localStorage.setItem(VOICE_CACHE_KEY, '1')
  } catch {}
}

export function getPreferredKokoroChunkSize(): number {
  return 100
}

export function getKokoroStatus(): KokoroStatus {
  return status
}

export function subscribeKokoroStatus(listener: (next: KokoroStatus) => void): () => void {
  listeners.add(listener)
  try {
    listener(status)
  } catch {}
  if (status.state === 'idle' && typeof window !== 'undefined') {
    void detectCached().then((cached) => {
      if (cached && status.state === 'idle') {
        emit({ message: 'Voz HQ en caché. Cárgala para usarla al instante.' })
      }
    })
  }
  return () => listeners.delete(listener)
}

export function kokoroIsCached(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(VOICE_CACHE_KEY) === '1'
  } catch {
    return false
  }
}

export function isKokoroReady(): boolean {
  return status.state === 'ready' && ttsInstance !== null
}

export function isKokoroLoading(): boolean {
  return status.state === 'loading'
}

export function canAutoLoadKokoroInBackground(): boolean {
  if (typeof window === 'undefined') return false
  return kokoroIsCached() || isConstrainedDevice() === false
}

export function markKokoroAutoInitStarted(): void {
  _autoInitStarted = true
}

function normalizeCacheText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?¡¿…"«»“”(){}[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getAudioCacheKey(text: string): string {
  // Speed is intentionally absent: playback rate is applied to <audio> instead.
  return `${getKokoroVoice()}|${normalizeCacheText(text)}`
}

function getAudioCacheLimit(): number {
  return isConstrainedDevice() ? AUDIO_CACHE_LIMIT_MOBILE : AUDIO_CACHE_LIMIT_DESKTOP
}

function audioCacheRequest(key: string): Request {
  const path = `/kokoro-audio/${encodeURIComponent(key)}.wav`
  const url =
    typeof window !== 'undefined' ? new URL(path, window.location.origin).toString() : path
  return new Request(url)
}

async function persistAudioBlob(key: string, blob: Blob): Promise<void> {
  if (typeof caches === 'undefined' || typeof window === 'undefined') return
  try {
    const cache = await caches.open(AUDIO_PERSISTENT_CACHE_NAME)
    await cache.put(
      audioCacheRequest(key),
      new Response(blob, { headers: { 'Content-Type': blob.type || 'audio/wav' } }),
    )
    const keys = await cache.keys()
    if (keys.length > AUDIO_PERSISTENT_LIMIT) {
      const stale = keys.slice(0, keys.length - AUDIO_PERSISTENT_LIMIT)
      await Promise.all(stale.map((request) => cache.delete(request)))
    }
  } catch {}
}

async function getPersistedAudioUrl(key: string): Promise<string | null> {
  if (typeof caches === 'undefined' || typeof window === 'undefined') return null
  try {
    const cache = await caches.open(AUDIO_PERSISTENT_CACHE_NAME)
    const response = await cache.match(audioCacheRequest(key))
    if (!response) return null
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    cacheKokoroAudio(key, url)
    return url
  } catch {
    return null
  }
}

async function getCachedAudioUrl(key: string): Promise<string | null> {
  const memory = audioCache.get(key)
  if (memory) return memory
  return getPersistedAudioUrl(key)
}

function revokeAudioUrl(url: string | null, key?: string | null): void {
  if (!url) return
  if (key && audioCache.get(key) === url) return
  for (const [cachedKey, cachedUrl] of audioCache) {
    if (cachedUrl === url) audioCache.delete(cachedKey)
  }
  try {
    URL.revokeObjectURL(url)
  } catch {}
}

function cacheKokoroAudio(key: string, url: string, blob?: Blob): void {
  const previous = audioCache.get(key)
  audioCache.delete(key)
  if (previous && previous !== url) revokeAudioUrl(previous, key)
  audioCache.set(key, url)
  if (blob) void persistAudioBlob(key, blob)

  const limit = getAudioCacheLimit()
  while (audioCache.size > limit) {
    const oldestKey = audioCache.keys().next().value as string | undefined
    if (!oldestKey) break
    if (oldestKey === currentAudioKey) break
    const oldestUrl = audioCache.get(oldestKey) ?? null
    audioCache.delete(oldestKey)
    revokeAudioUrl(oldestUrl, oldestKey)
  }
}

function getManifest(key: string): string[] | null {
  const memory = manifestCache.get(key)
  if (memory?.length) return memory
  try {
    const raw = window.localStorage.getItem(STREAM_MANIFEST_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const keys = parsed[key]
    if (Array.isArray(keys) && keys.length && keys.every((item) => typeof item === 'string')) {
      const result = keys as string[]
      manifestCache.set(key, result)
      return result
    }
  } catch {}
  return null
}

function setManifest(key: string, keys: string[]): void {
  manifestCache.set(key, keys)
  try {
    const raw = window.localStorage.getItem(STREAM_MANIFEST_KEY)
    const parsed: Record<string, string[]> = raw ? JSON.parse(raw) : {}
    parsed[key] = keys
    const entries = Object.entries(parsed)
    if (entries.length > MANIFEST_LIMIT) {
      for (const [stale] of entries.slice(0, entries.length - MANIFEST_LIMIT)) delete parsed[stale]
    }
    window.localStorage.setItem(STREAM_MANIFEST_KEY, JSON.stringify(parsed))
  } catch {}
}

async function getCachedAudioSequence(key: string): Promise<CachedSequence | null> {
  const manifest = getManifest(key)
  if (manifest?.length) {
    const urls: string[] = []
    for (const chunkKey of manifest) {
      const url = await getCachedAudioUrl(chunkKey)
      if (!url) return null
      urls.push(url)
    }
    if (urls.length) {
      markPhraseReady(key)
      return { urls, keys: manifest }
    }
  }
  const single = await getCachedAudioUrl(key)
  if (!single) return null
  markPhraseReady(key)
  return { urls: [single], keys: [key] }
}

function cleanupAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.src = ''
      currentAudio.load()
    } catch {}
  }
  currentAudio = null
  revokeAudioUrl(currentAudioUrl, currentAudioKey)
  currentAudioUrl = null
  currentAudioKey = null
}

export function stopKokoroPlayback(): void {
  playToken += 1
  cleanupAudio()
  for (const cancel of [...activePlaybacks]) cancel()
}

function subscribeChunks(record: GenerationRecord, listener: ChunkListener): () => void {
  for (const chunk of record.chunks) {
    try {
      listener(chunk)
    } catch {}
  }
  record.listeners.add(listener)
  return () => record.listeners.delete(listener)
}

function startGeneration(
  text: string,
  key: string,
  existingTts?: KokoroTTSLike | null,
  priority = false,
): GenerationRecord {
  const previous = generations.get(key)
  if (previous) return previous

  let resolvePromise: (urls: string[]) => void = () => {}
  let rejectPromise: (error: Error) => void = () => {}
  const promise = new Promise<string[]>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })
  const record: GenerationRecord = {
    key,
    promise,
    chunks: [],
    listeners: new Set(),
    error: null,
  }
  generations.set(key, record)

  const generationStartedAt = performance.now()
  let firstChunkAt = 0

  void (async () => {
    const tts = existingTts ?? (await ensureLoaded())
    if (!tts) throw new Error('No se pudo cargar la voz HQ.')

    await new Promise<void>((resolve, reject) => {
      let finished = false
      const finish = (callback: () => void) => {
        if (finished) return
        finished = true
        callback()
      }
      tts.generateStream(
        text,
        { voice: getKokoroVoice(), priority },
        {
          onChunk: ({ index, total, buffer }) => {
            if (record.error) return
            if (!firstChunkAt) {
              firstChunkAt = performance.now()
              diagnostics.lastFirstChunkMs = firstChunkAt - generationStartedAt
            }
            diagnostics.lastChunks = total
            try {
              const blob = new Blob([buffer], { type: 'audio/wav' })
              const url = URL.createObjectURL(blob)
              const chunkKey = total > 1 ? `${key}#${index}` : key
              const chunk: StoredChunk = { url, key: chunkKey, index, total }
              record.chunks.push(chunk)
              cacheKokoroAudio(chunkKey, url, blob)
              if (total > 1)
                setManifest(
                  key,
                  record.chunks.map((item) => item.key),
                )
              for (const listener of record.listeners) {
                try {
                  listener(chunk)
                } catch {}
              }
            } catch {
              // A failed chunk must never break the rest of the stream.
            }
          },
          onDone: () => finish(resolve),
          onError: (error) => finish(() => reject(error)),
        },
      )
    })
  })()
    .then(() => {
      diagnostics.lastGenerateMs = performance.now() - generationStartedAt
      markPhraseReady(key)
      resolvePromise(record.chunks.map((chunk) => chunk.url))
    })
    .catch((error: unknown) => {
      record.error = error instanceof Error ? error.message : 'Error generando audio HQ.'
      rejectPromise(error instanceof Error ? error : new Error(record.error))
    })
    .finally(() => {
      generations.delete(key)
    })

  return record
}

/** Start generating a phrase immediately (no idle wait), de-duplicated. */
export function prepareKokoroPhrase(text: string): void {
  if (typeof window === 'undefined') return
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return
  const key = getAudioCacheKey(clean)
  if (generations.has(key)) return
  void getCachedAudioSequence(key).then((cached) => {
    if (cached || generations.has(key)) return
    startGeneration(clean, key, undefined, true)
  })
}

async function createTts(): Promise<KokoroTTSLike | null> {
  const loadStartedAt = performance.now()
  let device = await chooseDevice()
  let dtype = chooseDtype(device)
  emit({
    state: 'loading',
    progress: Math.max(status.progress, 2),
    message: kokoroIsCached() ? 'Cargando voz HQ desde caché…' : 'Preparando descarga de voz HQ…',
    device,
    error: undefined,
  })

  const progressByFile = new Map<string, number>()
  const updateProgress = (info: unknown) => {
    try {
      const details = isRecord(info) ? info : {}
      const file =
        typeof details.file === 'string'
          ? details.file
          : typeof details.name === 'string'
            ? details.name
            : 'model'
      if (details.status === 'progress') {
        const pct =
          typeof details.progress === 'number'
            ? details.progress
            : typeof details.loaded === 'number' &&
                typeof details.total === 'number' &&
                details.total > 0
              ? (details.loaded / details.total) * 100
              : null
        if (pct !== null) progressByFile.set(file, Math.max(0, Math.min(100, pct)))
      } else if (details.status === 'done' || details.status === 'ready') {
        progressByFile.set(file, 100)
      } else if (details.status === 'initiate') {
        if (!progressByFile.has(file)) progressByFile.set(file, 1)
      }

      const values = [...progressByFile.values()]
      const aggregate = values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : status.progress
      const progress = clampProgress(aggregate)
      const downloading = values.some((v) => v < 100)
      emit({
        state: 'loading',
        progress,
        device,
        message: downloading
          ? kokoroIsCached()
            ? `Cargando voz HQ… ${progress}%`
            : `Descargando voz HQ… ${progress}%`
          : 'Inicializando modelo de voz…',
      })
    } catch {}
  }

  try {
    try {
      await startWorker(device, dtype, updateProgress)
    } catch {
      terminateWorker()
      emit({
        state: 'loading',
        progress: Math.max(status.progress, 2),
        message: 'Reintentando carga de voz HQ…',
        device: 'wasm',
      })
      await new Promise((resolve) => setTimeout(resolve, 800))
      device = 'wasm'
      dtype = 'q8'
      await startWorker(device, dtype, updateProgress)
    }

    diagnostics.loadMs = performance.now() - loadStartedAt
    ttsInstance = createWorkerTts()
    markCached()
    emit({ state: 'ready', progress: 100, message: 'Voz HQ lista.', device, error: undefined })
    void warmKokoroRuntime()
    schedulePreload()
    return ttsInstance
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo cargar Kokoro.'
    terminateWorker()
    ttsInstance = null
    emit({
      state: 'error',
      progress: 0,
      message: 'No se pudo cargar la voz HQ.',
      device: status.device,
      error: message,
    })
    throw error
  }
}

export async function loadKokoro(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (ttsInstance && status.state === 'ready') return true
  if (ttsPromise) {
    try {
      return (await ttsPromise) !== null
    } catch {
      return false
    }
  }

  ttsPromise = createTts().finally(() => {
    ttsPromise = null
  })

  try {
    return (await ttsPromise) !== null
  } catch {
    return false
  }
}

async function ensureLoaded(): Promise<KokoroTTSLike | null> {
  if (ttsInstance && status.state === 'ready') return ttsInstance
  const ok = await loadKokoro()
  return ok ? ttsInstance : null
}

function schedulePreload(): void {
  if (typeof window === 'undefined' || preloadIdleHandle !== null) return
  const run = () => {
    preloadIdleHandle = null
    void drainPreloadQueue()
  }
  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void
  }
  if (typeof win.requestIdleCallback === 'function') {
    preloadIdleHandle = win.requestIdleCallback(run, { timeout: PRELOAD_IDLE_TIMEOUT_MS }) as number
  } else {
    preloadIdleHandle = window.setTimeout(run, 1200)
  }
}

async function drainPreloadQueue(): Promise<void> {
  if (preloading || !isKokoroReady()) return
  preloading = true
  try {
    while (preloadQueue.length && isKokoroReady()) {
      const text = preloadQueue.shift()
      if (!text) continue
      preloadEnqueued.delete(text)
      const key = getAudioCacheKey(text)
      if (await getCachedAudioSequence(key)) continue
      if (generations.has(key)) continue
      const record = startGeneration(text, key, ttsInstance)
      try {
        await record.promise
      } catch {
        // Best effort: a failed preload must never affect playback.
      }
    }
  } finally {
    preloading = false
    if (preloadQueue.length && isKokoroReady()) schedulePreload()
  }
}

/** Queue real on-screen phrases for low-priority pre-generation (instant first tap). */
export function prewarmKokoroPhrases(texts: string[], limit = PRELOAD_QUEUE_LIMIT): void {
  if (typeof window === 'undefined') return
  // Never queue more phrases than the in-memory cache can hold.
  const max = Math.min(limit, PRELOAD_QUEUE_LIMIT, getAudioCacheLimit())
  for (const rawText of texts) {
    if (preloadQueue.length >= max) break
    const text = rawText.replace(/\s+/g, ' ').trim()
    if (!text || preloadEnqueued.has(text)) continue
    const key = getAudioCacheKey(text)
    restoreCachedAudio(key)
    if (audioCache.has(key) || manifestCache.has(key)) continue
    preloadEnqueued.add(text)
    preloadQueue.push(text)
  }
  if (isKokoroReady()) schedulePreload()
}

async function warmKokoroRuntime(): Promise<void> {
  if (!ttsInstance) return
  if (warmupPromise) return warmupPromise
  const now = Date.now()
  if (now - lastWarmUtteranceAt < 60_000) {
    schedulePreload()
    return
  }
  lastWarmUtteranceAt = now

  warmupPromise = (async () => {
    const queued = preloadQueue.shift()
    if (queued) preloadEnqueued.delete(queued)
    const phrase = queued ?? 'Ready.'
    const key = getAudioCacheKey(phrase)
    if (!(await getCachedAudioSequence(key))) {
      startGeneration(phrase, key, ttsInstance)
      try {
        await generations.get(key)?.promise
      } catch {
        if (queued && !preloadEnqueued.has(queued)) {
          preloadEnqueued.add(queued)
          preloadQueue.unshift(queued)
        }
      }
    }
    schedulePreload()
  })().finally(() => {
    warmupPromise = null
  })

  return warmupPromise
}

export function maybeWarmKokoroInBackground(): void {
  if (typeof window === 'undefined') return
  if (status.state === 'loading') return
  if (status.state === 'ready') {
    void warmKokoroRuntime()
    return
  }
  if (kokoroIsCached() || canAutoLoadKokoroInBackground()) {
    void loadKokoro().catch(() => {})
  }
}

function applyPlaybackRate(audio: HTMLAudioElement): void {
  const rate = getSpeechRate()
  try {
    audio.playbackRate = rate
  } catch {}
  try {
    audio.preservesPitch = true
  } catch {
    try {
      ;(audio as HTMLAudioElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true
    } catch {}
  }
}

type ChunkPlayer = {
  enqueue: (chunk: StoredChunk) => void
  finish: (generationOk: boolean) => void
  promise: Promise<boolean>
}

function createChunkPlayer(button?: HTMLElement | null): ChunkPlayer {
  const token = ++playToken
  const queue: StoredChunk[] = []
  let playing = false
  let playedCount = 0
  let streamDone = false
  let settled = false
  let resolveResult: (ok: boolean) => void = () => {}
  const promise = new Promise<boolean>((resolve) => {
    resolveResult = resolve
  })

  const cancel = () => settle(true)
  activePlaybacks.add(cancel)

  const settle = (ok: boolean) => {
    if (settled) return
    settled = true
    activePlaybacks.delete(cancel)
    setSpeaking(button, false)
    resolveResult(ok)
  }

  const playNext = () => {
    if (token !== playToken) {
      settle(true)
      return
    }
    const next = queue.shift()
    if (!next) {
      playing = false
      if (streamDone) settle(true)
      return
    }
    playing = true
    playedCount += 1
    cleanupAudio()
    currentAudioUrl = next.url
    currentAudioKey = next.key
    const audio = new Audio(next.url)
    currentAudio = audio
    audio.preload = 'auto'
    applyPlaybackRate(audio)

    audio.onplay = () => {
      if (token === playToken) setSpeaking(button, true)
    }
    audio.onended = () => {
      if (token !== playToken) return
      playNext()
    }
    audio.onerror = () => {
      if (token === playToken) settle(false)
    }
    void audio
      .play()
      .then(() => {
        if (token === playToken) setSpeaking(button, true)
      })
      .catch(() => settle(false))
  }

  return {
    promise,
    enqueue: (chunk) => {
      if (settled || token !== playToken) return
      queue.push(chunk)
      if (!playing) playNext()
    },
    finish: (generationOk) => {
      streamDone = true
      if (!playing && queue.length === 0) settle(playedCount > 0 || generationOk)
    },
  }
}

function playSequence(sequence: CachedSequence, button?: HTMLElement | null): Promise<boolean> {
  const token = ++playToken
  let index = 0
  let settled = false
  let resolveResult: (ok: boolean) => void = () => {}
  const promise = new Promise<boolean>((resolve) => {
    resolveResult = resolve
  })
  const cancel = () => settle(true)
  activePlaybacks.add(cancel)

  const settle = (ok: boolean) => {
    if (settled) return
    settled = true
    activePlaybacks.delete(cancel)
    setSpeaking(button, false)
    resolveResult(ok)
  }

  const playNext = () => {
    if (token !== playToken) {
      settle(true)
      return
    }
    if (index >= sequence.urls.length) {
      settle(true)
      return
    }
    const current = index++
    cleanupAudio()
    currentAudioUrl = sequence.urls[current]
    currentAudioKey = sequence.keys[current] ?? null
    const audio = new Audio(sequence.urls[current])
    currentAudio = audio
    audio.preload = 'auto'
    applyPlaybackRate(audio)

    audio.onplay = () => {
      if (token === playToken) setSpeaking(button, true)
    }
    audio.onended = () => {
      if (token === playToken) playNext()
    }
    audio.onerror = () => {
      if (token === playToken) settle(false)
    }
    void audio
      .play()
      .then(() => {
        if (token === playToken) setSpeaking(button, true)
      })
      .catch(() => settle(false))
  }

  playNext()
  return promise
}

function playUrl(
  url: string,
  button?: HTMLElement | null,
  cacheKey?: string | null,
): Promise<boolean> {
  return new Promise((resolve) => {
    const token = ++playToken
    cleanupAudio()
    currentAudioUrl = url
    currentAudioKey = cacheKey ?? null
    const audio = new Audio(url)
    currentAudio = audio
    audio.preload = 'auto'
    applyPlaybackRate(audio)

    let settled = false
    const settle = (ok: boolean) => {
      if (settled) return
      settled = true
      activePlaybacks.delete(cancel)
      setSpeaking(button, false)
      resolve(ok)
    }
    const cancel = () => settle(true)
    activePlaybacks.add(cancel)

    const finish = (ok: boolean) => {
      if (token !== playToken) return settle(ok)
      if (currentAudio === audio) cleanupAudio()
      settle(ok)
    }

    audio.onplay = () => {
      if (token !== playToken) return
      setSpeaking(button, true)
    }
    audio.onended = () => finish(true)
    audio.onerror = () => finish(false)
    audio.onpause = () => {
      if (token === playToken && audio.ended) return
      if (token === playToken) setSpeaking(button, false)
    }

    void audio
      .play()
      .then(() => {
        if (token !== playToken) return
        setSpeaking(button, true)
      })
      .catch(() => finish(false))
  })
}

export async function speakWithKokoro(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const key = getAudioCacheKey(text)
  const cached = await getCachedAudioSequence(key)
  if (cached) {
    return cached.urls.length === 1
      ? playUrl(cached.urls[0], button, cached.keys[0])
      : playSequence(cached, button)
  }

  const tts = await ensureLoaded()
  if (!tts) return false

  try {
    const player = createChunkPlayer(button)
    const record = startGeneration(text, key, tts, true)
    const unsubscribe = subscribeChunks(record, (chunk) => player.enqueue(chunk))
    void record.promise.then(
      () => player.finish(true),
      () => player.finish(false),
    )
    try {
      return await withFallback(player.promise, KOKORO_PLAY_TIMEOUT_MS, false, () => {
        stopKokoroPlayback()
      })
    } finally {
      unsubscribe()
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error generando audio con Kokoro.'
    emit({
      state: status.state === 'ready' ? 'ready' : 'error',
      message: status.message,
      device: status.device,
      progress: status.progress,
      error: message,
    })
    return false
  }
}
