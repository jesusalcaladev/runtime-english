export type SpeechEngine = 'system' | 'kokoro'

/** Small per-speaker tweaks so two-avatar conversations sound less flat. */
export type SpeechStyle = {
  pitch?: number
  rateScale?: number
}

export type SpeechLanguage = 'en-US' | 'en-GB'

export type SpeechSettings = {
  ttsEnabled?: boolean
  ttsRate?: number
  ttsEngine?: SpeechEngine
  speechLanguage?: SpeechLanguage
}

export type KokoroStatus = {
  state: 'idle' | 'loading' | 'ready' | 'error'
  progress: number // 0-100 aggregate best-effort
  message: string
  device: 'webgpu' | 'wasm' | null
  error?: string
}

export type SpeechRecognitionResult = {
  transcript: string
  confidence: number
  supported: boolean
  error?: string
}
