import { getSpeechLanguage, getSpeechRate, isConstrainedDevice } from './platform'
import type { KokoroStatus } from './types'
import { setSpeaking } from './ui'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

type KokoroTTSLike = {
  generate: (
    text: string,
    options?: { voice?: string; speed?: number },
  ) => Promise<{
    toBlob?: () => Blob
    toWav?: () => ArrayBuffer | Uint8Array
    audio?: Float32Array
    sampling_rate?: number
  }>
}

const VOICE_EN_US = 'af_heart'
const VOICE_EN_GB = 'bf_emma'

function getKokoroVoice(): string {
  return getSpeechLanguage() === 'en-GB' ? VOICE_EN_GB : VOICE_EN_US
}
const VOICE_CACHE_KEY = 'runtimeenglish_kokoro_voice_cache_v1'
const AUDIO_CACHE_LIMIT_MOBILE = 6
const AUDIO_CACHE_LIMIT_DESKTOP = 12
const AUDIO_PERSISTENT_CACHE_NAME = 'runtimeenglish-kokoro-audio-v1'
const AUDIO_PERSISTENT_LIMIT = 40
const PRELOAD_QUEUE_LIMIT = 12
const PRELOAD_IDLE_TIMEOUT_MS = 1500
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
let warmupPromise: Promise<void> | null = null
let lastWarmUtteranceAt = 0

// In-memory LRU of generated audio: instant replay for repeated phrases.
const audioCache = new Map<string, string>()
let currentAudioKey: string | null = null

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
let workerGenerationId = 0

type WorkerOutMessage =
  | { type: 'progress'; info: unknown }
  | { type: 'status'; message: string }
  | { type: 'ready' }
  | { type: 'error'; error: string }
  | { type: 'audio'; id: number; buffer: ArrayBuffer }
  | { type: 'gen-error'; id: number; error: string }

function isWorkerMessage(value: unknown): value is WorkerOutMessage {
  if (!isRecord(value) || typeof value.type !== 'string') return false
  return ['progress', 'status', 'ready', 'error', 'audio', 'gen-error'].includes(value.type)
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
  workerGenerations.clear()
}

function createWorkerTts(): KokoroTTSLike {
  return {
    generate: (text, options) =>
      new Promise((resolve, reject) => {
        const worker = kokoroWorker
        if (!worker) {
          reject(new Error('El motor HQ no está disponible.'))
          return
        }
        const id = ++workerGenerationId
        workerGenerations.set(id, {
          resolve: (buffer) => {
            resolve({ toWav: () => buffer })
          },
          reject,
        })
        worker.postMessage({
          type: 'generate',
          id,
          text,
          voice: options?.voice ?? getKokoroVoice(),
          speed: options?.speed ?? 1,
        })
      }),
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
        case 'gen-error': {
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
    // Some WebViews expose navigator.gpu but cannot provide an adapter.
    return (await gpu.requestAdapter()) != null
  } catch {
    return false
  }
}

async function chooseDevice(): Promise<'webgpu' | 'wasm'> {
  // Prefer WebGPU on capable non-constrained devices for faster inference; fallback to WASM.
  if (isConstrainedDevice()) return 'wasm'
  try {
    if (await hasWebGpu()) return 'webgpu'
  } catch {}
  return 'wasm'
}

function chooseDtype(device: 'webgpu' | 'wasm'): 'fp32' | 'q8' {
  // q8 is significantly smaller/faster to load and run on WASM in most cases.
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
  return 120
}

export function getKokoroStatus(): KokoroStatus {
  return status
}

export function subscribeKokoroStatus(listener: (next: KokoroStatus) => void): () => void {
  listeners.add(listener)
  try {
    listener(status)
  } catch {}
  // Best-effort cache detection for initial UI state.
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
  // Avoid surprising heavy downloads; allow background load if user likely has it cached or explicitly chose it.
  return kokoroIsCached() || isConstrainedDevice() === false
}

export function markKokoroAutoInitStarted(): void {
  _autoInitStarted = true
}

function getAudioCacheKey(text: string, speed: number): string {
  return `${speed}|${getKokoroVoice()}|${text}`
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
}

async function createTts(): Promise<KokoroTTSLike | null> {
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
      // Transient download/init failures are common on mobile: retry once with WASM/q8.
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

    const tts = createWorkerTts()
    ttsInstance = tts
    markCached()
    emit({ state: 'ready', progress: 100, message: 'Voz HQ lista.', device, error: undefined })
    void warmKokoroRuntime()
    schedulePreload()
    return tts
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
      const speed = getSpeechRate()
      const key = getAudioCacheKey(text, speed)
      if (await getCachedAudioUrl(key)) continue
      try {
        const result = await ttsInstance?.generate(text, { voice: getKokoroVoice(), speed })
        const blob = toAudioBlob(result)
        if (blob) {
          const url = URL.createObjectURL(blob)
          cacheKokoroAudio(key, url, blob)
        }
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
export function prewarmKokoroPhrases(texts: string[]): void {
  if (typeof window === 'undefined') return
  for (const rawText of texts) {
    const text = rawText.replace(/\s+/g, ' ').trim()
    if (!text || preloadEnqueued.has(text)) continue
    if (audioCache.has(getAudioCacheKey(text, getSpeechRate()))) continue
    if (preloadQueue.length >= Math.min(PRELOAD_QUEUE_LIMIT, getAudioCacheLimit())) break
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
    // Warm with a real queued phrase when possible so the cached audio is useful.
    const queued = preloadQueue.shift()
    if (queued) preloadEnqueued.delete(queued)
    const phrase = queued ?? 'Ready.'
    const key = getAudioCacheKey(phrase, getSpeechRate())
    if (!(await getCachedAudioUrl(key))) {
      try {
        const result = await ttsInstance?.generate(phrase, {
          voice: getKokoroVoice(),
          speed: getSpeechRate(),
        })
        const blob = toAudioBlob(result)
        if (blob) {
          const url = URL.createObjectURL(blob)
          cacheKokoroAudio(key, url, blob)
        }
      } catch {
        // Put the phrase back so the preload queue can retry it later.
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

function toAudioBlob(result: unknown): Blob | null {
  try {
    if (isRecord(result) && typeof result.toBlob === 'function') {
      const blob = (result.toBlob as () => unknown)()
      if (blob instanceof Blob) return blob
    }
    if (isRecord(result) && typeof result.toWav === 'function') {
      const wav = (result.toWav as () => unknown)()
      if (wav instanceof Blob) return wav
      if (wav instanceof ArrayBuffer) return new Blob([wav], { type: 'audio/wav' })
      if (wav instanceof Uint8Array)
        return new Blob([wav.buffer as ArrayBuffer], { type: 'audio/wav' })
    }
  } catch {}
  return null
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

    const finish = (ok: boolean) => {
      if (token !== playToken) return resolve(ok)
      setSpeaking(button, false)
      if (currentAudio === audio) cleanupAudio()
      resolve(ok)
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

  const speed = getSpeechRate()
  const key = getAudioCacheKey(text, speed)
  // A persisted hit also avoids loading the model at all, so playback is instant after a reload.
  const cachedUrl = await getCachedAudioUrl(key)
  if (cachedUrl) return await playUrl(cachedUrl, button, key)

  const tts = await ensureLoaded()
  if (!tts) return false

  try {
    const result = await tts.generate(text, { voice: getKokoroVoice(), speed })
    const blob = toAudioBlob(result)
    if (!blob) return false
    const url = URL.createObjectURL(blob)
    cacheKokoroAudio(key, url, blob)
    return await playUrl(url, button, key)
  } catch (error) {
    // If generation fails after ready state (e.g. context/device issue), surface error once but allow fallback.
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
