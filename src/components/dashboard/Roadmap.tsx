import { Check, ChevronRight, Clock, Layers, Play, Sparkles, Target } from 'lucide-preact'
import { useState } from 'preact/hooks'
import type { NavModule, NavSession } from '../../data/curriculum'
import { isSessionRelevantToGoal } from '../../lib/goals'
import { getUiStage, tAction } from '../../lib/i18n'
import { getMasteredSessionIds } from '../../lib/mastery'
import { route } from '../../lib/routes'
import { useProgress } from '../../lib/useProgress'

interface Props {
  modules: NavModule[]
  nextSessionId: string
}

type Stage = ReturnType<typeof getUiStage>
type LevelFilter = 'all' | 'mine' | 'a1' | 'b1'

function SessionRow({
  session,
  moduleId,
  nextSessionId,
  completedSessions,
  masteredIds,
  stage,
  goal,
}: {
  session: NavSession
  moduleId: string
  nextSessionId: string
  completedSessions: Record<string, number>
  masteredIds: Set<string>
  stage: Stage
  goal: 'daily' | 'interviews' | 'work' | 'all'
}) {
  const complete = Boolean(completedSessions[session.id])
  const mastered = masteredIds.has(session.id)
  const isNext = session.id === nextSessionId && !complete
  const goalRelevant = goal !== 'all' && isSessionRelevantToGoal(session.slug, goal)
  const isIntegrated = !session.id.startsWith(`${moduleId}-`)
  const isCheckpoint = /checkpoint|repaso|integrad/i.test(`${session.step} ${session.title}`)

  return (
    <a
      href={route(`/session/${session.slug}`)}
      className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
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
          {isIntegrated && (
            <span
              className="hidden rounded-full bg-base-content/[0.06] px-2 py-0.5 text-[9px] font-medium text-base-content/45 sm:inline-flex"
              title="Sesión integrada en esta parte del recorrido"
            >
              Integrada
            </span>
          )}
          {isCheckpoint && !isIntegrated && (
            <span className="hidden rounded-full bg-base-content/[0.06] px-2 py-0.5 text-[9px] font-medium text-base-content/45 sm:inline-flex">
              Repaso
            </span>
          )}
          {goalRelevant && !complete && (
            <span
              className="hidden items-center gap-1 rounded-full bg-base-content/[0.06] px-2 py-0.5 text-[9px] font-medium text-base-content/50 sm:inline-flex"
              title="Recomendada para tu objetivo"
            >
              <Target className="h-2.5 w-2.5 text-accent/70" /> Meta
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
  goal,
}: {
  module: NavModule
  nextSessionId: string
  completedSessions: Record<string, number>
  masteredIds: Set<string>
  stage: Stage
  goal: 'daily' | 'interviews' | 'work' | 'all'
}) {
  const done = module.sessions.filter((session) => completedSessions[session.id]).length
  const modulePct = Math.round((done / Math.max(module.sessions.length, 1)) * 100)

  return (
    <article
      className={`rounded-[28px] p-4 sm:p-5 ${module.featured ? 'bg-accent/[0.045]' : 'bg-base-200/70'}`}
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
        <div className="shrink-0 text-right">
          <p className="font-mono text-sm font-medium text-base-content/70">{modulePct}%</p>
          <p class="mt-0.5 text-[10px] text-base-content/30">
            {done}/{module.sessions.length}
          </p>
        </div>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-base-content/[0.06]">
        <div
          className="h-full rounded-full bg-accent/80 transition-all duration-500"
          style={{ width: `${modulePct}%` }}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        {module.sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            moduleId={module.id}
            nextSessionId={nextSessionId}
            completedSessions={completedSessions}
            masteredIds={masteredIds}
            stage={stage}
            goal={goal}
          />
        ))}
      </div>
    </article>
  )
}

export default function Roadmap({ modules, nextSessionId }: Props) {
  const state = useProgress()
  const stage = getUiStage(state)
  const goal = state.settings.goal ?? 'all'
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const masteredIds = new Set(getMasteredSessionIds(state))
  const diagnosticLevel = state.settings.diagnostic?.level
  const totalSessions = modules.reduce((total, module) => total + module.sessions.length, 0)
  const totalExercises = modules.reduce(
    (total, module) =>
      total + module.sessions.reduce((sum, session) => sum + session.exerciseCount, 0),
    0,
  )
  const doneSessions = modules
    .flatMap((module) => module.sessions)
    .filter((session) => state.completedSessions[session.id]).length
  const overallPct = Math.round((doneSessions / Math.max(totalSessions, 1)) * 100)

  const groups = [
    {
      id: 'a1',
      title: tAction(stage, 'foundations'),
      level: 'A1–A2',
      modules: modules.filter((module) => module.level === 'A1-A2'),
    },
    {
      id: 'b1',
      title: tAction(stage, 'production'),
      level: 'B1–B2',
      modules: modules.filter((module) => module.level === 'B1-B2'),
    },
  ] as const

  const targetGroup =
    levelFilter === 'mine'
      ? diagnosticLevel === 'B1' || diagnosticLevel === 'B2'
        ? 'b1'
        : 'a1'
      : levelFilter
  const visibleGroups = groups.filter((group) => targetGroup === 'all' || group.id === targetGroup)

  const filters: { id: LevelFilter; label: string }[] = [
    { id: 'all', label: tAction(stage, 'filterAll') },
    {
      id: 'mine',
      label: `${tAction(stage, 'myLevel')}${diagnosticLevel ? ` · ${diagnosticLevel}` : ''}`,
    },
    { id: 'a1', label: 'A1–A2' },
    { id: 'b1', label: 'B1–B2' },
  ]

  return (
    <section id="roadmap" className="mt-14 scroll-mt-20">
      <div className="rounded-[32px] bg-base-200/60 p-4 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mono-label text-base-content/55">{tAction(stage, 'route')}</p>
            <h2 className="font-pixel mt-2 text-[2.2rem] leading-tight tracking-tight text-base-content/95 sm:text-[2.6rem]">
              {tAction(stage, 'pathTitle')}
            </h2>
            <p className="mt-2 hidden text-[14px] leading-relaxed text-base-content/55 sm:block">
              {modules.length} {tAction(stage, 'modules')} · {totalSessions}{' '}
              {tAction(stage, 'sessions')} · {totalExercises} {tAction(stage, 'exercises')}
            </p>
          </div>
          <div className="min-w-[170px] rounded-2xl bg-base-100/80 px-4 py-3.5">
            <p className="font-mono text-2xl font-semibold leading-none tracking-tight text-base-content/90">
              {overallPct}%
            </p>
            <p className="mt-1.5 text-[11px] text-base-content/50">
              {doneSessions} / {totalSessions} {tAction(stage, 'pathDone')}
            </p>
          </div>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-base-content/[0.07]">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>

        <fieldset className="mt-6 flex flex-wrap items-center gap-2 border-0 p-0">
          <legend className="sr-only">{tAction(stage, 'filterByLevel')}</legend>
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setLevelFilter(filter.id)}
              aria-pressed={levelFilter === filter.id}
              className={`h-8 rounded-full px-3 text-[11px] transition ${
                levelFilter === filter.id
                  ? 'bg-accent/15 font-medium text-accent'
                  : 'bg-base-100/70 text-base-content/50 hover:text-base-content'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </fieldset>

        <div className="mt-8 space-y-10">
          {visibleGroups.map((group) => {
            const sessions = group.modules.flatMap((module) => module.sessions)
            const done = sessions.filter((session) => state.completedSessions[session.id]).length
            const pct = Math.round((done / Math.max(sessions.length, 1)) * 100)
            return (
              <div key={group.id} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full bg-base-content px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide text-base-100">
                      {group.level}
                    </span>
                    <h3 className="font-pixel text-[1.6rem] leading-none tracking-tight text-base-content/90">
                      {group.title}
                    </h3>
                  </div>
                  <span className="text-[12px] font-medium text-base-content/55">
                    {done}/{sessions.length} sesiones · {pct}%
                  </span>
                </div>

                <div className="h-1 overflow-hidden rounded-full bg-base-content/[0.06]">
                  <div
                    className="h-full rounded-full bg-accent/70 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
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
                      goal={goal}
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
