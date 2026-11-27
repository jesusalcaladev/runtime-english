import { useState } from 'preact/hooks'
import type { PracticePack } from '../../data/practices'
import ExerciseRunner from '../exercise/ExerciseRunner'

interface Props {
  pack: PracticePack
}

/**
 * Práctica extra integrada: reusa `ExerciseRunner`, progreso/FSRS y perfil de
 * habilidades. Sin tipo de ejercicio nuevo, sin silo. Inicio bajo demanda para
 * no cargar varios runners a la vez.
 */
export default function PracticePackView({ pack }: Props) {
  const [started, setStarted] = useState(false)

  return (
    <article class="rounded-2xl bg-base-200 p-4 ring-1 ring-base-content/[0.04]">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[14px] font-medium text-base-content/85">{pack.title}</p>
          <p class="mt-1 text-[12px] leading-snug text-base-content/55">{pack.description}</p>
          <p class="mt-2 flex flex-wrap items-center gap-1.5">
            <span class="rounded-full bg-base-100/70 px-2 py-0.5 text-[10px] text-base-content/55">
              {pack.level}
            </span>
            <span class="rounded-full bg-base-100/70 px-2 py-0.5 text-[10px] text-base-content/55">
              {pack.exercises.length} ejercicios
            </span>
          </p>
        </div>
        {!started && (
          <button
            type="button"
            onClick={() => setStarted(true)}
            class="shrink-0 rounded-full bg-accent/12 px-3 py-1.5 text-[11px] font-medium text-accent transition hover:bg-accent/20"
          >
            Practicar
          </button>
        )}
      </div>

      {started && (
        <div class="mt-4 border-t border-base-content/[0.06] pt-4">
          <ExerciseRunner
            sessionId={`pack-${pack.id}`}
            sessionTitle={pack.title}
            exercises={pack.exercises}
            next={null}
            level={pack.level}
          />
        </div>
      )}
    </article>
  )
}
