import { beforeEach, describe, expect, it } from 'vitest'
import { hasUsableWebVoice, speakWeb } from './browser'
import { TtsTimeoutError, withFallback, withTimeout } from './watchdog'

class FakeUtterance {
  static instances: FakeUtterance[] = []
  text: string
  lang = ''
  rate = 1
  pitch = 1
  volume = 1
  voice: unknown = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: ((event: { error: string }) => void) | null = null

  constructor(text: string) {
    this.text = text
    FakeUtterance.instances.push(this)
  }
}

class FakeSynthesis {
  voices: unknown[] = []
  speaking = false
  paused = false
  cancelCount = 0
  spoken: FakeUtterance[] = []

  getVoices() {
    return this.voices
  }
  cancel() {
    this.cancelCount += 1
    this.spoken = []
  }
  pause() {
    this.paused = true
  }
  resume() {
    this.paused = false
  }
  speak(utterance: FakeUtterance) {
    this.spoken.push(utterance)
  }
}

const EN_VOICE = {
  name: 'Google US English',
  lang: 'en-US',
  localService: true,
  default: true,
}

let synth: FakeSynthesis

beforeEach(() => {
  FakeUtterance.instances = []
  synth = new FakeSynthesis()
  synth.voices = [EN_VOICE]
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true })
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: FakeUtterance,
    configurable: true,
  })
  Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
    value: FakeUtterance,
    configurable: true,
  })
})

describe('web voice playback reliability', () => {
  it('reports no usable voice when the host has none', () => {
    synth.voices = []
    expect(hasUsableWebVoice()).toBe(false)
    synth.voices = [EN_VOICE]
    expect(hasUsableWebVoice()).toBe(true)
  })

  it('cancels the native queue and resolves true when audio ends normally', async () => {
    const promise = speakWeb('Hello there')
    await new Promise((resolve) => setTimeout(resolve, 80))

    expect(FakeUtterance.instances).toHaveLength(1)
    expect(synth.cancelCount).toBeGreaterThanOrEqual(1)
    expect(synth.spoken).toHaveLength(1)

    FakeUtterance.instances[0].onstart?.()
    FakeUtterance.instances[0].onend?.()
    await expect(promise).resolves.toBe(true)
  })

  it('gives up on a stuck pending utterance in ~1.6s so the online fallback can run', async () => {
    const started = Date.now()
    // The utterance is queued but onstart/onend never fire (Brave/Linux case).
    const result = await speakWeb('This will never start')
    expect(result).toBe(false)
    expect(Date.now() - started).toBeLessThan(4_000)
    // The stuck native queue was cancelled so it cannot blurt out minutes later.
    expect(synth.cancelCount).toBeGreaterThanOrEqual(2)
  }, 6_000)
})

describe('TTS watchdog helpers', () => {
  it('rejects with TtsTimeoutError when work hangs', async () => {
    await expect(withTimeout(new Promise(() => {}), 20)).rejects.toBeInstanceOf(TtsTimeoutError)
  })

  it('resolves with a fallback and runs the cleanup callback on timeout', async () => {
    let cleaned = false
    const result = await withFallback(new Promise<boolean>(() => {}), 20, false, () => {
      cleaned = true
    })
    expect(result).toBe(false)
    expect(cleaned).toBe(true)
  })

  it('does not fire the fallback when work settles in time', async () => {
    await expect(withFallback(Promise.resolve(true), 100, false)).resolves.toBe(true)
  })
})
