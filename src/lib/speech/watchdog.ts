/**
 * Bounded-time helpers for the TTS stack.
 *
 * The web SpeechSynthesis API can leave utterances stuck in its internal queue
 * forever (no `onstart`/`onend`) — notably in Chromium-based browsers without
 * installed voices. Every TTS promise must therefore settle on its own, and an
 * exercise must never wait on a hung voice. These helpers centralise those hard
 * limits and the one-time "voice failed to start" signal used to pick the next
 * engine quickly.
 */

/**
 * How long we wait for a web utterance to actually start speaking. Kept short on
 * purpose: a slow/frozen native voice falls back to the online voice fast, which
 * is what makes the first tap feel instant.
 */
export const TTS_START_TIMEOUT_MS = 700
/**
 * Network-backed Web Speech voices (e.g. "Google US English") need real time to
 * fetch the first audio on a cold start. Cancelling them at 700 ms made them
 * look broken; local voices still use the short deadline above.
 */
export const TTS_REMOTE_START_TIMEOUT_MS = 2_500
/** How long we wait for an online MP3 to start streaming before falling back. */
export const TTS_BUFFER_TIMEOUT_MS = 250
/** Hard cap for a single web utterance once it has started (keep-alive keeps it alive). */
export const TTS_UTTERANCE_TIMEOUT_MS = 20_000
/** Upper bound for a full `speakLine()` call so exercises/dialogues never block. */
export const TTS_LINE_TIMEOUT_MS = 15_000

/**
 * Deadline for an entire playback attempt. It must scale with the text length:
 * a fixed 5s cap truncates a normal 180-character chunk (~12s of speech). The
 * per-engine *start* watchdogs above are what keep failures fast; this is only
 * a generous safety net for a stream that never ends.
 */
export function ttsAttemptDeadlineMs(text: string): number {
  return Math.min(TTS_LINE_TIMEOUT_MS, Math.max(4_000, text.length * 110 + 2_000))
}

export class TtsTimeoutError extends Error {
  constructor(label = 'TTS') {
    super(`${label} timed out`)
    this.name = 'TtsTimeoutError'
  }
}

/** Reject with `TtsTimeoutError` when `promise` does not settle within `ms`. */
export function withTimeout<T>(promise: Promise<T>, ms: number, onTimeout?: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let done = false
    const timer = setTimeout(() => {
      if (done) return
      done = true
      onTimeout?.()
      reject(new TtsTimeoutError())
    }, ms)
    // Do not keep a Node/test process alive purely because of a safety timer.
    if (typeof timer === 'object' && timer !== null && 'unref' in timer) {
      ;(timer as { unref?: () => void }).unref?.()
    }
    promise.then(
      (value) => {
        if (done) return
        done = true
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        if (done) return
        done = true
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/** Resolve with `fallback` instead of rejecting when the deadline is hit. */
export async function withFallback<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
  onTimeout?: () => void,
): Promise<T> {
  try {
    return await withTimeout(promise, ms, onTimeout)
  } catch (error) {
    if (error instanceof TtsTimeoutError) return fallback
    throw error
  }
}
