import { ArrowDown, Check, RotateCcw } from 'lucide-preact'
import { getUiStage, tAction } from '../../lib/i18n'
import { useProgress } from '../../lib/useProgress'

interface Props {
  sessionId: string
  exerciseIds: string[]
}

export default function SessionProgressCard({ sessionId, exerciseIds }: Props) {
  const state = useProgress()
  const stage = getUiStage(state)
  const done = exerciseIds.filter((id) => state.completedExercises[id]).length
  const total = exerciseIds.length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const complete = Boolean(state.completedSessions[sessionId])

  function scrollToPractice() {
    document.getElementById('practica')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function replay() {
    window.dispatchEvent(
      new CustomEvent('runtimeenglish:restart-session', { detail: { sessionId } }),
    )
    scrollToPractice()
  }

  return (
    <div class="rounded-2xl bg-base-200 p-4">
      <div class="flex items-center justify-between gap-2">
        <p class="mono-label">{tAction(stage, 'yourProgress')}</p>
        <span
          class={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ${
            complete
              ? 'bg-accent/10 text-accent'
              : done > 0
                ? 'bg-base-100/70 text-base-content/50'
                : 'bg-base-100/50 text-base-content/35'
          }`}
        >
          {complete && <Check class="h-2.5 w-2.5" />}
          {complete
            ? tAction(stage, 'completed')
            : done > 0
              ? tAction(stage, 'inProgress')
              : tAction(stage, 'notStarted')}
        </span>
      </div>

      <div class="mt-4 flex items-end justify-between gap-3">
        <p class="font-mono text-[1.6rem] font-medium leading-none tracking-tight">
          {done}
          <span class="text-sm font-normal text-base-content/30"> / {total}</span>
        </p>
        <span class="font-mono text-[10px] text-base-content/35">{pct}%</span>
      </div>

      <div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-base-content/[0.07]">
        <div
          class="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <button
        type="button"
        onClick={scrollToPractice}
        class="btn btn-primary btn-sm mt-4 h-9 w-full gap-1.5 rounded-xl"
      >
        {done > 0 ? tAction(stage, 'continuePractice') : tAction(stage, 'startPractice')}
        <ArrowDown class="h-3.5 w-3.5" />
      </button>

      {done > 0 && (
        <button
          type="button"
          onClick={replay}
          class="btn btn-ghost btn-sm mt-1.5 h-9 w-full gap-1.5 rounded-xl text-base-content/40 hover:text-base-content/65"
        >
          <RotateCcw class="h-3.5 w-3.5" />
          {tAction(stage, 'replaySession')}
        </button>
      )}
    </div>
  )
}
