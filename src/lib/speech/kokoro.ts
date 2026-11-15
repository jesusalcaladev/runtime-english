import type { KokoroStatus } from "./types";
import { getSpeechRate, isConstrainedDevice } from "./platform";
import { setSpeaking } from "./ui";

type KokoroTTSLike = {
  generate: (
    text: string,
    options?: { voice?: string; speed?: number },
  ) => Promise<{ toBlob?: () => Blob; toWav?: () => ArrayBuffer | Uint8Array; audio?: Float32Array; sampling_rate?: number }>;
};

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const DEFAULT_VOICE = "af_heart";
const VOICE_CACHE_KEY = "runtimeenglish_kokoro_voice_cache_v1";
const MODEL_CACHE_HINTS = ["transformers-cache", "onnx-community/Kokoro-82M-v1.0-ONNX", "kokoro-voices"];

let status: KokoroStatus = {
  state: "idle",
  progress: 0,
  message: "Voz HQ no cargada.",
  device: null,
};

let ttsPromise: Promise<KokoroTTSLike | null> | null = null;
let ttsInstance: KokoroTTSLike | null = null;
let autoInitStarted = false;
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;
let playToken = 0;
let warmupPromise: Promise<void> | null = null;
let lastWarmUtteranceAt = 0;

const listeners = new Set<(next: KokoroStatus) => void>();

function emit(next: Partial<KokoroStatus>) {
  status = { ...status, ...next };
  for (const listener of listeners) {
    try {
      listener(status);
    } catch {}
  }
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return status.progress;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasWebGpu(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof (navigator as Navigator & { gpu?: unknown }).gpu !== "undefined";
}

function chooseDevice(): "webgpu" | "wasm" {
  // Prefer WebGPU on capable non-constrained devices for faster inference; fallback to WASM.
  if (hasWebGpu() && !isConstrainedDevice()) return "webgpu";
  return "wasm";
}

function chooseDtype(device: "webgpu" | "wasm"): "fp32" | "q8" {
  // q8 is significantly smaller/faster to load and run on WASM in most cases.
  if (device === "wasm") return "q8";
  return "fp32";
}

async function detectCached(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(VOICE_CACHE_KEY) === "1") return true;
  } catch {}

  if (typeof caches === "undefined") return false;
  try {
    const keys = await caches.keys();
    return keys.some((key) => MODEL_CACHE_HINTS.some((hint) => key.includes(hint) || hint.includes(key)));
  } catch {
    return false;
  }
}

function markCached() {
  try {
    window.localStorage.setItem(VOICE_CACHE_KEY, "1");
  } catch {}
}

export function getPreferredKokoroChunkSize(): number {
  return 120;
}

export function getKokoroStatus(): KokoroStatus {
  return status;
}

export function subscribeKokoroStatus(listener: (next: KokoroStatus) => void): () => void {
  listeners.add(listener);
  try {
    listener(status);
  } catch {}
  // Best-effort cache detection for initial UI state.
  if (status.state === "idle" && typeof window !== "undefined") {
    void detectCached().then((cached) => {
      if (cached && status.state === "idle") {
        emit({ message: "Voz HQ en caché. Cárgala para usarla al instante." });
      }
    });
  }
  return () => listeners.delete(listener);
}

export function kokoroIsCached(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(VOICE_CACHE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isKokoroReady(): boolean {
  return status.state === "ready" && ttsInstance !== null;
}

export function isKokoroLoading(): boolean {
  return status.state === "loading";
}

export function canAutoLoadKokoroInBackground(): boolean {
  if (typeof window === "undefined") return false;
  // Avoid surprising heavy downloads; allow background load if user likely has it cached or explicitly chose it.
  return kokoroIsCached() || isConstrainedDevice() === false;
}

export function markKokoroAutoInitStarted(): void {
  autoInitStarted = true;
}

function cleanupAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio.load();
    } catch {}
  }
  currentAudio = null;
  if (currentAudioUrl) {
    try {
      URL.revokeObjectURL(currentAudioUrl);
    } catch {}
    currentAudioUrl = null;
  }
}

export function stopKokoroPlayback(): void {
  playToken += 1;
  cleanupAudio();
}

async function createTts(): Promise<KokoroTTSLike | null> {
  const device = chooseDevice();
  const dtype = chooseDtype(device);
  emit({
    state: "loading",
    progress: Math.max(status.progress, 2),
    message: kokoroIsCached() ? "Cargando voz HQ desde caché…" : "Preparando descarga de voz HQ…",
    device,
    error: undefined,
  });

  const progressByFile = new Map<string, number>();
  const updateProgress = (info: any) => {
    try {
      const file = typeof info?.file === "string" ? info.file : typeof info?.name === "string" ? info.name : "model";
      if (info?.status === "progress") {
        const pct = typeof info?.progress === "number" ? info.progress : typeof info?.loaded === "number" && typeof info?.total === "number" && info.total > 0 ? (info.loaded / info.total) * 100 : null;
        if (pct !== null) progressByFile.set(file, Math.max(0, Math.min(100, pct)));
      } else if (info?.status === "done" || info?.status === "ready") {
        progressByFile.set(file, 100);
      } else if (info?.status === "initiate") {
        if (!progressByFile.has(file)) progressByFile.set(file, 1);
      }

      const values = [...progressByFile.values()];
      const aggregate = values.length ? values.reduce((a, b) => a + b, 0) / values.length : status.progress;
      const progress = clampProgress(aggregate);
      const downloading = values.some((v) => v < 100);
      emit({
        state: "loading",
        progress,
        device,
        message: downloading
          ? (kokoroIsCached() ? `Cargando voz HQ… ${progress}%` : `Descargando voz HQ… ${progress}%`)
          : "Inicializando modelo de voz…",
      });
    } catch {}
  };

  try {
    const mod = await import("kokoro-js");
    const KokoroTTS = (mod as any).KokoroTTS;
    if (!KokoroTTS?.from_pretrained) {
      throw new Error("KokoroTTS API no disponible.");
    }

    const tts = (await KokoroTTS.from_pretrained(MODEL_ID, {
      dtype,
      device,
      progress_callback: updateProgress,
    })) as KokoroTTSLike;

    ttsInstance = tts;
    markCached();
    emit({ state: "ready", progress: 100, message: "Voz HQ lista.", device, error: undefined });
    void warmKokoroRuntime();
    return tts;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar Kokoro.";
    ttsInstance = null;
    emit({ state: "error", progress: 0, message: "No se pudo cargar la voz HQ.", device: status.device, error: message });
    throw error;
  }
}

export async function loadKokoro(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (ttsInstance && status.state === "ready") return true;
  if (ttsPromise) {
    try {
      return (await ttsPromise) !== null;
    } catch {
      return false;
    }
  }

  ttsPromise = createTts().finally(() => {
    ttsPromise = null;
  });

  try {
    return (await ttsPromise) !== null;
  } catch {
    return false;
  }
}

async function ensureLoaded(): Promise<KokoroTTSLike | null> {
  if (ttsInstance && status.state === "ready") return ttsInstance;
  const ok = await loadKokoro();
  return ok ? ttsInstance : null;
}

async function warmKokoroRuntime(): Promise<void> {
  if (!ttsInstance) return;
  if (warmupPromise) return warmupPromise;
  const now = Date.now();
  if (now - lastWarmUtteranceAt < 60_000) return;
  lastWarmUtteranceAt = now;

  warmupPromise = (async () => {
    try {
      // Tiny generation to warm model/voice path so the next user-triggered play is faster.
      await ttsInstance!.generate("Ready.", { voice: DEFAULT_VOICE, speed: 1 });
    } catch {
      // Best effort.
    }
  })().finally(() => {
    warmupPromise = null;
  });

  return warmupPromise;
}

export function maybeWarmKokoroInBackground(): void {
  if (typeof window === "undefined") return;
  if (status.state === "loading") return;
  if (status.state === "ready") {
    void warmKokoroRuntime();
    return;
  }
  if (kokoroIsCached() || canAutoLoadKokoroInBackground()) {
    void loadKokoro().catch(() => {});
  }
}

function toAudioUrl(result: any): string | null {
  try {
    if (result && typeof result.toBlob === "function") {
      const blob = result.toBlob();
      if (blob instanceof Blob) return URL.createObjectURL(blob);
    }
    if (result && typeof result.toWav === "function") {
      const wav = result.toWav();
      if (wav instanceof Blob) return URL.createObjectURL(wav);
      if (wav instanceof ArrayBuffer) return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
      if (wav instanceof Uint8Array) return URL.createObjectURL(new Blob([wav.buffer as ArrayBuffer], { type: "audio/wav" }));
    }
  } catch {}
  return null;
}

function playUrl(url: string, button?: HTMLElement | null): Promise<boolean> {
  return new Promise((resolve) => {
    const token = ++playToken;
    cleanupAudio();
    currentAudioUrl = url;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.preload = "auto";

    const finish = (ok: boolean) => {
      if (token !== playToken) return resolve(ok);
      setSpeaking(button, false);
      if (currentAudio === audio) cleanupAudio();
      resolve(ok);
    };

    audio.onplay = () => {
      if (token !== playToken) return;
      setSpeaking(button, true);
    };
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    audio.onpause = () => {
      if (token === playToken && audio.ended) return;
      if (token === playToken) setSpeaking(button, false);
    };

    void audio.play().then(() => {
      if (token !== playToken) return;
      setSpeaking(button, true);
    }).catch(() => finish(false));
  });
}

export async function speakWithKokoro(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const tts = await ensureLoaded();
  if (!tts) return false;

  const speed = getSpeechRate();
  try {
    const result = await tts.generate(text, { voice: DEFAULT_VOICE, speed });
    const url = toAudioUrl(result);
    if (!url) return false;
    return await playUrl(url, button);
  } catch (error) {
    // If generation fails after ready state (e.g. context/device issue), surface error once but allow fallback.
    const message = error instanceof Error ? error.message : "Error generando audio con Kokoro.";
    emit({ state: status.state === "ready" ? "ready" : "error", message: status.message, device: status.device, progress: status.progress, error: message });
    return false;
  }
}
