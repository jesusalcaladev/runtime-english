export type SpeechEngine = "system" | "kokoro";

export type SpeechSettings = {
  ttsEnabled?: boolean;
  ttsRate?: number;
  ttsEngine?: SpeechEngine;
};

export type KokoroStatus = {
  state: "idle" | "loading" | "ready" | "error";
  progress: number; // 0-100 aggregate best-effort
  message: string;
  device: "webgpu" | "wasm" | null;
  error?: string;
};

export type SpeechRecognitionResult = {
  transcript: string;
  confidence: number;
  supported: boolean;
  error?: string;
};
