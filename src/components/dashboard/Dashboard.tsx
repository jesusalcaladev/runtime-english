import { useState } from "preact/hooks";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BookText,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-preact";
import type { NavModule } from "../../data/curriculum";
import OnboardingCard from "./OnboardingCard";
import Roadmap from "./Roadmap";
import { GOAL_LABELS, isSessionRelevantToGoal } from "../../lib/goals";
import { getUiStage, t, tAction } from "../../lib/i18n";
import { getDuePhraseEntries, getReviewStats, progressStore, todayKey } from "../../lib/progress";
import { route } from "../../lib/routes";
import { aggregateErrorPatterns } from "../../lib/errorPatterns";
import { getConsistencyFeedback, getConsistencyStats, getLearningRecommendations } from "../../lib/studyPlan";
import { useProgress } from "../../lib/useProgress";

interface Props {
  modules: NavModule[];
  totalSessions: number;
  totalExercises: number;
  totalAchievements: number;
  exerciseIds: string[];
}

const LEVEL_LABELS = ["Rookie", "Junior", "Mid", "Senior", "Staff", "Principal"];

export default function Dashboard({
  modules,
  totalSessions,
  totalExercises,
  totalAchievements,
  exerciseIds,
}: Props) {
  const state = useProgress();
  const stage = getUiStage(state);
  const [showHabits, setShowHabits] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);

  const allSessions = modules.flatMap((module) =>
    module.sessions.map((session) => ({ ...session, module })),
  );
  const nextSession =
    allSessions.find((session) => !state.completedSessions[session.id]) ??
    allSessions[allSessions.length - 1];

  const goal = state.settings.goal ?? "all";
  const goalLabel = GOAL_LABELS[goal];
  const nextIdx = Math.max(0, allSessions.findIndex((s) => s.id === nextSession.id));
  const goalSession =
    goal === "all"
      ? null
      : allSessions.slice(nextIdx).find((s) => !state.completedSessions[s.id] && isSessionRelevantToGoal(s.slug, goal)) ??
        allSessions.find((s) => !state.completedSessions[s.id] && isSessionRelevantToGoal(s.slug, goal)) ??
        null;
  const showGoalPick = goalSession && goalSession.id !== nextSession.id;

  const doneSessions = allSessions.filter((session) => state.completedSessions[session.id]).length;
  const doneExercises = Object.keys(state.completedExercises).length;
  const pct = totalExercises === 0 ? 0 : Math.round((doneExercises / totalExercises) * 100);
  const unlockedAchievements = Object.keys(state.achievements).length;
  const courseComplete = doneSessions >= totalSessions && doneExercises >= totalExercises;
  const xpLevel = Math.max(1, Math.floor(state.xp / 150) + 1);
  const intoLevel = state.xp % 150;
  const levelLabel = LEVEL_LABELS[Math.min(LEVEL_LABELS.length - 1, xpLevel - 1)];

  const a1Modules = modules.filter((module) => module.level === "A1-A2");
  const a1Done = a1Modules
    .flatMap((module) => module.sessions)
    .filter((session) => state.completedSessions[session.id]).length;
  const a1Total = a1Modules.flatMap((module) => module.sessions).length;
  const cefr =
    a1Total > 0 && a1Done / a1Total >= 0.9
      ? "B1-B2"
      : a1Done / Math.max(a1Total, 1) >= 0.5
        ? "A2 → B1"
        : "A1-A2";

  const greeting =
    stage === "es"
      ? `Hola${state.settings.name ? `, ${state.settings.name}` : ""}.`
      : `Hey${state.settings.name ? `, ${state.settings.name}` : ""}.`;

  const totalAttempts = Object.values(state.attempts).reduce((s, v) => s + v, 0);
  const accuracy = totalAttempts === 0 ? 0 : Math.min(100, Math.round((doneExercises / totalAttempts) * 100));
  const today = todayKey();
  const practicedToday = state.streak.lastActiveDate === today;
  const showStreakReminder =
    state.settings.onboarded &&
    state.settings.reminders.enabled &&
    !practicedToday &&
    state.settings.reminders.lastNudgeDate !== today;

  const review = getReviewStats(state, exerciseIds, Date.now());
  const duePhrases = getDuePhraseEntries(state).length;
  const totalDue = review.due + duePhrases;
  const consistency = getConsistencyStats(state);
  const plan = state.settings.plan;
  const hardPhraseCount = Object.values(state.phrasebook ?? {}).filter((p) => p.difficulty === "hard").length;
  const recommendations = getLearningRecommendations(state, {
    due: review.due,
    weak: review.weak,
    unseen: review.unseen,
    nextSessionSlug: nextSession.slug,
    hardPhraseCount,
    duePhrases,
  });
  const consistencyTips = getConsistencyFeedback(consistency, plan);
  const weakRate = totalAttempts === 0 ? 0 : Math.round(((totalAttempts - doneExercises) / totalAttempts) * 100);
  const recentErrorEvents = (state.errorEvents ?? []).slice(-120);
  const errorPatterns = aggregateErrorPatterns(recentErrorEvents).slice(0, 5);

  const reviewHref =
    duePhrases > 0 && review.due === 0
      ? "/dictionary?review=1"
      : "/practice?mode=review";
  const reviewLabel =
    review.due > 0 && duePhrases > 0
      ? `Repasar hoy (${review.due} ejercicios + ${duePhrases} frases)`
      : review.due > 0
        ? `Repasar hoy (${review.due} ejercicios)`
        : duePhrases > 0
          ? `Repasar flashcards (${duePhrases} frases)`
          : "Repasar hoy";
  const showPlanIntro = Boolean(
    state.settings.onboarded &&
      state.settings.plan &&
      state.settings.planIntroDismissed === false,
  );
  const recommendedNextHref = totalDue > 0 ? route(reviewHref) : route(`/session/${nextSession.slug}`);
  const recommendedNextLabel =
    totalDue > 0 ? reviewLabel : `Continuar: ${nextSession.title}`;

  return (
    <div class="mx-auto max-w-[1120px] animate-fade-up">
      {!state.settings.onboarded && <OnboardingCard />}

      {showPlanIntro && state.settings.plan && (
        <section class="mb-4 overflow-hidden rounded-3xl border border-accent/20 bg-accent/[0.07] p-5 sm:p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="mono-label flex items-center gap-2 text-accent/90"><Sparkles class="h-3.5 w-3.5" /> Tu plan está listo</p>
              <h2 class="font-pixel mt-2 text-[1.45rem] tracking-tight sm:text-[1.7rem]">Resumen rápido y siguiente paso</h2>
              <p class="mt-2 max-w-2xl text-sm leading-relaxed text-base-content/60">
                Nivel inicial <span class="font-mono font-medium text-accent">{state.settings.plan.level ?? state.settings.diagnostic?.level ?? "A1"}</span> · objetivo <span class="font-medium text-base-content/75">{GOAL_LABELS[goal]}</span>. Meta diaria: {state.settings.plan.dailyMinutes} min / {state.settings.plan.dailyExercises} ejercicios. Semanal: {state.settings.plan.weeklySessions} sesiones / {state.settings.plan.weeklyExercises} ejercicios.
              </p>
            </div>
            <button
              type="button"
              onClick={() => progressStore.setSettings({ planIntroDismissed: true } as any)}
              class="flex h-9 w-9 items-center justify-center rounded-xl text-base-content/45 hover:bg-base-100/70 hover:text-base-content/70"
              aria-label="Cerrar resumen del plan"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <div class="mt-4 grid gap-2 sm:grid-cols-3">
            <div class="rounded-2xl bg-base-100/70 p-3"><p class="text-[10px] text-base-content/45">Diario</p><p class="mt-1 font-mono text-sm font-semibold">{state.settings.plan.dailyExercises} ejercicios · {state.settings.plan.dailyMinutes} min</p></div>
            <div class="rounded-2xl bg-base-100/70 p-3"><p class="text-[10px] text-base-content/45">Semanal</p><p class="mt-1 font-mono text-sm font-semibold">{state.settings.plan.weeklySessions} sesiones · {state.settings.plan.weeklyExercises} ej</p></div>
            <div class="rounded-2xl bg-base-100/70 p-3"><p class="text-[10px] text-base-content/45">Mensual</p><p class="mt-1 font-mono text-sm font-semibold">{state.settings.plan.monthlySessions} sesiones · {state.settings.plan.monthlyExercises} ej</p></div>
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <a href={recommendedNextHref} class="btn btn-primary h-10 gap-2 rounded-xl px-4">
              <Play class="h-4 w-4 fill-current" /> Siguiente paso: {recommendedNextLabel}
            </a>
            <a href={route("/settings")} class="btn btn-ghost h-10 rounded-xl px-4 text-base-content/65">Ajustar plan</a>
          </div>
        </section>
      )}

      {/* Banner/CTA persistente si hay repasos pendientes */}
      {state.settings.onboarded && totalDue > 0 && (
        <section class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/20 bg-accent/[0.08] p-4">
          <div class="flex min-w-0 items-start gap-3">
            <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Brain class="h-4 w-4" />
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium">Tienes {totalDue} repaso{totalDue === 1 ? "" : "s"} hoy</p>
              <p class="mt-1 text-[11px] leading-relaxed text-base-content/60">
                {review.due > 0 && duePhrases > 0
                  ? `${review.due} ejercicio${review.due === 1 ? "" : "s"} (SRS) y ${duePhrases} frase${duePhrases === 1 ? "" : "s"} del diccionario (flashcards) listas para repasar.`
                  : review.due > 0
                    ? `${review.due} ejercicio${review.due === 1 ? "" : "s"} vencido${review.due === 1 ? "" : "s"} por repaso espaciado.`
                    : `${duePhrases} frase${duePhrases === 1 ? "" : "s"} del diccionario lista${duePhrases === 1 ? "" : "s"} para flashcards.`}
              </p>
            </div>
          </div>
          <div class="flex shrink-0 flex-wrap items-center gap-2">
            <a href={route(reviewHref)} class="btn btn-primary btn-sm h-9 gap-1.5 rounded-xl px-3">
              <RotateCcw class="h-3.5 w-3.5" /> {review.due > 0 ? "Repasar ejercicios" : "Flashcards"}
            </a>
            {review.due > 0 && duePhrases > 0 && (
              <a href={route("/dictionary?review=1")} class="btn btn-ghost btn-sm h-9 gap-1.5 rounded-xl bg-base-100/70 px-3">
                <BookText class="h-3.5 w-3.5" /> Frases ({duePhrases})
              </a>
            )}
          </div>
        </section>
      )}

      {showStreakReminder && (
        <section class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/15 bg-accent/[0.06] p-4">
          <div class="flex min-w-0 items-start gap-3">
            <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Bell class="h-4 w-4" />
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium">
                {state.streak.current > 0 ? "No pierdas tu racha hoy" : "Unos minutos de práctica hoy"}
              </p>
              <p class="mt-1 text-[11px] leading-relaxed text-base-content/55">
                {state.streak.current > 0
                  ? `Llevas ${state.streak.current} día${state.streak.current === 1 ? "" : "s"} seguidos. Haz una sesión corta o práctica rápida para mantenerla.`
                  : "Mantén el hábito: una sesión corta o práctica rápida cuenta para tu racha."}
              </p>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <a
              href={route(`/session/${nextSession.slug}`)}
              class="btn btn-primary btn-sm h-9 rounded-xl px-3"
              onClick={() =>
                progressStore.setSettings({
                  reminders: { ...state.settings.reminders, lastNudgeDate: today },
                })
              }
            >
              Practicar
            </a>
            <button
              type="button"
              aria-label="Descartar recordatorio de hoy"
              class="flex h-9 w-9 items-center justify-center rounded-xl text-base-content/45 transition hover:bg-base-100/60 hover:text-base-content/70"
              onClick={() =>
                progressStore.setSettings({
                  reminders: { ...state.settings.reminders, lastNudgeDate: today },
                })
              }
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* Bloque 1: Acción inmediata (Continuar + Repasar hoy unificado) */}
      <section class="relative mt-2 overflow-hidden rounded-[28px] bg-base-200 p-5 sm:p-8">
        <div class="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-accent/[0.07] blur-3xl" />
        <div class="relative">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div class="min-w-0">
              <p class="mono-label flex items-center gap-2 text-base-content/50">
                <span class="h-1.5 w-1.5 rounded-full bg-accent" />
                {t(stage, "workspace")} · RuntimeEnglish
              </p>
              <h1 class="font-pixel mt-2 text-[2.2rem] leading-[1.02] tracking-tight sm:text-[3rem]">
                {greeting}
              </h1>
            </div>
            <span class="flex items-center gap-2 rounded-full bg-base-100/70 px-3 py-1.5">
              <span class="h-2 w-2 rounded-full bg-accent" />
              <span class="font-mono text-[11px] font-semibold text-base-content/80">{cefr}</span>
              <span class="text-[10px] text-base-content/30">·</span>
              <span class="text-[11px] font-medium text-base-content/55">Nivel {xpLevel} · {levelLabel}</span>
            </span>
          </div>

          <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div class="max-w-2xl">
              <div class="flex flex-wrap items-center gap-2.5">
                <span class="mono-label text-accent">{t(stage, "nextUp")}</span>
                <span class="rounded-full bg-base-300/70 px-2.5 py-1 font-mono text-[10px] font-medium text-base-content/55">
                  {nextSession.module.code} · {nextSession.step}
                </span>
              </div>
              <h2 class="mt-3 text-balance text-[1.45rem] font-semibold leading-snug tracking-tight text-base-content/95 sm:text-[1.75rem]">
                {nextSession.title}
              </h2>
              <p class="mt-2 max-w-xl text-[14px] leading-7 text-base-content/60">{nextSession.summary}</p>
              <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-base-content/55">
                <span class="flex items-center gap-1.5"><Clock class="h-4 w-4 text-base-content/40" />{nextSession.minutes} {t(stage, "minutes")}</span>
                <span class="flex items-center gap-1.5"><Layers class="h-4 w-4 text-base-content/40" />{nextSession.exerciseCount} {t(stage, "exercises")}</span>
                <span class="rounded-full bg-base-100/80 px-2.5 py-1 font-mono text-[10px] font-semibold text-base-content/65">{nextSession.cefr}</span>
              </div>

              <div class="mt-6 flex flex-wrap items-center gap-2.5">
                <a href={route(`/session/${nextSession.slug}`)} class="btn btn-primary h-11 gap-2 rounded-xl px-5 text-[14px]">
                  <Play class="h-4 w-4 fill-current" />
                  {doneSessions > 0 ? t(stage, "continue") : t(stage, "start")}
                </a>
                {totalDue > 0 ? (
                  <a href={route(reviewHref)} class="btn btn-ghost h-11 gap-2 rounded-xl bg-accent/10 px-4 text-accent hover:bg-accent/15 ring-1 ring-accent/20">
                    <RotateCcw class="h-4 w-4" />
                    {reviewLabel}
                  </a>
                ) : (
                  <a href={route("/practice")} class="btn btn-ghost h-11 gap-2 rounded-xl bg-base-100/60 px-4 text-base-content/70 hover:bg-base-100">
                    <Zap class="h-4 w-4" /> Práctica rápida
                  </a>
                )}
                {review.due > 0 && duePhrases > 0 && (
                  <a href={route("/dictionary?review=1")} class="btn btn-ghost h-10 gap-2 rounded-xl px-3 text-base-content/60">
                    <BookText class="h-4 w-4" /> Flashcards ({duePhrases})
                  </a>
                )}
              </div>

              {showGoalPick && goalSession && (
                <a href={route(`/session/${goalSession.slug}`)} class="mt-4 flex items-center gap-3.5 rounded-2xl bg-base-100/60 px-4 py-3.5 transition hover:bg-base-100/85">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Target class="h-4 w-4" /></span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-[11px] font-medium tracking-wide text-accent/85">Para tu objetivo · {goalLabel}</span>
                    <span class="mt-0.5 block truncate text-[14px] font-medium text-base-content/85">{goalSession.title}</span>
                    <span class="mt-0.5 block text-[11px] text-base-content/45">{goalSession.module.shortTitle} · {goalSession.cefr}</span>
                  </span>
                  <ArrowRight class="h-4 w-4 shrink-0 text-base-content/35" />
                </a>
              )}
            </div>

            {/* Progreso compacto dentro del bloque 1 */}
            <div class="flex items-center gap-4 rounded-2xl bg-base-100/50 p-4 lg:min-w-[220px] lg:flex-col lg:items-stretch">
              <div class="flex items-center gap-4 lg:justify-center">
                <div class="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center">
                  <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" class="text-base-content/[0.08]" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-accent)" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40} ${2 * Math.PI * 40}`}
                      strokeDashoffset={2 * Math.PI * 40 - (pct / 100) * 2 * Math.PI * 40}
                      class="transition-[stroke-dashoffset] duration-700 ease-out" />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="font-mono text-[0.95rem] font-semibold tracking-tight">{pct}%</span>
                  </div>
                </div>
                <div class="space-y-0.5">
                  <p class="text-[11px] font-medium text-base-content/70">Progreso total</p>
                  <p class="font-mono text-[11px] text-base-content/55">{doneExercises}/{totalExercises} ejercicios</p>
                  <p class="text-[10px] text-base-content/40">{doneSessions}/{totalSessions} sesiones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bloque 2: Estado (3-4 métricas clave, sin duplicados) */}
      <section class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={Flame} label={t(stage, "streak")} value={`${state.streak.current}`} detail={`${t(stage, "days")} · récord ${state.streak.longest}`} />
        <Metric icon={Zap} label="XP · Nivel" value={`${state.xp}`} detail={`Nivel ${xpLevel} (${levelLabel}) · ${intoLevel}/150`} />
        <Metric icon={Layers} label="Progreso" value={`${pct}%`} detail={`${doneExercises}/${totalExercises} ejercicios`} />
        <Metric icon={BarChart3} label="Precisión" value={`${accuracy}%`} detail={`${weakRate}% a reforzar · ${review.weak} débiles`} />
      </section>

      {/* Accesos secundarios compactos (sin duplicar métricas) */}
      <section class="mt-3 flex flex-wrap gap-2">
        <a href={route("/practice")} class="inline-flex items-center gap-2 rounded-xl bg-base-200 px-3 py-2 text-[12px] text-base-content/70 hover:bg-base-300/70">
          <Zap class="h-3.5 w-3.5 text-accent" /> Práctica {review.due > 0 ? `· ${review.due} SRS` : ""}
        </a>
        <a href={route("/dictionary")} class="inline-flex items-center gap-2 rounded-xl bg-base-200 px-3 py-2 text-[12px] text-base-content/70 hover:bg-base-300/70">
          <BookText class="h-3.5 w-3.5 text-accent" /> Diccionario {duePhrases > 0 ? `· ${duePhrases} flashcards` : `· ${Object.keys(state.phrasebook ?? {}).length}`}
        </a>
        <a href={route("/search")} class="inline-flex items-center gap-2 rounded-xl bg-base-200 px-3 py-2 text-[12px] text-base-content/70 hover:bg-base-300/70">
          Buscar contenido
        </a>
      </section>

      {/* Bloque 3: Profundizar (colapsable en móvil por defecto) */}
      <section class="mt-4 grid gap-3 lg:grid-cols-2">
        <div class="rounded-3xl bg-base-200 p-5">
          <button type="button" onClick={() => setShowHabits((v) => !v)} class="flex w-full items-center justify-between gap-2 text-left">
            <p class="flex items-center gap-2 text-sm font-medium"><Calendar class="h-4 w-4 text-accent" /> Metas y hábitos</p>
            <span class="flex items-center gap-2">
              {plan && <span class="hidden rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent sm:inline">{plan.level ?? "Plan"} · {GOAL_LABELS[plan.focus as keyof typeof GOAL_LABELS] ?? plan.focus}</span>}
              {showHabits ? <ChevronUp class="h-4 w-4 text-base-content/40" /> : <ChevronDown class="h-4 w-4 text-base-content/40" />}
            </span>
          </button>
          {!showHabits && (
            <p class="mt-2 text-[12px] text-base-content/55">
              {plan
                ? `Hoy ${consistency.todayExercises}/${plan.dailyExercises} ejercicios · Semana ${consistency.weekSessions}/${plan.weeklySessions} sesiones.`
                : "Configura tu plan para ver metas diarias, semanales y mensuales."}
              <span class="ml-1 text-base-content/40">(toca para ver detalle)</span>
            </p>
          )}
          {showHabits && (
            <div class="mt-4 space-y-4">
              {plan ? (
                <>
                  <div class="grid gap-3 sm:grid-cols-3">
                    <MiniGoal title="Hoy" value={`${consistency.todayExercises}/${plan.dailyExercises}`} sub="ejercicios" pct={Math.round((consistency.todayExercises / Math.max(plan.dailyExercises, 1)) * 100)} extra={`${plan.dailyMinutes} min/día`} />
                    <MiniGoal title="Semana" value={`${consistency.weekSessions}/${plan.weeklySessions}`} sub="sesiones" pct={Math.round((consistency.weekSessions / Math.max(plan.weeklySessions, 1)) * 100)} extra={`${consistency.weekExercises}/${plan.weeklyExercises} ej · ${consistency.activeDaysThisWeek} días`} />
                    <MiniGoal title="Mes" value={`${consistency.monthSessions}/${plan.monthlySessions}`} sub="sesiones" pct={Math.round((consistency.monthSessions / Math.max(plan.monthlySessions, 1)) * 100)} extra={`${consistency.monthExercises}/${plan.monthlyExercises} ej · ${consistency.activeDaysThisMonth} días`} />
                  </div>
                  <div class="space-y-1.5">
                    {consistencyTips.map((tip, i) => (
                      <p key={i} class="flex items-start gap-2 text-[12px] leading-relaxed text-base-content/60">
                        <CheckCircle2 class="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70" /> {tip}
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <div class="rounded-xl bg-base-100/50 p-4 text-sm text-base-content/55">
                  <p>Aún no tienes un plan personalizado.</p>
                  <a href={route("/settings")} class="btn btn-primary btn-sm mt-3 h-9 rounded-xl px-3">Configurar plan</a>
                </div>
              )}
            </div>
          )}
        </div>

        <div class="rounded-3xl bg-base-200 p-5">
          <button type="button" onClick={() => setShowPatterns((v) => !v)} class="flex w-full items-center justify-between gap-2 text-left">
            <p class="flex items-center gap-2 text-sm font-medium"><Lightbulb class="h-4 w-4 text-accent" /> Recomendaciones y patrones</p>
            {showPatterns ? <ChevronUp class="h-4 w-4 text-base-content/40" /> : <ChevronDown class="h-4 w-4 text-base-content/40" />}
          </button>
          {!showPatterns && (
            <div class="mt-2 space-y-2">
              <p class="text-[12px] text-base-content/55">
                {recommendations[0] ? recommendations[0].title : "Sin recomendaciones pendientes"}{recommendations.length > 1 ? ` · +${recommendations.length - 1} más` : ""}. <span class="text-base-content/40">(toca para ver detalle)</span>
              </p>
              {recommendations[0] && (
                <a href={route(recommendations[0].href)} class="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline">
                  {recommendations[0].title} <ArrowUpRight class="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
          {showPatterns && (
            <div class="mt-4 space-y-2">
              <div class="rounded-xl bg-base-100/60 p-3">
                <p class="text-[11px] font-medium text-base-content/60">Patrones de práctica</p>
                <ul class="mt-2 space-y-1 text-[12px] leading-relaxed text-base-content/55">
                  <li>• Precisión: <span class="font-medium text-base-content/75">{accuracy}%</span> ({doneExercises}/{totalAttempts || 0}).</li>
                  <li>• A reforzar: <span class="font-medium text-base-content/75">{review.weak}</span>{review.weak > 0 ? " ejercicios." : " — bien."}</li>
                  <li>• Ejercicios SRS vencidos: <span class="font-medium text-base-content/75">{review.due}</span>.</li>
                  {duePhrases > 0 && <li>• Frases (flashcards) vencidas: <span class="font-medium text-base-content/75">{duePhrases}</span>.</li>}
                  {hardPhraseCount > 0 && <li>• Frases difíciles: <span class="font-medium text-base-content/75">{hardPhraseCount}</span>.</li>}
                </ul>
                {errorPatterns.length > 0 && (
                  <div class="mt-3 border-t border-base-content/10 pt-3">
                    <p class="text-[11px] font-medium text-base-content/60">Patrones de error detectados</p>
                    <div class="mt-2 space-y-2">
                      {errorPatterns.map((p) => (
                        <div key={p.skill} class="rounded-lg bg-base-100/70 px-2.5 py-2">
                          <div class="flex items-center justify-between gap-2">
                            <span class="text-[12px] font-medium text-base-content/75">{p.label}</span>
                            <span class="rounded-full bg-error/10 px-2 py-0.5 font-mono text-[10px] text-error">{p.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {recommendations.map((rec) => (
                <a key={rec.title} href={route(rec.href)} class="flex items-start justify-between gap-3 rounded-xl bg-base-100/50 p-3 transition hover:bg-base-100/80">
                  <div class="min-w-0">
                    <p class="text-[12px] font-medium text-base-content/80">{rec.title}</p>
                    <p class="mt-0.5 text-[11px] leading-relaxed text-base-content/50">{rec.detail}</p>
                  </div>
                  <ArrowUpRight class={`mt-0.5 h-4 w-4 shrink-0 ${rec.tone === "accent" ? "text-accent" : rec.tone === "warn" ? "text-warning" : "text-base-content/30"}`} />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <Roadmap modules={modules} nextSessionId={nextSession.id} />

      <section class="mt-10 grid gap-3 md:grid-cols-2">
        <a href={route("/achievements")} class="group flex items-center justify-between gap-4 rounded-3xl bg-base-200 p-5 transition hover:bg-base-300/70">
          <div class="flex items-center gap-3.5">
            <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-base-100/70 text-base-content/55"><Trophy class="h-4.5 w-4.5" /></span>
            <div>
              <p class="text-[13px] font-medium">{t(stage, "achievements")}</p>
              <p class="mt-0.5 text-[11px] text-base-content/40">{unlockedAchievements} {tAction(stage, "of")} {totalAchievements} {tAction(stage, "unlocked")}</p>
            </div>
          </div>
          <ArrowUpRight class="h-4 w-4 text-base-content/25 transition group-hover:text-base-content/60" />
        </a>

        <a href={route(courseComplete ? "/certificate" : "/slang")} class="group flex items-center justify-between gap-4 rounded-3xl bg-accent/[0.055] p-5 transition hover:bg-accent/[0.085]">
          <div class="flex items-center gap-3.5">
            <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              {courseComplete ? <Award class="h-4.5 w-4.5" /> : <Sparkles class="h-4.5 w-4.5" />}
            </span>
            <div>
              <p class="text-[13px] font-medium">{courseComplete ? "Certificate ready" : tAction(stage, "slangTitle")}</p>
              <p class="mt-0.5 text-[11px] text-base-content/40">
                {courseComplete ? "Print your English for Programmers certificate" : tAction(stage, "slangBody")}
              </p>
            </div>
          </div>
          <ArrowRight class="h-4 w-4 text-accent/60 transition group-hover:translate-x-0.5" />
        </a>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: any; label: string; value: string; detail: string }) {
  return (
    <div class="rounded-2xl bg-base-200 px-4 py-4">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-medium tracking-[0.04em] text-base-content/50">{label}</span>
        <Icon class="h-4 w-4 text-base-content/35" />
      </div>
      <p class="mt-3 font-mono text-[1.3rem] font-semibold tracking-tight text-base-content/90">{value}</p>
      <p class="mt-1 truncate text-[11px] text-base-content/45">{detail}</p>
    </div>
  );
}

function MiniGoal({ title, value, sub, pct, extra }: { title: string; value: string; sub: string; pct: number; extra: string }) {
  return (
    <div class="rounded-xl bg-base-100/60 p-3">
      <p class="text-[10px] text-base-content/45">{title}</p>
      <p class="mt-1 font-mono text-sm font-semibold">{value} <span class="text-[10px] font-normal text-base-content/45">{sub}</span></p>
      <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-base-content/10">
        <div class="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
      <p class="mt-1 text-[10px] text-base-content/40">{extra}</p>
    </div>
  );
}
