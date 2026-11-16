import { ArrowLeft, ArrowRight, RotateCcw, Trophy } from 'lucide-preact'
import type { UiStage } from '../../../lib/i18n'
import { tAction } from '../../../lib/i18n'
import { route } from '../../../lib/routes'
import type { NextSession } from './utils'

interface Props {
  stage: UiStage
  sessionTitle: string
  next: NextSession | null
  wasComplete: boolean
  solvedCount: number
  total: number
  onRestart: () => void
}

export function ExerciseFinishedScreen({
  stage,
  sessionTitle,
  next,
  wasComplete,
  solvedCount,
  total,
  onRestart,
}: Props) {
  const isLast = !next
  return (
    <div class="animate-pop overflow-hidden rounded-[26px] bg-base-200 p-1.5">
      <div class="relative overflow-hidden rounded-[20px] bg-base-100 px-6 py-12 text-center sm:px-10">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-accent/[0.07] to-transparent" />
        <div class="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Trophy class="h-7 w-7" />
        </div>
        <p class="mono-label relative mt-5 text-accent/80">{tAction(stage, 'sessionCompleted')}</p>
        <h3 class="font-pixel relative mx-auto mt-3 max-w-xl text-balance text-[1.9rem] leading-tight tracking-tight sm:text-[2.35rem]">
          {sessionTitle}
        </h3>
        <p class="relative mx-auto mt-3 max-w-md text-sm leading-6 text-base-content/50">
          {tAction(stage, isLast ? 'lastBody' : 'savedBody')}
        </p>
        <div class="relative mx-auto mt-6 flex max-w-sm flex-wrap items-center justify-center gap-2">
          <span class="rounded-full bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-medium text-accent">
            {tAction(stage, wasComplete ? 'sessionReviewed' : 'sessionXp')}
          </span>
          <span class="rounded-full bg-base-200 px-3 py-1.5 font-mono text-[11px] text-base-content/45">
            {solvedCount}/{total} {tAction(stage, 'exercises').toLowerCase()}
          </span>
        </div>
        <div class="relative mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          {next && (
            <a
              href={route(`/session/${next.slug}`)}
              class="btn btn-primary btn-sm h-10 gap-2 rounded-xl px-4"
            >
              {tAction(stage, 'next')}: {next.title}
              <ArrowRight class="h-3.5 w-3.5" />
            </a>
          )}
          <a
            href={route('/')}
            class="btn btn-ghost btn-sm h-10 gap-2 rounded-xl px-3 text-base-content/55"
          >
            <ArrowLeft class="h-3.5 w-3.5" />
            {tAction(stage, 'backRoadmap')}
          </a>
          <button
            type="button"
            onClick={onRestart}
            class="btn btn-ghost btn-sm h-10 gap-2 rounded-xl px-3 text-base-content/40"
          >
            <RotateCcw class="h-3.5 w-3.5" />
            {tAction(stage, 'review')}
          </button>
        </div>
      </div>
    </div>
  )
}
