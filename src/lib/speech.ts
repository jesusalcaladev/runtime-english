let cachedVoice: SpeechSynthesisVoice | null = null;
let cachedRate = 1;

export function getSpeechRate(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = window.localStorage.getItem("deveng_core_v2");
    if (!raw) return 1;
    const parsed = JSON.parse(raw);
    return typeof parsed?.settings?.ttsRate === "number" ? parsed.settings.ttsRate : 1;
  } catch {
    return 1;
  }
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  return (
    voices.find(
      (voice) =>
        voice.lang === "en-US" &&
        /Google|Natural|Microsoft|Samantha|Daniel|Alex/i.test(voice.name),
    ) ??
    voices.find((voice) => voice.lang === "en-US") ??
    voices.find((voice) => voice.lang.startsWith("en")) ??
    null
  );
}

export function speak(text: string, button?: HTMLElement | null) {
  if (typeof window === "undefined" || !text) return;

  if (!("speechSynthesis" in window)) {
    console.info("Speech synthesis no disponible en este navegador.");
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(
    text.replace(/\s+/g, " ").trim(),
  );
  utterance.lang = "en-US";
  cachedRate = getSpeechRate();
  utterance.rate = cachedRate;
  utterance.pitch = 1;
  utterance.volume = 1;

  if (!cachedVoice) cachedVoice = pickEnglishVoice();
  if (cachedVoice) utterance.voice = cachedVoice;

  if (button) {
    button.dataset.speaking = "true";
    const reset = () => {
      button.dataset.speaking = "false";
    };
    utterance.onend = reset;
    utterance.onerror = reset;
  }

  synth.speak(utterance);
}

export function initVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const refresh = () => {
    cachedVoice = pickEnglishVoice();
  };
  refresh();
  window.speechSynthesis.onvoiceschanged = refresh;
  window.setTimeout(refresh, 400);
  window.setTimeout(refresh, 1200);
}
