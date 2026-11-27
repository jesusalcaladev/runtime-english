import { beforeEach, describe, expect, it, vi } from 'vitest'

const { languageRef } = vi.hoisted(() => ({
  languageRef: { current: 'en-US' as 'en-US' | 'en-GB' },
}))
vi.mock('./platform', () => ({
  getSpeechLanguage: () => languageRef.current,
  getSpeechRate: () => 1,
}))

import {
  getGooglePhraseStatus,
  prefetchGooglePhrase,
  speakWithGoogle,
  splitGoogleText,
  stopGooglePlayback,
} from './google'

class FakeAudio {
  static instances: FakeAudio[] = []
  src: string
  playbackRate = 1
  currentTime = 0
  paused = false
  readyState = 0
  preload = ''
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  oncanplaythrough: (() => void) | null = null

  constructor(src: string) {
    this.src = src
    FakeAudio.instances.push(this)
  }

  load() {}

  removeAttribute(_name: string) {}

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
  it('uses the selected accent in the Google URL and caches per accent', () => {
    languageRef.current = 'en-GB'
    prefetchGooglePhrase('Accent test phrase.')
    expect(FakeAudio.instances[0].src).toContain('tl=en-GB')
    FakeAudio.instances[0].readyState = 2
    FakeAudio.instances[0].oncanplaythrough?.()

    languageRef.current = 'en-US'
    prefetchGooglePhrase('Accent test phrase.')
    expect(FakeAudio.instances).toHaveLength(2)
    expect(FakeAudio.instances[1].src).toContain('tl=en-US')
    FakeAudio.instances[1].readyState = 2
    FakeAudio.instances[1].oncanplaythrough?.()
    languageRef.current = 'en-US'
  })

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

  it('prefetches a phrase and reuses the buffered audio when played', async () => {
    prefetchGooglePhrase('Prefetch me please.')
    expect(FakeAudio.instances).toHaveLength(1)

    const prefetched = FakeAudio.instances[0]
    prefetched.readyState = 2
    prefetched.oncanplaythrough?.()
    expect(getGooglePhraseStatus(['Prefetch me please.'])).toEqual({ ready: 1, total: 1 })

    const promise = speakWithGoogle('Prefetch me please.')
    await Promise.resolve()
    await Promise.resolve()

    // No second Audio element: the next line is played from the prefetched cache.
    expect(FakeAudio.instances).toHaveLength(1)
    prefetched.onended?.()
    expect(await promise).toBe(true)
  })

  it('returns false when the audio fails', async () => {
    const promise = speakWithGoogle('Hello')
    await Promise.resolve()
    await Promise.resolve()

    FakeAudio.instances[0].onerror?.()
    expect(await promise).toBe(false)
  })

  it('queues all chunks of a long phrase up front for parallel download', async () => {
    const long = `${'A sentence here. '.repeat(15)}`
    expect(splitGoogleText(long).length).toBeGreaterThan(1)

    const promise = speakWithGoogle(long)
    await Promise.resolve()
    await Promise.resolve()

    // The bounded downloader fills its parallel slots while the first chunk plays.
    expect(FakeAudio.instances.length).toBeGreaterThan(1)
    stopGooglePlayback()
    await expect(promise).resolves.toBe(false)
  })
})
