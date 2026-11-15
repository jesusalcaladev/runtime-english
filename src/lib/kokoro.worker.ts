/// <reference lib="webworker" />

type LoadMsg = { type: "load"; device: "webgpu" | "wasm"; preferLowMemory?: boolean };
type GenerateMsg = { type: "generate"; id: number; text: string; speed: number };
type Msg = LoadMsg | GenerateMsg;

type WorkerOutMsg =
  | { type: "progress"; info: unknown }
  | { type: "status"; message: string }
  | { type: "ready"; device: "webgpu" | "wasm" }
  | { type: "error"; error: string }
  | { type: "audio"; id: number; buffer: ArrayBuffer; mime: string; device: "webgpu" | "wasm" | null }
  | { type: "gen-error"; id: number; error: string };

interface KokoroAudioResult {
  toBlob?: () => Blob;
  toWav?: () => ArrayBuffer | ArrayBufferView;
}

interface KokoroTtsInstance {
  generate: (text: string, options: { voice: string; speed: number }) => Promise<KokoroAudioResult>;
}

interface KokoroTtsStatic {
  from_pretrained: (
    modelId: string,
    options: {
      dtype: "fp32" | "q8";
      device: "webgpu" | "wasm";
      progress_callback?: (info: unknown) => void;
    },
  ) => Promise<KokoroTtsInstance>;
}

interface TransformersWasmBackend {
  numThreads?: number;
  simd?: boolean;
}

interface TransformersEnv {
  allowRemoteModels?: boolean;
  backends?: {
    onnx?: {
      wasm?: TransformersWasmBackend;
    };
  };
}

const workerScope = self as unknown as DedicatedWorkerGlobalScope;

let tts: KokoroTtsInstance | null = null;
let loadPromise: Promise<void> | null = null;
let loadedDevice: "webgpu" | "wasm" | null = null;

function postWorkerMessage(message: WorkerOutMsg, transfer?: Transferable[]): void {
  if (transfer) {
    workerScope.postMessage(message, transfer);
    return;
  }
  workerScope.postMessage(message);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

async function ensureLoaded(device: "webgpu" | "wasm", preferLowMemory = false): Promise<void> {
  if (tts) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      try {
        const transformers = await import("@huggingface/transformers");
        const env = (transformers as { env?: TransformersEnv }).env;
        const wasm = env?.backends?.onnx?.wasm;

        if (wasm) {
          // Keep CPU/memory pressure low, especially on mobile.
          wasm.numThreads = 1;
          try {
            const hardwareConcurrency = workerScope.navigator?.hardwareConcurrency;
            if (typeof hardwareConcurrency === "number" && hardwareConcurrency <= 4) {
              wasm.simd = true;
            }
          } catch {
            // Ignore hardware probing failures.
          }
        }

        if (env?.allowRemoteModels === false) {
          env.allowRemoteModels = true;
        }
      } catch {
        // Ignore optional transformers env tuning failures.
      }

      let KokoroTTS: KokoroTtsStatic;
      try {
        ({ KokoroTTS } = (await import("kokoro-js")) as { KokoroTTS: KokoroTtsStatic });
      } catch {
        await new Promise<void>((resolve) => setTimeout(resolve, 250));
        ({ KokoroTTS } = (await import("kokoro-js")) as { KokoroTTS: KokoroTtsStatic });
      }

      const modelId = "onnx-community/Kokoro-82M-v1.0-ONNX";
      const requestedDevice = preferLowMemory ? "wasm" : device;
      const dtype = requestedDevice === "webgpu" ? "fp32" : "q8";

      const progressCallback = (info: unknown): void => {
        try {
          postWorkerMessage({ type: "progress", info });
        } catch {
          // Ignore progress posting failures.
        }
      };

      try {
        tts = await KokoroTTS.from_pretrained(modelId, {
          dtype,
          device: requestedDevice,
          progress_callback: progressCallback,
        });
        loadedDevice = requestedDevice;
        postWorkerMessage({ type: "ready", device: requestedDevice });
      } catch (error) {
        if (requestedDevice === "webgpu") {
          postWorkerMessage({
            type: "status",
            message: "WebGPU no disponible o inestable, usando WASM (q8)…",
          });
          tts = await KokoroTTS.from_pretrained(modelId, {
            dtype: "q8",
            device: "wasm",
            progress_callback: progressCallback,
          });
          loadedDevice = "wasm";
          postWorkerMessage({ type: "ready", device: "wasm" });
        } else {
          throw error;
        }
      }
    } catch (error) {
      tts = null;
      loadedDevice = null;
      postWorkerMessage({ type: "error", error: getErrorMessage(error, "load error") });
      throw error;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

function toArrayBuffer(value: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (value instanceof ArrayBuffer) return value;
  const copy = new Uint8Array(value.byteLength);
  copy.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
  return copy.buffer;
}

workerScope.onmessage = async (event: MessageEvent<Msg>) => {
  const message = event.data;
  if (!message) return;

  if (message.type === "load") {
    try {
      await ensureLoaded(message.device, Boolean(message.preferLowMemory));
    } catch {
      // Load errors are reported through worker messages.
    }
    return;
  }

  if (message.type === "generate") {
    try {
      if (!tts) throw new Error("TTS not ready");

      // Short texts are cheaper/faster on mobile and reduce generation stalls.
      const text = message.text.trim();
      if (!text) throw new Error("Empty text");

      const audio = await tts.generate(text, { voice: "af_heart", speed: message.speed });
      let buffer: ArrayBuffer;
      let mime = "audio/wav";

      if (typeof audio.toBlob === "function") {
        const blob = audio.toBlob();
        mime = blob.type || "audio/wav";
        buffer = await blob.arrayBuffer();
      } else if (typeof audio.toWav === "function") {
        buffer = toArrayBuffer(audio.toWav());
        mime = "audio/wav";
      } else {
        throw new Error("Unsupported audio output");
      }

      postWorkerMessage(
        { type: "audio", id: message.id, buffer, mime, device: loadedDevice },
        [buffer],
      );
    } catch (error) {
      postWorkerMessage({
        type: "gen-error",
        id: message.id,
        error: getErrorMessage(error, "generate error"),
      });
    }
  }
};
