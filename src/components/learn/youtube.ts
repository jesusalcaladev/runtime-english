/** Tipos mínimos de la YouTube IFrame API que realmente usa el VideoLab. */
export interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  setPlaybackRate(rate: number): void
  destroy(): void
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: () => void
        onStateChange?: (event: { data: number }) => void
        onError?: (event: { data: number }) => void
      }
    },
  ) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

const API_URL = 'https://www.youtube.com/iframe_api'
const LOAD_TIMEOUT_MS = 12_000

let loader: Promise<void> | null = null

/**
 * Carga el script de YouTube una sola vez. Si falla, limpia el estado para que
 * un siguiente montaje pueda reintentarlo.
 */
export function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no-window'))
  if (window.YT?.Player) return Promise.resolve()
  if (loader) return loader

  loader = new Promise<void>((resolve, reject) => {
    let settled = false
    let timeout: number
    const previousCallback = window.onYouTubeIframeAPIReady

    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      if (error) {
        loader = null
        reject(error)
      } else {
        resolve()
      }
    }

    timeout = window.setTimeout(() => finish(new Error('YouTube API timeout')), LOAD_TIMEOUT_MS)

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.()
      finish()
    }

    const script = document.createElement('script')
    script.src = API_URL
    script.async = true
    script.onerror = () => finish(new Error('YouTube API script error'))
    document.head.appendChild(script)
  })

  return loader
}
