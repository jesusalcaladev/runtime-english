import {
  Award,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  Play,
  Sparkles,
} from 'lucide-preact'
import { useState } from 'preact/hooks'
import type { NavModule, NavSession } from '../../data/curriculum'
import { CERTIFICATE_LEVELS, isLevelComplete, isLevelUnlocked } from '../../lib/certificateLevels'
import { getUiStage, tAction } from '../../lib/i18n'
import { getMasteredSessionIds } from '../../lib/mastery'
import { route } from '../../lib/routes'
import type { Level } from '../../lib/types'
import { useProgress } from '../../lib/useProgress'

interface Props {
  modules: NavModule[]
  nextSessionId: string
  level: Level
}

type Stage = ReturnType<typeof getUiStage>

function SessionRow({
  session,
  nextSessionId,
  completedSessions,
  masteredIds,
  stage,
}: {
  session: NavSession
  nextSessionId: string
  completedSessions: Record<string, number>
  masteredIds: Set<string>
  stage: Stage
}) {
  const complete = Boolean(completedSessions[session.id])
  const mastered = masteredIds.has(session.id)
  const isNext = session.id === nextSessionId && !complete

  return (
    <a
      href={route(`/session/${session.slug}`)}
      className={`group surface-muted flex items-center gap-3 px-3 py-3 transition ${
        isNext
          ? 'bg-accent/[0.08]'
          : complete
            ? 'bg-base-100/40 hover:bg-base-100/70'
            : 'hover:bg-base-100/70'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-medium ${
          complete
            ? 'bg-accent/15 text-accent'
            : isNext
              ? 'bg-accent text-accent-content'
              : 'bg-base-100 text-base-content/35'
        }`}
      >
        {complete ? (
          <Check className="h-4 w-4" strokeWidth={2.5} />
        ) : isNext ? (
          <Play className="h-3.5 w-3.5 fill-current" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className={`block truncate text-[13px] font-medium ${
              complete
                ? 'text-base-content/45'
                : 'text-base-content/85 group-hover:text-base-content'
            }`}
          >
            {session.title}
          </span>
          {isNext && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-medium text-accent">
              {tAction(stage, 'continueHere')}
            </span>
          )}
          {mastered && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[9px] font-medium text-success"
              title={tAction(stage, 'masteryProgress')}
            >
              <Check className="h-2.5 w-2.5" /> {tAction(stage, 'masteredBadge')}
            </span>
          )}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-base-content/35">
          <span className="font-mono">{session.cefr}</span>
          <span className="hidden items-center gap-1 sm:flex">
            <Clock className="h-3 w-3" />
            {session.minutes} {tAction(stage, 'minutes')}
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <Layers className="h-3 w-3" />
            {session.exerciseCount} {stage === 'es' ? 'ej.' : 'ex.'}
          </span>
          <span className="hidden truncate font-mono text-base-content/30 sm:inline">
            {session.step}
          </span>
        </span>
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-base-content/20 transition group-hover:translate-x-0.5 group-hover:text-base-content/45" />
    </a>
  )
}

function ModuleCard({
  module,
  nextSessionId,
  completedSessions,
  masteredIds,
  stage,
}: {
  module: NavModule
  nextSessionId: string
  completedSessions: Record<string, number>
  masteredIds: Set<string>
  stage: Stage
}) {
  const done = module.sessions.filter((session) => completedSessions[session.id]).length
  const modulePct = Math.round((done / Math.max(module.sessions.length, 1)) * 100)
  const [open, setOpen] = useState(() =>
    module.sessions.some((session) => session.id === nextSessionId),
  )

  return (
    <article
      className={`surface-card p-4 sm:p-5 ${module.featured ? 'bg-accent/[0.045]' : 'bg-base-200/70'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-base-content/35">{module.code}</span>
            {module.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-medium text-accent">
                <Sparkles className="h-3 w-3" /> {tAction(stage, 'special')}
              </span>
            )}
          </div>
          <h4 className="mt-1.5 text-[15px] font-medium tracking-tight text-base-content/90">
            {module.shortTitle}
          </h4>
          <p className="mt-1 hidden max-w-2xl text-[11px] leading-relaxed text-base-content/40 sm:block">
            {module.description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p className="font-mono text-sm font-medium text-base-content/70">{modulePct}%</p>
            <p class="mt-0.5 text-[10px] text-base-content/30">
              {done}/{module.sessions.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={`${open ? 'Ocultar' : 'Mostrar'} lecciones de ${module.shortTitle}`}
            class="flex h-8 w-8 items-center justify-center rounded-full text-base-content/40 transition hover:bg-base-100 hover:text-base-content/70"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-base-content/[0.06]">
        <div
          className="h-full rounded-full bg-accent/80 transition-all duration-500"
          style={{ width: `${modulePct}%` }}
        />
      </div>

      {open && (
        <div className="mt-4 space-y-1.5">
          {module.sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              nextSessionId={nextSessionId}
              completedSessions={completedSessions}
              masteredIds={masteredIds}
              stage={stage}
            />
          ))}
        </div>
      )}
    </article>
  )
}

export default function Roadmap({ modules, nextSessionId, level }: Props) {
  const state = useProgress()
  const stage = getUiStage(state)
  const masteredIds = new Set(getMasteredSessionIds(state))

  const groups = CERTIFICATE_LEVELS.map((info) => ({
    id: info.i18nKey,
    title:
      info.i18nKey === 'a1'
        ? tAction(stage, 'foundations')
        : info.i18nKey === 'b1'
          ? tAction(stage, 'production')
          : tAction(stage, 'mastery'),
    level: info.level,
    modules: modules.filter((module) => module.level === info.level),
  }))

  const visibleGroups = groups.filter((group) => group.level === level)
  const levelSessions = visibleGroups.flatMap((group) =>
    group.modules.flatMap((module) => module.sessions),
  )
  const levelDone = levelSessions.filter((session) => state.completedSessions[session.id]).length
  const levelPct = Math.round((levelDone / Math.max(levelSessions.length, 1)) * 100)

  return (
    <section id="roadmap" className="mt-4 scroll-mt-20">
      <div className="surface-card bg-base-200/60 p-4 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mono-label text-base-content/55">{tAction(stage, 'route')}</p>
            <h2 className="section-heading mt-2 text-[2.2rem] leading-tight sm:text-[2.6rem]">
              {tAction(stage, 'sessions')} · {level}
            </h2>
            <p className="mt-2 hidden text-[14px] leading-relaxed text-base-content/55 sm:block">
              {visibleGroups[0]?.modules.length ?? 0} {tAction(stage, 'modules')} ·{' '}
              {levelSessions.length} {tAction(stage, 'sessions')}
            </p>
          </div>
          <div className="min-w-[170px] rounded-2xl bg-base-100/80 px-4 py-3.5">
            <p className="font-mono text-2xl font-semibold leading-none tracking-tight text-base-content/90">
              {levelPct}%
            </p>
            <p className="mt-1.5 text-[11px] text-base-content/50">
              {levelDone} / {levelSessions.length} {tAction(stage, 'pathDone')}
            </p>
          </div>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-base-content/[0.07]">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${levelPct}%` }}
          />
        </div>

        <div className="mt-8 space-y-10">
          {visibleGroups.map((group) => {
            const sessions = group.modules.flatMap((module) => module.sessions)
            const done = sessions.filter((session) => state.completedSessions[session.id]).length
            const pct = Math.round((done / Math.max(sessions.length, 1)) * 100)
            return (
              <div key={group.id} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-pixel text-[1.6rem] leading-none tracking-tight text-base-content/90">
                      {group.title}
                    </h3>
                  </div>
                  <span className="text-[12px] font-medium text-base-content/55">
                    {done}/{sessions.length} {tAction(stage, 'sessions')} · {pct}%
                  </span>
                </div>

                <div className="h-1 overflow-hidden rounded-full bg-base-content/[0.06]">
                  <div
                    className="h-full rounded-full bg-accent/70 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="surface-muted mt-4 flex flex-wrap items-center justify-between gap-3 bg-accent/[0.06] p-4">
                  <div className="min-w-0">
                    <p class="mono-label flex items-center gap-1.5 text-accent/80">
                      <Award class="h-3 w-3" /> {tAction(stage, 'certificateLevel')} {group.level}
                    </p>
                    <p class="mt-1 text-[11px] text-base-content/50">
                      {isLevelComplete(group.level, state)
                        ? tAction(stage, 'levelReady')
                        : `${done}/${sessions.length} ${tAction(stage, 'sessions')} · ${pct}%`}
                    </p>
                  </div>
                  {isLevelUnlocked(group.level, state) ? (
                    <a
                      href={route(`/certificate?level=${group.level}`)}
                      class="btn btn-primary btn-sm h-9 rounded-xl px-4"
                    >
                      {isLevelComplete(group.level, state)
                        ? tAction(stage, 'certificateLevel')
                        : tAction(stage, 'yourProgress')}
                    </a>
                  ) : (
                    <span aria-disabled="true" class="text-[11px] text-base-content/35">
                      {tAction(stage, 'certificateLockedLevel')}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {group.modules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      nextSessionId={nextSessionId}
                      completedSessions={state.completedSessions}
                      masteredIds={masteredIds}
                      stage={stage}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
