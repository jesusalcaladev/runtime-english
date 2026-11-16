import { ArrowLeft, Check, Clock, Play, Search, Sparkles, X } from 'lucide-preact'
import { useMemo, useState } from 'preact/hooks'
import type { VideoLesson } from '../../data/learningResources'
import { useUiStage } from '../../hooks/useUiStage'
import { tAction, type UiStage } from '../../lib/i18n'
import { useProgress } from '../../lib/useProgress'
import { getAllVideoProgress } from '../../lib/videoProgress'
import { getVideoQuizProgress } from '../../lib/videoQuiz'
import VideoLab from './VideoLab'

interface Props {
  lessons: VideoLesson[]
}

type LevelFilter = 'all' | 'mine' | 'a1' | 'b1'

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function VideoCard({
  lesson,
  stage,
  resumePct,
  watched,
  onOpen,
}: {
  lesson: VideoLesson
  stage: UiStage
  resumePct: number
  watched: boolean
  onOpen(): void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      class="group flex flex-col overflow-hidden rounded-3xl bg-base-200 text-left ring-1 ring-base-content/[0.04] transition duration-200 hover:-translate-y-0.5 hover:ring-accent/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div class="relative aspect-video overflow-hidden bg-black">
        <img
          src={`https://i.ytimg.com/vi/${lesson.youtubeId}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          class="h-full w-full object-cover opacity-85 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
        />
        <span class="absolute inset-0 flex items-center justify-center">
          <span class="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/30 backdrop-blur-sm transition group-hover:scale-105 group-hover:bg-accent group-hover:text-accent-content">
            <Play class="h-5 w-5 fill-current" />
          </span>
        </span>
        <span class="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[10px] text-white">
          <Clock class="h-2.5 w-2.5" /> {formatDuration(lesson.durationSeconds)}
        </span>
        <span class="absolute left-2 top-2 rounded-full bg-base-100/85 px-2 py-0.5 font-mono text-[9px] text-base-content/60 backdrop-blur-sm">
          {lesson.level}
        </span>
        {watched && (
          <span class="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[9px] font-medium text-accent-content">
            <Check class="h-2.5 w-2.5" /> {tAction(stage, 'watched')}
          </span>
        )}
        {resumePct > 1 && !watched && (
          <span class="absolute inset-x-0 bottom-0 h-1 bg-black/40">
            <span class="block h-full bg-accent" style={{ width: `${resumePct}%` }} />
          </span>
        )}
      </div>
      <div class="flex flex-1 flex-col gap-2 p-4">
        <p class="mono-label text-accent/75">{lesson.topic}</p>
        <p class="text-[15px] font-semibold leading-snug text-base-content/90 transition group-hover:text-base-content">
          {lesson.title}
        </p>
        <p class="text-[11px] text-base-content/45">{lesson.channel}</p>
        {resumePct > 1 && !watched && (
          <p class="mt-auto pt-1 text-[10px] font-medium text-accent/80">
            {tAction(stage, 'resume')} · {resumePct}%
          </p>
        )}
      </div>
    </button>
  )
}

export default function VideoLibrary({ lessons }: Props) {
  const stage = useUiStage()
  const state = useProgress()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [progressVersion, setProgressVersion] = useState(0)
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [query, setQuery] = useState('')
  void progressVersion // fuerza relectura al volver de un video

  const progress = getAllVideoProgress()
  const diagnostic = state.settings.diagnostic?.level
  const myLevel = diagnostic === 'B1' || diagnostic === 'B2' ? 'B1-B2' : 'A1-A2'

  const stats = useMemo(() => {
    const entries = lessons.map((lesson) => ({
      lesson,
      entry: progress[lesson.id],
      quiz: getVideoQuizProgress(lesson.id),
    }))
    const watched = entries.filter(({ entry }) => entry?.completed).length
    const minutes = Math.round(
      entries.reduce(
        (sum, { entry }) => sum + Math.min(entry?.position ?? 0, entry?.duration ?? 0),
        0,
      ) / 60,
    )
    const withQuiz = entries.filter(({ quiz }) => quiz?.attempts.length)
    const best = withQuiz.reduce((sum, { quiz }) => sum + (quiz?.bestCorrect ?? 0), 0)
    const total = withQuiz.reduce((sum, { quiz }) => sum + (quiz?.attempts[0]?.total ?? 0), 0)
    const accuracy = total ? Math.round((best / total) * 100) : 0
    const resume = entries
      .filter(({ entry }) => entry && !entry.completed && entry.position > 5)
      .sort((a, b) => (b.entry?.updatedAt ?? 0) - (a.entry?.updatedAt ?? 0))[0]
    return { watched, minutes, accuracy, resume }
  }, [lessons, progress])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return lessons.filter((lesson) => {
      const matchesLevel =
        levelFilter === 'all' ||
        (levelFilter === 'mine' && lesson.level === myLevel) ||
        (levelFilter === 'a1' && lesson.level === 'A1-A2') ||
        (levelFilter === 'b1' && lesson.level === 'B1-B2')
      const haystack = `${lesson.title} ${lesson.topic} ${lesson.channel} ${lesson.description}`
      return matchesLevel && haystack.toLowerCase().includes(needle)
    })
  }, [lessons, levelFilter, myLevel, query])

  const active = lessons.find((lesson) => lesson.id === activeId) ?? null
  const resume = stats.resume
  const resumeEntry = resume?.entry
  const resumePct = resumeEntry
    ? Math.round((resumeEntry.position / Math.max(resumeEntry.duration, 1)) * 100)
    : 0

  function open(lessonId: string) {
    setActiveId(lessonId)
  }

  function back() {
    setActiveId(null)
    setProgressVersion((value) => value + 1)
  }

  if (active) {
    return (
      <div class="space-y-4">
        <button
          type="button"
          onClick={back}
          class="inline-flex h-9 items-center gap-1.5 rounded-full bg-base-200 px-3 text-[11px] text-base-content/60 transition hover:text-base-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft class="h-3.5 w-3.5" /> {tAction(stage, 'backToLibrary')}
        </button>
        <VideoLab
          key={active.id}
          lesson={active}
          onProgressChange={() => setProgressVersion((value) => value + 1)}
        />
      </div>
    )
  }

  const filters: { id: LevelFilter; label: string }[] = [
    { id: 'all', label: tAction(stage, 'filterAll') },
    {
      id: 'mine',
      label: `${tAction(stage, 'myLevel')}${diagnostic ? ` · ${diagnostic}` : ''}`,
    },
    { id: 'a1', label: 'A1-A2' },
    { id: 'b1', label: 'B1-B2' },
  ]

  return (
    <section class="space-y-5">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="mono-label text-accent/75">VideoLab</p>
          <h2 class="mt-1 text-[19px] font-semibold tracking-tight text-base-content/90">
            {tAction(stage, 'videoLibrary')}
          </h2>
          <p class="mt-1 text-[12px] text-base-content/45">{tAction(stage, 'chooseVideo')}</p>
        </div>
        <span class="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-[10px] text-accent">
          <Sparkles class="h-3 w-3" />
          {lessons.length} {tAction(stage, 'videosAvailable')}
        </span>
      </div>

      <div class="flex flex-wrap gap-2">
        <span class="flex items-center gap-2 rounded-full bg-base-200 px-3 py-1.5 font-mono text-[10px] text-base-content/55">
          {tAction(stage, 'watched')}{' '}
          <b class="text-accent">
            {stats.watched}/{lessons.length}
          </b>
        </span>
        <span class="flex items-center gap-2 rounded-full bg-base-200 px-3 py-1.5 font-mono text-[10px] text-base-content/55">
          {tAction(stage, 'minutesWatched')} <b class="text-accent">{stats.minutes}</b>
        </span>
        <span class="flex items-center gap-2 rounded-full bg-base-200 px-3 py-1.5 font-mono text-[10px] text-base-content/55">
          {tAction(stage, 'quizAccuracy')} <b class="text-accent">{stats.accuracy}%</b>
        </span>
      </div>

      {resume && (
        <button
          type="button"
          onClick={() => open(resume.lesson.id)}
          class="flex w-full flex-wrap items-center gap-3 rounded-2xl bg-accent/[0.08] p-4 text-left ring-1 ring-accent/20 transition hover:ring-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-content">
            <Play class="h-4 w-4 fill-current" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="mono-label block text-accent/80">
              {tAction(stage, 'continueWatching')}
            </span>
            <span class="mt-0.5 block truncate text-[13px] font-medium text-base-content/85">
              {resume.lesson.title}
            </span>
          </span>
          <span class="font-mono text-[11px] text-accent/80">{resumePct}%</span>
        </button>
      )}

      <div class="flex flex-wrap items-center gap-2">
        <label class="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-xl bg-base-200 px-3 focus-within:ring-2 focus-within:ring-accent/40 sm:max-w-xs">
          <Search class="h-3.5 w-3.5 text-base-content/35" />
          <input
            type="search"
            value={query}
            onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
            placeholder={tAction(stage, 'searchVideos')}
            aria-label={tAction(stage, 'searchVideos')}
            class="w-full bg-transparent text-[11px] text-base-content/80 outline-none placeholder:text-base-content/30"
          />
        </label>
        <fieldset class="flex flex-wrap gap-1.5">
          <legend class="sr-only">{tAction(stage, 'filterByLevel')}</legend>
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setLevelFilter(filter.id)}
              aria-pressed={levelFilter === filter.id}
              class={`h-9 rounded-full px-3 text-[10px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                levelFilter === filter.id
                  ? 'bg-base-content text-base-100'
                  : 'bg-base-200 text-base-content/55 hover:text-base-content'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </fieldset>
      </div>

      {visible.length === 0 ? (
        <div class="rounded-2xl bg-base-200/70 p-8 text-center">
          <X class="mx-auto h-5 w-5 text-base-content/30" />
          <p class="mt-2 text-[13px] text-base-content/60">{tAction(stage, 'noVideoMatch')}</p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setLevelFilter('all')
            }}
            class="btn btn-sm mt-3 rounded-xl bg-base-100"
          >
            {tAction(stage, 'clearFilters')}
          </button>
        </div>
      ) : (
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((lesson) => {
            const entry = progress[lesson.id]
            return (
              <VideoCard
                key={lesson.id}
                lesson={lesson}
                stage={stage}
                watched={Boolean(entry?.completed)}
                resumePct={
                  entry?.duration ? Math.round((entry.position / entry.duration) * 100) : 0
                }
                onOpen={() => open(lesson.id)}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
