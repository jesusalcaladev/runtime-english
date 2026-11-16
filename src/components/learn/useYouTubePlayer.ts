import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { getActiveCueIndex, type VideoCue } from '../../data/learningResources'
import { loadYouTubeApi } from './youtube'

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const

export interface YouTubePlayerController {
  mountRef: { current: HTMLDivElement | null }
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
  initialPosition?: number
  duration?: number
  onProgress?: (position: number, duration: number) => void
}

/** Reproductor de YouTube + estado de sincronización con los subtítulos. */
export function useYouTubePlayer(
  videoId: string,
  cues: VideoCue[],
  options: PlayerOptions = {},
): YouTubePlayerController {
  const mountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<import('./youtube').YTPlayer | null>(null)
  const readyRef = useRef(false)
  const loopRef = useRef(false)
  const offsetRef = useRef(0)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)
  const [offset, setOffset] = useState(0)
  const [rateIndex, setRateIndex] = useState(PLAYBACK_RATES.indexOf(1))
  const [loopLine, setLoopLine] = useState(false)
  const [autoPause, setAutoPause] = useState(false)
  const autoPauseRef = useRef(false)
  const lastCueRef = useRef<number>(-2)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    let cancelled = false
    let interval: number | undefined
    readyRef.current = false
    setTime(0)
    setPlaying(false)

    loadYouTubeApi()
      .then(() => {
        if (cancelled || !mountRef.current || !window.YT) return
        const player = new window.YT.Player(mountRef.current, {
          videoId,
          playerVars: {
            enablejsapi: 1,
            playsinline: 1,
            rel: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => {
              readyRef.current = true
              const resumeAt = optionsRef.current.initialPosition ?? 0
              if (resumeAt > 0) player.seekTo(resumeAt, true)
            },
            onStateChange: (event) => setPlaying(event.data === 1),
            onError: () => setError(true),
          },
        })
        playerRef.current = player
        interval = window.setInterval(() => {
          const current = playerRef.current
          if (!current || !readyRef.current) return
          try {
            const seconds = current.getCurrentTime()
            setTime(seconds)
            optionsRef.current.onProgress?.(seconds, optionsRef.current.duration ?? 0)
            const effective = seconds + offsetRef.current
            const index = getActiveCueIndex(cues, Math.max(0, effective))

            if (autoPauseRef.current && index >= 0) {
              const cue = cues[index]
              if (effective >= cue.end - 0.15 && lastCueRef.current !== index) {
                lastCueRef.current = index
                current.pauseVideo()
                current.seekTo(Math.max(0, cue.start - offsetRef.current), true)
              }
              return
            }
            if (!loopRef.current || index < 0) return
            const cue = cues[index]
            if (effective >= cue.end - 0.2) {
              current.seekTo(Math.max(0, cue.start - offsetRef.current), true)
            }
          } catch {
            // El reproductor aún no está listo; el siguiente tick lo intenta.
          }
        }, 120)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
      if (interval !== undefined) window.clearInterval(interval)
      try {
        playerRef.current?.destroy()
      } catch {
        // Ya fue destruido por YouTube.
      }
      playerRef.current = null
      readyRef.current = false
    }
  }, [videoId, cues])

  const togglePlay = useCallback(() => {
    const player = playerRef.current
    if (!player || !readyRef.current) return
    if (playing) player.pauseVideo()
    else player.playVideo()
  }, [playing])

  const cycleRate = useCallback(() => {
    const nextIndex = (rateIndex + 1) % PLAYBACK_RATES.length
    setRateIndex(nextIndex)
    const nextRate = PLAYBACK_RATES[nextIndex]
    try {
      playerRef.current?.setPlaybackRate(nextRate)
    } catch {
      // Algunos reproductores no soportan todas las velocidades.
    }
  }, [rateIndex])

  const toggleLoop = useCallback(() => {
    setLoopLine((current) => {
      loopRef.current = !current
      return !current
    })
  }, [])

  const toggleAutoPause = useCallback(() => {
    setAutoPause((current) => {
      autoPauseRef.current = !current
      lastCueRef.current = -2
      return !current
    })
  }, [])

  const changeOffset = useCallback((delta: number) => {
    setOffset((current) => {
      const next = current + delta
      offsetRef.current = next
      return next
    })
  }, [])

  const seekTo = useCallback((seconds: number) => {
    try {
      playerRef.current?.seekTo(Math.max(0, seconds - offsetRef.current), true)
    } catch {
      // Reproductor aún no listo.
    }
  }, [])

  return {
    mountRef,
    activeIndex: getActiveCueIndex(cues, Math.max(0, time + offset)),
    time,
    playing,
    error,
    offset,
    rate: PLAYBACK_RATES[rateIndex],
    loopLine,
    autoPause,
    togglePlay,
    cycleRate,
    toggleLoop,
    toggleAutoPause,
    changeOffset,
    seekTo,
  }
}
