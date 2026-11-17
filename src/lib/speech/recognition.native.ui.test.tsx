import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { recognizeOnce, stopSpeechRecognition } from './recognition'

type ListenerData = { matches?: string[]; status?: 'started' | 'stopped' }
type Listener = (data: ListenerData) => void

vi.mock('@capacitor-community/speech-recognition', () => ({
  SpeechRecognition: {
    available: vi.fn(async () => ({ available: true })),
    checkPermissions: vi.fn(async () => ({ speechRecognition: 'granted' })),
    requestPermissions: vi.fn(async () => ({ speechRecognition: 'granted' })),
    start: vi.fn(async () => ({ matches: [] as string[] })),
    stop: vi.fn(async () => undefined),
    addListener: vi.fn(async () => ({ remove: async () => undefined })),
    removeAllListeners: vi.fn(async () => undefined),
  },
}))

type NativeMock = {
  available: ReturnType<typeof vi.fn>
  checkPermissions: ReturnType<typeof vi.fn>
  requestPermissions: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  addListener: ReturnType<typeof vi.fn>
  removeAllListeners: ReturnType<typeof vi.fn>
}

async function getNativeMock(): Promise<NativeMock> {
  const mod = await import('@capacitor-community/speech-recognition')
  return mod.SpeechRecognition as unknown as NativeMock
}

function captureListeners(native: NativeMock): Record<string, Listener> {
  const listeners: Record<string, Listener> = {}
  native.addListener.mockImplementation(async (name: string, callback: Listener) => {
    listeners[name] = callback
    return { remove: async () => undefined }
  })
  return listeners
}

/** Let the preflight/permission/listener microtasks settle before inspecting mocks. */
function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('recognizeOnce (native plugin)', () => {
  const originalCapacitor = (window as unknown as { Capacitor?: unknown }).Capacitor

  beforeEach(async () => {
    const native = await getNativeMock()
    vi.resetAllMocks()
    native.available.mockResolvedValue({ available: true })
    native.checkPermissions.mockResolvedValue({ speechRecognition: 'granted' })
    native.requestPermissions.mockResolvedValue({ speechRecognition: 'granted' })
    native.start.mockResolvedValue({ matches: [] })
    native.stop.mockResolvedValue(undefined)
    native.addListener.mockImplementation(async () => ({ remove: async () => undefined }))
    native.removeAllListeners.mockResolvedValue(undefined)
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
    const listeners = captureListeners(native)
    const onPartial = vi.fn()

    const promise = recognizeOnce('en-US', 8_000, onPartial)
    await flushMicrotasks()

    expect(native.start).toHaveBeenCalledWith(expect.objectContaining({ partialResults: true }))
    listeners.partialResults?.({ matches: ['hello'] })
    expect(onPartial).toHaveBeenCalledWith('hello')
    listeners.partialResults?.({ matches: ['hello world'] })
    expect(onPartial).toHaveBeenCalledWith('hello world')

    listeners.listeningState?.({ status: 'stopped' })
    const result = await promise
    expect(result.transcript).toBe('hello world')
  })

  it('reports unavailable devices without ever starting recognition', async () => {
    const native = await getNativeMock()
    native.available.mockResolvedValueOnce({ available: false })

    const result = await recognizeOnce('en-US', 3_000)

    expect(result.supported).toBe(true)
    expect(result.transcript).toBe('')
    expect(result.error).toContain('no está disponible en este dispositivo')
    expect(result.error).toContain('app de Google')
    expect(native.start).not.toHaveBeenCalled()
    expect(native.addListener).not.toHaveBeenCalled()
  })

  it('registers both listeners before calling start', async () => {
    const native = await getNativeMock()
    const listeners = captureListeners(native)
    const callOrder: string[] = []
    native.addListener.mockImplementation(async (name: string, callback: Listener) => {
      callOrder.push(`add:${name}`)
      listeners[name] = callback
      return { remove: async () => undefined }
    })
    native.start.mockImplementation(async (options: { partialResults: boolean }) => {
      callOrder.push(`start:${options.partialResults ? 'partial' : 'final'}`)
      return { matches: [] }
    })

    const promise = recognizeOnce('en-US', 3_000, vi.fn())
    await flushMicrotasks()

    expect(callOrder).toEqual(['add:partialResults', 'add:listeningState', 'start:partial'])
    expect(native.start).toHaveBeenCalledTimes(1)

    // Settle the attempt with the already-registered listeners.
    listeners.partialResults?.({ matches: ['hello'] })
    listeners.listeningState?.({ status: 'stopped' })
    await expect(promise).resolves.toMatchObject({ transcript: 'hello' })
  })

  it('falls back to the system popup when the direct attempt hears nothing', async () => {
    const native = await getNativeMock()
    const listeners = captureListeners(native)
    native.start.mockImplementation(async (options: { popup: boolean }) => {
      if (options.popup) return { matches: ['popup transcript'] }
      // The plugin resolves start() immediately, then the recognizer stops with
      // no text. With partialResults its later error reject is lost, so the
      // listeningState watchdog must be what triggers the fallback.
      listeners.listeningState?.({ status: 'stopped' })
      return { matches: [] }
    })

    const result = await recognizeOnce('en-US', 3_000, vi.fn())

    expect(result.transcript).toBe('popup transcript')
    expect(native.start).toHaveBeenCalledTimes(2)
    expect(native.start).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ partialResults: true, popup: false }),
    )
    expect(native.start).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ partialResults: false, popup: true }),
    )
  })

  it('maps native errors to actionable Spanish messages', async () => {
    const native = await getNativeMock()
    native.start.mockRejectedValueOnce(new Error('Insufficient permissions'))

    const result = await recognizeOnce('en-US', 3_000)

    expect(result.error).toContain('Permiso de micrófono denegado')
    expect(result.error).toContain('Ajustes')
    expect(native.start).toHaveBeenCalledTimes(1) // not retryable: no second prompt
  })

  it('stops the active native recognition when cancelled', async () => {
    const native = await getNativeMock()
    const listeners = captureListeners(native)

    const promise = recognizeOnce('en-US', 3_000, vi.fn())
    await flushMicrotasks()

    stopSpeechRecognition()
    expect(native.stop).toHaveBeenCalled()

    listeners.partialResults?.({ matches: ['hello'] })
    listeners.listeningState?.({ status: 'stopped' })
    await expect(promise).resolves.toMatchObject({ transcript: 'hello' })
  })
})
