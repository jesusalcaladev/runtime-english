import { useProgress } from '../../lib/useProgress'

interface Props {
  a1SessionIds: string[]
  b1SessionIds: string[]
  totalSessions: number
  totalExercises: number
}

export default function ProgressPill({
  a1SessionIds,
  b1SessionIds,
  totalSessions,
  totalExercises,
}: Props) {
  const state = useProgress()

  const doneExercises = Object.keys(state.completedExercises).length
  const doneSessions = Object.keys(state.completedSessions).length
  const pct =
    totalExercises === 0 ? 0 : Math.min(100, Math.round((doneExercises / totalExercises) * 100))

  const a1Done = a1SessionIds.filter((id) => state.completedSessions[id]).length
  const a1Pct = a1SessionIds.length === 0 ? 0 : Math.round((a1Done / a1SessionIds.length) * 100)
  const b1Done = b1SessionIds.filter((id) => state.completedSessions[id]).length
  const b1Pct = b1SessionIds.length === 0 ? 0 : Math.round((b1Done / b1SessionIds.length) * 100)
  const cefr = a1Pct >= 90 && b1Pct >= 40 ? 'B1-B2' : a1Pct >= 50 ? 'A2 → B1' : 'A1-A2'

  const label = `${doneSessions}/${totalSessions} sesiones · ${doneExercises}/${totalExercises} ejercicios · ${cefr}`

  return (
    <div
      role="group"
      class="flex items-center gap-1.5 rounded-full bg-base-200 py-1.5 pl-2 pr-2 sm:gap-2.5 sm:pl-3 sm:pr-2.5"
      title={label}
      aria-label={`Progreso: ${pct}% (${cefr})`}
    >
      <span class="hidden font-mono text-[10px] font-semibold tracking-tight text-base-content/70 sm:inline">
        {cefr}
      </span>
      <span
        class="relative h-1 w-10 overflow-hidden rounded-full bg-base-content/10 sm:w-16"
        aria-hidden="true"
      >
        <span
          class="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span class="min-w-[2ch] text-right font-mono text-[10px] tabular-nums text-base-content/55 sm:w-7 sm:text-base-content/45">
        {pct}%
      </span>
    </div>
  )
}
