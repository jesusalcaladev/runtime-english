import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { getActiveCueIndex, type VideoCue } from '../../data/learningResources'
import { speakLine } from '../../lib/speech'
import { stopTts } from '../../lib/speech/preview'
import type { PlayerController, PlayerOptions } from './playerTypes'

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const
const TICK_MS = 100

/**
 * Reproductor sin red: avanza por los tiempos de la transcripción y lee cada línea
 * con el motor TTS ya instalado en la app. Expone el mismo contrato que YouTube
 * para que VideoLab no tenga que ramificar su UI.
 */
export function useTranscriptPlayer(
  cues: VideoCue[],
  options: PlayerOptions = {},
): PlayerController {
  const enabled = options.enabled === true
  const end = useMemo(() => (cues.length ? cues[cues.length - 1].end : 0), [cues])
  const [time, setTime] = useState(() => Math.max(0, options.initialPosition ?? 0))
  const [playing, setPlaying] = useState(false)
  const [rateIndex, setRateIndex] = useState(PLAYBACK_RATES.indexOf(1))
  const [offset, setOffset] = useState(0)
  const [loopLine, setLoopLine] = useState(false)
  const [autoPause, setAutoPause] = useState(false)
  // Looping or seeking inside the same cue must replay its TTS even though the
  // active index does not change.
  const [speechRun, setSpeechRun] = useState(0)

  const timeRef = useRef(time)
  const rateRef = useRef(PLAYBACK_RATES[rateIndex])
  const offsetRef = useRef(0)
  const loopRef = useRef(false)
  const autoPauseRef = useRef(false)
  const finishedRef = useRef(false)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const activeIndex = getActiveCueIndex(cues, Math.max(0, time + offset))

  useEffect(() => {
    if (!enabled) {
      setPlaying(false)
      return
    }
    if (!playing) return

    const interval = window.setInterval(() => {
      const index = getActiveCueIndex(cues, Math.max(0, timeRef.current))
      if (index < 0) {
        timeRef.current = cues[0]?.start ?? 0
        setTime(timeRef.current)
        return
      }
      const cue = cues[index]
      timeRef.current += (TICK_MS / 1000) * rateRef.current
      setTime(timeRef.current)
      optionsRef.current.onProgress?.(timeRef.current, optionsRef.current.duration ?? end)

      if (timeRef.current < cue.end) return
      if (loopRef.current) {
        timeRef.current = cue.start
        setSpeechRun((run) => run + 1)
      } else if (autoPauseRef.current) {
        timeRef.current = cue.start
        setPlaying(false)
        void stopTts()
      } else if (index + 1 < cues.length) {
        timeRef.current = cues[index + 1].start
      } else {
        timeRef.current = cue.end
        setPlaying(false)
        if (!finishedRef.current) {
          finishedRef.current = true
          optionsRef.current.onFinish?.()
        }
      }
      setTime(timeRef.current)
    }, TICK_MS)

    return () => window.clearInterval(interval)
  }, [enabled, playing, cues, end])

  useEffect(() => {
    if (!enabled || !playing || activeIndex < 0) return
    void stopTts()
    void speakLine(cues[activeIndex].en)
  }, [activeIndex, enabled, playing, cues, speechRun])

  useEffect(() => {
    if (!enabled) return
    const onVisibility = () => {
      if (document.hidden) {
        setPlaying(false)
        void stopTts()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [enabled])

  useEffect(
    () => () => {
      void stopTts()
    },
    [],
  )

  const togglePlay = useCallback(() => {
    if (!enabled) return
    setPlaying((current) => {
      if (current) {
        void stopTts()
      } else {
        if (timeRef.current >= (optionsRef.current.duration ?? end) - 0.5) {
          timeRef.current = 0
          setTime(0)
          finishedRef.current = false
        }
      }
      return !current
    })
  }, [enabled, end])

  const cycleRate = useCallback(() => {
    setRateIndex((current) => {
      const next = (current + 1) % PLAYBACK_RATES.length
      rateRef.current = PLAYBACK_RATES[next]
      return next
    })
  }, [])

  const toggleLoop = useCallback(() => {
    setLoopLine((current) => {
      loopRef.current = !current
      return !current
    })
  }, [])

  const toggleAutoPause = useCallback(() => {
    setAutoPause((current) => {
      autoPauseRef.current = !current
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
    timeRef.current = Math.max(0, seconds - offsetRef.current)
    setTime(timeRef.current)
    setSpeechRun((run) => run + 1)
    finishedRef.current = false
  }, [])

  return {
    activeIndex,
    time,
    playing,
    error: false,
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
