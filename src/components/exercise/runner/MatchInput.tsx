import { Check, Lightbulb } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import { shuffleIndices } from '../../../lib/exercise'
import type { MatchExercise } from '../../../lib/types'

interface Props {
  exercise: MatchExercise
  matchedPairs: number[]
  disabled: boolean
  onMatchedPairsChange(next: number[]): void
  onInteraction(): void
}

export default function MatchInput({
  exercise,
  matchedPairs,
  disabled,
  onMatchedPairsChange,
  onInteraction,
}: Props) {
  const [left, setLeft] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const [shuffled] = useState(() => shuffleIndices(exercise.pairs.length))

  useEffect(() => {
    setLeft(null)
    setWrong(null)
  }, [exercise.id])

  function pickLeft(index: number) {
    if (disabled || matchedPairs.includes(index)) return
    setLeft(index)
    setWrong(null)
  }

  function pickRight(index: number) {
    if (disabled || matchedPairs.includes(index) || left === null) return
    if (left === index) {
      onMatchedPairsChange([...matchedPairs, index])
      onInteraction()
    } else {
      setWrong(index)
    }
    setLeft(null)
  }

  return (
    <div class="mt-5 space-y-3">
      <p class="px-1 text-[11px] text-base-content/45">
        Toca un texto en inglés y después su significado.
      </p>
      <div class="grid gap-2 sm:grid-cols-2">
        <div class="space-y-1.5">
          {exercise.pairs.map((pair, index) => {
            const matched = matchedPairs.includes(index)
            return (
              <button
                key={`en-${index}`}
                type="button"
                disabled={disabled || matched}
                onClick={() => pickLeft(index)}
                class={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left font-mono text-[13px] transition disabled:cursor-default ${matched ? 'bg-accent/10 text-accent/40 line-through' : left === index ? 'bg-base-content text-base-100' : 'bg-base-200 text-base-content/80 hover:bg-base-300'}`}
              >
                <span>{pair.en}</span>
                {matched && <Check class="h-3.5 w-3.5 shrink-0" />}
              </button>
            )
          })}
        </div>
        <div class="space-y-1.5">
          {shuffled.map((index) => {
            const matched = matchedPairs.includes(index)
            return (
              <button
                key={`es-${index}`}
                type="button"
                disabled={disabled || matched}
                onClick={() => pickRight(index)}
                class={`w-full rounded-xl px-3 py-2.5 text-left text-[13px] transition disabled:cursor-default ${matched ? 'bg-accent/10 text-accent/40 line-through' : wrong === index ? 'bg-error/15 text-error' : 'bg-base-200 text-base-content/75 hover:bg-base-300'}`}
              >
                {exercise.pairs[index]?.es}
              </button>
            )
          })}
        </div>
      </div>
      {matchedPairs.length > 0 && (
        <p class="px-1 text-[11px] text-accent/80">
          {matchedPairs.length} / {exercise.pairs.length} parejas
        </p>
      )}
      {exercise.hint && (
        <p class="flex items-center gap-1.5 px-1 text-[12px] text-base-content/55">
          <Lightbulb class="h-3 w-3 text-warning/70" />
          {exercise.hint}
        </p>
      )}
    </div>
  )
}
