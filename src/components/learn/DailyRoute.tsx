import { ArrowRight, Brain, Check, Play, RotateCcw, Sparkles, X } from 'lucide-preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { VideoLesson } from '../../data/learningResources'
import { useUiStage } from '../../hooks/useUiStage'
import { buildDailyRoute, type DailyRouteStep, localDateKey } from '../../lib/dailyRoute'
import { tAction } from '../../lib/i18n'
import { type PhrasebookEntry, phraseId, progressStore } from '../../lib/progress'
import { useProgress } from '../../lib/useProgress'

interface Props {
  lessons: VideoLesson[]
  onOpenLesson(lessonId: string): void
}

function stepLabel(stage: 'es' | 'mixed' | 'en', step: DailyRouteStep): string {
  switch (step.kind) {
    case 'phrases':
      return step.value > 0
        ? `${tAction(stage, 'dailyRoutePhrases')} (${step.value})`
        : tAction(stage, 'dailyRouteFree')
    case 'resume':
      return `${tAction(stage, 'dailyRouteResume')} · ${step.value}%`
    case 'quiz':
      return `${tAction(stage, 'dailyRouteQuiz')} · ${step.value}%`
    default:
      return tAction(stage, 'dailyRouteNew')
  }
}

function stepValue(stage: 'es' | 'mixed' | 'en', step: DailyRouteStep): string {
  if (step.kind === 'resume') return tAction(stage, 'dailyRouteResumeValue')
  if (step.kind === 'quiz') return tAction(stage, 'dailyRouteQuizValue')
  return `${step.minutes} ${tAction(stage, 'dailyRouteMin')}`
}

export default function DailyRoute({ lessons, onOpenLesson }: Props) {
  const stage = useUiStage()
  const state = useProgress()
  const [today] = useState(() => Date.now())
  const [reviewing, setReviewing] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [steps, setSteps] = useState<DailyRouteStep[]>([])
  const todayKey = localDateKey(today)
  const done = state.dailyRoute?.date === todayKey ? (state.dailyRoute.done ?? []) : []

  const diagnostic = state.settings.diagnostic?.level
  const level =
    diagnostic === 'C1' || diagnostic === 'C2'
      ? 'B1-B2'
      : diagnostic === 'B1' || diagnostic === 'B2'
        ? 'B1-B2'
        : 'A1-A2'

  const duePhrases = useMemo(
    () =>
      Object.values(state.phrasebook ?? {}).filter(
        (entry) => entry.saved !== false && entry.due <= today,
      ).length,
    [state.phrasebook, today],
  )

  useEffect(() => {
    const cached = state.dailyRoute
    if (cached?.date === todayKey && cached.steps.length) {
      setSteps(cached.steps)
      return
    }
    const built = buildDailyRoute({
      now: today,
      dailyMinutes: state.settings.plan?.dailyMinutes ?? 15,
      level,
      lessons,
      progress: state.videoLab?.progress ?? {},
      quiz: state.videoLab?.quiz ?? {},
      duePhrases,
    })
    progressStore.saveDailyRoute(built)
    setSteps(built)
  }, [
    today,
    todayKey,
    state.dailyRoute,
    state.settings.plan,
    state.videoLab,
    level,
    lessons,
    duePhrases,
  ])

  const dueCards = useMemo(
    () =>
      (Object.values(state.phrasebook ?? {}) as PhrasebookEntry[])
        .filter((entry) => entry.saved !== false && entry.due <= today)
        .slice(0, 12),
    [state.phrasebook, today],
  )

  function start(step: DailyRouteStep) {
    if (step.kind === 'phrases') {
      setReviewing(true)
      setCardIndex(0)
      setRevealed(false)
      setReviewed(0)
      return
    }
    if (step.lessonId) onOpenLesson(step.lessonId)
  }

  function answer(correct: boolean) {
    const card = dueCards[cardIndex]
    if (!card) return
    progressStore.reviewPhrase(phraseId(card.en), correct)
    setReviewed((value) => value + 1)
    setRevealed(false)
    setCardIndex((value) => value + 1)
    if (cardIndex + 1 >= dueCards.length) {
      const phraseStep = steps.find((step) => step.kind === 'phrases')
      if (phraseStep) toggleDone(phraseStep.id, true)
    }
  }

  function toggleDone(id: string, value?: boolean) {
    const isDone = value ?? !done.includes(id)
    const next = isDone ? [...done, id] : done.filter((item) => item !== id)
    progressStore.setDailyRouteDone(next)
  }

  function regenerate() {
    progressStore.resetDailyRoute()
    setSteps([])
    setReviewing(false)
  }

  const card = dueCards[cardIndex]

  return (
    <section class="rounded-3xl bg-accent/[0.05] p-4 ring-1 ring-accent/15 sm:p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="mono-label text-accent/80">{tAction(stage, 'nextStep')}</p>
          <h2 class="mt-1 text-[19px] font-semibold tracking-tight text-base-content/90">
            {tAction(stage, 'todayRoutine')}
          </h2>
          <p class="mt-1 text-[12px] leading-relaxed text-base-content/55">
            {tAction(stage, 'dailyRouteHint')}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="flex items-center gap-1.5 rounded-full bg-accent/12 px-3 py-1.5 text-[10px] font-medium text-accent">
            <Sparkles class="h-3 w-3" /> {steps.length}
          </span>
          <button
            type="button"
            onClick={regenerate}
            class="inline-flex h-8 items-center gap-1.5 rounded-full bg-base-100/70 px-3 text-[10px] text-base-content/55 transition hover:text-base-content"
            aria-label={tAction(stage, 'regeneratePlan')}
            title={tAction(stage, 'regeneratePlan')}
          >
            <RotateCcw class="h-3 w-3" />
            {tAction(stage, 'regeneratePlan')}
          </button>
        </div>
      </div>

      <ol class="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const isDone = done.includes(step.id)
          return (
            <li
              key={step.id}
              class={`relative flex flex-col rounded-2xl bg-base-100/80 p-3 ring-1 transition ${isDone ? 'ring-accent/30' : 'ring-base-content/[0.04] hover:ring-accent/35'}`}
            >
              <button
                type="button"
                onClick={() => start(step)}
                aria-label={`${tAction(stage, 'startStep')} ${index + 1}: ${stepLabel(stage, step)}`}
                title={stepLabel(stage, step)}
                class="group flex flex-1 flex-col text-left"
              >
                <span class="flex items-center justify-between gap-2">
                  <span class="font-mono text-[10px] text-accent/70">0{index + 1}</span>
                  {step.kind === 'phrases' ? (
                    <Brain class="h-3.5 w-3.5 text-accent/70" />
                  ) : step.kind === 'new' ? (
                    <Sparkles class="h-3.5 w-3.5 text-accent/70" />
                  ) : (
                    <Play class="h-3.5 w-3.5 text-accent/70" />
                  )}
                </span>
                <span class="mt-2 line-clamp-2 text-[12px] font-medium leading-snug text-base-content/85">
                  {stepLabel(stage, step)}
                </span>
                <span class="mt-1 font-mono text-[10px] text-base-content/40">
                  {stepValue(stage, step)}
                </span>
                <span class="mt-auto flex items-center gap-1 pt-2 text-[10px] font-medium text-accent/70 group-hover:text-accent">
                  {step.kind === 'phrases'
                    ? tAction(stage, 'reviewStep')
                    : tAction(stage, 'startStep')}
                  <ArrowRight class="h-3 w-3" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleDone(step.id)}
                aria-label={`${tAction(stage, 'markStepDone')} ${index + 1}`}
                aria-pressed={isDone}
                title={isDone ? tAction(stage, 'stepDone') : tAction(stage, 'markStepDone')}
                class={`mt-2 inline-flex h-7 items-center justify-center gap-1.5 rounded-full text-[10px] font-medium transition ${isDone ? 'bg-accent/15 text-accent' : 'bg-base-200 text-base-content/45 hover:text-base-content'}`}
              >
                <Check class="h-3 w-3" />
                {isDone ? tAction(stage, 'stepDone') : tAction(stage, 'markStepDone')}
              </button>
            </li>
          )
        })}
      </ol>

      {reviewing && (
        <div class="mt-3 rounded-2xl bg-base-100/80 p-4 ring-1 ring-accent/15">
          <div class="flex items-center justify-between gap-2">
            <p class="mono-label text-accent/80">{tAction(stage, 'dailyRoutePhrases')}</p>
            <button
              type="button"
              onClick={() => setReviewing(false)}
              class="flex h-7 w-7 items-center justify-center rounded-full text-base-content/40 transition hover:bg-base-200 hover:text-base-content"
              aria-label={tAction(stage, 'closeReview')}
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </div>
          {!card ? (
            <div class="mt-3 text-center">
              <p class="text-[13px] text-base-content/75">
                {tAction(stage, 'reviewedCount')} {reviewed}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCardIndex(0)
                  setRevealed(false)
                  setReviewed(0)
                }}
                class="btn btn-sm mt-2 gap-1.5 rounded-xl bg-base-200"
              >
                <RotateCcw class="h-3.5 w-3.5" /> {tAction(stage, 'repeatTest')}
              </button>
            </div>
          ) : (
            <div class="mt-3 space-y-3">
              <p class="font-mono text-[10px] text-base-content/35">
                {cardIndex + 1} / {dueCards.length}
              </p>
              <p class="rounded-xl bg-base-200 px-4 py-3 font-mono text-[14px] text-base-content/90">
                {card.en}
              </p>
              {revealed && (
                <p class="rounded-xl bg-accent/[0.07] px-4 py-3 text-[13px] text-base-content/75">
                  {card.es}
                </p>
              )}
              <div class="flex flex-wrap items-center gap-2">
                {!revealed ? (
                  <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    class="btn btn-sm btn-primary rounded-xl"
                  >
                    {tAction(stage, 'showTranslation')}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => answer(false)}
                      class="btn btn-sm gap-1.5 rounded-xl bg-error/10 text-error"
                    >
                      <X class="h-3.5 w-3.5" /> {tAction(stage, 'missedIt')}
                    </button>
                    <button
                      type="button"
                      onClick={() => answer(true)}
                      class="btn btn-sm gap-1.5 rounded-xl bg-accent/15 text-accent"
                    >
                      <Check class="h-3.5 w-3.5" /> {tAction(stage, 'gotIt')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
