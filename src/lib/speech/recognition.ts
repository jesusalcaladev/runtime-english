import { emitToast } from "../toast";
import { isNativePlatform } from "./platform";
import type { SpeechRecognitionResult } from "./types";

interface SpeechRecognitionAlternativeLike {
  transcript?: string;
  confidence?: number;
}

interface SpeechRecognitionResultLike {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike | undefined;
}

interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike | undefined;
}

interface SpeechRecognitionEventLike {
  results?: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike {
  error?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface CapacitorPermissionsLike {
  query?: (options: { name: string }) => Promise<unknown>;
}

interface CapacitorLike {
  Permissions?: CapacitorPermissionsLike;
}

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;

  const speechWindow = window as SpeechRecognitionWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function getErrorName(error: unknown): string {
  if (typeof error === "object" && error !== null && "name" in error) {
    const name = (error as { name?: unknown }).name;
    return typeof name === "string" ? name : "";
  }
  return "";
}

function getBestTranscript(result: SpeechRecognitionResultLike | undefined): { transcript: string; confidence: number } {
  if (!result) {
    return { transcript: "", confidence: 0 };
  }

  let bestTranscript = "";
  let bestConfidence = 0;

  for (let index = 0; index < result.length; index += 1) {
    const alternative = result[index];
    const transcript = typeof alternative?.transcript === "string" ? alternative.transcript.trim() : "";
    const confidence = typeof alternative?.confidence === "number" ? alternative.confidence : 0;

    if (confidence >= bestConfidence) {
      bestTranscript = transcript;
      bestConfidence = confidence;
    }
  }

  return { transcript: bestTranscript, confidence: bestConfidence };
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export async function ensureMicrophonePermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (isNativePlatform()) {
    try {
      const { Capacitor } = await import("@capacitor/core");
      const permissions = (Capacitor as CapacitorLike).Permissions;
      if (typeof permissions?.query === "function") {
        // Best-effort touchpoint; actual prompt happens via getUserMedia/Web Speech + manifest permissions.
        void permissions.query({ name: "microphone" }).catch(() => undefined);
      }
    } catch {
      // Ignore optional Capacitor permission probing failures.
    }
  }

  try {
    const stream = await navigator.mediaDevices?.getUserMedia?.({ audio: true });
    if (stream) {
      try {
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        // Ignore track cleanup failures.
      }
      return true;
    }
  } catch (error) {
    const name = getErrorName(error);
    if (name === "NotAllowedError" || name === "SecurityError") {
      emitToast(
        isNativePlatform()
          ? "Microphone permission denied. Enable it in app settings to use voice practice."
          : "Microphone permission denied. Allow it in your browser settings to use voice practice.",
        "error",
      );
    } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      emitToast("No microphone was found on this device.", "error");
    }
    return false;
  }

  return false;
}

export function recognizeOnce(lang = "en-US", timeoutMs = 7_000): Promise<SpeechRecognitionResult> {
  if (typeof window === "undefined") {
    return Promise.resolve({ transcript: "", confidence: 0, supported: false, error: "no-window" });
  }

  const SpeechRecognition = getSpeechRecognitionCtor();
  if (!SpeechRecognition) {
    return Promise.resolve({
      transcript: "",
      confidence: 0,
      supported: false,
      error: "Speech recognition is not available in this browser/device.",
    });
  }

  return new Promise((resolve) => {
    let isSettled = false;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    const timeoutId = window.setTimeout(() => {
      finish("", 0, "Timed out. Please try again.");
    }, timeoutMs);

    const finish = (transcript: string, confidence: number, error?: string) => {
      if (isSettled) return;
      isSettled = true;
      window.clearTimeout(timeoutId);

      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
      } catch {
        // Ignore recognition shutdown errors.
      }

      resolve({ transcript, confidence, supported: true, error });
    };

    recognition.onresult = (event) => {
      try {
        const bestResult = event.results?.[0];
        if (!bestResult) {
          finish("", 0, "No speech was detected.");
          return;
        }

        const { transcript, confidence } = getBestTranscript(bestResult);
        finish(transcript, confidence);
      } catch {
        finish("", 0, "Could not process the audio.");
      }
    };

    recognition.onerror = (event) => {
      const code = event.error ?? "error";
      const message =
        code === "not-allowed" || code === "service-not-allowed"
          ? "Microphone permission denied."
          : code === "no-speech"
            ? "No speech was detected. Try speaking closer to the microphone."
            : "Could not access the microphone.";

      finish("", 0, message);
    };

    recognition.onend = () => {
      if (!isSettled) {
        finish("", 0, "No speech was detected.");
      }
    };

    try {
      recognition.start();
    } catch {
      finish("", 0, "Could not start the microphone.");
    }
  });
}
