import { Check, Lightbulb, RotateCcw } from 'lucide-preact'
import { useState } from 'preact/hooks'
import type { VideoLesson } from '../../data/learningResources'

interface Props {
  questions: VideoLesson['questions']
  stage: 'es' | 'mixed' | 'en'
  title: string
  tip: string
}

export default function VideoComprehension({ questions, stage, title, tip }: Props) {
  const [picked, setPicked] = useState<(number | null)[]>([])
  const [checked, setChecked] = useState(false)

  const correct = questions.filter((question, index) => picked[index] === question.answer).length
  const allAnswered = questions.every(
    (_, index) => picked[index] !== undefined && picked[index] !== null,
  )

  function restart() {
    setPicked([])
    setChecked(false)
  }

  return (
    <div class="rounded-2xl bg-base-200/70 p-4 ring-1 ring-base-content/[0.04]">
      <div class="flex items-start gap-2">
        <Lightbulb class="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <div>
          <p class="mono-label text-accent/80">{title}</p>
          <p class="mt-1 text-[11px] text-base-content/45">{tip}</p>
        </div>
      </div>

      <div class="mt-3 space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} class="space-y-2">
            <p class="text-[13px] font-medium text-base-content/85">
              {index + 1}. {question.prompt}
            </p>
            <div class="space-y-1">
              {question.options.map((option, optionIndex) => {
                const selected = picked[index] === optionIndex
                const isRight = checked && optionIndex === question.answer
                const isWrong = checked && selected && optionIndex !== question.answer
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={checked}
                    onClick={() => {
                      const next = [...picked]
                      next[index] = optionIndex
                      setPicked(next)
                    }}
                    class={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] transition disabled:cursor-default ${isRight ? 'bg-accent/10 text-accent' : isWrong ? 'bg-error/10 text-error' : selected ? 'bg-base-content text-base-100' : 'bg-base-100/70 text-base-content/70 hover:bg-base-100'}`}
                  >
                    <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-base-100/60 font-mono text-[9px]">
                      {isRight || isWrong ? <Check class="h-3 w-3" /> : selected ? '•' : null}
                    </span>
                    {option}
                  </button>
                )
              })}
            </div>
            {checked && (
              <p class="text-[11px] leading-relaxed text-base-content/55">{question.explanation}</p>
            )}
          </div>
        ))}
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        {!checked ? (
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={!allAnswered}
            class="btn btn-sm btn-primary rounded-xl disabled:opacity-30"
          >
            {stage === 'es' ? 'Comprobar' : 'Check'}
          </button>
        ) : (
          <>
            <p class="font-mono text-[12px] text-accent">
              {correct} / {questions.length}
            </p>
            <button
              type="button"
              onClick={restart}
              class="btn btn-sm gap-1.5 rounded-xl bg-base-100"
            >
              <RotateCcw class="h-3.5 w-3.5" />
              {stage === 'es' ? 'Repetir' : 'Retry'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
