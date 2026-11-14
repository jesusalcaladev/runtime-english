import { emitToast } from "./toast";

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

type StoredSpeechSettings = {
  ttsEnabled?: boolean;
  ttsRate?: number;
  ttsEngine?: "system" | "kokoro";
};

function readStoredSettings(): StoredSpeechSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("devlingo_v2");
    return raw ? JSON.parse(raw)?.settings ?? null : null;
  } catch {
    return null;
  }
}

export function isSpeechEnabled(): boolean {
  const settings = readStoredSettings();
  return settings?.ttsEnabled !== false;
}

function getSpeechEngine(): "system" | "kokoro" {
  return readStoredSettings()?.ttsEngine === "kokoro" ? "kokoro" : "system";
}

function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  try {
    return typeof cap?.isNativePlatform === "function" ? cap.isNativePlatform() : false;
  } catch {
    return false;
  }
}

export function getSpeechRate(): number {
  const rate = readStoredSettings()?.ttsRate;
  return typeof rate === "number" && Number.isFinite(rate)
    ? Math.min(2, Math.max(0.5, rate))
    : 1;
}

// --- Kokoro (HQ neural TTS, opt-in) ---
export type KokoroStatus = {
  state: "idle" | "loading" | "ready" | "error";
  progress: number; // 0-100 aggregate best-effort
  message: string;
  device: "webgpu" | "wasm" | null;
  error?: string;
};

const KOKORO_CACHED_KEY = "devlingo_kokoro_cached_v1";

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

let kokoroTTS: any = null;
let kokoroPromise: Promise<any> | null = null;
let kokoroStatus: KokoroStatus = {
  state: "idle",
  progress: 0,
  message: isKokoroMarkedCached() ? "Voz HQ descargada (en caché)" : "Voz HQ no descargada",
  device: null,
};
const kokoroListeners = new Set<(s: KokoroStatus) => void>();
let kokoroAudio: HTMLAudioElement | null = null;
let kokoroAudioUrl: string | null = null;
let kokoroSpeakingButton: HTMLElement | null = null;
let kokoroAbort: AbortController | null = null;
const kokoroAudioCache = new Map<string, string>();
let kokoroAutoInitStarted = false;

function getKokoroCacheKey(text: string, speed: number): string {
  return `${speed}|af_heart|${text}`;
}

function cacheKokoroAudio(key: string, url: string) {
  const prev = kokoroAudioCache.get(key);
  if (prev && prev !== url) {
    try {
      URL.revokeObjectURL(prev);
    } catch {}
  }
  kokoroAudioCache.set(key, url);
  // Limit cache size
  while (kokoroAudioCache.size > 12) {
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
  for (const fn of kokoroListeners) {
    try {
      fn(kokoroStatus);
    } catch {}
  }
}

export function getKokoroStatus(): KokoroStatus {
  return kokoroStatus;
}

export function subscribeKokoroStatus(listener: (s: KokoroStatus) => void): () => void {
  kokoroListeners.add(listener);
  try {
    listener(kokoroStatus);
  } catch {}
  return () => kokoroListeners.delete(listener);
}

function stopKokoroPlayback() {
  try {
    kokoroAbort?.abort();
  } catch {}
  kokoroAbort = null;
  if (kokoroAudio) {
    try {
      kokoroAudio.onended = null;
      kokoroAudio.onerror = null;
      kokoroAudio.pause();
      kokoroAudio.src = "";
    } catch {}
    kokoroAudio = null;
  }
  // Do not revoke kokoroAudioUrl: it may come from cache for reuse
  kokoroAudioUrl = null;
  if (kokoroSpeakingButton) {
    setSpeaking(kokoroSpeakingButton, false);
    kokoroSpeakingButton = null;
  }
}

async function detectKokoroDevice(): Promise<"webgpu" | "wasm"> {
  try {
    const gpu = (navigator as any).gpu;
    if (gpu && typeof gpu.requestAdapter === "function") {
      const adapter = await gpu.requestAdapter();
      if (adapter) return "webgpu";
    }
  } catch {}
  return "wasm";
}

export async function loadKokoro(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (kokoroTTS && kokoroStatus.state === "ready") return true;
  if (kokoroPromise) {
    try {
      await kokoroPromise;
      return kokoroStatus.state === "ready";
    } catch {
      return false;
    }
  }

  let thisLoad!: Promise<any>;
  thisLoad = (async () => {
    const device = await detectKokoroDevice();
    const cachedHint = isKokoroMarkedCached();
    let stallTimer: ReturnType<typeof setTimeout> | null = null;
    let settled = false;
    const STALL_MS = 30000;
    const FINALIZE_STALL_MS = 180000; // Final initialization/compilation can take a while without events

    let targetProgress = 0; // Actual computed progress (0-99)
    let displayedProgress = 0; // Smoothed progress shown to the user
    let progressAnim: ReturnType<typeof setInterval> | null = null;

    const stopProgressAnim = () => {
      if (progressAnim) {
        clearInterval(progressAnim);
        progressAnim = null;
      }
    };
    const startProgressAnim = () => {
      if (progressAnim || settled) return;
      progressAnim = setInterval(() => {
        if (settled) {
          stopProgressAnim();
          return;
        }
        const target = targetProgress;
        if (displayedProgress >= target) {
          if (target >= 99) stopProgressAnim();
          return;
        }
        // Gradual progress toward the target to avoid jumps and show perceived real loading progress
        const remaining = target - displayedProgress;
        const step = Math.max(0.25, remaining * 0.18);
        displayedProgress = Math.min(target, displayedProgress + step);
        const shown = Math.max(0, Math.min(99, Math.round(displayedProgress)));
        emitKokoroStatus({
          state: "loading",
          progress: shown,
          message:
            target >= 99 && shown >= 99
              ? "Inicializando modelo de voz…"
              : cachedHint
                ? `Cargando voz HQ desde caché… ${shown}%`
                : `Descargando voz HQ… ${shown}%`,
          device,
        });
      }, 120);
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
        // No activity/progress for a while: mark error to unblock the UI and allow retry
        settled = true;
        stopProgressAnim();
        kokoroTTS = null;
        if (kokoroPromise === thisLoad) kokoroPromise = null;
        emitKokoroStatus({
          state: "error",
          progress: Math.round(displayedProgress),
          message: finalizing ? "La inicialización está tardando demasiado" : "La descarga parece detenida",
          device,
          error: finalizing
            ? "La descarga terminó pero el modelo no se pudo iniciar a tiempo. Vuelve a intentar (los archivos suelen quedar en caché)."
            : "No hubo progreso durante un rato. Revisa tu conexión y vuelve a intentar (lo descargado puede quedar en caché).",
        });
      }, ms);
    };

    emitKokoroStatus({
      state: "loading",
      progress: 0,
      message: cachedHint ? "Cargando voz HQ desde caché…" : "Descargando modelo de voz HQ…",
      device,
      error: undefined,
    });
    bumpStall();

    try {
      // Configure ONNX Runtime (via transformers.js) for environments without cross-origin isolation:
      // Single-thread mode avoids depending on SharedArrayBuffer/COOP+COEP in web and WebViews.
      try {
        const { env } = await import("@huggingface/transformers");
        const wasm = (env as any)?.backends?.onnx?.wasm;
        if (wasm) wasm.numThreads = 1;
        // Allow remote model download from Hugging Face (expected behavior)
        if ((env as any).allowRemoteModels === false) (env as any).allowRemoteModels = true;
      } catch {}

      const { KokoroTTS } = await import("kokoro-js");
      const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";
      const dtype = device === "webgpu" ? "fp32" : "q8";

      // Aggregate byte progress across all files to avoid jumps
      // (e.g. small files reaching 100% and inflating the average before the large file appears).
      const fileBytes: Record<string, { loaded: number; total: number }> = {};
      const updateAggregateProgress = (label?: string) => {
        if (settled) return;
        let loadedSum = 0;
        let totalSum = 0;
        for (const f of Object.values(fileBytes)) {
          if (f.total > 0) {
            totalSum += f.total;
            loadedSum += Math.min(f.loaded, f.total);
          }
        }
        let overall = 0;
        if (totalSum > 0) {
          overall = (loadedSum / totalSum) * 100;
        } else {
          const values = Object.values(fileBytes).map((f) =>
            f.total > 0 ? (f.loaded / f.total) * 100 : 0,
          );
          overall = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        }
        // Never go backwards and reserve 100% for the actual "ready" state
        const pct = Math.max(targetProgress, Math.min(99, overall));
        const progressed = pct > targetProgress;
        targetProgress = pct;

        // Immediate status/message (the bar animates smoothly toward the target)
        if (label) {
          const shown = Math.max(0, Math.min(99, Math.round(displayedProgress)));
          emitKokoroStatus({
            state: "loading",
            progress: shown,
            message: label,
            device,
          });
        } else if (!progressAnim && displayedProgress < targetProgress) {
          const shown = Math.max(0, Math.min(99, Math.round(displayedProgress)));
          emitKokoroStatus({
            state: "loading",
            progress: shown,
            message: `Descargando voz HQ… ${shown}%`,
            device,
          });
        }
        if (targetProgress > displayedProgress) startProgressAnim();

        // Reset watchdog on activity/progress; allow more time at the end (initialization)
        if (progressed || label) bumpStall(targetProgress >= 95 ? FINALIZE_STALL_MS : STALL_MS);
      };

      const loadWith = async (dev: "webgpu" | "wasm", dt: "fp32" | "fp16" | "q8" | "q4" | "q4f16") =>
        KokoroTTS.from_pretrained(model_id, {
          dtype: dt,
          device: dev,
          progress_callback: (info: any) => {
          try {
            if (!info || settled) return;
            bumpStall();
            const file = info.file as string | undefined;
            if (info.status === "progress" && file) {
              const total =
                typeof info.total === "number" && Number.isFinite(info.total) && info.total > 0
                  ? info.total
                  : (fileBytes[file]?.total ?? 0);
              let loaded =
                typeof info.loaded === "number" && Number.isFinite(info.loaded)
                  ? info.loaded
                  : undefined;
              if (loaded == null && typeof info.progress === "number" && total > 0) {
                // info.progress may be 0-100 or 0-1 depending on the emitter
                const ratio = info.progress > 1 ? info.progress / 100 : info.progress;
                loaded = ratio * total;
              }
              if (loaded == null) loaded = fileBytes[file]?.loaded ?? 0;
              // Register/update known totals; if total is unknown yet, use a
              // provisional estimate so aggregate progress advances smoothly until known.
              const effectiveTotal = total > 0 ? total : Math.max(loaded, fileBytes[file]?.total ?? 1);
              fileBytes[file] = { loaded, total: effectiveTotal };
              updateAggregateProgress();
            } else if (info.status === "initiate") {
              if (file && !fileBytes[file]) fileBytes[file] = { loaded: 0, total: 0 };
              emitKokoroStatus({
                state: "loading",
                progress: Math.max(0, Math.min(99, Math.round(displayedProgress))),
                message: "Preparando descarga de voz HQ…",
                device,
              });
              bumpStall(targetProgress >= 95 ? FINALIZE_STALL_MS : STALL_MS);
            } else if (info.status === "download" || info.status === "done") {
              if (file && fileBytes[file] && fileBytes[file].total > 0) {
                fileBytes[file].loaded = fileBytes[file].total;
              }
              // "done" may be per-file; keep <100% until the full load completes
              if (info.status === "done") updateAggregateProgress("Finalizando descarga…");
              if (targetProgress >= 95) bumpStall(FINALIZE_STALL_MS);
            } else if (info.status === "ready") {
              targetProgress = Math.max(targetProgress, 99);
              if (displayedProgress < 99) startProgressAnim();
              emitKokoroStatus({
                state: "loading",
                progress: Math.max(0, Math.min(99, Math.round(displayedProgress))),
                message: "Inicializando modelo de voz…",
                device,
              });
              // Compilation/initialization can take time without emitting progress
              bumpStall(FINALIZE_STALL_MS);
            }
          } catch {}
        },
      } as any);

      let tts: any;
      let usedDevice: "webgpu" | "wasm" = device;
      try {
        tts = await loadWith(device, dtype);
      } catch (e) {
        // If WebGPU fails (common in WebViews/devices without stable support), retry with WASM
        if (device === "webgpu" && !settled) {
          usedDevice = "wasm";
          emitKokoroStatus({
            state: "loading",
            progress: Math.max(0, Math.min(99, Math.round(displayedProgress))),
            message: "WebGPU no disponible, usando WASM…",
            device: usedDevice,
          });
          tts = await loadWith("wasm", "q8");
        } else {
          throw e;
        }
      }

      if (settled) return kokoroTTS;
      clearStall();
      stopProgressAnim();
      settled = true;
      displayedProgress = 100;
      targetProgress = 100;
      kokoroTTS = tts;
      markKokoroCached(true);
      emitKokoroStatus({
        state: "ready",
        progress: 100,
        message: "Voz HQ lista",
        device: usedDevice,
      });

      // Pre-generate the test phrase in the background so "Test voice" is instant
      // and does not freeze the page on the first click after download.
      try {
        const sample = "The server is running. Pull the latest changes before you push.";
        const speed = 1;
        const key = getKokoroCacheKey(sample, speed);
        if (!kokoroAudioCache.has(key)) {
          setTimeout(() => {
            void (async () => {
              try {
                if (!kokoroTTS || kokoroStatus.state !== "ready") return;
                const audio = await kokoroTTS.generate(sample, { voice: "af_heart", speed });
                const blob: Blob =
                  typeof audio?.toBlob === "function"
                    ? audio.toBlob()
                    : new Blob([audio.toWav()], { type: "audio/wav" });
                const url = URL.createObjectURL(blob);
                cacheKokoroAudio(key, url);
              } catch (e) {
                console.warn("Kokoro sample pre-generation failed", e);
              }
            })();
          }, 150);
        }
      } catch {}

      return tts;
    } catch (err) {
      clearStall();
      stopProgressAnim();
      if (settled) throw err; // ya manejado por watchdog como "stalled"
      settled = true;
      const message = err instanceof Error ? err.message : "No se pudo cargar la voz HQ";
      kokoroTTS = null;
      emitKokoroStatus({
        state: "error",
        progress: Math.round(displayedProgress),
        message: "Error al cargar la voz HQ",
        device,
        error: message,
      });
      throw err;
    } finally {
      clearStall();
      stopProgressAnim();
      if (kokoroPromise === thisLoad) kokoroPromise = null;
    }
  })();

  kokoroPromise = thisLoad;

  try {
    await kokoroPromise;
    return true;
  } catch {
    return false;
  }
}

async function speakKokoro(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!kokoroTTS || kokoroStatus.state !== "ready") return false;
  const abort = new AbortController();
  kokoroAbort = abort;
  kokoroSpeakingButton = button ?? null;
  try {
    const rate = getSpeechRate();
    const cacheKey = getKokoroCacheKey(text, rate);
    let url = kokoroAudioCache.get(cacheKey) ?? null;

    if (!url) {
      // Yield to the main thread so the UI can paint the "speaking/generating" state
      await new Promise<void>((resolve) => setTimeout(resolve, 20));
      if (abort.signal.aborted) return true;
      // Generation runs on the main thread and may briefly freeze; on failure, fall back silently.
      const audio = await kokoroTTS.generate(text, { voice: "af_heart", speed: rate });
      if (abort.signal.aborted) return true;
      const blob: Blob =
        typeof audio?.toBlob === "function"
          ? audio.toBlob()
          : new Blob([audio.toWav()], { type: "audio/wav" });
      url = URL.createObjectURL(blob);
      cacheKokoroAudio(cacheKey, url);
    }

    if (abort.signal.aborted) return true;
    stopKokoroPlayback(); // Clear previous playback (without revoking cached URLs)
    kokoroAbort = abort;
    kokoroSpeakingButton = button ?? null;
    kokoroAudioUrl = url;
    const el = new Audio(url);
    kokoroAudio = el;
    el.playbackRate = 1; // speed baked into generation
    await new Promise<void>((resolve, reject) => {
      el.onended = () => resolve();
      el.onerror = () => reject(new Error("audio playback error"));
      el.play().catch(reject);
    });
    return true;
  } catch (err) {
    if ((err as any)?.name === "AbortError") return true;
    console.warn("Kokoro TTS failed, falling back to system voice", err);
    return false;
  } finally {
    if (kokoroSpeakingButton === (button ?? null)) {
      stopKokoroPlayback();
    }
  }
}

export function stopSpeech() {
  if (typeof window === "undefined") return;
  stopKokoroPlayback();
  try {
    window.speechSynthesis?.cancel();
  } catch {}
  if (isNativePlatform()) {
    void import("@capacitor-community/text-to-speech")
      .then(({ TextToSpeech }) => TextToSpeech.stop())
      .catch(() => undefined);
  }
}

// --- Web Speech API path ---
function isEnglish(voice: SpeechSynthesisVoice): boolean {
  return voice.lang.toLowerCase().startsWith("en");
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;
  if (lang === "en-us") score += 40;
  else if (lang === "en-gb") score += 34;
  else if (lang.startsWith("en")) score += 20;
  if (/natural|neural|premium|enhanced/.test(name)) score += 30;
  if (/google us english|google uk english/.test(name)) score += 24;
  if (/microsoft .*online|microsoft aria|microsoft jenny|microsoft guy|microsoft libby|microsoft ryan/.test(name)) score += 24;
  if (/samantha|daniel|alex|karen|moira|tessa|fiona|ava|allison|siri/.test(name)) score += 14;
  if (/google/.test(name)) score += 10;
  if (/microsoft/.test(name)) score += 8;
  if (!voice.localService) score += 3;
  if (voice.default) score += 1;
  return score;
}

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter(isEnglish);
  if (english.length === 0) return null;
  return [...english].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function getWebVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  const synth = window.speechSynthesis;
  const current = synth.getVoices();
  if (current.length > 0) {
    cachedVoice = pickEnglishVoice(current);
    return current;
  }
  if (!voicesPromise) {
    voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        const voices = synth.getVoices();
        if (voices.length > 0) cachedVoice = pickEnglishVoice(voices);
        resolve(voices);
      };
      const previous = synth.onvoiceschanged;
      synth.onvoiceschanged = (event) => {
        previous?.call(synth, event);
        finish();
      };
      window.setTimeout(finish, timeoutMs);
    }).finally(() => {
      voicesPromise = null;
    });
  }
  return voicesPromise;
}

function setSpeaking(button: HTMLElement | null | undefined, speaking: boolean) {
  if (button) button.dataset.speaking = speaking ? "true" : "false";
}

async function speakNative(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (!isNativePlatform()) return false;

  try {
    const { TextToSpeech } = await import("@capacitor-community/text-to-speech");

    let lang = "en-US";
    let voice: number | undefined;
    try {
      const supported = await TextToSpeech.getSupportedVoices();
      const voices = Array.isArray((supported as any)?.voices) ? (supported as any).voices : [];
      const pick =
        (voices as Array<{ lang?: string; voiceURI?: string; name?: string; index?: number }>).find(
          (v) => (v.lang ?? "").toLowerCase() === "en-us",
        ) ??
        (voices as Array<{ lang?: string; voiceURI?: string; name?: string; index?: number }>).find(
          (v) => (v.lang ?? "").toLowerCase().startsWith("en"),
        );
      if (pick?.lang) lang = pick.lang;
      if (typeof pick?.index === "number") voice = pick.index;
    } catch {}

    await TextToSpeech.stop().catch(() => undefined);
    const options = {
      text,
      lang,
      rate: getSpeechRate(),
      pitch: 1,
      volume: 1,
      ...(typeof voice === "number" ? { voice } : {}),
      queueStrategy: 0,
    } as any;

    try {
      await TextToSpeech.speak(options);
      return true;
    } catch {
      await wait(350);
      await TextToSpeech.speak(options);
      return true;
    }
  } catch {
    return false;
  } finally {
    setSpeaking(button, false);
  }
}

function speakWeb(text: string, button?: HTMLElement | null): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    emitToast(
      "Este navegador no tiene síntesis de voz. Prueba en Chrome/Edge o usa la app Android.",
      "error",
    );
    setSpeaking(button, false);
    return Promise.resolve();
  }

  const synth = window.speechSynthesis;

  // Ensure voices are loaded (some browsers expose them asynchronously)
  let voices = synth.getVoices();
  if (!cachedVoice) cachedVoice = pickEnglishVoice(voices);
  if (voices.length === 0) {
    void getWebVoices(2000);
  }

  return new Promise<void>((resolve) => {
    let finished = false;
    let started = false;
    let attempts = 0;

    const finish = (notifyError = false) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeoutId);
      setSpeaking(button, false);
      if (notifyError) {
        emitToast("No se pudo reproducir la voz del sistema.", "error");
      }
      resolve();
    };

    const doSpeak = () => {
      if (finished) return;
      attempts += 1;

      try {
        // Safely clear the previous queue
        synth.cancel();
      } catch {}

      const u = new SpeechSynthesisUtterance(text);
      // Refresh voice selection in case voices have loaded
      const currentVoices = synth.getVoices();
      if (!cachedVoice || currentVoices.length) {
        cachedVoice = pickEnglishVoice(currentVoices) ?? cachedVoice;
      }
      const voice = cachedVoice;
      u.lang = voice?.lang || "en-US";
      u.rate = getSpeechRate();
      u.pitch = 1;
      u.volume = 1;
      if (voice) u.voice = voice;

      u.onstart = () => {
        started = true;
        setSpeaking(button, true);
      };
      u.onend = () => finish(false);
      u.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") {
          finish(false);
          return;
        }
        // Retry once if it failed before starting (common voices/cancel case in Chrome)
        if (!started && attempts < 2) {
          window.setTimeout(doSpeak, 150);
          return;
        }
        finish(!started);
      };

      try {
        // Small delay after cancel() improves reliability in Chrome/WebView
        window.setTimeout(() => {
          if (finished) return;
          try {
            synth.speak(u);
            if (synth.paused) synth.resume();
          } catch {
            if (!started && attempts < 2) window.setTimeout(doSpeak, 150);
            else finish(true);
          }
        }, 60);
      } catch {
        if (!started && attempts < 2) window.setTimeout(doSpeak, 150);
        else finish(true);
      }
    };

    // Reasonable maximum time based on text length
    const timeoutId = window.setTimeout(() => {
      if (!started && attempts < 2) {
        doSpeak();
        return;
      }
      finish(false);
    }, Math.max(8000, text.length * 120 + 2000));

    doSpeak();
  });
}

export function speak(text: string, button?: HTMLElement | null) {
  if (typeof window === "undefined" || !text.trim() || !isSpeechEnabled()) return;

  const clean = text.replace(/\s+/g, " ").trim();
  setSpeaking(button, true);
  stopSpeech(); // stop previous (clears speaking state; we'll set it again)

  const engine = getSpeechEngine();
  if (engine === "kokoro" && kokoroTTS && kokoroStatus.state === "ready") {
    void speakKokoro(clean, button).then((handled) => {
      if (!handled) {
        // Fallback
        if (isNativePlatform()) {
          void speakNative(clean, button).then((ok) => {
            if (!ok) setSpeaking(button, false);
          });
        } else {
          void speakWeb(clean, button).catch(() => setSpeaking(button, false));
        }
      }
    });
    return;
  }

  if (engine === "kokoro" && kokoroStatus.state === "loading") {
    // Load in progress: use system voice without interrupting the user
    console.info("Kokoro loading; using system voice fallback for now.");
  }

  if (isNativePlatform()) {
    void speakNative(clean, button).then((handled) => {
      if (!handled) {
        setSpeaking(button, false);
        emitToast("No se pudo reproducir la voz.", "error");
      }
    });
    return;
  }

  void speakWeb(clean, button).catch(() => {
    setSpeaking(button, false);
    emitToast("No se pudo reproducir la voz. Inténtalo de nuevo.", "error");
  });
}

export function kokoroIsCached(): boolean {
  return isKokoroMarkedCached();
}

// --- Speech recognition (speaking practice) ---
export type SpeechRecognitionResult = {
  transcript: string;
  confidence: number;
  supported: boolean;
  error?: string;
};

function getSpeechRecognitionCtor(): any | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognitionCtor());
}

export function recognizeOnce(lang = "en-US", timeoutMs = 7000): Promise<SpeechRecognitionResult> {
  if (typeof window === "undefined") {
    return Promise.resolve({ transcript: "", confidence: 0, supported: false, error: "no-window" });
  }
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    return Promise.resolve({
      transcript: "",
      confidence: 0,
      supported: false,
      error: "El reconocimiento de voz no está disponible en este navegador/dispositivo.",
    });
  }
  return new Promise((resolve) => {
    let done = false;
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    const timer = window.setTimeout(() => finish("", 0, "Tiempo de espera agotado. Intenta de nuevo."), timeoutMs);
    function finish(transcript: string, confidence: number, error?: string) {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      try { rec.onresult = null; rec.onerror = null; rec.onend = null; rec.stop(); } catch {}
      resolve({ transcript, confidence, supported: true, error });
    }
    rec.onresult = (event: any) => {
      try {
        const results = event?.results?.[0];
        if (!results) return finish("", 0, "No se detectó voz.");
        let best = { transcript: "", confidence: 0 };
        for (let i = 0; i < results.length; i++) {
          const alt = results[i];
          if ((alt?.confidence ?? 0) >= best.confidence) {
            best = { transcript: String(alt?.transcript ?? "").trim(), confidence: Number(alt?.confidence ?? 0) };
          }
        }
        finish(best.transcript, best.confidence);
      } catch {
        finish("", 0, "No se pudo procesar el audio.");
      }
    };
    rec.onerror = (event: any) => {
      const code = event?.error || "error";
      const msg =
        code === "not-allowed" || code === "service-not-allowed"
          ? "Permiso de micrófono denegado."
          : code === "no-speech"
            ? "No se detectó voz. Intenta más cerca del micrófono."
            : "No se pudo usar el micrófono.";
      finish("", 0, msg);
    };
    rec.onend = () => {
      if (!done) finish("", 0, "No se detectó voz.");
    };
    try {
      rec.start();
    } catch {
      finish("", 0, "No se pudo iniciar el micrófono.");
    }
  });
}

export function speechMatchScore(expected: string, heard: string): number {
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  const a = norm(expected).split(" ").filter(Boolean);
  const b = norm(heard).split(" ").filter(Boolean);
  if (a.length === 0) return 0;
  const setB = new Set(b);
  let hit = 0;
  for (const w of a) if (setB.has(w)) hit++;
  return hit / a.length;
}

export function maybeAutoLoadKokoro() {
  if (typeof window === "undefined") return;
  if (kokoroAutoInitStarted) return;
  if (kokoroTTS || kokoroPromise || kokoroStatus.state === "loading") return;
  const engine = getSpeechEngine();
  if (engine !== "kokoro" || !isKokoroMarkedCached()) return;
  kokoroAutoInitStarted = true;
  // Load from browser cache in the background without blocking the UI
  void loadKokoro().catch((e) => console.warn("Kokoro auto-load failed", e));
}

export function initVoices() {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) void getWebVoices();
  // If already downloaded, restore it without requesting download again
  setTimeout(() => {
    try {
      maybeAutoLoadKokoro();
    } catch {}
  }, 0);
}
