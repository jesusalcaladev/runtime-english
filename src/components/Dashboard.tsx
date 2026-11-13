import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Clock,
  Flame,
  Layers,
  Play,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-preact";
import type { NavModule } from "../data/curriculum";
import Roadmap from "./Roadmap";
import { getUiStage, t, tAction } from "../lib/i18n";
import { useProgress } from "../lib/useProgress";

interface Props {
  modules: NavModule[];
  totalSessions: number;
  totalExercises: number;
  totalAchievements: number;
}

const LEVEL_LABELS = ["Rookie", "Junior", "Mid", "Senior", "Staff", "Principal"];

export default function Dashboard({
  modules,
  totalSessions,
  totalExercises,
  totalAchievements,
}: Props) {
  const state = useProgress();
  const stage = getUiStage(state);

  const allSessions = modules.flatMap((module) =>
    module.sessions.map((session) => ({ ...session, module })),
  );
  const nextSession =
    allSessions.find((session) => !state.completedSessions[session.id]) ??
    allSessions[allSessions.length - 1];

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

  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  const stats = [
    {
      icon: Flame,
      label: t(stage, "streak"),
      value: `${state.streak.current}`,
      detail: `${t(stage, "days")} · ${tAction(stage, "record")} ${state.streak.longest}`,
    },
    {
      icon: Zap,
      label: "XP",
      value: `${state.xp}`,
      detail: `${intoLevel}/150 ${tAction(stage, "toLevel")} ${xpLevel + 1}`,
    },
    {
      icon: Layers,
      label: t(stage, "sessions"),
      value: `${doneSessions}/${totalSessions}`,
      detail: `${Math.round((doneSessions / Math.max(totalSessions, 1)) * 100)}% ${tAction(stage, "of")} Core`,
    },
    {
      icon: Trophy,
      label: t(stage, "achievements"),
      value: `${unlockedAchievements}/${totalAchievements}`,
      detail: tAction(stage, "achievementsUnlocked"),
    },
  ];

  return (
    <div class="mx-auto max-w-[1120px] animate-fade-up">
      <section class="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p class="mono-label flex items-center gap-2">
            <span class="h-1 w-1 rounded-full bg-accent" />
            {t(stage, "workspace")} / DevEng Core
          </p>
          <h1 class="font-pixel mt-3 text-[2.25rem] leading-[1.05] tracking-tight sm:text-[3.25rem]">
            {greeting}
          </h1>
          <p class="mt-3 max-w-xl text-sm leading-7 text-base-content/55">
            {t(stage, "heroBody")}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="flex items-center gap-2 rounded-full bg-base-200 py-1.5 pl-3 pr-3.5">
            <span class="h-1.5 w-1.5 rounded-full bg-accent" />
            <span class="font-mono text-[11px] font-semibold text-base-content/75">{cefr}</span>
            <span class="text-[10px] text-base-content/30">·</span>
            <span class="text-[11px] text-base-content/50">
              {xpLevel} {levelLabel}
            </span>
          </span>
        </div>
      </section>

      <section class="relative mt-8 overflow-hidden rounded-[26px] bg-base-200 p-5 sm:p-8">
        <div class="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-accent/[0.065] blur-3xl" />
        <div class="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-center">
          <div class="max-w-2xl">
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="mono-label text-accent/85">{t(stage, "nextUp")}</span>
              <span class="rounded-full bg-base-300/70 px-2.5 py-1 font-mono text-[9px] text-base-content/45">
                {nextSession.module.code} · {nextSession.step}
              </span>
            </div>
            <h2 class="mt-4 text-balance text-[1.4rem] font-medium leading-snug tracking-tight sm:text-[1.7rem]">
              {nextSession.title}
            </h2>
            <p class="mt-2.5 max-w-xl text-sm leading-6 text-base-content/55">
              {nextSession.summary}
            </p>
            <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-base-content/45">
              <span class="flex items-center gap-1.5">
                <Clock class="h-3.5 w-3.5" />
                {nextSession.minutes} {t(stage, "minutes")}
              </span>
              <span class="flex items-center gap-1.5">
                <Layers class="h-3.5 w-3.5" />
                {nextSession.exerciseCount} {t(stage, "exercises")}
              </span>
              <span class="rounded-full bg-base-100/70 px-2.5 py-1 font-mono text-[10px] font-medium text-base-content/55">
                {nextSession.cefr}
              </span>
            </div>
            <div class="mt-7 flex flex-wrap items-center gap-2">
              <a
                href={`/session/${nextSession.slug}`}
                class="btn btn-primary btn-sm h-10 gap-2 rounded-xl px-4"
              >
                <Play class="h-3.5 w-3.5 fill-current" />
                {doneSessions > 0 ? t(stage, "continue") : t(stage, "start")}
              </a>
              <a
                href="/slang"
                class="btn btn-ghost btn-sm h-10 gap-2 rounded-xl px-3 text-base-content/50 hover:text-base-content"
              >
                <Sparkles class="h-3.5 w-3.5 text-accent" />
                {t(stage, "slang")}
              </a>
            </div>
          </div>

          <div class="flex items-center gap-5 lg:flex-col lg:items-end">
            <div class="relative flex h-[124px] w-[124px] items-center justify-center">
              <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90" aria-hidden="true">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  class="text-base-content/[0.08]"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={circumference - (pct / 100) * circumference}
                  class="transition-[stroke-dashoffset] duration-700 ease-out"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="font-mono text-[1.45rem] font-medium tracking-tight">{pct}%</span>
                <span class="mt-0.5 text-[9px] tracking-normal text-base-content/35">
                  {t(stage, "totalProgress")}
                </span>
              </div>
            </div>
            <div class="space-y-1 lg:text-right">
              <p class="font-mono text-[11px] font-medium text-base-content/60">
                {doneExercises} / {totalExercises}
              </p>
              <p class="text-[10px] text-base-content/35">{t(stage, "exercises")} {tAction(stage, "solved")}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} class="rounded-2xl bg-base-200 px-4 py-4">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-medium tracking-[0.1em] text-base-content/40">
                {stat.label}
              </span>
              <stat.icon class="h-3.5 w-3.5 text-base-content/30" />
            </div>
            <p class="mt-3 font-mono text-[1.3rem] font-medium tracking-tight">{stat.value}</p>
            <p class="mt-1 truncate text-[10px] text-base-content/35">{stat.detail}</p>
          </div>
        ))}
      </section>

      <Roadmap modules={modules} nextSessionId={nextSession.id} />

      <section class="mt-10 grid gap-3 md:grid-cols-2">
        <a
          href="/achievements"
          class="group flex items-center justify-between gap-4 rounded-3xl bg-base-200 p-5 transition hover:bg-base-300/70"
        >
          <div class="flex items-center gap-3.5">
            <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-base-100/70 text-base-content/55">
              <Trophy class="h-4.5 w-4.5" />
            </span>
            <div>
              <p class="text-[13px] font-medium">{t(stage, "achievements")}</p>
              <p class="mt-0.5 text-[11px] text-base-content/40">
                {unlockedAchievements} {tAction(stage, "of")} {totalAchievements} {tAction(stage, "unlocked")}
              </p>
            </div>
          </div>
          <ArrowUpRight class="h-4 w-4 text-base-content/25 transition group-hover:text-base-content/60" />
        </a>

        <a
          href={courseComplete ? "/certificate" : "/slang"}
          class="group flex items-center justify-between gap-4 rounded-3xl bg-accent/[0.055] p-5 transition hover:bg-accent/[0.085]"
        >
          <div class="flex items-center gap-3.5">
            <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              {courseComplete ? <Award class="h-4.5 w-4.5" /> : <Sparkles class="h-4.5 w-4.5" />}
            </span>
            <div>
              <p class="text-[13px] font-medium">
                {courseComplete ? "Certificate ready" : tAction(stage, "slangTitle")}
              </p>
              <p class="mt-0.5 text-[11px] text-base-content/40">
                {courseComplete
                  ? "Print your English for Programmers certificate"
                  : tAction(stage, "slangBody")}
              </p>
            </div>
          </div>
          <ArrowRight class="h-4 w-4 text-accent/60 transition group-hover:translate-x-0.5" />
        </a>
      </section>
    </div>
  );
}
