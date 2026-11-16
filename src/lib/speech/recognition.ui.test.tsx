import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureMicrophonePermission, recognizeOnce, stopSpeechRecognition } from './recognition'

type AnyResult = Record<string, unknown>

class MockRecognition {
  static instances: MockRecognition[] = []

  lang = ''
  interimResults = false
  maxAlternatives = 0
  continuous = false
  onresult: ((event: { results: AnyResult[] }) => void) | null = null
  onerror: ((event: { error: string }) => void) | null = null
  onend: (() => void) | null = null
  started = false
  stopped = false

  constructor() {
    MockRecognition.instances.push(this)
  }

  start() {
    this.started = true
  }

  stop() {
    this.stopped = true
  }

  emit(results: AnyResult[]) {
    this.onresult?.({ results })
  }
}

function lastInstance(): MockRecognition {
  const instance = MockRecognition.instances.at(-1)
  if (!instance) throw new Error('No recognition instance was created')
  return instance
}

function alternative(transcript: string, confidence = 0): AnyResult {
  return { transcript, confidence }
}

function result(isFinal: boolean, ...alternatives: AnyResult[]): AnyResult {
  const indexed: AnyResult = { isFinal, length: alternatives.length }
  alternatives.forEach((alt, i) => {
    indexed[i] = alt
  })
  return indexed
}

describe('recognizeOnce (web speech)', () => {
  beforeEach(() => {
    MockRecognition.instances = []
    ;(window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = MockRecognition
    ;(window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition =
      undefined
  })

  afterEach(() => {
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition
  })

  it('keeps the first alternative when confidences are tied at zero', async () => {
    const promise = recognizeOnce('en-US', 5_000)
    lastInstance().emit([result(true, alternative('hello world', 0), alternative('hello word', 0))])

    await expect(promise).resolves.toMatchObject({ transcript: 'hello world', supported: true })
  })

  it('reports interim results and resolves with the final transcript', async () => {
    const onPartial = vi.fn()
    const promise = recognizeOnce('en-US', 5_000, onPartial)
    const instance = lastInstance()

    instance.emit([result(false, alternative('hello', 0.4))])
    expect(onPartial).toHaveBeenCalledWith('hello')

    instance.emit([result(true, alternative('hello world', 0.9))])
    await expect(promise).resolves.toMatchObject({ transcript: 'hello world', error: undefined })
  })

  it('maps recognition errors to helpful messages', async () => {
    const promise = recognizeOnce('en-US', 5_000)
    lastInstance().onerror?.({ error: 'no-speech' })

    const response = await promise
    expect(response.transcript).toBe('')
    expect(response.error).toContain('No se detectó voz')
  })

  it('stops an active recognition when cancelled', async () => {
    const promise = recognizeOnce('en-US', 5_000)
    const instance = lastInstance()

    stopSpeechRecognition()
    expect(instance.stopped).toBe(true)

    instance.onend?.()
    await promise
  })

  it('does not require getUserMedia to be exposed by the browser', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices')
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })
    try {
      await expect(ensureMicrophonePermission()).resolves.toBe(true)
    } finally {
      if (original) Object.defineProperty(navigator, 'mediaDevices', original)
    }
  })
})
