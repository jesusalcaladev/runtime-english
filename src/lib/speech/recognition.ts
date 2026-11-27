import { emitToast } from '../toast'
import { isMobileLikeDevice, isNativePlatform } from './platform'
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
  /** Plugin preflight: false when the device has no speech service (e.g. no Google app). */
  available?: () => Promise<{ available: boolean }>
  isListening?: () => Promise<{ listening: boolean }>
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
  network:
    'Error de red al usar el reconocimiento de voz. En Chromium/Brave suele faltar el servicio de voz: usa Chrome/Edge o escribe tu respuesta.',
  aborted: 'Reconocimiento cancelado.',
}

const NATIVE_NOT_AVAILABLE_MESSAGE =
  'El reconocimiento de voz no está disponible en este dispositivo. Revisa que tengas instalada la app de Google o un servicio de voz.'
const NATIVE_NO_SPEECH_MESSAGE =
  'No se detectó voz. Habla más cerca del micrófono e inténtalo de nuevo.'
const NATIVE_START_FAILED_MESSAGE =
  'No se pudo iniciar el micrófono. Revisa que haya un servicio de voz disponible.'

/** Time after the last partial result before we treat natural speech as finished. */
const NATIVE_SILENCE_MS = 2_500
/** A `stopped` with no text this soon after start means the recognizer never really started. */
const NATIVE_STARTUP_GRACE_MS = 600
/**
 * Android fires `onEndOfSpeech` before `onResults`, and network recognition can
 * take a while to deliver the final transcript. Settling any sooner dropped the
 * final (better) result and produced false "no speech" errors.
 */
const NATIVE_FINAL_RESULT_GRACE_MS = 900

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

/**
 * The level meter needs a second getUserMedia capture. That is impossible in the
 * native WebView and risky on mobile web, where it can break the recognizer's own
 * audio capture. In those cases the UI must not show a meter stuck at zero.
 */
export function isMicLevelMeterSupported(): boolean {
  if (typeof window === 'undefined' || isNativePlatform() || isMobileLikeDevice()) return false
  return (
    typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function'
  )
}

/** Live 0..1 input level for the listening UI. No-op on platforms without getUserMedia. */
export async function startMicLevelMeter(onLevel: (level: number) => void): Promise<() => void> {
  if (!isMicLevelMeterSupported()) return () => {}
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

type MappedNativeError = { message: string; retryable: boolean }

function mapNativeError(error: unknown): MappedNativeError {
  // Android reports errors via call.reject with the messages from getErrorText()
  // ("No match", "Network error", "RecognitionService busy", ...), but in
  // partialResults mode the call was already resolved, so those rejects are lost.
  const text = `${getErrorMessage(error)} ${getErrorName(error)}`.toLowerCase()

  if (text.includes('cancel') || text.includes('abort')) {
    return { message: 'Reconocimiento cancelado.', retryable: false }
  }
  if (
    text.includes('not available') ||
    text.includes('not-available') ||
    text.includes('unavailable')
  ) {
    return { message: NATIVE_NOT_AVAILABLE_MESSAGE, retryable: false }
  }
  if (
    text.includes('permission') ||
    text.includes('not allowed') ||
    text.includes('missing permission')
  ) {
    return {
      message: 'Permiso de micrófono denegado. Actívalo en Ajustes → Permisos.',
      retryable: false,
    }
  }
  if (
    text.includes('no match') ||
    text.includes('no speech') ||
    text.includes("didn't understand") ||
    text.includes('did not understand')
  ) {
    return { message: NATIVE_NO_SPEECH_MESSAGE, retryable: true }
  }
  if (text.includes('network') || text.includes('timeout') || text.includes('server')) {
    return {
      message: 'Error de red al usar el reconocimiento de voz. Inténtalo de nuevo.',
      retryable: true,
    }
  }
  if (text.includes('audio')) {
    return {
      message: 'Error con el micrófono. Revisa que esté conectado e inténtalo de nuevo.',
      retryable: true,
    }
  }
  if (text.includes('busy')) {
    return {
      message: 'El servicio de voz está ocupado. Inténtalo de nuevo en un momento.',
      retryable: true,
    }
  }
  return { message: 'No se pudo reconocer la voz. Inténtalo de nuevo.', retryable: true }
}

/** All non-empty transcripts of one recognition result, best-first. */
function getResultTranscripts(result: SpeechRecognitionResultLike | undefined): string[] {
  if (!result) return []
  const transcripts: string[] = []
  for (let index = 0; index < result.length; index += 1) {
    const alternative = result[index]
    const transcript =
      typeof alternative?.transcript === 'string' ? alternative.transcript.trim() : ''
    if (transcript && !transcripts.includes(transcript)) transcripts.push(transcript)
  }
  return transcripts
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

function nativeMatches(matches: string[] | undefined): string[] {
  const result: string[] = []
  for (const match of matches ?? []) {
    const text = typeof match === 'string' ? match.trim() : ''
    if (text && !result.includes(text)) result.push(text)
  }
  return result
}

type NativeAttemptMode = { partialResults: boolean; popup: boolean }

type NativeAttemptResult = {
  transcript: string
  confidence: number
  error?: string
  /** True when a popup retry is worth trying (no permission/not-available/cancel). */
  retryable: boolean
  speechDurationMs?: number
  alternatives: string[]
}

/**
 * One native recognition pass. All listeners are registered *before* start():
 * with partialResults the plugin resolves start() immediately and delivers
 * everything through events, so attaching afterwards races and loses results.
 */
function runNativeAttempt(
  native: NativeSpeechRecognition,
  lang: string,
  timeoutMs: number,
  onPartial: ((text: string) => void) | undefined,
  mode: NativeAttemptMode,
): Promise<NativeAttemptResult> {
  const usePartial = mode.partialResults && typeof native.addListener === 'function'

  return new Promise((resolve) => {
    let isSettled = false
    let lastText = ''
    let firstTextAt: number | null = null
    let lastTextAt: number | null = null
    let stopSignalled = false
    let lastAlternatives: string[] = []
    let silenceId: number | null = null
    let finalResultId: number | null = null
    let timeoutId: number | null = null
    const handles: NativeListenerHandle[] = []
    const startedAt = Date.now()
    activeNativeRecognition = native

    const clearSilenceTimer = () => {
      if (silenceId === null) return
      window.clearTimeout(silenceId)
      silenceId = null
    }

    const clearFinalResultTimer = () => {
      if (finalResultId === null) return
      window.clearTimeout(finalResultId)
      finalResultId = null
    }

    const finish = (
      transcript: string,
      failure?: MappedNativeError,
      alternatives: string[] = lastAlternatives,
    ) => {
      if (isSettled) return
      isSettled = true
      if (timeoutId !== null) window.clearTimeout(timeoutId)
      clearSilenceTimer()
      clearFinalResultTimer()
      if (activeNativeRecognition === native) activeNativeRecognition = null
      for (const handle of handles) {
        void handle.remove().catch(() => undefined)
      }
      resolve({
        transcript,
        confidence: transcript ? 1 : 0,
        error: transcript ? undefined : failure?.message,
        retryable: transcript ? false : Boolean(failure?.retryable),
        speechDurationMs:
          firstTextAt !== null && lastTextAt !== null && lastTextAt > firstTextAt
            ? lastTextAt - firstTextAt
            : undefined,
        alternatives: alternatives.length ? alternatives : transcript ? [transcript] : [],
      })
    }

    const fail = (message: string, error?: unknown) => {
      finish('', error !== undefined ? mapNativeError(error) : { message, retryable: true })
    }

    const stopListening = () => {
      try {
        void native.stop().catch(() => undefined)
      } catch {}
    }

    /** Wait for the final `onResults`, then settle with the best text we heard. */
    const scheduleFinalSettlement = () => {
      clearFinalResultTimer()
      finalResultId = window.setTimeout(() => {
        if (lastText) finish(lastText)
        else fail(NATIVE_NO_SPEECH_MESSAGE)
      }, NATIVE_FINAL_RESULT_GRACE_MS)
    }

    const handlePartialResults = (data: NativeListenerData) => {
      if (!usePartial) return
      const alternatives = nativeMatches(data.matches)
      const text = alternatives[0] ?? ''
      if (!text) return
      lastAlternatives = alternatives
      const now = Date.now()
      if (firstTextAt === null) firstTextAt = now
      lastTextAt = now
      lastText = text
      onPartial?.(text)
      // After stop() the recognizer can still emit its final result; keep the
      // grace window open instead of throwing that better transcript away.
      if (stopSignalled) {
        scheduleFinalSettlement()
        return
      }
      clearFinalResultTimer()
      clearSilenceTimer()
      // Native recognition stays open until stopped: a pause means the user finished.
      silenceId = window.setTimeout(() => {
        stopListening()
        scheduleFinalSettlement()
      }, NATIVE_SILENCE_MS)
    }

    const handleListeningState = (data: NativeListenerData) => {
      if (data.status !== 'stopped') return
      if (mode.popup) return // The system dialog reports its result through start().
      stopSignalled = true
      clearSilenceTimer()
      const elapsed = Date.now() - startedAt
      if (!lastText && elapsed < NATIVE_STARTUP_GRACE_MS) {
        // An instant "stopped" means the recognizer failed to start (missing voice service).
        fail(NATIVE_START_FAILED_MESSAGE)
        return
      }
      // Android fires onEndOfSpeech before onResults; allow the final transcript in.
      scheduleFinalSettlement()
    }

    void (async () => {
      // Register (and await) before start(): in partial mode the plugin resolves
      // start() immediately and delivers everything through these events.
      if (native.addListener) {
        const registrations = await Promise.allSettled([
          native.addListener('partialResults', handlePartialResults),
          native.addListener('listeningState', handleListeningState),
        ])
        for (const registration of registrations) {
          if (registration.status !== 'fulfilled' || !registration.value) continue
          if (isSettled) void registration.value.remove().catch(() => undefined)
          else handles.push(registration.value)
        }
      }
      if (isSettled) return

      timeoutId = window.setTimeout(() => {
        stopListening()
        if (lastText) finish(lastText)
        else fail('Tiempo de espera agotado. Inténtalo de nuevo.')
      }, timeoutMs)

      try {
        const response = await native.start({
          language: lang,
          maxResults: 3,
          prompt: 'Di tu respuesta en inglés',
          partialResults: usePartial,
          popup: mode.popup,
        })
        if (usePartial) return // start() is only an ack; the listeners drive completion.
        const alternatives = nativeMatches(response?.matches)
        if (alternatives[0]) finish(alternatives[0], undefined, alternatives)
        else fail(NATIVE_NO_SPEECH_MESSAGE)
      } catch (error) {
        // With partialResults the native reject arrives after resolve and is lost,
        // so the listeningState/timeout watchdogs above are the real error signal.
        fail('', error)
      }
    })()
  })
}

function toSpeechResult(attempt: NativeAttemptResult): SpeechRecognitionResult {
  return {
    transcript: attempt.transcript,
    confidence: attempt.confidence,
    supported: true,
    error: attempt.error,
    speechDurationMs: attempt.speechDurationMs,
    alternatives: attempt.alternatives,
  }
}

async function recognizeWithNative(
  native: NativeSpeechRecognition,
  lang: string,
  timeoutMs: number,
  onPartial?: (text: string) => void,
): Promise<SpeechRecognitionResult> {
  // Preflight: some ROMs/devices have no speech service at all.
  if (typeof native.available === 'function') {
    try {
      const availability = await native.available()
      if (availability?.available === false) {
        return {
          transcript: '',
          confidence: 0,
          supported: true,
          error: NATIVE_NOT_AVAILABLE_MESSAGE,
        }
      }
    } catch {
      // Best effort: still give start() a chance.
    }
  }

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

  // First pass: direct SpeechRecognizer. With a partial callback it streams results.
  const primary = await runNativeAttempt(native, lang, timeoutMs, onPartial, {
    partialResults: Boolean(onPartial && native.addListener),
    popup: false,
  })
  if (primary.transcript || !primary.retryable) return toSpeechResult(primary)

  // Second pass: the Android system voice-input dialog works on more devices.
  // Permission was already handled above, so this never prompts twice for it.
  try {
    await native.removeAllListeners?.()
  } catch {}
  const fallback = await runNativeAttempt(native, lang, timeoutMs, onPartial, {
    partialResults: false,
    popup: true,
  })
  return toSpeechResult(fallback.transcript || !fallback.error ? fallback : primary)
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
    const finalAlternatives: string[] = []
    let liveTranscript = ''
    let firstHeardAt: number | null = null
    let lastHeardAt: number | null = null
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
        speechDurationMs:
          transcript && firstHeardAt !== null && lastHeardAt !== null && lastHeardAt > firstHeardAt
            ? lastHeardAt - firstHeardAt
            : undefined,
        alternatives: [...new Set([...finalAlternatives, ...(transcript ? [transcript] : [])])],
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
            for (const candidate of getResultTranscripts(result)) {
              if (!finalAlternatives.includes(candidate)) finalAlternatives.push(candidate)
            }
          } else {
            liveTranscript = `${liveTranscript} ${transcript}`.trim()
          }
        }
        const preview = `${finalTranscript} ${liveTranscript}`.trim()
        if (preview) {
          const now = Date.now()
          if (firstHeardAt === null) firstHeardAt = now
          lastHeardAt = now
          onPartial?.(preview)
        }
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
