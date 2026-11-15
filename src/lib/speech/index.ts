import { emitToast } from "../toast";
import { primeWebVoices, speakNative, speakWeb, stopNativeSpeech } from "./browser";
import {
  canAutoLoadKokoroInBackground,
  getKokoroStatus,
  isKokoroLoading,
  isKokoroReady,
  kokoroIsCached,
  loadKokoro,
  markKokoroAutoInitStarted,
  maybeWarmKokoroInBackground,
  speakWithKokoro,
  stopKokoroPlayback,
  subscribeKokoroStatus,
} from "./kokoro";
import {
  getSpeechEngine,
  isNativePlatform,
  isSpeechEnabled,
  normalizeSpeechText,
} from "./platform";
import { clearAllSpeakLoading, setSpeakLoading, setSpeaking } from "./ui";

export type { KokoroStatus, SpeechRecognitionResult } from "./types";
export { getSpeechRate, isSpeechEnabled } from "./platform";
export { ensureMicrophonePermission, isSpeechRecognitionSupported, recognizeOnce } from "./recognition";
export { speechMatchScore } from "./match";
export { getKokoroStatus, kokoroIsCached, loadKokoro, subscribeKokoroStatus };

const KOKORO_AUTOLOAD_IDLE_TIMEOUT_MS = 6_000;
const KOKORO_AUTOLOAD_FALLBACK_DELAY_MS = 2_500;
const VOICES_INIT_AUTOLOAD_DELAY_MS = 1_200;

function canUseWebSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function requestIdleOrTimeout(callback: () => void, timeoutMs: number, fallbackDelayMs: number): void {
  if (typeof window === "undefined") return;

  const requestIdle = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void;
    }
  ).requestIdleCallback;

  if (typeof requestIdle === "function") {
    requestIdle(callback, { timeout: timeoutMs });
    return;
  }

  setTimeout(callback, fallbackDelayMs);
}

function notifySpeechUnavailableAfterBrowserFailure(): void {
  emitToast(
    kokoroIsCached()
      ? "The browser voice failed. Load or use the HQ voice (Kokoro) in Settings."
      : "The browser voice is unavailable (common in Brave). Download and use the HQ voice (Kokoro) in Settings → Pronunciation.",
    "error",
  );
}

export function warmSpeechEngine(): void {
  if (typeof window === "undefined") return;

  try {
    if (isSpeechEnabled() && canUseWebSpeech()) {
      primeWebVoices();
    }

    // Warm Kokoro in background when selected/cached so first playback starts faster.
    if (getSpeechEngine() === "kokoro" && kokoroIsCached() && !isKokoroReady() && !isKokoroLoading()) {
      maybeWarmKokoroInBackground();
    }
  } catch {
    // Warmup is best-effort and must never break user interaction.
  }
}

export function stopSpeech(): void {
  if (typeof window === "undefined") return;

  stopKokoroPlayback();

  try {
    window.speechSynthesis?.cancel();
  } catch {
    // Ignore browser synthesis shutdown errors.
  }

  clearAllSpeakLoading();

  if (isNativePlatform()) {
    void stopNativeSpeech();
  }
}

export function maybeAutoLoadKokoro(): void {
  if (typeof window === "undefined") return;
  if (!canAutoLoadKokoroInBackground()) return;

  // Only preload when the user explicitly selected Kokoro as engine.
  // Background preloading (even if cached) can be CPU/memory heavy on mobile/WebView.
  if (getSpeechEngine() !== "kokoro") return;

  markKokoroAutoInitStarted();

  const start = () => {
    void loadKokoro().catch((error) => console.warn("Kokoro auto-load failed", error));
  };

  requestIdleOrTimeout(start, KOKORO_AUTOLOAD_IDLE_TIMEOUT_MS, KOKORO_AUTOLOAD_FALLBACK_DELAY_MS);
}

export function initVoices(): void {
  if (typeof window === "undefined") return;

  if (canUseWebSpeech()) {
    primeWebVoices();
  }

  // If HQ engine is selected and cached, preload later in a non-blocking way.
  setTimeout(() => {
    try {
      maybeAutoLoadKokoro();
    } catch {
      // Ignore background preload failures during init.
    }
  }, VOICES_INIT_AUTOLOAD_DELAY_MS);
}

async function tryKokoroPlayback(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (!isKokoroReady()) return false;

  setSpeakLoading(button, true);
  setSpeaking(button, true);

  const handled = await speakWithKokoro(text, button).catch(() => false);
  if (!handled) {
    setSpeakLoading(button, false);
  }

  return handled;
}

async function playWithSystemVoice(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (isNativePlatform()) {
    return speakNative(text, button);
  }

  const webHandled = await speakWeb(text, button);
  if (webHandled) return true;

  // Browser voice failed (e.g. Brave without voices): try ready Kokoro as fallback.
  return tryKokoroPlayback(text, button);
}

async function playSpeech(text: string, button?: HTMLElement | null): Promise<void> {
  const engine = getSpeechEngine();

  if (engine === "kokoro") {
    if (isKokoroReady()) {
      const handledByKokoro = await speakWithKokoro(text, button).catch(() => false);
      if (handledByKokoro) return;

      const handledBySystem = await playWithSystemVoice(text, button).catch(() => false);
      if (!handledBySystem) {
        setSpeaking(button, false);
        emitToast("Could not play the system voice or the HQ voice.", "error");
      }
      return;
    }

    if (isKokoroLoading()) {
      console.info("Kokoro loading; using system voice fallback for now.");
    }
  }

  if (isNativePlatform()) {
    const handled = await speakNative(text, button).catch(() => false);
    if (!handled) {
      setSpeaking(button, false);
      emitToast("Could not play the native voice.", "error");
    }
    return;
  }

  const webHandled = await speakWeb(text, button).catch(() => false);
  if (webHandled) return;

  const handledByKokoroFallback = await tryKokoroPlayback(text, button);
  if (handledByKokoroFallback) return;

  setSpeaking(button, false);
  notifySpeechUnavailableAfterBrowserFailure();
}

export function speak(text: string, button?: HTMLElement | null): void {
  if (typeof window === "undefined") return;

  const cleanText = normalizeSpeechText(text);
  if (!cleanText || !isSpeechEnabled()) return;

  // Immediate visual feedback while engine/voices/audio warm up.
  setSpeakLoading(button, true);
  setSpeaking(button, false);
  stopSpeech(); // Stop previous playback (clears speaking/loading state; we'll set it again).
  setSpeakLoading(button, true);
  warmSpeechEngine();

  const clearLoading = () => setSpeakLoading(button, false);

  void playSpeech(cleanText, button)
    .catch(() => {
      setSpeaking(button, false);
      emitToast("Could not play audio. Try the HQ voice (Kokoro) in Settings.", "error");
    })
    .finally(clearLoading);
}
