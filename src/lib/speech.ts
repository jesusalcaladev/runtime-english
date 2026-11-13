import { emitToast } from "./toast";

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

function readStoredSettings(): { ttsEnabled?: boolean; ttsRate?: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("deveng_core_v2");
    return raw ? JSON.parse(raw)?.settings ?? null : null;
  } catch {
    return null;
  }
}

export function isSpeechEnabled(): boolean {
  const settings = readStoredSettings();
  return settings?.ttsEnabled !== false;
}

export function getSpeechRate(): number {
  const rate = readStoredSettings()?.ttsRate;
  return typeof rate === "number" && Number.isFinite(rate)
    ? Math.min(2, Math.max(0.5, rate))
    : 1;
}

function isEnglish(voice: SpeechSynthesisVoice): boolean {
  return voice.lang.toLowerCase().startsWith("en");
}

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    voices.find(
      (voice) =>
        voice.lang === "en-US" &&
        /Google|Natural|Microsoft|Samantha|Daniel|Alex/i.test(voice.name),
    ) ??
    voices.find((voice) => voice.lang === "en-US") ??
    voices.find(isEnglish) ??
    null
  );
}

function getWebVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }
  const synth = window.speechSynthesis;
  const current = synth.getVoices();
  if (current.length > 0) return Promise.resolve(current);
  if (voicesPromise) return voicesPromise;

  const pending = new Promise<SpeechSynthesisVoice[]>((resolve) => {
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
    window.setTimeout(finish, 1200);
  }).finally(() => {
    voicesPromise = null;
  });

  voicesPromise = pending;
  return pending;
}

function setSpeaking(button: HTMLElement | null | undefined, speaking: boolean) {
  if (button) button.dataset.speaking = speaking ? "true" : "false";
}

async function speakNative(text: string): Promise<boolean> {
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return false;

  const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
  await TextToSpeech.stop().catch(() => undefined);

  const { supported } = await TextToSpeech.isLanguageSupported({ lang: "en-US" }).catch(() => ({
    supported: true,
  }));
  if (!supported) {
    emitToast(
      "No hay una voz en inglés instalada. Instala una desde Ajustes de Android.",
      "error",
    );
    return true;
  }

  const options = {
    text,
    lang: "en-US",
    rate: getSpeechRate(),
    pitch: 1,
    volume: 1,
    queueStrategy: 0,
  };

  try {
    await TextToSpeech.speak(options);
  } catch {
    // The Android engine can still be initializing right after launch.
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    await TextToSpeech.speak(options);
  }
  return true;
}

async function speakWeb(text: string, button?: HTMLElement | null) {
  if (!("speechSynthesis" in window)) {
    emitToast("Este navegador no tiene síntesis de voz. En Android usa la app instalada.", "error");
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();
  if (synth.paused) synth.resume();

  // Speak immediately to preserve the user gesture; initVoices warms the cache.
  const voices = synth.getVoices();
  if (!cachedVoice) cachedVoice = pickEnglishVoice(voices);

  await new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = cachedVoice?.lang ?? "en-US";
    utterance.rate = getSpeechRate();
    utterance.pitch = 1;
    utterance.volume = 1;
    if (cachedVoice) utterance.voice = cachedVoice;

    const finish = () => {
      setSpeaking(button, false);
      resolve();
    };

    utterance.onend = finish;
    utterance.onerror = (event) => {
      if (event.error !== "interrupted" && event.error !== "canceled") {
        emitToast("No se pudo reproducir la voz. Revisa el volumen del dispositivo.", "error");
      }
      finish();
    };

    synth.speak(utterance);
    // Some WebViews report neither start nor end; avoid leaving the button stuck.
    window.setTimeout(() => {
      if (!synth.speaking && !synth.pending) finish();
    }, 1500);
  });
}

export function speak(text: string, button?: HTMLElement | null) {
  if (typeof window === "undefined" || !text.trim() || !isSpeechEnabled()) return;

  const clean = text.replace(/\s+/g, " ").trim();
  setSpeaking(button, true);

  void (async () => {
    try {
      const handledByNative = await speakNative(clean);
      if (handledByNative) {
        setSpeaking(button, false);
      } else {
        await speakWeb(clean, button);
      }
    } catch {
      setSpeaking(button, false);
      emitToast("No se pudo reproducir la voz. Inténtalo de nuevo.", "error");
    }
  })();
}

export function initVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  void getWebVoices();
}
