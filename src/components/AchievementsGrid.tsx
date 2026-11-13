import { useState } from "preact/hooks";
import {
  Award,
  Bookmark,
  CalendarCheck,
  CheckCheck,
  Flag,
  Flame,
  GitCommitHorizontal,
  GitMerge,
  GraduationCap,
  Languages,
  Layers,
  Lock,
  MessageSquare,
  Printer,
  Target,
  Terminal,
  Trophy,
  Zap,
} from "lucide-preact";
import type { ProgressState } from "../lib/progress";
import { useProgress } from "../lib/useProgress";

export interface AchievementMeta {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  xp: number;
  target?: number;
  progress?: (state: ProgressState) => number;
}

interface Props {
  achievements: AchievementMeta[];
  totalSessions: number;
  totalExercises: number;
}

const ICONS: Record<string, typeof Trophy> = {
  "git-commit-horizontal": GitCommitHorizontal,
  flag: Flag,
  layers: Layers,
  "graduation-cap": GraduationCap,
  terminal: Terminal,
  flame: Flame,
  "calendar-check": CalendarCheck,
  zap: Zap,
  bookmark: Bookmark,
  "message-square": MessageSquare,
  languages: Languages,
  trophy: Trophy,
  "git-merge": GitMerge,
  target: Target,
  "check-check": CheckCheck,
};

const TIERS = {
  bronze: {
    label: "Bronce",
    bg: "bg-amber-600/10",
    text: "text-amber-700 dark:text-amber-400",
  },
  silver: {
    label: "Plata",
    bg: "bg-slate-400/10",
    text: "text-slate-500 dark:text-slate-300",
  },
  gold: {
    label: "Oro",
    bg: "bg-yellow-500/10",
    text: "text-yellow-600 dark:text-yellow-400",
  },
} as const;

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type Filter = "all" | "progress" | "unlocked";

function progressOf(achievement: AchievementMeta, state: ProgressState): number {
  if (!achievement.target || !achievement.progress) return 0;
  return Math.min(achievement.target, Math.max(0, achievement.progress(state)));
}

export default function AchievementsGrid({ achievements, totalSessions, totalExercises }: Props) {
  const state = useProgress();
  const [filter, setFilter] = useState<Filter>("all");
  const unlocked = achievements.filter((achievement) => state.achievements[achievement.id]);
  const inProgress = achievements.filter(
    (achievement) =>
      !state.achievements[achievement.id] && progressOf(achievement, state) > 0,
  );
  const visible = achievements.filter((achievement) => {
    if (filter === "unlocked") return Boolean(state.achievements[achievement.id]);
    if (filter === "progress") return inProgress.includes(achievement);
    return true;
  });
  const xpFromAchievements = unlocked.reduce((total, achievement) => total + achievement.xp, 0);
  const pct = Math.round((unlocked.length / Math.max(achievements.length, 1)) * 100);
  const doneSessions = Object.keys(state.completedSessions).length;
  const doneExercises = Object.keys(state.completedExercises).length;
  const courseComplete = doneSessions >= totalSessions && doneExercises >= totalExercises;

  return (
    <div class="space-y-6">
      <a
        href="/certificate"
        class={`group flex items-center justify-between gap-4 rounded-3xl p-5 transition ${
          courseComplete
            ? "bg-accent/[0.08] hover:bg-accent/[0.12]"
            : "bg-base-200/70 hover:bg-base-200"
        }`}
      >
        <div class="flex items-center gap-3.5">
          <span
            class={`flex h-11 w-11 items-center justify-center rounded-2xl ${
              courseComplete ? "bg-accent/15 text-accent" : "bg-base-100/70 text-base-content/40"
            }`}
          >
            <Award class="h-5 w-5" />
          </span>
          <div>
            <p class="text-[13px] font-medium">
              {courseComplete ? "Certificate unlocked" : "Completion certificate"}
            </p>
            <p class="mt-0.5 text-[11px] text-base-content/45">
              {courseComplete
                ? "Print your English for Programmers certificate."
                : `Finish everything to unlock it · ${doneSessions}/${totalSessions} sessions, ${doneExercises}/${totalExercises} exercises`}
            </p>
          </div>
        </div>
        <span class="flex items-center gap-1.5 text-[11px] font-medium text-base-content/45 transition group-hover:text-base-content/70">
          <Printer class="h-4 w-4" />
          Open
        </span>
      </a>
      <div class="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Desbloqueados", value: `${unlocked.length}/${achievements.length}` },
          { label: "En progreso", value: `${inProgress.length}` },
          { label: "XP de logros", value: `${xpFromAchievements}` },
        ].map((stat) => (
          <div key={stat.label} class="rounded-2xl bg-base-200 p-4">
            <p class="text-[10px] font-medium tracking-[0.1em] text-base-content/35">
              {stat.label}
            </p>
            <p class="mt-2 font-mono text-xl font-medium tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div class="flex items-center gap-3">
        <div class="h-1 flex-1 overflow-hidden rounded-full bg-base-content/[0.07]">
          <div
            class="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span class="w-8 text-right font-mono text-[10px] text-base-content/30">{pct}%</span>
      </div>

      <div class="flex flex-wrap items-center gap-1.5">
        {([
          ["all", "Todos"],
          ["progress", "En progreso"],
          ["unlocked", "Desbloqueados"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            class={`rounded-full px-3 py-1.5 text-[10px] font-medium transition ${
              filter === value
                ? "bg-base-content text-base-100"
                : "bg-base-200 text-base-content/40 hover:text-base-content/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((achievement) => {
          const unlockedAt = state.achievements[achievement.id];
          const Icon = ICONS[achievement.icon] ?? Trophy;
          const tier = TIERS[achievement.tier];
          const current = progressOf(achievement, state);
          const progressPct = achievement.target
            ? Math.min(100, Math.round((current / achievement.target) * 100))
            : 0;
          return (
            <article
              key={achievement.id}
              class={`rounded-2xl p-4 transition ${
                unlockedAt ? "bg-base-200" : "bg-base-200/45"
              }`}
            >
              <div class="flex items-start gap-3">
                <span
                  class={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    unlockedAt
                      ? `${tier.bg} ${tier.text}`
                      : "bg-base-100/50 text-base-content/20"
                  }`}
                >
                  {unlockedAt ? <Icon class="h-5 w-5" /> : <Lock class="h-4 w-4" />}
                </span>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <h3
                      class={`text-sm font-medium ${
                        unlockedAt ? "text-base-content" : "text-base-content/35"
                      }`}
                    >
                      {achievement.title}
                    </h3>
                    <span
                      class={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-medium tracking-wide ${
                        unlockedAt
                          ? `${tier.bg} ${tier.text}`
                          : "bg-base-100/50 text-base-content/20"
                      }`}
                    >
                      {tier.label}
                    </span>
                  </div>
                  <p
                    class={`mt-1.5 text-[11px] leading-relaxed ${
                      unlockedAt ? "text-base-content/45" : "text-base-content/25"
                    }`}
                  >
                    {achievement.description}
                  </p>
                </div>
              </div>

              {achievement.target ? (
                <div class="mt-3 space-y-1.5">
                  <div class="h-0.5 overflow-hidden rounded-full bg-base-content/[0.06]">
                    <div
                      class={`h-full rounded-full transition-all duration-500 ${
                        unlockedAt ? "bg-accent" : "bg-accent/50"
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p class="font-mono text-[9px] text-base-content/30">
                    {current}/{achievement.target}
                  </p>
                </div>
              ) : null}

              <div class="mt-3.5 flex items-center justify-between gap-2">
                <span class="font-mono text-[10px] text-base-content/30">
                  +{achievement.xp} XP
                </span>
                <span
                  class={`text-[10px] font-medium ${
                    unlockedAt ? "text-accent" : "text-base-content/20"
                  }`}
                >
                  {unlockedAt ? `Desbloqueado · ${formatDate(unlockedAt)}` : "Bloqueado"}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
