import { act, renderHook } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { VideoCue } from '../../data/learningResources'
import { useTranscriptPlayer } from './useTranscriptPlayer'

const { speakLine, stopTts } = vi.hoisted(() => ({
  speakLine: vi.fn(() => Promise.resolve()),
  stopTts: vi.fn(() => Promise.resolve()),
}))

vi.mock('../../lib/speech', () => ({ speakLine }))
vi.mock('../../lib/speech/preview', () => ({ stopTts }))

const cues: VideoCue[] = [
  { start: 0, end: 2, en: 'First line.' },
  { start: 2, end: 4, en: 'Second line.' },
]

beforeEach(() => {
  vi.useFakeTimers()
  speakLine.mockClear()
  stopTts.mockClear()
})

afterEach(() => vi.useRealTimers())

describe('useTranscriptPlayer', () => {
  it('stays idle while disabled so YouTube keeps ownership', () => {
    const { result } = renderHook(() => useTranscriptPlayer(cues, { enabled: false }))
    expect(result.current.playing).toBe(false)
    expect(result.current.error).toBe(false)
    act(() => result.current.togglePlay())
    expect(result.current.playing).toBe(false)
    expect(speakLine).not.toHaveBeenCalled()
  })

  it('reads lines with TTS and advances through the transcript', () => {
    const { result } = renderHook(() => useTranscriptPlayer(cues, { enabled: true }))
    act(() => result.current.togglePlay())
    expect(result.current.playing).toBe(true)
    expect(speakLine).toHaveBeenCalledWith('First line.')

    act(() => void vi.advanceTimersByTime(2200))
    expect(result.current.time).toBeGreaterThan(2)
    expect(speakLine).toHaveBeenCalledWith('Second line.')
  })

  it('replays the line when looping, even though the active cue does not change', () => {
    const { result } = renderHook(() => useTranscriptPlayer(cues, { enabled: true }))
    act(() => result.current.togglePlay())
    act(() => result.current.toggleLoop())
    expect(speakLine).toHaveBeenCalledTimes(1)

    act(() => void vi.advanceTimersByTime(2_200))
    expect(result.current.time).toBeLessThan(2)
    expect(speakLine).toHaveBeenCalledTimes(2)
  })

  it('signals completion once when the transcript ends', () => {
    const onFinish = vi.fn()
    const { result } = renderHook(() =>
      useTranscriptPlayer(cues, { enabled: true, duration: 4, onFinish }),
    )
    act(() => result.current.seekTo(1.9))
    act(() => result.current.togglePlay())
    act(() => void vi.advanceTimersByTime(2500))
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(result.current.playing).toBe(false)
  })

  it('seeks by cue time and reports progress for resume', () => {
    const onProgress = vi.fn()
    const { result } = renderHook(() =>
      useTranscriptPlayer(cues, { enabled: true, duration: 10, onProgress }),
    )
    act(() => result.current.seekTo(2))
    expect(result.current.activeIndex).toBe(1)
    act(() => result.current.togglePlay())
    act(() => void vi.advanceTimersByTime(200))
    expect(onProgress).toHaveBeenCalled()
  })
})
