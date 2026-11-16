import { ArrowLeft, Play, Sparkles } from 'lucide-preact'
import { useState } from 'preact/hooks'
import type { VideoLesson } from '../../data/learningResources'
import { useUiStage } from '../../hooks/useUiStage'
import { tAction } from '../../lib/i18n'
import { getAllVideoProgress } from '../../lib/videoProgress'
import VideoLab from './VideoLab'

interface Props {
  lessons: VideoLesson[]
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export default function VideoLibrary({ lessons }: Props) {
  const stage = useUiStage()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [progressVersion, setProgressVersion] = useState(0)
  const progress = getAllVideoProgress()
  void progressVersion // fuerza relectura al volver de un video

  const active = lessons.find((lesson) => lesson.id === activeId) ?? null

  if (active) {
    return (
      <div class="space-y-4">
        <button
          type="button"
          onClick={() => {
            setActiveId(null)
            setProgressVersion((value) => value + 1)
          }}
          class="inline-flex h-8 items-center gap-1.5 rounded-full bg-base-200 px-3 text-[11px] text-base-content/60 transition hover:text-base-content"
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

  return (
    <section class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p class="mono-label text-base-content/45">VideoLab</p>
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

      <div class="grid gap-4 sm:grid-cols-2">
        {lessons.map((lesson) => {
          const entry = progress[lesson.id]
          const watched = Boolean(entry?.completed)
          const resumePct = entry?.duration
            ? Math.min(100, Math.round((entry.position / entry.duration) * 100))
            : 0
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => setActiveId(lesson.id)}
              class="group overflow-hidden rounded-3xl bg-base-200 text-left ring-1 ring-base-content/[0.04] transition hover:ring-accent/30"
            >
              <div class="relative aspect-video overflow-hidden bg-black">
                <img
                  src={`https://i.ytimg.com/vi/${lesson.youtubeId}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  class="h-full w-full object-cover opacity-85 transition group-hover:scale-[1.03] group-hover:opacity-100"
                />
                <span class="absolute inset-0 flex items-center justify-center">
                  <span class="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/30 transition group-hover:bg-accent group-hover:text-accent-content">
                    <Play class="h-5 w-5 fill-current" />
                  </span>
                </span>
                <span class="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[10px] text-white">
                  {formatDuration(lesson.durationSeconds)}
                </span>
                {watched && (
                  <span class="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[9px] font-medium text-accent-content">
                    ✓ {tAction(stage, 'watched')}
                  </span>
                )}
              </div>
              <div class="space-y-2 p-4">
                <p class="mono-label text-accent/75">{lesson.topic}</p>
                <p class="text-[15px] font-semibold leading-snug text-base-content/90">
                  {lesson.title}
                </p>
                <p class="text-[11px] text-base-content/45">
                  {lesson.channel} · {lesson.level}
                </p>
                {!watched && resumePct > 1 && (
                  <div class="flex items-center gap-2">
                    <div class="h-1 flex-1 overflow-hidden rounded-full bg-base-300">
                      <div
                        class="h-full rounded-full bg-accent"
                        style={{ width: `${resumePct}%` }}
                      />
                    </div>
                    <span class="font-mono text-[10px] text-base-content/40">{resumePct}%</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
