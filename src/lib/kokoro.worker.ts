/// <reference lib="webworker" />

type LoadMsg = { type: "load"; device: "webgpu" | "wasm" };
type GenerateMsg = { type: "generate"; id: number; text: string; speed: number };
type Msg = LoadMsg | GenerateMsg;

let tts: any = null;
let loadPromise: Promise<void> | null = null;

async function ensureLoaded(device: "webgpu" | "wasm") {
  if (tts) return;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      try {
        const { env } = await import("@huggingface/transformers");
        const wasm = (env as any)?.backends?.onnx?.wasm;
        if (wasm) wasm.numThreads = 1;
        if ((env as any).allowRemoteModels === false) (env as any).allowRemoteModels = true;
      } catch {}

      let KokoroTTS: any;
      try {
        ({ KokoroTTS } = await import("kokoro-js"));
      } catch (e) {
        await new Promise((r) => setTimeout(r, 250));
        ({ KokoroTTS } = await import("kokoro-js"));
      }

      const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";
      const dtype = device === "webgpu" ? "fp32" : "q8";

      const progress_callback = (info: any) => {
        try {
          (self as any).postMessage({ type: "progress", info });
        } catch {}
      };

      try {
        tts = await KokoroTTS.from_pretrained(model_id, {
          dtype,
          device,
          progress_callback,
        } as any);
        (self as any).postMessage({ type: "ready", device });
      } catch (e) {
        if (device === "webgpu") {
          (self as any).postMessage({ type: "status", message: "WebGPU no disponible, usando WASM…" });
          tts = await KokoroTTS.from_pretrained(model_id, {
            dtype: "q8",
            device: "wasm",
            progress_callback,
          } as any);
          (self as any).postMessage({ type: "ready", device: "wasm" });
        } else {
          throw e;
        }
      }
    } catch (err: any) {
      const message = err?.message || String(err || "load error");
      (self as any).postMessage({ type: "error", error: message });
      throw err;
    } finally {
      loadPromise = null;
    }
  })();
  return loadPromise;
}

self.onmessage = async (ev: MessageEvent<Msg>) => {
  const msg = ev.data;
  if (!msg) return;
  if (msg.type === "load") {
    try {
      await ensureLoaded(msg.device);
    } catch {}
    return;
  }
  if (msg.type === "generate") {
    try {
      if (!tts) throw new Error("TTS not ready");
      const audio = await tts.generate(msg.text, { voice: "af_heart", speed: msg.speed });
      let buffer: ArrayBuffer;
      let mime = "audio/wav";
      if (audio && typeof audio.toBlob === "function") {
        const blob: Blob = audio.toBlob();
        mime = blob.type || "audio/wav";
        buffer = await blob.arrayBuffer();
      } else if (audio && typeof audio.toWav === "function") {
        const wav = audio.toWav();
        buffer = wav instanceof ArrayBuffer ? wav : wav.buffer ? wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength) : new Uint8Array(wav).buffer;
        mime = "audio/wav";
      } else {
        throw new Error("Unsupported audio output");
      }
      (self as any).postMessage({ type: "audio", id: msg.id, buffer, mime }, [buffer]);
    } catch (err: any) {
      (self as any).postMessage({ type: "gen-error", id: msg.id, error: err?.message || String(err || "generate error") });
    }
  }
};
