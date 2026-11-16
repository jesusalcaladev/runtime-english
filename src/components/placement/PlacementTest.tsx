import { Check, ChevronRight, RotateCcw, Sparkles } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { getSessionBySlug } from '../../data/curriculum'
import { useUiStage } from '../../hooks/useUiStage'
import { tAction } from '../../lib/i18n'
import {
  loadPlacementResult,
  PLACEMENT_QUESTIONS,
  PLACEMENT_START_SLUG,
  type PlacementResult,
  savePlacementResult,
  scorePlacement,
} from '../../lib/placement'
import { progressStore } from '../../lib/progress'
import { route } from '../../lib/routes'
import { recommendPlan, toStudyPlan } from '../../lib/studyPlan'
import { useProgress } from '../../lib/useProgress'

export default function PlacementTest() {
  const stage = useUiStage()
  const settings = useProgress().settings
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [current, setCurrent] = useState(0)
  const [result, setResult] = useState<PlacementResult | null>(() => loadPlacementResult())

  const question = PLACEMENT_QUESTIONS[current]
  const finished = current >= PLACEMENT_QUESTIONS.length

  function choose(optionIndex: number) {
    if (!question) return
    const next = [...answers]
    next[current] = optionIndex
    setAnswers(next)
  }

  function next() {
    setCurrent((value) => value + 1)
  }

  function finish() {
    const scored = scorePlacement(answers)
    setResult(scored)
    savePlacementResult(scored)
    const diagnostic = {
      level: scored.level,
      score: Math.round((scored.correct / scored.total) * 100),
      completedAt: Date.now(),
    }
    progressStore.setSettings({
      diagnostic,
      plan: toStudyPlan(recommendPlan(settings.goal ?? 'all', diagnostic)),
      planIntroDismissed: false,
    })
  }

  function restart() {
    setAnswers([])
    setCurrent(0)
    setResult(null)
  }

  if (result) {
    const slug = PLACEMENT_START_SLUG[result.level]
    const session = getSessionBySlug(slug)?.session
    return (
      <div class="space-y-4 rounded-3xl bg-base-200 p-5 sm:p-6">
        <div class="flex items-center gap-2">
          <Sparkles class="h-4 w-4 text-accent" />
          <p class="mono-label text-accent/85">{tAction(stage, 'yourLevel')}</p>
        </div>
        <p class="font-pixel text-4xl text-base-content/90">{result.level}</p>
        <p class="text-[13px] leading-relaxed text-base-content/65">
          Acertaste {result.correct} de {result.total} preguntas. Puedes empezar por donde mejor
          encaja contigo y saltarte lo que ya dominas.
        </p>
        {session && (
          <div class="rounded-2xl bg-base-100/70 p-4">
            <p class="text-[11px] text-base-content/45">{tAction(stage, 'firstSession')}</p>
            <p class="mt-1 text-[14px] font-medium text-base-content/85">{session.title}</p>
            <p class="mt-0.5 text-[11px] text-base-content/45">{session.step}</p>
          </div>
        )}
        <div class="flex flex-wrap gap-2">
          <a href={route(`/session/${slug}`)} class="btn btn-primary btn-sm gap-1.5 rounded-xl">
            {tAction(stage, 'goToSession')} <ChevronRight class="h-3.5 w-3.5" />
          </a>
          <button type="button" onClick={restart} class="btn btn-sm gap-1.5 rounded-xl bg-base-100">
            <RotateCcw class="h-3.5 w-3.5" /> {tAction(stage, 'repeatTest')}
          </button>
        </div>
        <p class="text-[10px] text-base-content/35">
          Resultado guardado en este dispositivo. La ruta completa sigue disponible desde el inicio.
        </p>
      </div>
    )
  }

  if (finished) {
    return (
      <div class="rounded-3xl bg-base-200 p-6 text-center">
        <p class="text-[14px] text-base-content/80">
          Has terminado las {PLACEMENT_QUESTIONS.length} preguntas.
        </p>
        <button type="button" onClick={finish} class="btn btn-primary btn-sm mt-3 rounded-xl">
          Ver mi nivel
        </button>
      </div>
    )
  }

  const picked = answers[current]
  return (
    <div class="space-y-4 rounded-3xl bg-base-200 p-5 sm:p-6">
      <div class="flex items-center justify-between gap-2">
        <p class="mono-label text-accent/85">
          {tAction(stage, 'questionOf')} {current + 1} / {PLACEMENT_QUESTIONS.length}
        </p>
        <span class="rounded-full bg-base-100/70 px-2.5 py-1 font-mono text-[10px] text-base-content/45">
          {question.level}
        </span>
      </div>
      <div class="h-1 overflow-hidden rounded-full bg-base-300">
        <div
          class="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${(current / PLACEMENT_QUESTIONS.length) * 100}%` }}
        />
      </div>
      <p class="font-mono text-[16px] leading-relaxed text-base-content/90">{question.prompt}</p>
      <div class="space-y-1.5">
        {question.options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(index)}
            class={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-mono text-[13px] transition ${picked === index ? 'bg-accent/12 text-accent ring-1 ring-accent/25' : 'bg-base-100/70 text-base-content/70 hover:bg-base-100'}`}
          >
            <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-base-100 font-mono text-[9px]">
              {picked === index ? <Check class="h-3 w-3" /> : String.fromCharCode(65 + index)}
            </span>
            {option}
          </button>
        ))}
      </div>
      <div class="flex justify-end">
        <button
          type="button"
          onClick={next}
          disabled={picked === undefined || picked === null}
          class="btn btn-primary btn-sm gap-1.5 rounded-xl disabled:opacity-30"
        >
          {current === PLACEMENT_QUESTIONS.length - 1
            ? tAction(stage, 'finishTest')
            : tAction(stage, 'next')}
          <ChevronRight class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
