import type { SpeechSettings } from './types'

const SETTINGS_STORAGE_KEYS = ['runtimeenglish_v3', 'runtimeenglish_v2'] as const

const TTS_RATE_MIN = 0.5
const TTS_RATE_MAX = 2
const DEFAULT_TTS_RATE = 1

type SettingsEnvelope = {
  state?: unknown
  settings?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSpeechSettings(value: unknown): value is SpeechSettings {
  return isRecord(value)
}

function extractSpeechSettings(rawValue: string): SpeechSettings | null {
  let parsed: unknown

  try {
    parsed = JSON.parse(rawValue)
  } catch (error) {
    // Invalid JSON in this storage key; try the next known key.
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      console.debug('Skipping invalid speech settings JSON in storage.', error)
    }
    return null
  }

  if (!isRecord(parsed)) {
    return null
  }

  const envelope = parsed as SettingsEnvelope
  const stateCandidate = isRecord(envelope.state) ? envelope.state : envelope
  const settingsCandidate = isRecord(stateCandidate)
    ? (stateCandidate as { settings?: unknown }).settings
    : undefined

  return isSpeechSettings(settingsCandidate) ? settingsCandidate : null
}

export function readStoredSpeechSettings(): SpeechSettings | null {
  if (typeof window === 'undefined') {
    return null
  }

  for (const key of SETTINGS_STORAGE_KEYS) {
    try {
      const rawValue = window.localStorage.getItem(key)
      if (!rawValue) continue

      const settings = extractSpeechSettings(rawValue)
      if (settings) {
        return settings
      }
    } catch (error) {
      // Storage access can fail (privacy mode/quota/restricted contexts). Continue with fallbacks.
      if (typeof console !== 'undefined' && typeof console.debug === 'function') {
        console.debug(`Failed to read speech settings from storage key "${key}".`, error)
      }
    }
  }

  return null
}

export function isSpeechEnabled(): boolean {
  return readStoredSpeechSettings()?.ttsEnabled !== false
}

export function getSpeechPitch(): number {
  const pitch = readStoredSpeechSettings()?.ttsPitch
  if (typeof pitch !== 'number' || !Number.isFinite(pitch)) return 1
  return Math.min(TTS_RATE_MAX, Math.max(TTS_RATE_MIN, pitch))
}

export function getPreferredVoiceName(): string | null {
  const name = readStoredSpeechSettings()?.ttsVoiceName?.trim()
  return name || null
}

export function getSpeechEngine(): 'system' | 'kokoro' | 'piper' {
  const engine = readStoredSpeechSettings()?.ttsEngine
  return engine === 'kokoro' || engine === 'piper' ? engine : 'system'
}

export function getSpeechLanguage(): 'en-US' | 'en-GB' {
  return readStoredSpeechSettings()?.speechLanguage === 'en-GB' ? 'en-GB' : 'en-US'
}

export function getSpeechRate(): number {
  const rate = readStoredSpeechSettings()?.ttsRate
  if (typeof rate !== 'number' || !Number.isFinite(rate)) {
    return DEFAULT_TTS_RATE
  }

  return Math.min(TTS_RATE_MAX, Math.max(TTS_RATE_MIN, rate))
}

export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const capacitor = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor
    return typeof capacitor?.isNativePlatform === 'function' ? capacitor.isNativePlatform() : false
  } catch (error) {
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      console.debug('Failed to detect native platform for speech.', error)
    }
    return false
  }
}

export function isMobileLikeDevice(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const userAgent = navigator.userAgent ?? ''
    const isMobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)
    const hasCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false
    const shortestViewportSide = Math.min(window.innerWidth || 0, window.innerHeight || 0)
    const isNarrowViewport = shortestViewportSide > 0 && shortestViewportSide <= 900

    return isMobileUserAgent || (hasCoarsePointer && isNarrowViewport)
  } catch (error) {
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      console.debug('Failed to detect mobile-like device for speech.', error)
    }
    return false
  }
}

export function isConstrainedDevice(): boolean {
  return isNativePlatform() || isMobileLikeDevice()
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function normalizeSpeechText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}
