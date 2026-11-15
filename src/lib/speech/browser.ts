import { getSpeechRate, isNativePlatform, wait } from "./platform";
import { setSpeaking } from "./ui";

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

const LANG_SCORES: Record<string, number> = {
  "en-us": 40,
  "en-gb": 34,
};

const NAME_RULES: ReadonlyArray<readonly [RegExp, number]> = [
  [/\b(?:natural|neural|premium|enhanced)\b/, 30],
  [/google (?:us|uk) english/, 24],
  [/microsoft (?:.*online|aria|jenny|guy|libby|ryan)\b/, 24],
  [/\b(?:samantha|daniel|alex|karen|moira|tessa|fiona|ava|allison|siri)\b/, 14],
  [/\bgoogle\b/, 10],
  [/\bmicrosoft\b/, 8],
];

function isEnglishVoice(voice: SpeechSynthesisVoice): boolean {
  return voice.lang.toLowerCase().startsWith("en");
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();

  let score = LANG_SCORES[lang] ?? (lang.startsWith("en") ? 20 : 0);

  for (const [pattern, points] of NAME_RULES) {
    if (pattern.test(name)) score += points;
  }

  if (!voice.localService) score += 3;
  if (voice.default) score += 1;

  return score;
}

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter(isEnglishVoice);
  if (english.length === 0) return null;
  return [...english].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null;
}

export async function getWebVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
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

export function primeWebVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  void getWebVoices(1200);
}

export async function stopNativeSpeech() {
  if (!isNativePlatform()) return;
  try {
    const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
    await TextToSpeech.stop();
  } catch {
    // Best effort.
  }
}

export async function speakNative(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (!isNativePlatform()) return false;

  try {
    const { TextToSpeech } = await import("@capacitor-community/text-to-speech");

    let lang = "en-US";
    let voice: number | undefined;

    try {
      const supported = await TextToSpeech.getSupportedVoices();
      const voices = Array.isArray((supported as { voices?: unknown[] })?.voices)
        ? ((supported as { voices: Array<{ lang?: string; index?: number }> }).voices ?? [])
        : [];
      const pick =
        voices.find((item) => (item.lang ?? "").toLowerCase() === "en-us") ??
        voices.find((item) => (item.lang ?? "").toLowerCase().startsWith("en"));
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
    } as Record<string, unknown>;

    try {
      await TextToSpeech.speak(options as never);
      return true;
    } catch {
      await wait(350);
      await TextToSpeech.speak(options as never);
      return true;
    }
  } catch {
    return false;
  } finally {
    setSpeaking(button, false);
  }
}

export async function speakWeb(text: string, button?: HTMLElement | null): Promise<boolean> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    setSpeaking(button, false);
    return false;
  }

  const synth = window.speechSynthesis;

  let voices = synth.getVoices();
  if (voices.length === 0) {
    voices = await getWebVoices(2500);
  }
  cachedVoice = pickEnglishVoice(voices.length ? voices : synth.getVoices()) ?? cachedVoice;

  return new Promise<boolean>((resolve) => {
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

      try {
        synth.resume();
      } catch {}
      try {
        synth.cancel();
      } catch {}

      const utterance = new SpeechSynthesisUtterance(text);
      const currentVoices = synth.getVoices();
      if (currentVoices.length) cachedVoice = pickEnglishVoice(currentVoices) ?? cachedVoice;
      const voice = cachedVoice;

      utterance.lang = voice?.lang || "en-US";
      utterance.rate = getSpeechRate();
      utterance.pitch = 1;
      utterance.volume = 1;
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        started = true;
        setSpeaking(button, true);
      };
      utterance.onend = () => finish(true);
      utterance.onerror = (event) => {
        const error = (event as SpeechSynthesisErrorEvent & { error?: string })?.error;
        if (error === "interrupted" || error === "canceled") {
          finish(true);
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
          synth.speak(utterance);
          try {
            synth.resume();
          } catch {}

          // Chrome workaround: nudge if it gets stuck pending.
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
