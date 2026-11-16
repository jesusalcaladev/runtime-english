import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { recognizeOnce } from './recognition'

type Listener = (data: { matches?: string[]; status?: 'started' | 'stopped' }) => void

vi.mock('@capacitor-community/speech-recognition', () => ({
  SpeechRecognition: {
    checkPermissions: vi.fn(async () => ({ speechRecognition: 'granted' })),
    requestPermissions: vi.fn(async () => ({ speechRecognition: 'granted' })),
    start: vi.fn(async () => ({ matches: [] as string[] })),
    stop: vi.fn(async () => undefined),
    addListener: vi.fn(async () => ({ remove: async () => undefined })),
    removeAllListeners: vi.fn(async () => undefined),
  },
}))

async function getNativeMock() {
  const mod = await import('@capacitor-community/speech-recognition')
  return mod.SpeechRecognition as unknown as {
    start: ReturnType<typeof vi.fn>
    stop: ReturnType<typeof vi.fn>
    addListener: ReturnType<typeof vi.fn>
  }
}

describe('recognizeOnce (native plugin)', () => {
  const originalCapacitor = (window as unknown as { Capacitor?: unknown }).Capacitor

  beforeEach(() => {
    ;(window as unknown as { Capacitor: unknown }).Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => 'android',
    }
  })

  afterEach(() => {
    ;(window as unknown as { Capacitor?: unknown }).Capacitor = originalCapacitor
    vi.clearAllMocks()
  })

  it('uses final matches when no partial callback is provided', async () => {
    const native = await getNativeMock()
    native.start.mockResolvedValueOnce({ matches: ['hello world'] })

    const result = await recognizeOnce('en-US', 3_000)

    expect(result.transcript).toBe('hello world')
    expect(native.start).toHaveBeenCalledWith(
      expect.objectContaining({ partialResults: false, popup: false, language: 'en-US' }),
    )
  })

  it('streams partial results and sends live text to the caller', async () => {
    const native = await getNativeMock()
    const listeners: Record<string, Listener> = {}
    native.addListener.mockImplementation(async (name: string, callback: Listener) => {
      listeners[name] = callback
      return { remove: async () => undefined }
    })
    const onPartial = vi.fn()

    const promise = recognizeOnce('en-US', 8_000, onPartial)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(native.start).toHaveBeenCalledWith(expect.objectContaining({ partialResults: true }))
    listeners.partialResults?.({ matches: ['hello'] })
    expect(onPartial).toHaveBeenCalledWith('hello')
    listeners.partialResults?.({ matches: ['hello world'] })
    expect(onPartial).toHaveBeenCalledWith('hello world')

    listeners.listeningState?.({ status: 'stopped' })
    const result = await promise
    expect(result.transcript).toBe('hello world')
  })
})
