const SPEAK_LOADING_SELECTOR = "[data-speak-loading='true']"
const SPEAK_ACTIVE_SELECTOR = "[data-speak-loading='true'], [data-speaking='true']"

export function setSpeaking(button: HTMLElement | null | undefined, speaking: boolean) {
  if (!button) return
  button.dataset.speaking = speaking ? 'true' : 'false'
  button.dataset.speakState = speaking
    ? 'playing'
    : button.dataset.speakLoading === 'true'
      ? 'loading'
      : 'idle'
  if (speaking) {
    // Audio is playing: remove loading visuals/icon state.
    delete button.dataset.speakLoading
    button.removeAttribute('aria-busy')
  }
}

export function setSpeakLoading(button: HTMLElement | null | undefined, loading: boolean) {
  if (!button) return
  if (loading) {
    button.dataset.speakLoading = 'true'
    button.dataset.speakState = 'loading'
    button.setAttribute('aria-busy', 'true')
  } else {
    delete button.dataset.speakLoading
    button.removeAttribute('aria-busy')
    button.dataset.speakState = button.dataset.speaking === 'true' ? 'playing' : 'idle'
  }
}

export function clearAllSpeakLoading() {
  if (typeof document === 'undefined') return
  try {
    document.querySelectorAll<HTMLElement>(SPEAK_LOADING_SELECTOR).forEach((el) => {
      delete el.dataset.speakLoading
      el.removeAttribute('aria-busy')
      el.dataset.speakState = el.dataset.speaking === 'true' ? 'playing' : 'idle'
    })
  } catch {}
}

export function clearAllSpeakStates() {
  if (typeof document === 'undefined') return
  try {
    document.querySelectorAll<HTMLElement>(SPEAK_ACTIVE_SELECTOR).forEach((el) => {
      delete el.dataset.speakLoading
      delete el.dataset.speaking
      el.dataset.speakState = 'idle'
      el.removeAttribute('aria-busy')
    })
  } catch {}
}
