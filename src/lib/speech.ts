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
    const keys = ["runtimeenglish_v3","runtimeenglish_v2","devlingo_v3","devlingo_v2","deveng_core_v2"];
    let parsed: any = null;
    for (const k of keys) {
      const raw = window.localStorage.getItem(k);
      if (!raw) continue;
      try { parsed = JSON.parse(raw); break; } catch {}
    }
    if (!parsed) return null;
    const state = parsed?.state && typeof parsed.state === "object" ? parsed.state : parsed;
    return state?.settings ?? null;
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

const KOKORO_CACHED_KEY = "runtimeenglish_kokoro_cached_v1";

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

let kokoroWorker: Worker | null = null;
let kokoroPromise: Promise<boolean> | null = null;
let kokoroReady = false;
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
let kokoroGenSeq = 0;
const kokoroPendingGen = new Map<number, { resolve: (v: { buffer: ArrayBuffer; mime: string }) => void; reject: (e: any) => void }>();

function getKokoroCacheKey(text: string, speed: number): string {
  return `${speed}|af_heart|${text}`;
}

function cacheKokoroAudio(key: string, url: string) {
  const prev = kokoroAudioCache.get(key);
  if (prev && prev !== url) {
    try { URL.revokeObjectURL(prev); } catch {}
  }
  kokoroAudioCache.set(key, url);
  while (kokoroAudioCache.size > 12) {
    const oldest = kokoroAudioCache.keys().next().value as string | undefined;
    if (!oldest) break;
    const oldUrl = kokoroAudioCache.get(oldest);
    kokoroAudioCache.delete(oldest);
    if (oldUrl) { try { URL.revokeObjectURL(oldUrl); } catch {} }
  }
}

function emitKokoroStatus(patch: Partial<KokoroStatus>) {
  kokoroStatus = { ...kokoroStatus, ...patch };
  for (const fn of kokoroListeners) {
    try { fn(kokoroStatus); } catch {}
  }
}

export function getKokoroStatus(): KokoroStatus {
  return kokoroStatus;
}

export function subscribeKokoroStatus(listener: (s: KokoroStatus) => void): () => void {
  kokoroListeners.add(listener);
  try { listener(kokoroStatus); } catch {}
  return () => kokoroListeners.delete(listener);
}

function stopKokoroPlayback() {
  try { kokoroAbort?.abort(); } catch {}
  kokoroAbort = null;
  // Reject pending generations so callers can fall back/stop waiting
  for (const [, p] of kokoroPendingGen) {
    try { p.reject(new Error("aborted")); } catch {}
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

function ensureKokoroWorker(): Worker {
  if (kokoroWorker) return kokoroWorker;
  const w = new Worker(new URL("./kokoro.worker.ts", import.meta.url), { type: "module" });
  kokoroWorker = w;
  // Progress aggregation state (main thread)
  let targetProgress = 0;
  let displayedProgress = 0;
  let progressAnim: ReturnType<typeof setInterval> | null = null;
  let stallTimer: ReturnType<typeof setTimeout> | null = null;
  let settled = false;
  const fileBytes: Record<string, { loaded: number; total: number }> = {};
  const STALL_MS = 30000;
  const FINALIZE_STALL_MS = 180000;
  const deviceRef = { current: "wasm" as "webgpu" | "wasm" };
  const cachedHint = isKokoroMarkedCached();

  const stopProgressAnim = () => { if (progressAnim) { clearInterval(progressAnim); progressAnim = null; } };
  const clearStall = () => { if (stallTimer) { clearTimeout(stallTimer); stallTimer = null; } };
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
        message: finalizing ? "La inicialización está tardando demasiado" : "La descarga parece detenida",
        device: deviceRef.current,
        error: finalizing
          ? "La descarga terminó pero el modelo no se pudo iniciar a tiempo. Vuelve a intentar (los archivos suelen quedar en caché)."
          : "No hubo progreso durante un rato. Revisa tu conexión y vuelve a intentar (lo descargado puede quedar en caché).",
      });
    }, ms);
  };
  const startProgressAnim = () => {
    if (progressAnim || settled) return;
    progressAnim = setInterval(() => {
      if (settled) { stopProgressAnim(); return; }
      if (displayedProgress >= targetProgress) { if (targetProgress >= 99) stopProgressAnim(); return; }
      const remaining = targetProgress - displayedProgress;
      const step = Math.max(0.25, remaining * 0.18);
      displayedProgress = Math.min(targetProgress, displayedProgress + step);
      const shown = Math.max(0, Math.min(99, Math.round(displayedProgress)));
      emitKokoroStatus({
        state: "loading",
        progress: shown,
        message: targetProgress >= 99 && shown >= 99
          ? "Inicializando modelo de voz (puede tardar unos segundos, no cierres la pestaña)…"
          : cachedHint ? `Cargando voz HQ desde caché… ${shown}%` : `Descargando voz HQ… ${shown}%`,
        device: deviceRef.current,
      });
    }, 120);
  };
  const updateAggregateProgress = (label?: string) => {
    if (settled) return;
    let loadedSum = 0, totalSum = 0;
    for (const f of Object.values(fileBytes)) {
      if (f.total > 0) { totalSum += f.total; loadedSum += Math.min(f.loaded, f.total); }
    }
    let overall = 0;
    if (totalSum > 0) overall = (loadedSum / totalSum) * 100;
    else {
      const values = Object.values(fileBytes).map((f) => (f.total > 0 ? (f.loaded / f.total) * 100 : 0));
      overall = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }
    const pct = Math.max(targetProgress, Math.min(99, overall));
    const progressed = pct > targetProgress;
    targetProgress = pct;
    if (label) {
      emitKokoroStatus({ state: "loading", progress: Math.max(0, Math.min(99, Math.round(displayedProgress))), message: label, device: deviceRef.current });
    } else if (!progressAnim && displayedProgress < targetProgress) {
      emitKokoroStatus({ state: "loading", progress: Math.max(0, Math.min(99, Math.round(displayedProgress))), message: `Descargando voz HQ… ${Math.max(0, Math.min(99, Math.round(displayedProgress)))}%`, device: deviceRef.current });
    }
    if (targetProgress > displayedProgress) startProgressAnim();
    if (progressed || label) bumpStall(targetProgress >= 95 ? FINALIZE_STALL_MS : STALL_MS);
  };

  // expose helpers for loadKokoro to init/reset state via closure? simpler: attach
  (w as any).__kokoroUi = { reset(device: "webgpu"|"wasm") {
      deviceRef.current = device; targetProgress = 0; displayedProgress = 0; settled = false;
      for (const k of Object.keys(fileBytes)) delete fileBytes[k];
      stopProgressAnim(); clearStall();
      emitKokoroStatus({ state: "loading", progress: 0, message: cachedHint ? "Cargando voz HQ desde caché…" : "Descargando modelo de voz HQ…", device, error: undefined });
      bumpStall();
    },
    settleReady(device: "webgpu"|"wasm") {
      if (settled) return; deviceRef.current = device; clearStall(); stopProgressAnim();
      settled = true; displayedProgress = 100; targetProgress = 100;
      kokoroReady = true; markKokoroCached(true);
      emitKokoroStatus({ state: "ready", progress: 100, message: "Voz HQ lista", device, error: undefined });
    },
    settleError(message: string) {
      if (settled) return; clearStall(); stopProgressAnim(); settled = true; kokoroReady = false;
      emitKokoroStatus({ state: "error", progress: Math.round(displayedProgress), message: "Error al cargar la voz HQ", device: deviceRef.current, error: message });
    },
    setStatusMessage(message: string) {
      if (settled) return; bumpStall(targetProgress >= 95 ? FINALIZE_STALL_MS : STALL_MS);
      emitKokoroStatus({ state: "loading", progress: Math.max(0, Math.min(99, Math.round(displayedProgress))), message, device: deviceRef.current });
    },
    handleProgress(info: any) {
      if (!info || settled) return; bumpStall();
      const file = info.file as string | undefined;
      if (info.status === "progress" && file) {
        const total = typeof info.total === "number" && Number.isFinite(info.total) && info.total > 0 ? info.total : (fileBytes[file]?.total ?? 0);
        let loaded = typeof info.loaded === "number" && Number.isFinite(info.loaded) ? info.loaded : undefined;
        if (loaded == null && typeof info.progress === "number" && total > 0) {
          const ratio = info.progress > 1 ? info.progress / 100 : info.progress; loaded = ratio * total;
        }
        if (loaded == null) loaded = fileBytes[file]?.loaded ?? 0;
        const effectiveTotal = total > 0 ? total : Math.max(loaded, fileBytes[file]?.total ?? 1);
        fileBytes[file] = { loaded, total: effectiveTotal };
        updateAggregateProgress();
      } else if (info.status === "initiate") {
        if (file && !fileBytes[file]) fileBytes[file] = { loaded: 0, total: 0 };
        emitKokoroStatus({ state: "loading", progress: Math.max(0, Math.min(99, Math.round(displayedProgress))), message: "Preparando descarga de voz HQ…", device: deviceRef.current });
        bumpStall(targetProgress >= 95 ? FINALIZE_STALL_MS : STALL_MS);
      } else if (info.status === "download" || info.status === "done") {
        if (file && fileBytes[file] && fileBytes[file].total > 0) fileBytes[file].loaded = fileBytes[file].total;
        if (info.status === "done") updateAggregateProgress("Finalizando descarga…");
        if (targetProgress >= 95) bumpStall(FINALIZE_STALL_MS);
      } else if (info.status === "ready") {
        targetProgress = Math.max(targetProgress, 99);
        if (displayedProgress < 99) startProgressAnim();
        emitKokoroStatus({ state: "loading", progress: Math.max(0, Math.min(99, Math.round(displayedProgress))), message: "Inicializando modelo de voz (puede tardar unos segundos, no cierres la pestaña)…", device: deviceRef.current });
        bumpStall(FINALIZE_STALL_MS);
      }
    }
  };

  w.onmessage = (ev: MessageEvent<any>) => {
    const data = ev.data || {};
    const ui = (w as any).__kokoroUi;
    if (data.type === "progress") { ui.handleProgress(data.info); return; }
    if (data.type === "status") { ui.setStatusMessage(data.message || "Cargando…"); return; }
    if (data.type === "ready") { ui.settleReady(data.device || "wasm"); return; }
    if (data.type === "error") { ui.settleError(data.error || "Error"); return; }
    if (data.type === "audio") {
      const p = kokoroPendingGen.get(data.id);
      if (p) { kokoroPendingGen.delete(data.id); p.resolve({ buffer: data.buffer, mime: data.mime || "audio/wav" }); }
      return;
    }
    if (data.type === "gen-error") {
      const p = kokoroPendingGen.get(data.id);
      if (p) { kokoroPendingGen.delete(data.id); p.reject(new Error(data.error || "generate error")); }
      return;
    }
  };
  w.onerror = () => {
    const ui = (w as any).__kokoroUi;
    ui?.settleError?.("El worker de voz HQ falló.");
  };
  return w;
}

export async function loadKokoro(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (kokoroReady && kokoroStatus.state === "ready") return true;
  if (kokoroPromise) return kokoroPromise;

  kokoroPromise = (async () => {
    try {
      const device = await detectKokoroDevice();
      const w = ensureKokoroWorker();
      (w as any).__kokoroUi.reset(device);
      w.postMessage({ type: "load", device });
      // Wait until ready or error
      await new Promise<void>((resolve, reject) => {
        const off = subscribeKokoroStatus((st) => {
          if (st.state === "ready") { off(); resolve(); }
          else if (st.state === "error") { off(); reject(new Error(st.error || st.message)); }
        });
      });
      // Pre-generación de muestra: útil en escritorio, pero costosa en móvil/nativo.
      // Se omite en plataformas nativas para reducir picos de CPU/memoria tras la descarga.
      if (!isNativePlatform()) {
        try {
          const sample = "The server is running. Pull the latest changes before you push.";
          const speed = 1;
          const key = getKokoroCacheKey(sample, speed);
          if (!kokoroAudioCache.has(key) && kokoroReady) {
            const run = () => {
              void (async () => {
                try {
                  const { buffer, mime } = await kokoroGenerateInWorker(sample, speed);
                  const blob = new Blob([buffer], { type: mime || "audio/wav" });
                  const url = URL.createObjectURL(blob);
                  cacheKokoroAudio(key, url);
                } catch {}
              })();
            };
            const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: any) => void);
            if (typeof ric === "function") ric(run, { timeout: 8000 });
            else setTimeout(run, 5000);
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

function kokoroGenerateInWorker(text: string, speed: number): Promise<{ buffer: ArrayBuffer; mime: string }> {
  const w = ensureKokoroWorker();
  const id = ++kokoroGenSeq;
  return new Promise((resolve, reject) => {
    kokoroPendingGen.set(id, { resolve, reject });
    try {
      w.postMessage({ type: "generate", id, text, speed });
    } catch (e) {
      kokoroPendingGen.delete(id);
      reject(e);
    }
  });
}

function splitSpeechChunks(text: string, maxLen = 180): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];
  const parts = clean.split(/(?<=[.!?;:])\s+|\n+/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let cur = "";
  const pushCur = () => { if (cur.trim()) { chunks.push(cur.trim()); cur = ""; } };
  for (const part of (parts.length ? parts : [clean])) {
    if (part.length <= maxLen) {
      if (!cur) cur = part;
      else if ((cur + " " + part).length <= maxLen) cur += " " + part;
      else { pushCur(); cur = part; }
      continue;
    }
    pushCur();
    const words = part.split(/\s+/);
    let wcur = "";
    for (const w of words) {
      if (!wcur) wcur = w;
      else if ((wcur + " " + w).length <= maxLen) wcur += " " + w;
      else { chunks.push(wcur); wcur = w; }
    }
    if (wcur) chunks.push(wcur);
  }
  pushCur();
  return chunks.length ? chunks : [clean.slice(0, maxLen)];
}

async function playAudioUrl(url: string): Promise<void> {
  const el = new Audio(url);
  kokoroAudio = el;
  el.playbackRate = 1;
  await new Promise<void>((resolve, reject) => {
    el.onended = () => resolve();
    el.onerror = () => reject(new Error("audio playback error"));
    el.play().catch(reject);
  });
}

async function speakKokoro(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!kokoroReady || kokoroStatus.state !== "ready") return false;
  const abort = new AbortController();
  kokoroAbort = abort;
  kokoroSpeakingButton = button ?? null;
  try {
    const rate = getSpeechRate();
    const chunks = splitSpeechChunks(text);
    if (chunks.length === 0) return false;

    for (let i = 0; i < chunks.length; i++) {
      if (abort.signal.aborted) return true;
      const chunk = chunks[i];
      const cacheKey = getKokoroCacheKey(chunk, rate);
      let url = kokoroAudioCache.get(cacheKey) ?? null;

      if (!url) {
        if (abort.signal.aborted) return true;
        const { buffer, mime } = await kokoroGenerateInWorker(chunk, rate);
        if (abort.signal.aborted) return true;
        const blob = new Blob([buffer], { type: mime || "audio/wav" });
        url = URL.createObjectURL(blob);
        cacheKokoroAudio(cacheKey, url);
      }

      if (abort.signal.aborted) return true;
      if (kokoroAudio) {
        try { kokoroAudio.onended = null; kokoroAudio.onerror = null; kokoroAudio.pause(); kokoroAudio.src = ""; } catch {}
        kokoroAudio = null;
      }
      kokoroAbort = abort;
      kokoroSpeakingButton = button ?? null;
      kokoroAudioUrl = url;
      await playAudioUrl(url);
    }
    return true;
  } catch (err) {
    if ((err as any)?.name === "AbortError" || abort.signal.aborted) return true;
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

async function speakWeb(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    setSpeaking(button, false);
    return false;
  }

  const synth = window.speechSynthesis;

  // Some browsers (Chrome/Android WebView) load voices asynchronously.
  let voices = synth.getVoices();
  if (voices.length === 0) {
    voices = await getWebVoices(2500);
  }
  cachedVoice = pickEnglishVoice(voices.length ? voices : synth.getVoices()) ?? cachedVoice;

  return await new Promise<boolean>((resolve) => {
    let finished = false;
    let started = false;
    let attempts = 0;

    const finish = (ok: boolean) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeoutId);
      setSpeaking(button, false);
      resolve(ok);
    };

    const doSpeak = () => {
      if (finished) return;
      attempts += 1;

      try { synth.resume(); } catch {}
      try { synth.cancel(); } catch {}

      const u = new SpeechSynthesisUtterance(text);
      const currentVoices = synth.getVoices();
      if (currentVoices.length) cachedVoice = pickEnglishVoice(currentVoices) ?? cachedVoice;
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
      u.onend = () => finish(true);
      u.onerror = (e) => {
        const err = (e as any)?.error;
        if (err === "interrupted" || err === "canceled") {
          finish(true); // interruption is not a failure
          return;
        }
        if (!started && attempts < 3) {
          window.setTimeout(doSpeak, 180 * attempts);
          return;
        }
        finish(false);
      };

      window.setTimeout(() => {
        if (finished) return;
        try {
          synth.speak(u);
          try { synth.resume(); } catch {}
          // Chrome workaround: if it gets stuck pending, nudge once
          window.setTimeout(() => {
            try {
              if (!started && !finished && synth.pending && !synth.speaking) {
                synth.pause();
                synth.resume();
              }
            } catch {}
          }, 350);
        } catch {
          if (!started && attempts < 3) window.setTimeout(doSpeak, 180 * attempts);
          else finish(false);
        }
      }, 80);
    };

    const timeoutId = window.setTimeout(() => {
      if (!started && attempts < 3) {
        doSpeak();
        return;
      }
      finish(started);
    }, Math.max(10000, text.length * 140 + 3000));

    doSpeak();
  });
}

export function speak(text: string, button?: HTMLElement | null) {
  if (typeof window === "undefined" || !text.trim() || !isSpeechEnabled()) return;

  const clean = text.replace(/\s+/g, " ").trim();
  setSpeaking(button, true);
  stopSpeech(); // stop previous (clears speaking state; we'll set it again)

  const engine = getSpeechEngine();
  if (engine === "kokoro" && kokoroReady && kokoroStatus.state === "ready") {
    void speakKokoro(clean, button).then((handled) => {
      if (!handled) {
        if (isNativePlatform()) {
          void speakNative(clean, button).then((ok) => {
            if (!ok) setSpeaking(button, false);
          });
        } else {
          void speakWeb(clean, button).then((ok) => {
            if (!ok) {
              setSpeaking(button, false);
              emitToast("No se pudo reproducir la voz del sistema ni la voz HQ.", "error");
            }
          }).catch(() => setSpeaking(button, false));
        }
      }
    });
    return;
  }

  if (engine === "kokoro" && kokoroStatus.state === "loading") {
    console.info("Kokoro loading; using system voice fallback for now.");
  }

  if (isNativePlatform()) {
    void speakNative(clean, button).then((handled) => {
      if (!handled) {
        setSpeaking(button, false);
        emitToast("No se pudo reproducir la voz nativa.", "error");
      }
    });
    return;
  }

  void speakWeb(clean, button).then(async (ok) => {
    if (ok) return;
    // Fallback: si la voz del navegador falla (p.ej. Brave sin voces), usar Kokoro si ya está listo
    if (kokoroReady && kokoroStatus.state === "ready") {
      setSpeaking(button, true);
      const handled = await speakKokoro(clean, button).catch(() => false);
      if (handled) return;
    }
    setSpeaking(button, false);
    emitToast(
      kokoroIsCached()
        ? "La voz del navegador falló. Cargando/usa la voz HQ (Kokoro) en Ajustes."
        : "La voz del navegador no está disponible (común en Brave). Descarga y usa la voz HQ (Kokoro) en Ajustes → Pronunciación.",
      "error",
    );
  }).catch(() => {
    setSpeaking(button, false);
    emitToast("No se pudo reproducir la voz. Prueba la voz HQ (Kokoro) en Ajustes.", "error");
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
  if (kokoroReady || kokoroPromise || kokoroStatus.state === "loading") return;
  // Solo precargar cuando el usuario eligió explícitamente Kokoro como motor.
  // Precargar en segundo plano aunque esté en caché puede consumir mucha CPU/memoria
  // (especialmente en móviles/WebView) y volver lenta la app al iniciar.
  if (getSpeechEngine() !== "kokoro") return;
  if (!isKokoroMarkedCached()) return;
  // En plataformas nativas evita precarga agresiva al arranque; se cargará al usar Ajustes o al reproducir.
  if (isNativePlatform()) return;

  kokoroAutoInitStarted = true;
  const start = () => {
    void loadKokoro().catch((e) => console.warn("Kokoro auto-load failed", e));
  };
  const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: any) => void);
  if (typeof ric === "function") {
    ric(start, { timeout: 4000 });
  } else {
    setTimeout(start, 1500);
  }
}

export function initVoices() {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) void getWebVoices();
  // Si el motor HQ está seleccionado y ya está en caché, precargar de forma diferida y no bloqueante.
  setTimeout(() => {
    try {
      maybeAutoLoadKokoro();
    } catch {}
  }, 1200);
}
