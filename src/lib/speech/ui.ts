const SPEAK_LOADING_SELECTOR = "[data-speak-loading='true']";

export function setSpeaking(button: HTMLElement | null | undefined, speaking: boolean) {
  if (!button) return;
  button.dataset.speaking = speaking ? "true" : "false";
  if (speaking) delete button.dataset.speakLoading;
}

export function setSpeakLoading(button: HTMLElement | null | undefined, loading: boolean) {
  if (!button) return;
  if (loading) {
    button.dataset.speakLoading = "true";
    button.setAttribute("aria-busy", "true");
  } else {
    delete button.dataset.speakLoading;
    button.removeAttribute("aria-busy");
  }
}

export function clearAllSpeakLoading() {
  if (typeof document === "undefined") return;
  try {
    document.querySelectorAll<HTMLElement>(SPEAK_LOADING_SELECTOR).forEach((el) => {
      delete el.dataset.speakLoading;
      el.removeAttribute("aria-busy");
    });
  } catch {}
}
