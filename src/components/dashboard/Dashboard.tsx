import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BookText,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-preact'
import type { ComponentType } from 'preact'
import { useEffect, useLayoutEffect, useState } from 'preact/hooks'
import type { NavModule } from '../../data/curriculum'
import { CERTIFICATE_LEVELS, isLevelComplete } from '../../lib/certificateLevels'
import { aggregateErrorPatterns } from '../../lib/errorPatterns'
import { GOAL_LABELS, isSessionRelevantToGoal } from '../../lib/goals'
import { getUiStage, t, tAction } from '../../lib/i18n'
import { getDuePhraseEntries, getReviewStats } from '../../lib/progress'
import { route } from '../../lib/routes'
import { warmSpeechEngine } from '../../lib/speech'
import {
  getConsistencyFeedback,
  getConsistencyStats,
  getLearningRecommendations,
} from '../../lib/studyPlan'
import type { Level } from '../../lib/types'
import { useProgress } from '../../lib/useProgress'
import Mascot from '../ui/Mascot'
import OnboardingCard from './OnboardingCard'
import Roadmap from './Roadmap'

interface Props {
  modules: NavModule[]
  totalSessions: number
  totalExercises: number
  totalAchievements: number
  exerciseIds: string[]
}

const LEVEL_LABELS = ['Rookie', 'Junior', 'Mid', 'Senior', 'Staff', 'Principal']

function readLevelParam(): Level | null {
  const value = new URLSearchParams(window.location.search).get('level')
  return value === 'A1-A2' || value === 'B1-B2' || value === 'C1-C2' ? value : null
}

export default function Dashboard({
  modules,
  totalSessions,
  totalExercises,
  totalAchievements,
  exerciseIds,
}: Props) {
  const state = useProgress()
  const stage = getUiStage(state)
  const [showHabits, setShowHabits] = useState(false)
  const [showPatterns, setShowPatterns] = useState(false)
  const [levelParam, setLevelParam] = useState<Level | null>(readLevelParam)

  useEffect(() => {
    const sync = () => setLevelParam(readLevelParam())
    const onSelect = (event: Event) => {
      const level = (event as CustomEvent<string>).detail
      setLevelParam(level === 'A1-A2' || level === 'B1-B2' || level === 'C1-C2' ? level : null)
    }
    window.addEventListener('popstate', sync)
    document.addEventListener('astro:after-swap', sync)
    window.addEventListener('runtimeenglish:select-level', onSelect)
    return () => {
      window.removeEventListener('popstate', sync)
      document.removeEventListener('astro:after-swap', sync)
      window.removeEventListener('runtimeenglish:select-level', onSelect)
    }
  }, [])

  useLayoutEffect(() => {
    // El skeleton es un overlay con animate-pulse: se quita antes del primer
    // paint, justo cuando el dashboard real ya está montado. Así no parpadea
    // encima del contenido aunque el listener del evento se registrara tarde.
    document.getElementById('dashboard-skeleton')?.remove()
  }, [])

  useEffect(() => {
    try {
      warmSpeechEngine()
    } catch {}
    window.dispatchEvent(new CustomEvent('runtimeenglish:dashboard-ready'))
  }, [])

  const allSessions = modules.flatMap((module) =>
    module.sessions.map((session) => ({ ...session, module })),
  )
  const currentLevel =
    CERTIFICATE_LEVELS.find(
      (entry) => entry.state === 'active' && !isLevelComplete(entry.level, state),
    ) ?? CERTIFICATE_LEVELS[CERTIFICATE_LEVELS.length - 1]
  const selectedLevel: Level = levelParam ?? currentLevel.level
  const nextSession =
    allSessions
      .filter((session) => session.module.level === selectedLevel)
      .find((session) => !state.completedSessions[session.id]) ??
    allSessions.find((session) => !state.completedSessions[session.id]) ??
    allSessions[allSessions.length - 1]

  const goal = state.settings.goal ?? 'all'
  const goalLabel = GOAL_LABELS[goal]
  const nextIdx = Math.max(
    0,
    allSessions.findIndex((s) => s.id === nextSession.id),
  )
  const goalSession =
    goal === 'all'
      ? null
      : (allSessions
          .slice(nextIdx)
          .find((s) => !state.completedSessions[s.id] && isSessionRelevantToGoal(s.slug, goal)) ??
        allSessions.find(
          (s) => !state.completedSessions[s.id] && isSessionRelevantToGoal(s.slug, goal),
        ) ??
        null)
  const showGoalPick = goalSession && goalSession.id !== nextSession.id

  const doneSessions = allSessions.filter((session) => state.completedSessions[session.id]).length
  const doneExercises = Object.keys(state.completedExercises).length
  const pct = totalExercises === 0 ? 0 : Math.round((doneExercises / totalExercises) * 100)
  const unlockedAchievements = Object.keys(state.achievements).length
  const levelCertificateReady = isLevelComplete(selectedLevel, state)
  const xpLevel = Math.max(1, Math.floor(state.xp / 150) + 1)
  const intoLevel = state.xp % 150
  const levelLabel = LEVEL_LABELS[Math.min(LEVEL_LABELS.length - 1, xpLevel - 1)]

  const a1Modules = modules.filter((module) => module.level === 'A1-A2')
  const a1Done = a1Modules
    .flatMap((module) => module.sessions)
    .filter((session) => state.completedSessions[session.id]).length
  const a1Total = a1Modules.flatMap((module) => module.sessions).length
  const cefr =
    a1Total > 0 && a1Done / a1Total >= 0.9
      ? 'B1-B2'
      : a1Done / Math.max(a1Total, 1) >= 0.5
        ? 'A2 → B1'
        : 'A1-A2'

  const greeting =
    stage === 'es'
      ? `Hola${state.settings.name ? `, ${state.settings.name}` : ''}.`
      : `Hey${state.settings.name ? `, ${state.settings.name}` : ''}.`

  const totalAttempts = Object.values(state.attempts).reduce((s, v) => s + v, 0)
  const accuracy =
    totalAttempts === 0 ? 0 : Math.min(100, Math.round((doneExercises / totalAttempts) * 100))
  const review = getReviewStats(state, exerciseIds, Date.now())
  const duePhrases = getDuePhraseEntries(state).length
  const totalDue = review.due + duePhrases
  const consistency = getConsistencyStats(state)
  const plan = state.settings.plan
  const hardPhraseCount = Object.values(state.phrasebook ?? {}).filter(
    (p) => p.difficulty === 'hard',
  ).length
  const recommendations = getLearningRecommendations(state, {
    due: review.due,
    weak: review.weak,
    unseen: review.unseen,
    nextSessionSlug: nextSession.slug,
    hardPhraseCount,
    duePhrases,
  })
  const consistencyTips = getConsistencyFeedback(consistency, plan)
  const weakRate =
    totalAttempts === 0 ? 0 : Math.round(((totalAttempts - doneExercises) / totalAttempts) * 100)
  const recentErrorEvents = (state.errorEvents ?? []).slice(-120)
  const errorPatterns = aggregateErrorPatterns(recentErrorEvents).slice(0, 5)

  const reviewHref =
    duePhrases > 0 && review.due === 0 ? '/dictionary?review=1' : '/practice?mode=review'
  const reviewLabel =
    review.due > 0 && duePhrases > 0
      ? `Repasar hoy (${review.due} ejercicios + ${duePhrases} frases)`
      : review.due > 0
        ? `Repasar hoy (${review.due} ejercicios)`
        : duePhrases > 0
          ? `Repasar flashcards (${duePhrases} frases)`
          : 'Repasar hoy'
  return (
    <div class="app-container animate-fade-up">
      {!state.settings.onboarded && <OnboardingCard />}

      {/* Banner/CTA persistente si hay repasos pendientes */}
      {state.settings.onboarded && totalDue > 0 && (
        <section class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/20 bg-accent/[0.08] p-4">
          <div class="flex min-w-0 items-start gap-3">
            <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Brain class="h-4 w-4" />
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium">
                Tienes {totalDue} repaso{totalDue === 1 ? '' : 's'} hoy
              </p>
              <p class="mt-1 hidden text-[11px] leading-relaxed text-base-content/60 sm:block">
                {review.due > 0 && duePhrases > 0
                  ? `${review.due} ejercicio${review.due === 1 ? '' : 's'} (SRS) y ${duePhrases} frase${duePhrases === 1 ? '' : 's'} del diccionario (flashcards) listas para repasar.`
                  : review.due > 0
                    ? `${review.due} ejercicio${review.due === 1 ? '' : 's'} vencido${review.due === 1 ? '' : 's'} por repaso espaciado.`
                    : `${duePhrases} frase${duePhrases === 1 ? '' : 's'} del diccionario lista${duePhrases === 1 ? '' : 's'} para flashcards.`}
              </p>
            </div>
          </div>
          <div class="flex shrink-0 flex-wrap items-center gap-2">
            <a href={route(reviewHref)} class="btn btn-primary btn-sm h-9 gap-1.5 rounded-xl px-3">
              <RotateCcw class="h-3.5 w-3.5" />{' '}
              {review.due > 0 ? 'Repasar ejercicios' : 'Flashcards'}
            </a>
            {review.due > 0 && duePhrases > 0 && (
              <a
                href={route('/dictionary?review=1')}
                class="btn btn-ghost btn-sm h-9 gap-1.5 rounded-xl bg-base-100/70 px-3"
              >
                <BookText class="h-3.5 w-3.5" /> Frases ({duePhrases})
              </a>
            )}
          </div>
        </section>
      )}

      {/* Bloque 1: Acción inmediata (Continuar + Repasar hoy unificado) */}
      <section class="relative mt-2 overflow-hidden rounded-[24px] bg-base-200 p-3.5 sm:rounded-[28px] sm:p-8">
        <div class="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-accent/[0.07] blur-3xl" />
        <div class="relative">
          <div class="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
            <div class="min-w-0">
              <p class="mono-label hidden items-center gap-2 text-base-content/50 sm:flex">
                <span class="h-1.5 w-1.5 rounded-full bg-accent" />
                {t(stage, 'workspace')} · RuntimeEnglish
              </p>
              <h1 class="font-pixel mt-0 text-[1.95rem] leading-[1.02] tracking-tight sm:mt-2 sm:text-[3rem]">
                {greeting}
              </h1>
            </div>
            <div class="flex flex-wrap items-center gap-2 self-center">
              {state.settings.onboarded ? (
                <Mascot
                  mood="idle"
                  size="md"
                  lines={[tAction(stage, 'mascotHello'), tAction(stage, 'mascotHello2')]}
                />
              ) : null}
              <span class="flex items-center gap-2 rounded-full bg-base-100/70 px-2.5 py-1.5 sm:px-3">
                <span class="h-2 w-2 rounded-full bg-accent" />
                <span class="font-mono text-[11px] font-semibold text-base-content/80">{cefr}</span>
                <span class="hidden text-[10px] text-base-content/45 sm:inline">·</span>
                <span class="hidden text-[11px] font-medium text-base-content/55 sm:inline">
                  Nivel {xpLevel} · {levelLabel}
                </span>
              </span>
            </div>
          </div>

          <div class="mt-5 sm:mt-6">
            <div class="max-w-2xl">
              <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <span class="mono-label text-accent">{t(stage, 'nextUp')}</span>
                <span class="rounded-full bg-base-300/70 px-2.5 py-1 font-mono text-[10px] font-medium text-base-content/55">
                  {nextSession.module.code} · {nextSession.step}
                </span>
              </div>
              <h2 class="mt-2.5 text-balance text-[1.3rem] font-semibold leading-snug tracking-tight text-base-content/95 sm:mt-3 sm:text-[1.75rem]">
                {nextSession.title}
              </h2>
              <p class="mt-2 hidden max-w-xl text-[13px] leading-6 text-base-content/60 sm:block sm:text-[14px] sm:leading-7">
                {nextSession.summary}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-base-content/55 sm:mt-4 sm:gap-x-4 sm:gap-y-2 sm:text-[12px]">
                <span class="flex items-center gap-1.5">
                  <Clock class="h-4 w-4 text-base-content/40" />
                  {nextSession.minutes} {t(stage, 'minutes')}
                </span>
                <span class="flex items-center gap-1.5">
                  <Layers class="h-4 w-4 text-base-content/40" />
                  {nextSession.exerciseCount} {t(stage, 'exercises')}
                </span>
                <span class="rounded-full bg-base-100/80 px-2.5 py-1 font-mono text-[10px] font-semibold text-base-content/65">
                  {nextSession.cefr}
                </span>
              </div>

              <div class="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
                <a
                  href={route(`/session/${nextSession.slug}`)}
                  class="btn btn-primary h-11 w-full gap-2 rounded-xl px-5 text-[14px] sm:w-auto"
                >
                  <Play class="h-4 w-4 fill-current" />
                  {doneSessions > 0 ? t(stage, 'continue') : t(stage, 'start')}
                </a>
                {totalDue > 0 ? (
                  <a
                    href={route(reviewHref)}
                    class="btn btn-ghost h-11 w-full gap-2 rounded-xl bg-accent/10 px-4 text-accent ring-1 ring-accent/20 hover:bg-accent/15 sm:w-auto"
                  >
                    <RotateCcw class="h-4 w-4" />
                    <span class="sm:hidden">Repasar ({totalDue})</span>
                    <span class="hidden sm:inline">{reviewLabel}</span>
                  </a>
                ) : (
                  <a
                    href={route('/practice')}
                    class="btn btn-ghost h-11 w-full gap-2 rounded-xl bg-base-100/60 px-4 text-base-content/70 hover:bg-base-100 sm:w-auto"
                  >
                    <Zap class="h-4 w-4" /> Práctica rápida
                  </a>
                )}
                {review.due > 0 && duePhrases > 0 && (
                  <a
                    href={route('/dictionary?review=1')}
                    class="btn btn-ghost h-10 w-full gap-2 rounded-xl px-3 text-base-content/60 sm:w-auto"
                  >
                    <BookText class="h-4 w-4" /> Flashcards ({duePhrases})
                  </a>
                )}
              </div>

              {showGoalPick && goalSession && (
                <a
                  href={route(`/session/${goalSession.slug}`)}
                  class="mt-4 flex items-center gap-3 rounded-2xl bg-base-100/60 px-3.5 py-3 transition hover:bg-base-100/85 sm:gap-3.5 sm:px-4 sm:py-3.5"
                >
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Target class="h-4 w-4" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-[11px] font-medium tracking-wide text-accent/85">
                      Para tu objetivo · {goalLabel}
                    </span>
                    <span class="mt-0.5 block truncate text-[13px] font-medium text-base-content/85 sm:text-[14px]">
                      {goalSession.title}
                    </span>
                    <span class="mt-0.5 block text-[11px] text-base-content/45">
                      {goalSession.module.shortTitle} · {goalSession.cefr}
                    </span>
                  </span>
                  <ArrowRight class="h-4 w-4 shrink-0 text-base-content/35" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <Roadmap modules={modules} nextSessionId={nextSession.id} level={selectedLevel} />

      <details class="group mt-6 rounded-3xl bg-base-200/40 p-3 sm:p-5">
        <summary class="mono-label flex cursor-pointer list-none items-center justify-between px-2 py-1 text-base-content/55">
          <span>{stage === 'en' ? 'More tools & progress' : 'Más herramientas y progreso'}</span>
          <ChevronDown class="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <div class="mt-4 space-y-3">
          {/* Bloque 2: Estado (3-4 métricas clave, sin duplicados) */}
          <section class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric
              icon={Flame}
              label={t(stage, 'streak')}
              value={`${state.streak.current}`}
              detail={`${t(stage, 'days')} · récord ${state.streak.longest}`}
            />
            <Metric
              icon={Zap}
              label="XP · Nivel"
              value={`${state.xp}`}
              detail={`Nivel ${xpLevel} (${levelLabel}) · ${intoLevel}/150`}
            />
            <Metric
              icon={Layers}
              label="Progreso total"
              value={`${pct}%`}
              detail={`${doneExercises}/${totalExercises} ejercicios`}
            />
            <Metric
              icon={BarChart3}
              label="Precisión"
              value={`${accuracy}%`}
              detail={`${weakRate}% a reforzar · ${review.weak} débiles`}
            />
          </section>

          {/* Accesos secundarios compactos (sin duplicar métricas ni navegación) */}
          <section class="mt-3 flex flex-wrap gap-2">
            <a
              href={route('/practice')}
              class="inline-flex items-center gap-2 rounded-xl bg-base-200 px-3 py-2 text-[12px] text-base-content/70 hover:bg-base-300/70"
            >
              <Zap class="h-3.5 w-3.5 text-accent" /> Práctica{' '}
              {review.due > 0 ? `· ${review.due} SRS` : ''}
            </a>
            <a
              href={route('/dictionary')}
              class="inline-flex items-center gap-2 rounded-xl bg-base-200 px-3 py-2 text-[12px] text-base-content/70 hover:bg-base-300/70"
            >
              <BookText class="h-3.5 w-3.5 text-accent" /> Diccionario{' '}
              {duePhrases > 0
                ? `· ${duePhrases} flashcards`
                : `· ${Object.keys(state.phrasebook ?? {}).length}`}
            </a>
          </section>

          {/* Bloque 3: Profundizar (colapsable en móvil por defecto) */}
          <section class="mt-4 grid gap-3 lg:grid-cols-2">
            <div class="rounded-3xl bg-base-200 p-5">
              <button
                type="button"
                onClick={() => setShowHabits((v) => !v)}
                class="flex w-full cursor-pointer items-center justify-between gap-2 text-left"
                aria-expanded={showHabits}
              >
                <p class="flex items-center gap-2 text-sm font-medium">
                  <Calendar class="h-4 w-4 text-accent" /> Metas y hábitos
                </p>
                <span class="flex items-center gap-2">
                  {plan && (
                    <span class="hidden rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent sm:inline">
                      {plan.level ?? 'Plan'} ·{' '}
                      {GOAL_LABELS[plan.focus as keyof typeof GOAL_LABELS] ?? plan.focus}
                    </span>
                  )}
                  <ChevronDown
                    class={`h-4 w-4 text-base-content/40 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${showHabits ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </span>
              </button>
              <p
                class={`mt-2 text-[12px] text-base-content/55 transition-opacity duration-200 ${showHabits ? 'hidden' : 'block'}`}
              >
                {plan
                  ? `Hoy ${consistency.todayExercises}/${plan.dailyExercises} ejercicios · Semana ${consistency.weekSessions}/${plan.weeklySessions} sesiones.`
                  : 'Configura tu plan para ver metas diarias, semanales y mensuales.'}
                <span class="ml-1 text-base-content/40">(ver detalle)</span>
              </p>
              <div
                class={`grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${showHabits ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div class="overflow-hidden">
                  <div class="space-y-4">
                    {plan ? (
                      <>
                        <div class="grid gap-3 sm:grid-cols-3">
                          <MiniGoal
                            title="Hoy"
                            value={`${consistency.todayExercises}/${plan.dailyExercises}`}
                            sub="ejercicios"
                            pct={Math.round(
                              (consistency.todayExercises / Math.max(plan.dailyExercises, 1)) * 100,
                            )}
                            extra={`${plan.dailyMinutes} min/día`}
                          />
                          <MiniGoal
                            title="Semana"
                            value={`${consistency.weekSessions}/${plan.weeklySessions}`}
                            sub="sesiones"
                            pct={Math.round(
                              (consistency.weekSessions / Math.max(plan.weeklySessions, 1)) * 100,
                            )}
                            extra={`${consistency.weekExercises}/${plan.weeklyExercises} ej · ${consistency.activeDaysThisWeek} días`}
                          />
                          <MiniGoal
                            title="Mes"
                            value={`${consistency.monthSessions}/${plan.monthlySessions}`}
                            sub="sesiones"
                            pct={Math.round(
                              (consistency.monthSessions / Math.max(plan.monthlySessions, 1)) * 100,
                            )}
                            extra={`${consistency.monthExercises}/${plan.monthlyExercises} ej · ${consistency.activeDaysThisMonth} días`}
                          />
                        </div>
                        <div class="space-y-1.5">
                          {consistencyTips.map((tip, i) => (
                            <p
                              key={i}
                              class="flex items-start gap-2 text-[12px] leading-relaxed text-base-content/60"
                            >
                              <CheckCircle2 class="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70" />{' '}
                              {tip}
                            </p>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div class="rounded-xl bg-base-100/50 p-4 text-sm text-base-content/55">
                        <p>Aún no tienes un plan personalizado.</p>
                        <a
                          href={route('/settings')}
                          class="btn btn-primary btn-sm mt-3 h-9 rounded-xl px-3"
                        >
                          Configurar plan
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-3xl bg-base-200 p-5">
              <button
                type="button"
                onClick={() => setShowPatterns((v) => !v)}
                class="flex w-full cursor-pointer items-center justify-between gap-2 text-left"
                aria-expanded={showPatterns}
              >
                <p class="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb class="h-4 w-4 text-accent" /> Recomendaciones y patrones
                </p>
                <ChevronDown
                  class={`h-4 w-4 text-base-content/40 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${showPatterns ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              <div
                class={`mt-2 space-y-2 transition-opacity duration-200 ${showPatterns ? 'hidden' : 'block'}`}
              >
                <p class="text-[12px] text-base-content/55">
                  {recommendations[0] ? recommendations[0].title : 'Sin recomendaciones pendientes'}
                  {recommendations.length > 1 ? ` · +${recommendations.length - 1} más` : ''}.{' '}
                  <span class="text-base-content/40">(ver detalle)</span>
                </p>
                {recommendations[0] && (
                  <a
                    href={route(recommendations[0].href)}
                    class="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline"
                  >
                    {recommendations[0].title} <ArrowUpRight class="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <div
                class={`grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${showPatterns ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div class="overflow-hidden">
                  <div class="space-y-2">
                    <div class="rounded-xl bg-base-100/60 p-3">
                      <p class="text-[11px] font-medium text-base-content/60">
                        Patrones de práctica
                      </p>
                      <ul class="mt-2 space-y-1 text-[12px] leading-relaxed text-base-content/55">
                        <li>
                          • Precisión:{' '}
                          <span class="font-medium text-base-content/75">{accuracy}%</span> (
                          {doneExercises}/{totalAttempts || 0}).
                        </li>
                        <li>
                          • A reforzar:{' '}
                          <span class="font-medium text-base-content/75">{review.weak}</span>
                          {review.weak > 0 ? ' ejercicios.' : ' — bien.'}
                        </li>
                        <li class="hidden sm:list-item">
                          • Ejercicios SRS vencidos:{' '}
                          <span class="font-medium text-base-content/75">{review.due}</span>.
                        </li>
                        {duePhrases > 0 && (
                          <li class="hidden sm:list-item">
                            • Frases (flashcards) vencidas:{' '}
                            <span class="font-medium text-base-content/75">{duePhrases}</span>.
                          </li>
                        )}
                        {hardPhraseCount > 0 && (
                          <li class="hidden sm:list-item">
                            • Frases difíciles:{' '}
                            <span class="font-medium text-base-content/75">{hardPhraseCount}</span>.
                          </li>
                        )}
                      </ul>
                      {errorPatterns.length > 0 && (
                        <div class="mt-3 border-t border-base-content/10 pt-3">
                          <p class="text-[11px] font-medium text-base-content/60">
                            Patrones de error detectados
                          </p>
                          <div class="mt-2 space-y-2">
                            {errorPatterns.map((p, i) => (
                              <div
                                key={p.skill}
                                class={`rounded-lg bg-base-100/70 px-2.5 py-2 ${i > 1 ? 'hidden sm:block' : ''}`}
                              >
                                <div class="flex items-center justify-between gap-2">
                                  <span class="text-[12px] font-medium text-base-content/75">
                                    {p.label}
                                  </span>
                                  <span class="rounded-full bg-error/10 px-2 py-0.5 font-mono text-[10px] text-error">
                                    {p.count}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {recommendations.map((rec) => (
                      <a
                        key={rec.title}
                        href={route(rec.href)}
                        class="flex items-start justify-between gap-3 rounded-xl bg-base-100/50 p-3 transition hover:bg-base-100/80"
                      >
                        <div class="min-w-0">
                          <p class="text-[12px] font-medium text-base-content/80">{rec.title}</p>
                          <p class="mt-0.5 hidden text-[11px] leading-relaxed text-base-content/50 sm:block">
                            {rec.detail}
                          </p>
                        </div>
                        <ArrowUpRight
                          class={`mt-0.5 h-4 w-4 shrink-0 ${rec.tone === 'accent' ? 'text-accent' : rec.tone === 'warn' ? 'text-warning' : 'text-base-content/45'}`}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="mt-10 grid gap-3 md:grid-cols-2">
            <a
              href={route('/achievements')}
              class="group flex items-center justify-between gap-4 rounded-3xl bg-base-200 p-5 transition hover:bg-base-300/70"
            >
              <div class="flex items-center gap-3.5">
                <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-base-100/70 text-base-content/55">
                  <Trophy class="h-4.5 w-4.5" />
                </span>
                <div>
                  <p class="text-[13px] font-medium">{t(stage, 'achievements')}</p>
                  <p class="mt-0.5 text-[11px] text-base-content/40">
                    {unlockedAchievements} {tAction(stage, 'of')} {totalAchievements}{' '}
                    {tAction(stage, 'unlocked')}
                  </p>
                </div>
              </div>
              <ArrowUpRight class="h-4 w-4 text-base-content/25 transition group-hover:text-base-content/60" />
            </a>

            <a
              href={route(levelCertificateReady ? `/certificate?level=${selectedLevel}` : '/slang')}
              class="group flex items-center justify-between gap-4 rounded-3xl bg-accent/[0.055] p-5 transition hover:bg-accent/[0.085]"
            >
              <div class="flex items-center gap-3.5">
                <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  {levelCertificateReady ? (
                    <Award class="h-4.5 w-4.5" />
                  ) : (
                    <Sparkles class="h-4.5 w-4.5" />
                  )}
                </span>
                <div>
                  <p class="text-[13px] font-medium">
                    {levelCertificateReady
                      ? `${tAction(stage, 'certificateLevel')} ${selectedLevel}`
                      : tAction(stage, 'slangTitle')}
                  </p>
                  <p class="mt-0.5 text-[11px] text-base-content/40">
                    {levelCertificateReady
                      ? `${tAction(stage, 'levelReady')} · ${selectedLevel}`
                      : tAction(stage, 'slangBody')}
                  </p>
                </div>
              </div>
              <ArrowRight class="h-4 w-4 text-accent/60 transition group-hover:translate-x-0.5" />
            </a>
          </section>
        </div>
      </details>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ class?: string }>
  label: string
  value: string
  detail: string
}) {
  return (
    <div class="rounded-2xl bg-base-200 px-4 py-4">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-medium tracking-[0.04em] text-base-content/50">{label}</span>
        <Icon class="h-4 w-4 text-base-content/35" />
      </div>
      <p class="mt-3 font-mono text-[1.3rem] font-semibold tracking-tight text-base-content/90">
        {value}
      </p>
      <p class="mt-1 hidden truncate text-[11px] text-base-content/45 sm:block">{detail}</p>
    </div>
  )
}

function MiniGoal({
  title,
  value,
  sub,
  pct,
  extra,
}: {
  title: string
  value: string
  sub: string
  pct: number
  extra: string
}) {
  return (
    <div class="rounded-xl bg-base-100/60 p-3">
      <p class="text-[10px] text-base-content/45">{title}</p>
      <p class="mt-1 font-mono text-sm font-semibold">
        {value} <span class="text-[10px] font-normal text-base-content/45">{sub}</span>
      </p>
      <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-base-content/10">
        <div
          class="h-full rounded-full bg-accent"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <p class="mt-1 text-[10px] text-base-content/40">{extra}</p>
    </div>
  )
}
