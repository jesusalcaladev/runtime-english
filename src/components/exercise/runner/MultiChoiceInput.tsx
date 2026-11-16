import { Check, Volume2 } from 'lucide-preact'
import type { MultiChoiceExercise } from '../../../lib/types'

interface Props {
  exercise: MultiChoiceExercise
  picked: number[]
  disabled: boolean
  showErrors: boolean
  onPickedChange(next: number[]): void
  onInteraction(): void
}

export default function MultiChoiceInput({
  exercise,
  picked,
  disabled,
  showErrors,
  onPickedChange,
  onInteraction,
}: Props) {
  function toggle(index: number) {
    onPickedChange(
      picked.includes(index) ? picked.filter((value) => value !== index) : [...picked, index],
    )
    onInteraction()
  }

  return (
    <div class="mt-5 space-y-1.5">
      <p class="px-1 text-[11px] text-base-content/45">
        Marca todas las opciones correctas (puede haber más de una).
      </p>
      {exercise.options.map((option, index) => {
        const isPicked = picked.includes(index)
        const isRight = disabled && exercise.answers.includes(index)
        const isWrong = showErrors && isPicked && !exercise.answers.includes(index)
        return (
          <div
            key={option}
            class={`flex items-center gap-1 rounded-xl transition ${isRight ? 'bg-accent/[0.09]' : isWrong ? 'bg-error/[0.08]' : isPicked ? 'bg-base-200' : 'hover:bg-base-200/60'}`}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => toggle(index)}
              class="flex flex-1 items-center gap-3 px-3 py-3 text-left text-sm disabled:cursor-default"
            >
              <span
                class={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[10px] transition ${isRight || isPicked ? 'bg-base-content text-base-100' : 'bg-base-200 text-base-content/35'}`}
              >
                {isRight || isPicked ? <Check class="h-3 w-3" /> : String.fromCharCode(65 + index)}
              </span>
              <span
                class={`flex-1 font-mono text-[13px] sm:text-sm ${disabled && !isRight ? 'text-base-content/35' : 'text-base-content/85'}`}
              >
                {option}
              </span>
            </button>
            <button
              type="button"
              data-speak={option}
              class="mr-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-content/25 transition hover:scale-[1.03] hover:bg-base-100 hover:text-base-content/70 active:scale-95"
              aria-label={`Escuchar opción ${String.fromCharCode(65 + index)}: ${option}`}
            >
              <Volume2 class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
