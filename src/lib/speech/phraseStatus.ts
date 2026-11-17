/** Tiny shared signal for "a phrase became ready" across TTS engines. */
type Listener = () => void

const listeners = new Set<Listener>()
let epoch = 0

export function bumpPhraseStatus(): void {
  epoch += 1
  for (const listener of [...listeners]) {
    try {
      listener()
    } catch {
      // A broken subscriber must never break TTS.
    }
  }
}

export function subscribePhraseStatus(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPhraseStatusEpoch(): number {
  return epoch
}
