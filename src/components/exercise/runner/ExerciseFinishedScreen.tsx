import { ArrowLeft, ArrowRight, Award, RotateCcw, Trophy } from 'lucide-preact'
import type { UiStage } from '../../../lib/i18n'
import { tAction } from '../../../lib/i18n'
import { route } from '../../../lib/routes'
import type { Level } from '../../../lib/types'
import Mascot from '../../ui/Mascot'
import type { NextSession } from './utils'

interface Props {
  stage: UiStage
  sessionTitle: string
  next: NextSession | null
  wasComplete: boolean
  solvedCount: number
  total: number
  accuracy: number
  firstAttemptAccuracy?: number
  missedCount?: number
  reviewSkills: string[]
  level?: Level
  levelStats?: { doneSessions: number; sessions: number } | null
  levelDone: boolean
  onRestart: () => void
  onRepeatMissed?: () => void
}

export function ExerciseFinishedScreen({
  stage,
  sessionTitle,
  next,
  wasComplete,
  solvedCount,
  total,
  accuracy,
  firstAttemptAccuracy,
  missedCount = 0,
  reviewSkills,
  level,
  levelStats,
  levelDone,
  onRestart,
  onRepeatMissed,
}: Props) {
  const isLast = !next
  const levelPct =
    levelStats && levelStats.sessions > 0
      ? Math.round((levelStats.doneSessions / levelStats.sessions) * 100)
      : 0
  return (
    <div class="animate-pop overflow-hidden rounded-[26px] bg-base-200 p-1.5">
      <div class="relative overflow-hidden rounded-[20px] bg-base-100 px-6 py-12 text-center sm:px-10">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-accent/[0.07] to-transparent" />
        <div class="relative mx-auto flex justify-center">
          <Mascot mood="finished" size="lg" lines={[tAction(stage, 'mascotFinish')]} />
        </div>
        <p class="mono-label relative mt-5 inline-flex items-center gap-1.5 text-accent/80">
          <Trophy class="h-3.5 w-3.5" /> {tAction(stage, 'sessionCompleted')}
        </p>
        <h3 class="font-pixel relative mx-auto mt-3 max-w-xl text-balance text-[1.9rem] leading-tight tracking-tight sm:text-[2.35rem]">
          {sessionTitle}
        </h3>
        <p class="relative mx-auto mt-3 max-w-md text-sm leading-6 text-base-content/50">
          {tAction(stage, isLast ? 'lastBody' : 'savedBody')}
        </p>

        <div class="relative mx-auto mt-6 grid max-w-md gap-2 sm:grid-cols-3">
          <span class="rounded-full bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-medium text-accent">
            {tAction(stage, wasComplete ? 'sessionReviewed' : 'sessionXp')}
          </span>
          <span class="rounded-full bg-base-200 px-3 py-1.5 font-mono text-[11px] text-base-content/60">
            {tAction(stage, 'sessionAccuracy')} {accuracy}%
          </span>
          {firstAttemptAccuracy !== undefined && (
            <span class="rounded-full bg-base-200 px-3 py-1.5 font-mono text-[11px] text-base-content/45">
              {tAction(stage, 'firstAttemptAccuracy')} {firstAttemptAccuracy}%
            </span>
          )}
          <span class="rounded-full bg-base-200 px-3 py-1.5 font-mono text-[11px] text-base-content/45">
            {solvedCount}/{total} {tAction(stage, 'exercises').toLowerCase()}
          </span>
        </div>

        {reviewSkills.length > 0 && (
          <div class="relative mx-auto mt-4 max-w-md rounded-2xl bg-base-200/60 p-3 text-left">
            <p class="mono-label text-base-content/50">{tAction(stage, 'toReview')}</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              {reviewSkills.map((skill) => (
                <span
                  key={skill}
                  class="rounded-full bg-base-100 px-2.5 py-1 font-mono text-[10px] text-base-content/60"
                >
                  {skill}
                </span>
              ))}
            </div>
            <a
              href={route('/practice?mode=review')}
              class="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-accent/90 hover:text-accent"
            >
              {tAction(stage, 'review')} <ArrowRight class="h-3 w-3" />
            </a>
          </div>
        )}

        {level && levelStats && (
          <div class="relative mx-auto mt-3 max-w-md rounded-2xl bg-base-200/60 p-3 text-left">
            <div class="flex items-center justify-between gap-2">
              <p class="mono-label text-base-content/60">{level}</p>
              <span class="font-mono text-[10px] text-base-content/45">
                {levelStats.doneSessions}/{levelStats.sessions}
              </span>
            </div>
            <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-base-content/[0.07]">
              <div
                class="h-full rounded-full bg-accent/70 transition-all duration-500"
                style={{ width: `${levelPct}%` }}
              />
            </div>
            {levelDone && (
              <a
                href={route(`/certificate?level=${level}`)}
                class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-[11px] font-medium text-accent hover:bg-accent/20"
              >
                <Award class="h-3.5 w-3.5" /> {tAction(stage, 'levelReady')}
              </a>
            )}
          </div>
        )}

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
          {missedCount > 0 && onRepeatMissed && (
            <button
              type="button"
              onClick={onRepeatMissed}
              class="btn btn-ghost btn-sm h-10 gap-2 rounded-xl px-3 text-base-content/55"
            >
              <RotateCcw class="h-3.5 w-3.5" />
              {tAction(stage, 'retryMissed')} ({missedCount})
            </button>
          )}
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
