declare module 'piper-tts-web' {
  export class OnnxWebRuntime {
    constructor(options?: { basePath?: string; numThreads?: number })
    destroy(): void
  }
  export class PhonemizeWebRuntime {
    constructor(options?: { basePath?: string })
    destroy(): void
  }
  export class HuggingFaceVoiceProvider {
    constructor(options?: { baseUrl?: string })
    destroy(): void
  }
  export class PiperWebEngine {
    constructor(options?: Record<string, unknown>)
    generate(
      text: string,
      voice: string,
      speaker?: number,
    ): Promise<{ file: Blob; duration: number; phonemeData: unknown }>
    destroy(): void
  }
}
