import { ArrowRight, Award, Layers } from 'lucide-preact'
import { ALL_SESSIONS } from '../../data/curriculum'
import {
  getCertificateLevelInfo,
  getLevelStats,
  isLevelUnlocked,
} from '../../lib/certificateLevels'
import { getUiStage, tAction } from '../../lib/i18n'
import { route } from '../../lib/routes'
import type { Level } from '../../lib/types'
import { useProgress } from '../../lib/useProgress'

interface Props {
  level: Level
  currentSessionId: string
}

export default function LevelProgressCard({ level, currentSessionId }: Props) {
  const state = useProgress()
  const stage = getUiStage(state)
  const info = getCertificateLevelInfo(level)
  const stats = getLevelStats(level, state)
  const pct = stats.sessions === 0 ? 0 : Math.round((stats.doneSessions / stats.sessions) * 100)

  const entries = ALL_SESSIONS.filter((entry) => entry.module.level === level)
  const index = entries.findIndex((entry) => entry.session.id === currentSessionId)
  const next = index >= 0 ? entries[index + 1] : undefined
  const unlocked = isLevelUnlocked(level, state)

  return (
    <div class="rounded-2xl bg-base-200 p-4">
      <div class="flex items-center justify-between gap-2">
        <p class="mono-label flex items-center gap-1.5">
          <Layers class="h-3 w-3 text-accent" /> {info.label}
        </p>
        <span class="font-mono text-[10px] text-base-content/35">
          {stats.doneSessions}/{stats.sessions}
        </span>
      </div>

      <div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-base-content/[0.07]">
        <div
          class="h-full rounded-full bg-accent/70 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p class="mt-2 text-[10px] text-base-content/40">
        {stats.doneExercises}/{stats.exercises} {tAction(stage, 'exercises')} · {pct}%
      </p>

      {next && (
        <a
          href={route(`/session/${next.session.slug}`)}
          class="group mt-4 block rounded-xl bg-base-100/70 p-3 transition hover:bg-base-100"
        >
          <p class="mono-label text-base-content/45">{tAction(stage, 'nextInLevel')}</p>
          <p class="mt-1.5 line-clamp-2 text-[11px] font-medium leading-relaxed text-base-content/70 group-hover:text-base-content">
            {next.session.title}
          </p>
          <p class="mt-1 flex items-center gap-1 font-mono text-[9px] text-base-content/30">
            {next.session.cefr}
            <ArrowRight class="ml-auto h-3 w-3 transition group-hover:translate-x-0.5 group-hover:text-accent" />
          </p>
        </a>
      )}

      {unlocked ? (
        <a
          href={route(`/certificate?level=${level}`)}
          class="mt-2 flex items-center gap-2 rounded-xl bg-accent/[0.07] px-3 py-2 text-[11px] font-medium text-accent transition hover:bg-accent/[0.12]"
        >
          <Award class="h-3.5 w-3.5 shrink-0" />
          {tAction(stage, 'certificateLevel')} {level}
          <ArrowRight class="ml-auto h-3 w-3" />
        </a>
      ) : (
        <span
          aria-disabled="true"
          class="mt-2 flex items-center gap-2 rounded-xl bg-base-100/50 px-3 py-2 text-[11px] text-base-content/30"
        >
          <Award class="h-3.5 w-3.5 shrink-0" />
          {tAction(stage, 'certificateLevel')} {level}
        </span>
      )}
    </div>
  )
}
