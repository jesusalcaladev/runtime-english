import { Check, Lightbulb, RotateCcw, Trophy } from 'lucide-preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { VideoLesson } from '../../data/learningResources'
import { tAction } from '../../lib/i18n'
import {
  getVideoQuizProgress,
  saveVideoQuizAttempt,
  type VideoQuizProgress,
} from '../../lib/videoQuiz'

interface Props {
  lessonId: string
  questions: VideoLesson['questions']
  stage: 'es' | 'mixed' | 'en'
  title: string
  tip: string
}

export default function VideoComprehension({ lessonId, questions, stage, title, tip }: Props) {
  const [progress, setProgress] = useState<VideoQuizProgress | undefined>(() =>
    getVideoQuizProgress(lessonId),
  )
  const [picked, setPicked] = useState<Record<string, number>>({})
  const [checked, setChecked] = useState(false)
  const [retryIds, setRetryIds] = useState<string[] | null>(null)

  useEffect(() => {
    setProgress(getVideoQuizProgress(lessonId))
    setPicked({})
    setChecked(false)
    setRetryIds(null)
  }, [lessonId])

  // Fijamos las preguntas al reintentar: el progreso guardado cambia al corregir
  // y no debe hacer que el reintento salte a todas las preguntas a mitad de camino.
  const activeQuestions = useMemo(() => {
    if (!retryIds) return questions
    return questions.filter((question) => retryIds.includes(question.id))
  }, [questions, retryIds])

  const correct = activeQuestions.filter(
    (question) => picked[question.id] === question.answer,
  ).length
  const allAnswered = activeQuestions.every((question) => Number.isInteger(picked[question.id]))
  const missed = activeQuestions.filter((question) => picked[question.id] !== question.answer)

  function check() {
    const answers: Record<string, number> = {}
    for (const question of activeQuestions) {
      const value = picked[question.id]
      if (Number.isInteger(value)) answers[question.id] = value
    }
    const updated = saveVideoQuizAttempt(lessonId, {
      questionIds: activeQuestions.map((question) => question.id),
      answers,
      correct,
      total: activeQuestions.length,
      missedQuestionIds: missed.map((question) => question.id),
      at: Date.now(),
    })
    setProgress(updated)
    setChecked(true)
  }

  function restart(missedOnly: boolean) {
    setRetryIds(missedOnly ? (progress?.missedQuestionIds ?? []) : null)
    setPicked({})
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

      {progress?.attempts.length ? (
        <div class="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-base-100/60 px-3 py-2">
          <Trophy class="h-3.5 w-3.5 text-accent/70" />
          <span class="font-mono text-[10px] text-base-content/60">
            {tAction(stage, 'quizBest')} {progress.bestCorrect}/{questions.length}
          </span>
          <span class="font-mono text-[10px] text-base-content/40">
            {tAction(stage, 'quizLast')} {progress.attempts[0].correct}/{progress.attempts[0].total}
          </span>
          <span class="ml-auto flex items-center gap-1">
            {progress.attempts.map((attempt, index) => (
              <span
                key={`${attempt.at}-${index}`}
                class="rounded-full bg-base-200 px-1.5 py-0.5 font-mono text-[9px] text-base-content/45"
                title={new Date(attempt.at).toLocaleString()}
              >
                {attempt.correct}/{attempt.total}
              </span>
            ))}
          </span>
        </div>
      ) : null}

      {retryIds && (
        <p class="mt-2 text-[11px] text-accent/80">
          {tAction(stage, 'retryingMissed')} · {activeQuestions.length}
        </p>
      )}

      <div class="mt-3 space-y-4">
        {activeQuestions.map((question) => (
          <div key={question.id} class="space-y-2">
            <p class="text-[13px] font-medium text-base-content/85">{question.prompt}</p>
            <div class="space-y-1">
              {question.options.map((option, optionIndex) => {
                const selected = picked[question.id] === optionIndex
                const isRight = checked && optionIndex === question.answer
                const isWrong = checked && selected && optionIndex !== question.answer
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={checked}
                    onClick={() =>
                      setPicked((current) => ({ ...current, [question.id]: optionIndex }))
                    }
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
            onClick={check}
            disabled={!allAnswered}
            class="btn btn-sm btn-primary rounded-xl disabled:opacity-30"
          >
            {stage === 'es' ? 'Comprobar' : 'Check'}
          </button>
        ) : (
          <>
            <p class="font-mono text-[12px] text-accent">
              {correct} / {activeQuestions.length}
            </p>
            {missed.length > 0 && (
              <button
                type="button"
                onClick={() => restart(true)}
                class="btn btn-sm gap-1.5 rounded-xl bg-error/10 text-error"
              >
                <RotateCcw class="h-3.5 w-3.5" />
                {tAction(stage, 'retryMissed')} ({missed.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => restart(false)}
              class="btn btn-sm gap-1.5 rounded-xl bg-base-100"
            >
              <RotateCcw class="h-3.5 w-3.5" />
              {tAction(stage, 'retryAll')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
