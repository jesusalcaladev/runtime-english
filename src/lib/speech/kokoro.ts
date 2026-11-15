import { isConstrainedDevice } from "./platform";
import type { KokoroStatus } from "./types";
import { setSpeaking } from "./ui";

const KOKORO_CACHED_KEY = "runtimeenglish_kokoro_cached_v1";
const DESKTOP_AUDIO_CACHE_LIMIT = 12;
const MOBILE_AUDIO_CACHE_LIMIT = 6;
const DESKTOP_CHUNK_SIZE = 180;
const MOBILE_CHUNK_SIZE = 110;

type KokoroDevice = "webgpu" | "wasm";

type KokoroUiBridge = {
  reset: (device: KokoroDevice) => void;
  settleReady: (device: KokoroDevice) => void;
  settleError: (message: string) => void;
  setStatusMessage: (message: string) => void;
  handleProgress: (info: unknown) => void;
};

type KokoroWorkerWithUi = Worker & { __kokoroUi?: KokoroUiBridge };

type PendingGeneration = {
  resolve: (value: { buffer: ArrayBuffer; mime: string }) => void;
  reject: (reason?: unknown) => void;
};

type KokoroWorkerProgressMessage = {
  type: "progress";
  info?: unknown;
};

type KokoroWorkerStatusMessage = {
  type: "status";
  message?: string;
};

type KokoroWorkerReadyMessage = {
  type: "ready";
  device?: KokoroDevice;
};

type KokoroWorkerErrorMessage = {
  type: "error";
  error?: string;
};

type KokoroWorkerAudioMessage = {
  type: "audio";
  id: number;
  buffer: ArrayBuffer;
  mime?: string;
};

type KokoroWorkerGenErrorMessage = {
  type: "gen-error";
  id: number;
  error?: string;
};

type KokoroWorkerMessage =
  | KokoroWorkerProgressMessage
  | KokoroWorkerStatusMessage
  | KokoroWorkerReadyMessage
  | KokoroWorkerErrorMessage
  | KokoroWorkerAudioMessage
  | KokoroWorkerGenErrorMessage;

function isKokoroDevice(value: unknown): value is KokoroDevice {
  return value === "webgpu" || value === "wasm";
}

function isKokoroWorkerMessage(value: unknown): value is KokoroWorkerMessage {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }

  const type = (value as { type?: unknown }).type;
  if (typeof type !== "string") {
    return false;
  }

  if (type === "progress" || type === "status" || type === "ready" || type === "error") {
    return true;
  }

  if (type === "audio" || type === "gen-error") {
    return typeof (value as { id?: unknown }).id === "number";
  }

  return false;
}

function isKokoroMarkedCached(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KOKORO_CACHED_KEY) === "1";
  } catch {
    return false;
  }
}

function markKokoroCached(ready: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (ready) window.localStorage.setItem(KOKORO_CACHED_KEY, "1");
    else window.localStorage.removeItem(KOKORO_CACHED_KEY);
  } catch {}
}

let kokoroWorker: KokoroWorkerWithUi | null = null;
let kokoroPromise: Promise<boolean> | null = null;
let kokoroReady = false;
let kokoroStatus: KokoroStatus = {
  state: "idle",
  progress: 0,
  message: isKokoroMarkedCached() ? "HQ voice downloaded (cached)" : "HQ voice not downloaded",
  device: null,
};
const kokoroListeners = new Set<(status: KokoroStatus) => void>();
let kokoroAudio: HTMLAudioElement | null = null;
let kokoroSpeakingButton: HTMLElement | null = null;
let kokoroAbort: AbortController | null = null;
const kokoroAudioCache = new Map<string, string>();
let kokoroAutoInitStarted = false;
let kokoroGenSeq = 0;
const kokoroPendingGen = new Map<number, PendingGeneration>();

function getKokoroCacheKey(text: string, speed: number): string {
  return `${speed}|af_heart|${text}`;
}

function getKokoroCacheLimit(): number {
  return isConstrainedDevice() ? MOBILE_AUDIO_CACHE_LIMIT : DESKTOP_AUDIO_CACHE_LIMIT;
}

export function getPreferredKokoroChunkSize(): number {
  return isConstrainedDevice() ? MOBILE_CHUNK_SIZE : DESKTOP_CHUNK_SIZE;
}

function cacheKokoroAudio(key: string, url: string) {
  const prev = kokoroAudioCache.get(key);
  if (prev && prev !== url) {
    try {
      URL.revokeObjectURL(prev);
    } catch {}
  }

  // Refresh insertion order for simple LRU behavior.
  if (kokoroAudioCache.has(key)) kokoroAudioCache.delete(key);
  kokoroAudioCache.set(key, url);

  const limit = getKokoroCacheLimit();
  while (kokoroAudioCache.size > limit) {
    const oldest = kokoroAudioCache.keys().next().value as string | undefined;
    if (!oldest) break;
    const oldUrl = kokoroAudioCache.get(oldest);
    kokoroAudioCache.delete(oldest);
    if (oldUrl) {
      try {
        URL.revokeObjectURL(oldUrl);
      } catch {}
    }
  }
}

function emitKokoroStatus(patch: Partial<KokoroStatus>) {
  kokoroStatus = { ...kokoroStatus, ...patch };
  for (const listener of kokoroListeners) {
    try {
      listener(kokoroStatus);
    } catch {}
  }
}

export function getKokoroStatus(): KokoroStatus {
  return kokoroStatus;
}

export function subscribeKokoroStatus(listener: (status: KokoroStatus) => void): () => void {
  kokoroListeners.add(listener);
  try {
    listener(kokoroStatus);
  } catch {}
  return () => kokoroListeners.delete(listener);
}

export function kokoroIsCached(): boolean {
  return isKokoroMarkedCached();
}

export function isKokoroReady(): boolean {
  return kokoroReady && kokoroStatus.state === "ready";
}

export function isKokoroLoading(): boolean {
  return kokoroStatus.state === "loading";
}

export function canAutoLoadKokoroInBackground(): boolean {
  if (typeof window === "undefined") return false;
  if (kokoroAutoInitStarted || kokoroReady || kokoroPromise || kokoroStatus.state === "loading") return false;
  if (!isKokoroMarkedCached()) return false;
  if (isConstrainedDevice()) return false;
  return true;
}

export function markKokoroAutoInitStarted() {
  kokoroAutoInitStarted = true;
}

export function stopKokoroPlayback() {
  try {
    kokoroAbort?.abort();
  } catch {}
  kokoroAbort = null;

  for (const [, pending] of kokoroPendingGen) {
    try {
      pending.reject(new Error("aborted"));
    } catch {}
  }
  kokoroPendingGen.clear();

  if (kokoroAudio) {
    try {
      kokoroAudio.onended = null;
      kokoroAudio.onerror = null;
      kokoroAudio.pause();
      kokoroAudio.src = "";
    } catch {}
    kokoroAudio = null;
  }

  if (kokoroSpeakingButton) {
    setSpeaking(kokoroSpeakingButton, false);
    kokoroSpeakingButton = null;
  }
}

async function detectKokoroDevice(): Promise<KokoroDevice> {
  // On mobile/constrained devices, prefer quantized WASM for better stability and memory behavior.
  if (isConstrainedDevice()) return "wasm";

  try {
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (typeof mem === "number" && mem > 0 && mem < 8) return "wasm";
  } catch {}

  try {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter?: () => Promise<unknown> } }).gpu;
    if (gpu && typeof gpu.requestAdapter === "function") {
      const adapter = await gpu.requestAdapter();
      if (adapter) return "webgpu";
    }
  } catch {}

  return "wasm";
}

function ensureKokoroWorker(): KokoroWorkerWithUi {
  if (kokoroWorker) return kokoroWorker;

  const worker = new Worker(new URL("../kokoro.worker.ts", import.meta.url), { type: "module" }) as KokoroWorkerWithUi;
  kokoroWorker = worker;

  let targetProgress = 0;
  let displayedProgress = 0;
  let progressAnim: ReturnType<typeof setInterval> | null = null;
  let stallTimer: ReturnType<typeof setTimeout> | null = null;
  let settled = false;
  const fileBytes: Record<string, { loaded: number; total: number }> = {};
  const STALL_MS = 30000;
  const FINALIZE_STALL_MS = 180000;
  const deviceRef = { current: "wasm" as KokoroDevice };
  const cachedHint = isKokoroMarkedCached();

  const stopProgressAnim = () => {
    if (progressAnim) {
      clearInterval(progressAnim);
      progressAnim = null;
    }
  };
  const clearStall = () => {
    if (stallTimer) {
      clearTimeout(stallTimer);
      stallTimer = null;
    }
  };
  const bumpStall = (ms = STALL_MS) => {
    if (settled) return;
    clearStall();
    stallTimer = setTimeout(() => {
      if (settled || kokoroStatus.state !== "loading") return;
      const finalizing = targetProgress >= 95;
      settled = true;
      stopProgressAnim();
      kokoroReady = false;
      emitKokoroStatus({
        state: "error",
        progress: Math.round(displayedProgress),
        message: finalizing ? "Initialization is taking too long" : "The download appears stalled",
        device: deviceRef.current,
        error: finalizing
          ? "The download finished, but the model could not start in time. Try again (files are often already cached)."
          : "No progress for a while. Check your connection and try again (downloaded files may be cached).",
      });
    }, ms);
  };
  const startProgressAnim = () => {
    if (progressAnim || settled) return;
    progressAnim = setInterval(() => {
      if (settled) {
        stopProgressAnim();
        return;
      }
      if (displayedProgress >= targetProgress) {
        if (targetProgress >= 99) stopProgressAnim();
        return;
      }
      const remaining = targetProgress - displayedProgress;
      const step = Math.max(0.25, remaining * 0.18);
      displayedProgress = Math.min(targetProgress, displayedProgress + step);
      const shown = Math.max(0, Math.min(99, Math.round(displayedProgress)));
      emitKokoroStatus({
        state: "loading",
        progress: shown,
        message:
          targetProgress >= 99 && shown >= 99
            ? "Initializing voice model (this may take a few seconds, keep this tab open)…"
            : cachedHint
              ? `Loading HQ voice from cache… ${shown}%`
              : `Downloading HQ voice… ${shown}%`,
        device: deviceRef.current,
      });
    }, 120);
  };
  const updateAggregateProgress = (label?: string) => {
    if (settled) return;

    let loadedSum = 0;
    let totalSum = 0;
    for (const file of Object.values(fileBytes)) {
      if (file.total > 0) {
        totalSum += file.total;
        loadedSum += Math.min(file.loaded, file.total);
      }
    }

    let overall = 0;
    if (totalSum > 0) {
      overall = (loadedSum / totalSum) * 100;
    } else {
      const values = Object.values(fileBytes).map((file) => (file.total > 0 ? (file.loaded / file.total) * 100 : 0));
      overall = values.length ? values.reduce((acc, value) => acc + value, 0) / values.length : 0;
    }

    const pct = Math.max(targetProgress, Math.min(99, overall));
    const progressed = pct > targetProgress;
    targetProgress = pct;

    if (label) {
      emitKokoroStatus({
        state: "loading",
        progress: Math.max(0, Math.min(99, Math.round(displayedProgress))),
        message: label,
        device: deviceRef.current,
      });
    } else if (!progressAnim && displayedProgress < targetProgress) {
      emitKokoroStatus({
        state: "loading",
        progress: Math.max(0, Math.min(99, Math.round(displayedProgress))),
        message: `Downloading HQ voice… ${Math.max(0, Math.min(99, Math.round(displayedProgress)))}%`,
        device: deviceRef.current,
      });
    }

    if (targetProgress > displayedProgress) startProgressAnim();
    if (progressed || label) bumpStall(targetProgress >= 95 ? FINALIZE_STALL_MS : STALL_MS);
  };

  worker.__kokoroUi = {
    reset(device) {
      deviceRef.current = device;
      targetProgress = 0;
      displayedProgress = 0;
      settled = false;
      for (const key of Object.keys(fileBytes)) delete fileBytes[key];
      stopProgressAnim();
      clearStall();
      emitKokoroStatus({
        state: "loading",
        progress: 0,
        message: cachedHint ? "Loading HQ voice from cache…" : "Downloading HQ voice model…",
        device,
        error: undefined,
      });
      bumpStall();
    },
    settleReady(device) {
      if (settled) return;
      deviceRef.current = device;
      clearStall();
      stopProgressAnim();
      settled = true;
      displayedProgress = 100;
      targetProgress = 100;
      kokoroReady = true;
      markKokoroCached(true);
      emitKokoroStatus({ state: "ready", progress: 100, message: "HQ voice ready", device, error: undefined });
    },
    settleError(message) {
      if (settled) return;
      clearStall();
      stopProgressAnim();
      settled = true;
      kokoroReady = false;
      emitKokoroStatus({
        state: "error",
        progress: Math.round(displayedProgress),
        message: "Failed to load HQ voice",
        device: deviceRef.current,
        error: message,
      });
    },
    setStatusMessage(message) {
      if (settled) return;
      bumpStall(targetProgress >= 95 ? FINALIZE_STALL_MS : STALL_MS);
      emitKokoroStatus({
        state: "loading",
        progress: Math.max(0, Math.min(99, Math.round(displayedProgress))),
        message,
        device: deviceRef.current,
      });
    },
    handleProgress(info) {
      if (!info || settled || typeof info !== "object") return;
      bumpStall();
      const payload = info as Record<string, unknown>;
      const file = typeof payload.file === "string" ? payload.file : undefined;
      const status = typeof payload.status === "string" ? payload.status : undefined;

      if (status === "progress" && file) {
        const total =
          typeof payload.total === "number" && Number.isFinite(payload.total) && payload.total > 0
            ? payload.total
            : (fileBytes[file]?.total ?? 0);
        let loaded = typeof payload.loaded === "number" && Number.isFinite(payload.loaded) ? payload.loaded : undefined;
        if (loaded == null && typeof payload.progress === "number" && total > 0) {
          const ratio = payload.progress > 1 ? payload.progress / 100 : payload.progress;
          loaded = ratio * total;
        }
        if (loaded == null) loaded = fileBytes[file]?.loaded ?? 0;
        const effectiveTotal = total > 0 ? total : Math.max(loaded, fileBytes[file]?.total ?? 1);
        fileBytes[file] = { loaded, total: effectiveTotal };
        updateAggregateProgress();
      } else if (status === "initiate") {
        if (file && !fileBytes[file]) fileBytes[file] = { loaded: 0, total: 0 };
        emitKokoroStatus({
          state: "loading",
          progress: Math.max(0, Math.min(99, Math.round(displayedProgress))),
          message: "Preparing HQ voice download…",
          device: deviceRef.current,
        });
        bumpStall(targetProgress >= 95 ? FINALIZE_STALL_MS : STALL_MS);
      } else if (status === "download" || status === "done") {
        if (file && fileBytes[file] && fileBytes[file].total > 0) fileBytes[file].loaded = fileBytes[file].total;
        if (status === "done") updateAggregateProgress("Finalizing download…");
        if (targetProgress >= 95) bumpStall(FINALIZE_STALL_MS);
      } else if (status === "ready") {
        targetProgress = Math.max(targetProgress, 99);
        if (displayedProgress < 99) startProgressAnim();
        emitKokoroStatus({
          state: "loading",
          progress: Math.max(0, Math.min(99, Math.round(displayedProgress))),
          message: "Initializing voice model (this may take a few seconds, keep this tab open)…",
          device: deviceRef.current,
        });
        bumpStall(FINALIZE_STALL_MS);
      }
    },
  };

  worker.onmessage = (event: MessageEvent<unknown>) => {
    if (!isKokoroWorkerMessage(event.data)) return;

    const ui = worker.__kokoroUi;
    if (!ui) return;

    const message = event.data;

    switch (message.type) {
      case "progress":
        ui.handleProgress(message.info);
        return;
      case "status":
        ui.setStatusMessage(message.message ?? "Loading…");
        return;
      case "ready":
        ui.settleReady(isKokoroDevice(message.device) ? message.device : "wasm");
        return;
      case "error":
        ui.settleError(message.error ?? "Error");
        return;
      case "audio": {
        const pending = kokoroPendingGen.get(message.id);
        if (!pending) return;
        kokoroPendingGen.delete(message.id);
        pending.resolve({ buffer: message.buffer, mime: message.mime ?? "audio/wav" });
        return;
      }
      case "gen-error": {
        const pending = kokoroPendingGen.get(message.id);
        if (!pending) return;
        kokoroPendingGen.delete(message.id);
        pending.reject(new Error(message.error ?? "Generation error"));
        return;
      }
      default:
        return;
    }
  };

  worker.onerror = () => {
    worker.__kokoroUi?.settleError("The HQ voice worker failed.");
  };

  return worker;
}

export async function loadKokoro(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (isKokoroReady()) return true;
  if (kokoroPromise) return kokoroPromise;

  kokoroPromise = (async () => {
    try {
      const device = await detectKokoroDevice();
      const lowMemory = isConstrainedDevice();
      const worker = ensureKokoroWorker();
      worker.__kokoroUi?.reset(device);
      emitKokoroStatus({
        state: "loading",
        progress: 0,
        message: lowMemory
          ? isKokoroMarkedCached()
            ? "Loading mobile-optimized HQ voice…"
            : "Downloading mobile-optimized HQ voice…"
          : isKokoroMarkedCached()
            ? "Loading HQ voice from cache…"
            : "Downloading HQ voice model…",
        device,
        error: undefined,
      });
      worker.postMessage({ type: "load", device, preferLowMemory: lowMemory });

      await new Promise<void>((resolve, reject) => {
        const off = subscribeKokoroStatus((status) => {
          if (status.state === "ready") {
            off();
            resolve();
          } else if (status.state === "error") {
            off();
            reject(new Error(status.error || status.message));
          }
        });
      });

      // Sample pre-generation only on desktop to avoid memory/CPU spikes on mobile.
      if (!isConstrainedDevice()) {
        try {
          const sample = "The server is running. Pull the latest changes before you push.";
          const speed = 1;
          const key = getKokoroCacheKey(sample, speed);
          if (!kokoroAudioCache.has(key) && isKokoroReady()) {
            const run = () => {
              void (async () => {
                try {
                  const { buffer, mime } = await kokoroGenerateInWorker(sample, speed);
                  const blob = new Blob([buffer], { type: mime || "audio/wav" });
                  cacheKokoroAudio(key, URL.createObjectURL(blob));
                } catch {}
              })();
            };
            const requestIdle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void }).requestIdleCallback;
            if (typeof requestIdle === "function") requestIdle(run, { timeout: 10000 });
            else setTimeout(run, 6000);
          }
        } catch {}
      }

      return true;
    } catch {
      return false;
    } finally {
      kokoroPromise = null;
    }
  })();

  return kokoroPromise;
}

export function maybeWarmKokoroInBackground() {
  if (kokoroReady || kokoroPromise || kokoroStatus.state === "loading") return;
  if (!isKokoroMarkedCached()) return;
  void loadKokoro().catch(() => {});
}

function kokoroGenerateInWorker(text: string, speed: number): Promise<{ buffer: ArrayBuffer; mime: string }> {
  const worker = ensureKokoroWorker();
  const id = ++kokoroGenSeq;

  return new Promise((resolve, reject) => {
    kokoroPendingGen.set(id, { resolve, reject });
    try {
      worker.postMessage({ type: "generate", id, text, speed });
    } catch (error) {
      kokoroPendingGen.delete(id);
      reject(error);
    }
  });
}

export function splitSpeechChunks(text: string, maxLen = getPreferredKokoroChunkSize()): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  const parts = clean
    .split(/(?<=[.!?;:])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current.trim()) {
      chunks.push(current.trim());
      current = "";
    }
  };

  for (const part of parts.length ? parts : [clean]) {
    if (part.length <= maxLen) {
      if (!current) current = part;
      else if (`${current} ${part}`.length <= maxLen) current += ` ${part}`;
      else {
        pushCurrent();
        current = part;
      }
      continue;
    }

    pushCurrent();
    const words = part.split(/\s+/);
    let wordChunk = "";
    for (const word of words) {
      if (!wordChunk) wordChunk = word;
      else if (`${wordChunk} ${word}`.length <= maxLen) wordChunk += ` ${word}`;
      else {
        chunks.push(wordChunk);
        wordChunk = word;
      }
    }
    if (wordChunk) chunks.push(wordChunk);
  }

  pushCurrent();
  return chunks.length ? chunks : [clean.slice(0, maxLen)];
}

async function playAudioUrl(url: string): Promise<void> {
  const element = new Audio(url);
  kokoroAudio = element;
  element.playbackRate = 1;

  await new Promise<void>((resolve, reject) => {
    element.onended = () => resolve();
    element.onerror = () => reject(new Error("audio playback error"));
    element.play().catch(reject);
  });
}

export async function speakWithKokoro(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!isKokoroReady()) return false;

  const abort = new AbortController();
  kokoroAbort = abort;
  kokoroSpeakingButton = button ?? null;

  try {
    const chunks = splitSpeechChunks(text);
    if (chunks.length === 0) return false;

    // Read rate lazily to keep behavior consistent and avoid tight coupling in this module.
    const { getSpeechRate } = await import("./platform");
    const speechRate = getSpeechRate();

    for (const chunk of chunks) {
      if (abort.signal.aborted) return true;
      const cacheKey = getKokoroCacheKey(chunk, speechRate);
      let url = kokoroAudioCache.get(cacheKey) ?? null;

      if (!url) {
        if (abort.signal.aborted) return true;
        const { buffer, mime } = await kokoroGenerateInWorker(chunk, speechRate);
        if (abort.signal.aborted) return true;
        const blob = new Blob([buffer], { type: mime || "audio/wav" });
        url = URL.createObjectURL(blob);
        cacheKokoroAudio(cacheKey, url);
      }

      if (abort.signal.aborted) return true;
      if (kokoroAudio) {
        try {
          kokoroAudio.onended = null;
          kokoroAudio.onerror = null;
          kokoroAudio.pause();
          kokoroAudio.src = "";
        } catch {}
        kokoroAudio = null;
      }

      kokoroAbort = abort;
      kokoroSpeakingButton = button ?? null;
      await playAudioUrl(url);
    }

    return true;
  } catch (error) {
    if ((error as { name?: string })?.name === "AbortError" || abort.signal.aborted) return true;
    console.warn("Kokoro TTS failed, falling back to system voice", error);
    return false;
  } finally {
    if (kokoroSpeakingButton === (button ?? null)) {
      stopKokoroPlayback();
    }
  }
}
