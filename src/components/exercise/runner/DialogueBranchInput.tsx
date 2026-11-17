import { Check, CheckCircle2, Volume2, XCircle } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { useUiStage } from '../../../hooks/useUiStage'
import { tAction } from '../../../lib/i18n'
import type { DialogueBranchExercise } from '../../../lib/types'

interface Props {
  exercise: DialogueBranchExercise
  picked: number[]
  disabled: boolean
  showErrors: boolean
  onPickedChange(next: number[]): void
  onInteraction(): void
}

export default function DialogueBranchInput({
  exercise,
  picked,
  disabled,
  showErrors,
  onPickedChange,
  onInteraction,
}: Props) {
  const stage = useUiStage()
  const [visited, setVisited] = useState<number[]>([0])
  const [finished, setFinished] = useState(false)
  const stepIndex = visited[visited.length - 1] ?? 0
  const step = exercise.steps[stepIndex]
  const chosenIndex = picked[stepIndex]
  const chosen = chosenIndex !== undefined ? step?.choices[chosenIndex] : undefined
  const graded = chosen !== undefined && (showErrors || disabled)

  function choose(choiceIndex: number) {
    if (!step || chosenIndex !== undefined || disabled) return
    const next = [...picked]
    next[stepIndex] = choiceIndex
    onPickedChange(next)
    onInteraction()
  }

  function advance() {
    if (!step || !chosen) return
    const candidate = chosen.next ?? stepIndex + 1
    const nextStep =
      candidate >= 0 && candidate < exercise.steps.length && !visited.includes(candidate)
        ? candidate
        : null
    if (nextStep === null || visited.length >= exercise.steps.length) {
      setFinished(true)
      return
    }
    setVisited((path) => [...path, nextStep])
  }

  function restartPath() {
    setVisited([0])
    setFinished(false)
  }

  if (finished) {
    return (
      <div class="mt-5 space-y-2 rounded-2xl bg-base-200/70 p-4">
        <p class="text-[13px] text-base-content/80">{tAction(stage, 'dialogueFinished')}</p>
        <button type="button" onClick={restartPath} class="btn btn-xs rounded-lg bg-base-100">
          {tAction(stage, 'repeatTest')}
        </button>
      </div>
    )
  }

  if (!step) return null

  return (
    <div class="mt-5 space-y-3">
      <p class="px-1 text-[11px] text-base-content/45">{tAction(stage, 'branchPrompt')}</p>
      {exercise.context ? (
        <p class="rounded-xl bg-base-200/60 px-3 py-2 text-[11px] leading-relaxed text-base-content/60">
          <span class="mono-label mr-1.5 text-accent/70">Escena</span>
          {exercise.context}
        </p>
      ) : null}
      <div class="flex items-center gap-1">
        {exercise.steps.map((_, index) => (
          <span
            key={index}
            class={`h-1 flex-1 rounded-full ${visited.includes(index) ? 'bg-accent/60' : 'bg-base-300'}`}
          />
        ))}
      </div>
      <div class="rounded-2xl bg-base-200/70 p-3">
        <p class="flex items-start gap-2 text-[13px] leading-relaxed text-base-content/85">
          <span class="mt-0.5 rounded-full bg-accent/12 px-2 py-0.5 text-[9px] font-medium text-accent">
            {step.speaker}
          </span>
          <span class="font-mono">{step.line}</span>
          <button
            type="button"
            data-speak={step.line}
            class="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base-content/35 transition hover:bg-base-100 hover:text-accent"
            aria-label={`${tAction(stage, 'play')}: ${step.line}`}
          >
            <Volume2 class="h-3.5 w-3.5" />
          </button>
        </p>
        <div class="mt-2.5 space-y-1.5">
          {step.choices.map((option, index) => {
            const selected = chosenIndex === index
            const isRight = graded && option.correct
            const isWrong = graded && selected && !option.correct
            return (
              <button
                key={option.en}
                type="button"
                disabled={disabled || chosenIndex !== undefined}
                onClick={() => choose(index)}
                class={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] transition disabled:cursor-default ${isRight ? 'bg-accent/10 text-accent' : isWrong ? 'bg-error/10 text-error' : selected ? 'bg-base-content text-base-100' : 'bg-base-100/70 text-base-content/70 hover:bg-base-100'}`}
              >
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-base-100/60 font-mono text-[9px]">
                  {isRight ? (
                    <CheckCircle2 class="h-3.5 w-3.5" />
                  ) : isWrong ? (
                    <XCircle class="h-3.5 w-3.5" />
                  ) : selected ? (
                    <Check class="h-3 w-3" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span class="font-mono">{option.en}</span>
              </button>
            )
          })}
        </div>
        {chosen && (
          <div class="mt-2 space-y-2">
            <p
              class={`rounded-lg px-3 py-2 text-[11px] leading-relaxed ${chosen.correct ? 'bg-accent/[0.08] text-accent/85' : 'bg-error/[0.08] text-error/85'}`}
            >
              {chosen.feedback}
            </p>
            {!disabled && (
              <button type="button" onClick={advance} class="btn btn-xs rounded-lg bg-base-100">
                {tAction(stage, 'next')}
              </button>
            )}
          </div>
        )}
      </div>
      <p class="px-1 text-[10px] text-base-content/35">
        {visited.length} / {exercise.steps.length}
      </p>
    </div>
  )
}
