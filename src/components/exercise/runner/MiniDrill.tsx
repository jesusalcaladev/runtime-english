import { Check, RotateCcw, X, Zap } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { MICRO_DRILLS } from '../../../data/microDrills'
import { useUiStage } from '../../../hooks/useUiStage'
import { type ErrorSkill, SKILL_LABELS } from '../../../lib/errorPatterns'
import { tAction } from '../../../lib/i18n'

interface Props {
  skill: ErrorSkill
}

export default function MiniDrill({ skill }: Props) {
  const stage = useUiStage()
  const drills = MICRO_DRILLS[skill] ?? MICRO_DRILLS.general ?? []
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const drill = drills[index]
  const finished = index >= drills.length

  function choose(optionIndex: number) {
    if (picked !== null || !drill) return
    setPicked(optionIndex)
    if (optionIndex === drill.answer) setCorrectCount((value) => value + 1)
  }

  function next() {
    setIndex((value) => value + 1)
    setPicked(null)
  }

  function restart() {
    setIndex(0)
    setPicked(null)
    setCorrectCount(0)
  }

  if (!drill && !finished) return null

  return (
    <div class="mt-3 rounded-2xl bg-warning/[0.06] p-3 ring-1 ring-warning/15">
      <div class="flex items-center gap-2">
        <Zap class="h-3.5 w-3.5 text-warning/80" />
        <p class="mono-label text-warning/80">
          {tAction(stage, 'quickReview')} · {SKILL_LABELS[skill]}
        </p>
      </div>

      {finished ? (
        <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p class="text-[12px] text-base-content/70">
            {tAction(stage, 'hits')}: {correctCount} / {drills.length}
          </p>
          <button
            type="button"
            onClick={restart}
            class="inline-flex h-7 items-center gap-1.5 rounded-full bg-base-100 px-2.5 text-[11px] text-base-content/60 transition hover:text-base-content"
          >
            <RotateCcw class="h-3 w-3" /> {tAction(stage, 'repeatTest')}
          </button>
        </div>
      ) : (
        <div class="mt-2 space-y-2">
          <p class="text-[11px] text-base-content/40">
            {index + 1} / {drills.length}
          </p>
          <p class="font-mono text-[13px] text-base-content/85">{drill.prompt}</p>
          <div class="space-y-1">
            {drill.options.map((option, optionIndex) => {
              const isRight = picked !== null && optionIndex === drill.answer
              const isWrong = picked === optionIndex && optionIndex !== drill.answer
              return (
                <button
                  key={option}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => choose(optionIndex)}
                  class={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left font-mono text-[12px] transition disabled:cursor-default ${isRight ? 'bg-accent/10 text-accent' : isWrong ? 'bg-error/10 text-error' : 'bg-base-100/70 text-base-content/70 hover:bg-base-100'}`}
                >
                  <span class="flex h-4 w-4 items-center justify-center">
                    {isRight ? <Check class="h-3 w-3" /> : isWrong ? <X class="h-3 w-3" /> : null}
                  </span>
                  {option}
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <div class="space-y-2">
              <p class="text-[11px] leading-relaxed text-base-content/55">{drill.explanation}</p>
              <button type="button" onClick={next} class="btn btn-xs rounded-lg bg-base-100">
                {index === drills.length - 1 ? tAction(stage, 'seeResult') : tAction(stage, 'next')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
