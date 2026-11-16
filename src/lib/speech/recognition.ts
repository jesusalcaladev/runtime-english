import { emitToast } from '../toast'
import { isNativePlatform } from './platform'
import type { SpeechRecognitionResult } from './types'

interface SpeechRecognitionAlternativeLike {
  transcript?: string
  confidence?: number
}

interface SpeechRecognitionResultLike {
  readonly length: number
  readonly isFinal?: boolean
  [index: number]: SpeechRecognitionAlternativeLike | undefined
}

interface SpeechRecognitionResultListLike {
  readonly length: number
  [index: number]: SpeechRecognitionResultLike | undefined
}

interface SpeechRecognitionEventLike {
  resultIndex?: number
  results?: SpeechRecognitionResultListLike
}

interface SpeechRecognitionErrorEventLike {
  error?: string
}

interface SpeechRecognitionInstance {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

type NativePermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied'

type NativeListenerData = { matches?: string[]; status?: 'started' | 'stopped' }
type NativeListenerHandle = { remove: () => Promise<void> }

interface NativeSpeechRecognition {
  checkPermissions: () => Promise<{ speechRecognition?: NativePermissionState }>
  requestPermissions: () => Promise<{ speechRecognition?: NativePermissionState }>
  start: (options: {
    language: string
    maxResults: number
    prompt: string
    partialResults: boolean
    popup: boolean
  }) => Promise<{ matches?: string[] }>
  stop: () => Promise<void>
  addListener?: (
    eventName: 'partialResults' | 'listeningState',
    listener: (data: NativeListenerData) => void,
  ) => Promise<NativeListenerHandle>
  removeAllListeners?: () => Promise<void>
}

const WEB_ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Permiso de micrófono denegado. Actívalo en Ajustes → Permisos.',
  'service-not-allowed':
    'El servicio de reconocimiento de voz no está disponible en este dispositivo.',
  'no-speech': 'No se detectó voz. Habla más cerca del micrófono e inténtalo de nuevo.',
  'audio-capture': 'No se encontró un micrófono disponible.',
  network: 'Error de red al usar el reconocimiento de voz.',
  aborted: 'Reconocimiento cancelado.',
}

let nativeSpeechPromise: Promise<NativeSpeechRecognition | null> | null = null
let activeWebRecognition: SpeechRecognitionInstance | null = null
let activeNativeRecognition: NativeSpeechRecognition | null = null
let micStream: MediaStream | null = null

async function getMicStream(): Promise<MediaStream | null> {
  if (typeof navigator === 'undefined') return null
  const getUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices)
  if (typeof getUserMedia !== 'function') return null
  try {
    if (micStream?.active) return micStream
    micStream = await getUserMedia({ audio: true })
    return micStream
  } catch {
    return null
  }
}

export function releaseMicStream(): void {
  if (!micStream) return
  try {
    micStream.getTracks().forEach((track) => {
      track.stop()
    })
  } catch {}
  micStream = null
}

/** Live 0..1 input level for the listening UI. No-op on platforms without getUserMedia. */
export async function startMicLevelMeter(onLevel: (level: number) => void): Promise<() => void> {
  if (typeof window === 'undefined' || isNativePlatform()) return () => {}
  const stream = await getMicStream()
  if (!stream) return () => {}

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) return () => {}

  let context: AudioContext | null = null
  try {
    context = new AudioContextCtor()
    const source = context.createMediaStreamSource(stream)
    const analyser = context.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)
    void context.resume().catch(() => {})

    const data = new Uint8Array(analyser.fftSize)
    let frame = 0
    let stopped = false
    const tick = () => {
      if (stopped) return
      try {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (const value of data) {
          const normalized = (value - 128) / 128
          sum += normalized * normalized
        }
        onLevel(Math.min(1, Math.sqrt(sum / data.length) * 4))
      } catch {}
      frame = window.requestAnimationFrame(tick)
    }
    tick()

    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
      try {
        source.disconnect()
      } catch {}
      void context?.close().catch(() => {})
      releaseMicStream()
    }
  } catch {
    void context?.close().catch(() => {})
    releaseMicStream()
    return () => {}
  }
}

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const speechWindow = window as SpeechRecognitionWindow
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null
}

async function getNativeSpeechRecognition(): Promise<NativeSpeechRecognition | null> {
  if (!isNativePlatform()) return null
  if (!nativeSpeechPromise) {
    nativeSpeechPromise = import('@capacitor-community/speech-recognition')
      .then((mod) => (mod.SpeechRecognition as unknown as NativeSpeechRecognition) ?? null)
      .catch(() => null)
  }
  return nativeSpeechPromise
}

function getErrorName(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    const name = (error as { name?: unknown }).name
    return typeof name === 'string' ? name : ''
  }
  return ''
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message.toLowerCase()
  if (typeof error === 'string') return error.toLowerCase()
  return ''
}

function mapNativeError(error: unknown): string {
  const message = getErrorMessage(error)
  if (message.includes('cancel') || message.includes('abort')) return 'Reconocimiento cancelado.'
  if (message.includes('permission') || message.includes('not allowed')) {
    return 'Permiso de micrófono denegado. Actívalo en Ajustes → Permisos.'
  }
  if (message.includes('speech') && message.includes('available')) {
    return 'El reconocimiento de voz no está disponible en este dispositivo.'
  }
  if (message.includes('network')) return 'Error de red al usar el reconocimiento de voz.'
  return 'No se pudo reconocer la voz. Inténtalo de nuevo.'
}

function getBestTranscript(result: SpeechRecognitionResultLike | undefined): {
  transcript: string
  confidence: number
} {
  if (!result) return { transcript: '', confidence: 0 }

  let bestTranscript = ''
  let bestConfidence = -1

  for (let index = 0; index < result.length; index += 1) {
    const alternative = result[index]
    const transcript =
      typeof alternative?.transcript === 'string' ? alternative.transcript.trim() : ''
    const rawConfidence = alternative?.confidence
    const confidence =
      typeof rawConfidence === 'number' && Number.isFinite(rawConfidence) ? rawConfidence : 0

    // Alternatives are ordered best-first. With equal (often zero) confidence, keep the first.
    if (
      confidence > bestConfidence ||
      (confidence === bestConfidence && transcript && !bestTranscript)
    ) {
      bestTranscript = transcript
      bestConfidence = confidence
    }
  }

  return { transcript: bestTranscript, confidence: Math.max(0, bestConfidence) }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  // The native plugin uses the device's own recognizer (works inside the Android WebView).
  if (isNativePlatform()) return true
  return getSpeechRecognitionCtor() !== null
}

export async function getMicrophonePermissionStatus(): Promise<
  'granted' | 'denied' | 'prompt' | 'unknown'
> {
  if (typeof window === 'undefined') return 'unknown'

  if (isNativePlatform()) {
    const native = await getNativeSpeechRecognition()
    if (native) {
      try {
        const state = (await native.checkPermissions()).speechRecognition
        if (state === 'granted' || state === 'denied') return state
        if (state === 'prompt' || state === 'prompt-with-rationale') return 'prompt'
      } catch {
        // Fall through to other checks.
      }
    }
  }

  try {
    const status = await navigator.permissions?.query?.({
      name: 'microphone' as PermissionName,
    })
    if (status?.state === 'granted' || status?.state === 'denied' || status?.state === 'prompt') {
      return status.state
    }
  } catch {
    // Permissions API is not available everywhere.
  }

  return 'unknown'
}

export async function ensureMicrophonePermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  if (isNativePlatform()) {
    const native = await getNativeSpeechRecognition()
    if (native) {
      try {
        const current = await native.checkPermissions()
        if (current.speechRecognition === 'granted') return true
        if (current.speechRecognition === 'denied') {
          emitToast('Micrófono denegado. Actívalo en Ajustes → Permisos.', 'error')
          return false
        }
        const requested = await native.requestPermissions()
        if (requested.speechRecognition === 'granted') return true
        emitToast('No se concedió permiso de micrófono.', 'error')
        return false
      } catch {
        // Fall back to the Web Speech permission flow.
      }
    }
  }

  const getUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices)
  if (typeof getUserMedia !== 'function') {
    // Web Speech prompts for the mic itself when getUserMedia is not exposed.
    return true
  }

  try {
    const stream = await getUserMedia({ audio: true })
    try {
      stream.getTracks().forEach((track) => {
        track.stop()
      })
    } catch {}
    return true
  } catch (error) {
    const name = getErrorName(error)
    if (
      name === 'NotAllowedError' ||
      name === 'PermissionDeniedError' ||
      name === 'SecurityError'
    ) {
      emitToast('Permiso de micrófono denegado. Actívalo en Ajustes → Permisos.', 'error')
    } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      emitToast('No se encontró un micrófono en este dispositivo.', 'error')
    } else {
      emitToast('No se pudo acceder al micrófono.', 'error')
    }
    return false
  }
}

/** Stop any in-flight recognition (web or native). Safe to call repeatedly. */
export function stopSpeechRecognition(): void {
  try {
    activeWebRecognition?.stop()
  } catch {}
  try {
    void activeNativeRecognition?.stop().catch(() => undefined)
  } catch {}
}

async function recognizeWithNative(
  native: NativeSpeechRecognition,
  lang: string,
  timeoutMs: number,
  onPartial?: (text: string) => void,
): Promise<SpeechRecognitionResult> {
  try {
    const status = await native.checkPermissions()
    if (status.speechRecognition === 'denied') {
      return {
        transcript: '',
        confidence: 0,
        supported: true,
        error: 'Micrófono denegado. Actívalo en Ajustes → Permisos.',
      }
    }
    if (status.speechRecognition !== 'granted') {
      const requested = await native.requestPermissions()
      if (requested.speechRecognition !== 'granted') {
        return {
          transcript: '',
          confidence: 0,
          supported: true,
          error: 'No se concedió permiso de micrófono.',
        }
      }
    }
  } catch {
    // Permission probing is best effort; start() will surface any real failure.
  }

  const usePartial = Boolean(onPartial && native.addListener)

  return new Promise((resolve) => {
    let isSettled = false
    let lastText = ''
    let silenceId: number | null = null
    const handles: NativeListenerHandle[] = []
    activeNativeRecognition = native

    const clearSilenceTimer = () => {
      if (silenceId === null) return
      window.clearTimeout(silenceId)
      silenceId = null
    }

    const finish = (transcript: string, error?: string) => {
      if (isSettled) return
      isSettled = true
      window.clearTimeout(timeoutId)
      clearSilenceTimer()
      activeNativeRecognition = null
      for (const handle of handles) {
        void handle.remove().catch(() => undefined)
      }
      if (!usePartial) void native.removeAllListeners?.().catch(() => undefined)
      resolve({
        transcript,
        confidence: transcript ? 1 : 0,
        supported: true,
        error: transcript ? undefined : error,
      })
    }

    const stopListening = () => {
      void native.stop().catch(() => undefined)
    }

    const timeoutId = window.setTimeout(() => {
      stopListening()
      finish(lastText, lastText ? undefined : 'Tiempo de espera agotado. Inténtalo de nuevo.')
    }, timeoutMs)

    if (usePartial) {
      void native
        .addListener?.('partialResults', (data) => {
          const text = (data.matches ?? []).map((match) => match.trim()).find(Boolean) ?? ''
          if (!text) return
          lastText = text
          onPartial?.(text)
          clearSilenceTimer()
          // Native recognition stays open until stopped: a short pause means the user finished.
          silenceId = window.setTimeout(() => {
            stopListening()
            finish(lastText)
          }, 1500)
        })
        .then((handle) => {
          if (!handle) return
          if (isSettled) void handle.remove().catch(() => undefined)
          else handles.push(handle)
        })
        .catch(() => undefined)

      void native
        .addListener?.('listeningState', (data) => {
          if (data.status !== 'stopped') return
          finish(
            lastText,
            lastText ? undefined : 'No se detectó voz. Habla más cerca del micrófono.',
          )
        })
        .then((handle) => {
          if (!handle) return
          if (isSettled) void handle.remove().catch(() => undefined)
          else handles.push(handle)
        })
        .catch(() => undefined)
    }

    void native
      .start({
        language: lang,
        maxResults: 3,
        prompt: 'Di tu respuesta en inglés',
        // With partialResults the plugin resolves right away; the listeners drive completion.
        partialResults: usePartial,
        popup: false,
      })
      .then(({ matches }) => {
        if (usePartial) return
        const transcript = (matches ?? []).map((match) => match.trim()).find(Boolean) ?? ''
        finish(transcript, 'No se detectó voz. Habla más cerca del micrófono.')
      })
      .catch((error) => {
        finish('', mapNativeError(error))
      })
  })
}

function recognizeWithWeb(
  lang: string,
  timeoutMs: number,
  onPartial?: (text: string) => void,
): Promise<SpeechRecognitionResult> {
  const SpeechRecognition = getSpeechRecognitionCtor()
  if (!SpeechRecognition) {
    return Promise.resolve({
      transcript: '',
      confidence: 0,
      supported: false,
      error: 'Reconocimiento de voz no disponible. Usa Chrome/Edge o escribe tu respuesta.',
    })
  }

  return new Promise((resolve) => {
    let isSettled = false
    let finalTranscript = ''
    let liveTranscript = ''
    let finalizeId: number | null = null
    const recognition = new SpeechRecognition()
    activeWebRecognition = recognition

    recognition.lang = lang
    recognition.interimResults = true
    recognition.maxAlternatives = 3
    recognition.continuous = false

    const clearFinalizeTimer = () => {
      if (finalizeId === null) return
      window.clearTimeout(finalizeId)
      finalizeId = null
    }

    const finish = (transcript: string, error?: string) => {
      if (isSettled) return
      isSettled = true
      window.clearTimeout(timeoutId)
      clearFinalizeTimer()
      try {
        recognition.onresult = null
        recognition.onerror = null
        recognition.onend = null
        recognition.stop()
      } catch {}
      activeWebRecognition = null
      resolve({
        transcript,
        confidence: transcript ? 1 : 0,
        supported: true,
        error: transcript ? undefined : error,
      })
    }

    const timeoutId = window.setTimeout(() => {
      finish('', 'Tiempo de espera agotado. Inténtalo de nuevo.')
    }, timeoutMs)

    recognition.onresult = (event) => {
      try {
        const results = event.results
        if (!results) return
        // Only process new results: engines resend the full list on every interim event.
        const fromIndex = Math.max(0, event.resultIndex ?? 0)
        for (let index = fromIndex; index < results.length; index += 1) {
          const result = results[index]
          if (!result) continue
          const { transcript } = getBestTranscript(result)
          if (!transcript) continue
          if (result.isFinal) {
            finalTranscript = `${finalTranscript} ${transcript}`.trim()
          } else {
            liveTranscript = `${liveTranscript} ${transcript}`.trim()
          }
        }
        const preview = `${finalTranscript} ${liveTranscript}`.trim()
        if (preview) onPartial?.(preview)
        if (finalTranscript) {
          // Wait briefly for a possible trailing final result before settling.
          clearFinalizeTimer()
          finalizeId = window.setTimeout(() => finish(finalTranscript.trim()), 350)
        }
      } catch {
        finish('', 'No se pudo procesar el audio. Inténtalo de nuevo.')
      }
    }

    recognition.onerror = (event) => {
      const code = event.error ?? 'error'
      finish('', WEB_ERROR_MESSAGES[code] ?? 'No se pudo acceder al micrófono.')
    }

    recognition.onend = () => {
      if (isSettled) return
      const transcript = finalTranscript.trim() || liveTranscript.trim()
      finish(
        transcript,
        transcript ? undefined : 'No se detectó voz. Habla más cerca del micrófono.',
      )
    }

    try {
      recognition.start()
    } catch {
      finish('', 'No se pudo iniciar el micrófono.')
    }
  })
}

export async function recognizeOnce(
  lang = 'en-US',
  timeoutMs = 7_000,
  onPartial?: (text: string) => void,
): Promise<SpeechRecognitionResult> {
  if (typeof window === 'undefined') {
    return { transcript: '', confidence: 0, supported: false, error: 'no-window' }
  }

  if (isNativePlatform()) {
    const native = await getNativeSpeechRecognition()
    if (native) return recognizeWithNative(native, lang, timeoutMs, onPartial)
  }

  return recognizeWithWeb(lang, timeoutMs, onPartial)
}
