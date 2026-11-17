import { beforeEach, describe, expect, it } from 'vitest'
import { speakWithGoogle, splitGoogleText, stopGooglePlayback } from './google'

class FakeAudio {
  static instances: FakeAudio[] = []
  src: string
  playbackRate = 1
  currentTime = 0
  paused = false
  onended: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(src: string) {
    this.src = src
    FakeAudio.instances.push(this)
  }

  play() {
    this.paused = false
    return Promise.resolve()
  }

  pause() {
    this.paused = true
  }
}

Object.defineProperty(window, 'Audio', { value: FakeAudio, configurable: true })

beforeEach(() => {
  FakeAudio.instances = []
  stopGooglePlayback()
})

describe('Google TTS', () => {
  it('splits long text into safe sentence chunks', () => {
    const text = `${'First sentence. '.repeat(8)}${'Second sentence. '.repeat(8)}`
    const chunks = splitGoogleText(text)

    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) expect(chunk.length).toBeLessThanOrEqual(180)
  })

  it('plays each chunk and resolves when the audio ends', async () => {
    const promise = speakWithGoogle('Hello there. How are you?')
    await Promise.resolve()
    await Promise.resolve()

    expect(FakeAudio.instances).toHaveLength(1)
    expect(FakeAudio.instances[0].src).toContain('translate.google.com')
    FakeAudio.instances[0].onended?.()
    expect(await promise).toBe(true)
  })

  it('returns false when the audio fails', async () => {
    const promise = speakWithGoogle('Hello')
    await Promise.resolve()
    await Promise.resolve()

    FakeAudio.instances[0].onerror?.()
    expect(await promise).toBe(false)
  })
})
