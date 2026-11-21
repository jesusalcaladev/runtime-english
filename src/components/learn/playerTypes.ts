/** Contrato común para el reproductor de YouTube y el reproductor offline de transcripción. */
export interface PlayerController {
  activeIndex: number
  time: number
  playing: boolean
  error: boolean
  offset: number
  rate: number
  loopLine: boolean
  autoPause: boolean
  togglePlay(): void
  cycleRate(): void
  toggleLoop(): void
  toggleAutoPause(): void
  changeOffset(delta: number): void
  seekTo(seconds: number): void
}

export interface PlayerOptions {
  enabled?: boolean
  initialPosition?: number
  duration?: number
  onProgress?: (position: number, duration: number) => void
  onFinish?: () => void
}
