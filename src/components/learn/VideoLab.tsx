import {
  BookmarkCheck,
  Check,
  ExternalLink,
  Gauge,
  LocateFixed,
  Pause,
  Play,
  Repeat2,
  Search,
} from 'lucide-preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { VideoLesson } from '../../data/learningResources'
import { useUiStage } from '../../hooks/useUiStage'
import { tAction } from '../../lib/i18n'
import { getVideoProgress, markVideoCompleted, saveVideoProgress } from '../../lib/videoProgress'
import SubtitleList from './SubtitleList'
import { useYouTubePlayer } from './useYouTubePlayer'
import VideoComprehension from './VideoComprehension'
import VideoPhraseReview from './VideoPhraseReview'

interface Props {
  lesson: VideoLesson
  onProgressChange?: () => void
}

export default function VideoLab({ lesson, onProgressChange }: Props) {
  const stage = useUiStage()
  const saved = useMemo(() => getVideoProgress(lesson.id), [lesson.id])
  const lastSaveRef = useRef(0)
  const [watched, setWatched] = useState(Boolean(saved?.completed))
  const [query, setQuery] = useState('')
  const [shadowLine, setShadowLine] = useState<number | null>(null)
  const [shadowScore, setShadowScore] = useState<number | null>(null)
  const [follow, setFollow] = useState(true)

  const {
    mountRef,
    activeIndex,
    playing,
    error,
    offset,
    rate,
    loopLine,
    togglePlay,
    cycleRate,
    toggleLoop,
    changeOffset,
    seekTo,
    time,
  } = useYouTubePlayer(lesson.youtubeId, lesson.cues, {
    initialPosition: saved?.completed ? 0 : saved?.position,
    duration: lesson.durationSeconds,
    onProgress: (position, duration) => {
      const now = Date.now()
      if (position < 1 || now - lastSaveRef.current < 5000) return
      lastSaveRef.current = now
      saveVideoProgress(lesson.id, {
        position,
        duration: duration || lesson.durationSeconds,
        completed: false,
        updatedAt: now,
      })
      onProgressChange?.()
    },
  })

  useEffect(() => {
    setWatched(Boolean(getVideoProgress(lesson.id)?.completed))
    setQuery('')
    setShadowLine(null)
    setShadowScore(null)
  }, [lesson.id])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || error) return
      const target = event.target
      if (
        target instanceof Element &&
        target.closest("button, a, input, textarea, select, [contenteditable='true']")
      )
        return
      if (event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        changeOffset(-5)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        changeOffset(5)
      } else if (event.key.toLowerCase() === 'f') {
        setFollow((current) => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [error, togglePlay, changeOffset])

  const visibleCues = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return lesson.cues
    return lesson.cues.filter((cue) => `${cue.en} ${cue.es ?? ''}`.toLowerCase().includes(needle))
  }, [lesson.cues, query])

  async function repeatLine(index: number, text: string) {
    setShadowLine(index)
    setShadowScore(null)
    try {
      const { recognizeOnce, speechMatchScore } = await import('../../lib/speech')
      const result = await recognizeOnce()
      setShadowScore(
        result.supported ? Math.round(speechMatchScore(text, result.transcript) * 100) : null,
      )
    } catch {
      setShadowScore(null)
    }
  }

  function complete() {
    markVideoCompleted(lesson.id, lesson.durationSeconds)
    setWatched(true)
    onProgressChange?.()
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${lesson.youtubeId}`
  const progressPct = Math.min(
    100,
    Math.round((Math.max(time, saved?.position ?? 0) / Math.max(lesson.durationSeconds, 1)) * 100),
  )

  return (
    <section class="rounded-3xl bg-base-200/60 p-4 ring-1 ring-base-content/[0.04] sm:p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="mono-label text-accent/80">{lesson.topic}</p>
          <h3 class="mt-1 text-[17px] font-semibold tracking-tight text-base-content/90">
            {lesson.title}
          </h3>
          <p class="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-base-content/50">
            <span>{lesson.channel}</span>
            <span>·</span>
            <span>{lesson.level}</span>
            <span>·</span>
            <span>{tAction(stage, 'fullVideo')}</span>
            {watched && (
              <span class="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[9px] text-accent">
                <BookmarkCheck class="h-3 w-3" /> {tAction(stage, 'watched')}
              </span>
            )}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={complete}
            disabled={watched}
            class="inline-flex h-8 items-center gap-1.5 rounded-full bg-base-100 px-3 text-[11px] text-base-content/60 transition hover:text-base-content disabled:opacity-40"
          >
            <Check class="h-3.5 w-3.5" /> {tAction(stage, 'markWatched')}
          </button>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-8 items-center gap-1.5 rounded-full bg-base-100 px-3 text-[11px] text-base-content/55 transition hover:text-base-content"
          >
            <ExternalLink class="h-3.5 w-3.5" /> YouTube
          </a>
        </div>
      </div>

      <p class="mt-3 text-[13px] leading-relaxed text-base-content/65">{lesson.description}</p>

      <div class="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div class="space-y-3">
          {error ? (
            <div class="rounded-2xl bg-base-100 p-5 text-center">
              <p class="text-[13px] text-base-content/70">{tAction(stage, 'playerUnavailable')}</p>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-sm btn-primary mt-3 rounded-xl"
              >
                {tAction(stage, 'openYoutube')}
              </a>
            </div>
          ) : (
            <div class="overflow-hidden rounded-2xl bg-black">
              <div ref={mountRef} class="aspect-video w-full" />
            </div>
          )}

          <div class="flex items-center gap-2">
            <div class="h-1 flex-1 overflow-hidden rounded-full bg-base-300">
              <div
                class="h-full rounded-full bg-accent transition-[width] duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span class="font-mono text-[10px] text-base-content/40">{progressPct}%</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={error}
              class="inline-flex h-8 items-center gap-1.5 rounded-full bg-accent/12 px-3 text-[11px] font-medium text-accent transition hover:bg-accent/20 disabled:opacity-40"
            >
              {playing ? <Pause class="h-3.5 w-3.5" /> : <Play class="h-3.5 w-3.5" />}
              {tAction(stage, playing ? 'pause' : 'play')}
            </button>
            <button
              type="button"
              onClick={cycleRate}
              disabled={error}
              class="inline-flex h-8 items-center gap-1.5 rounded-full bg-base-100 px-3 text-[11px] text-base-content/60 transition hover:text-base-content disabled:opacity-40"
              title={tAction(stage, 'speed')}
            >
              <Gauge class="h-3.5 w-3.5" /> {rate}×
            </button>
            <button
              type="button"
              onClick={toggleLoop}
              aria-pressed={loopLine}
              disabled={error}
              class={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] transition disabled:opacity-40 ${loopLine ? 'bg-accent/15 text-accent' : 'bg-base-100 text-base-content/60 hover:text-base-content'}`}
              title={tAction(stage, 'repeatLine')}
            >
              <Repeat2 class="h-3.5 w-3.5" /> {tAction(stage, 'repeatLine')}
            </button>
            <button
              type="button"
              onClick={() => setFollow((current) => !current)}
              aria-pressed={follow}
              class={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] transition ${follow ? 'bg-accent/15 text-accent' : 'bg-base-100 text-base-content/60 hover:text-base-content'}`}
              title={tAction(stage, 'follow')}
            >
              <LocateFixed class="h-3.5 w-3.5" /> {tAction(stage, 'follow')}
            </button>
            <div class="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeOffset(-5)}
                class="h-8 rounded-full bg-base-100 px-2.5 font-mono text-[11px] text-base-content/55 transition hover:text-base-content"
                title="−5s"
              >
                −5s
              </button>
              <span class="font-mono text-[10px] text-base-content/35">
                {offset >= 0 ? `+${offset}` : offset}s
              </span>
              <button
                type="button"
                onClick={() => changeOffset(5)}
                class="h-8 rounded-full bg-base-100 px-2.5 font-mono text-[11px] text-base-content/55 transition hover:text-base-content"
                title="+5s"
              >
                +5s
              </button>
            </div>
          </div>
          <p class="hidden px-1 text-[10px] text-base-content/30 sm:block">
            {tAction(stage, 'keyboardHint')}
          </p>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2 px-1">
            <p class="mono-label text-base-content/40" aria-live="polite">
              {tAction(stage, 'subtitlesTitle')}
            </p>
            <p class="font-mono text-[10px] text-base-content/30">
              {activeIndex >= 0 ? `${activeIndex + 1}/${lesson.cues.length}` : lesson.cues.length}
            </p>
          </div>
          <label class="flex h-9 items-center gap-2 rounded-xl bg-base-100 px-3">
            <Search class="h-3.5 w-3.5 text-base-content/35" />
            <input
              type="search"
              value={query}
              onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
              placeholder={tAction(stage, 'searchTranscript')}
              aria-label={tAction(stage, 'searchTranscript')}
              class="w-full bg-transparent text-[11px] text-base-content/80 outline-none placeholder:text-base-content/30"
            />
          </label>
          {visibleCues.length === 0 ? (
            <div class="rounded-2xl bg-base-100 p-4 text-center text-[12px] text-base-content/50">
              {tAction(stage, 'noCueMatch')}
            </div>
          ) : (
            <SubtitleList
              cues={visibleCues}
              activeIndex={activeIndex}
              playing={playing}
              follow={follow}
              onSeek={seekTo}
              onShadow={repeatLine}
              shadowLine={shadowLine}
              shadowScore={shadowScore}
              listening={tAction(stage, 'listening')}
              shadowLabel={tAction(stage, 'shadowLine')}
              matchLabel={tAction(stage, 'matchPercent')}
            />
          )}
          <p class="px-1 text-[11px] leading-relaxed text-base-content/40">
            {tAction(stage, 'subtitlesNote')}
          </p>
          <VideoPhraseReview cues={lesson.cues} />
          <VideoComprehension
            questions={lesson.questions}
            stage={stage}
            title={tAction(stage, 'comprehension')}
            tip={tAction(stage, 'comprehensionTip')}
          />
        </div>
      </div>
    </section>
  )
}
