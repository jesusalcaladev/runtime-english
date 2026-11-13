import type { ProgressState } from "./progress";
import { ALL_SESSIONS, levelStats } from "../data/curriculum";
import { getLanguageStatus } from "./i18n";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  xp: number;
  target?: number;
  progress?: (state: ProgressState) => number;
  check: (state: ProgressState) => boolean;
}

function completedSessions(state: ProgressState): number {
  return Object.keys(state.completedSessions).length;
}

function completedExercises(state: ProgressState): number {
  return Object.keys(state.completedExercises).length;
}

function startedLevel(state: ProgressState, level: "A1-A2" | "B1-B2"): boolean {
  return ALL_SESSIONS.some(
    (entry) =>
      entry.module.level === level && Boolean(state.completedSessions[entry.session.id]),
  );
}

function totalExercises(): number {
  return ALL_SESSIONS.reduce((total, entry) => total + entry.session.exercises.length, 0);
}

function accuracyPct(state: ProgressState): number {
  const attempts = Object.values(state.attempts).reduce((total, value) => total + value, 0);
  if (attempts === 0) return 0;
  return Math.min(100, Math.round((completedExercises(state) / attempts) * 100));
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-step",
    title: "Primer commit",
    description: "Resuelve tu primer ejercicio.",
    icon: "git-commit-horizontal",
    tier: "bronze",
    xp: 10,
    check: (state) => completedExercises(state) >= 1,
  },
  {
    id: "first-session",
    title: "Sesión cerrada",
    description: "Completa tu primera sesión entera.",
    icon: "flag",
    tier: "bronze",
    xp: 20,
    check: (state) => completedSessions(state) >= 1,
  },
  {
    id: "three-sessions",
    title: "Tres sesiones",
    description: "Completa 3 sesiones y empieza a construir el hábito.",
    icon: "layers",
    tier: "bronze",
    xp: 25,
    target: 3,
    progress: completedSessions,
    check: (state) => completedSessions(state) >= 3,
  },
  {
    id: "five-sessions",
    title: "En racha",
    description: "Completa 5 sesiones.",
    icon: "layers",
    tier: "silver",
    xp: 50,
    target: 5,
    progress: completedSessions,
    check: (state) => completedSessions(state) >= 5,
  },
  {
    id: "half-core",
    title: "Media ruta",
    description: "Completa la mitad de las sesiones del Core.",
    icon: "git-merge",
    tier: "silver",
    xp: 60,
    target: Math.floor(ALL_SESSIONS.length / 2),
    progress: completedSessions,
    check: (state) => completedSessions(state) >= Math.floor(ALL_SESSIONS.length / 2),
  },
  {
    id: "a1-complete",
    title: "Base sólida",
    description: "Completa todas las sesiones de A1–A2.",
    icon: "graduation-cap",
    tier: "gold",
    xp: 100,
    check: (state) => {
      const stats = levelStats("A1-A2", state.completedSessions);
      return stats.total > 0 && stats.done === stats.total;
    },
  },
  {
    id: "b1-started",
    title: "Nivel producción",
    description: "Completa una sesión de B1–B2.",
    icon: "terminal",
    tier: "silver",
    xp: 30,
    check: (state) => startedLevel(state, "B1-B2"),
  },
  {
    id: "b1-complete",
    title: "Producción completa",
    description: "Completa todas las sesiones de B1–B2.",
    icon: "terminal",
    tier: "gold",
    xp: 120,
    target: levelStats("B1-B2", {}).total,
    progress: (state) => levelStats("B1-B2", state.completedSessions).done,
    check: (state) => {
      const stats = levelStats("B1-B2", state.completedSessions);
      return stats.total > 0 && stats.done === stats.total;
    },
  },
  {
    id: "streak-3",
    title: "Tres días seguidos",
    description: "Mantén una racha de 3 días.",
    icon: "flame",
    tier: "bronze",
    xp: 25,
    check: (state) => state.streak.longest >= 3,
  },
  {
    id: "streak-7",
    title: "Semana completa",
    description: "Mantén una racha de 7 días.",
    icon: "calendar-check",
    tier: "gold",
    xp: 80,
    check: (state) => state.streak.longest >= 7,
  },
  {
    id: "xp-500",
    title: "500 XP",
    description: "Acumula 500 XP de práctica.",
    icon: "zap",
    tier: "silver",
    xp: 50,
    target: 500,
    progress: (state) => state.xp,
    check: (state) => state.xp >= 500,
  },
  {
    id: "xp-1000",
    title: "1000 XP",
    description: "Acumula 1000 XP de práctica sostenida.",
    icon: "zap",
    tier: "gold",
    xp: 100,
    target: 1000,
    progress: (state) => state.xp,
    check: (state) => state.xp >= 1000,
  },
  {
    id: "accuracy-10",
    title: "Precisión",
    description: "Resuelve al menos 10 ejercicios con 80% de precisión.",
    icon: "target",
    tier: "silver",
    xp: 45,
    target: 80,
    progress: (state) =>
      completedExercises(state) >= 10
        ? accuracyPct(state)
        : Math.round((completedExercises(state) / 10) * 80),
    check: (state) => completedExercises(state) >= 10 && accuracyPct(state) >= 80,
  },
  {
    id: "slang-25",
    title: "Vocabulario vivo",
    description: "Guarda 25 términos del deck de slang.",
    icon: "bookmark",
    tier: "silver",
    xp: 40,
    target: 25,
    progress: (state) => state.savedSlang.length,
    check: (state) => state.savedSlang.length >= 25,
  },
  {
    id: "slang-saved",
    title: "Cazador de slang",
    description: "Guarda 10 términos del deck de slang.",
    icon: "bookmark",
    tier: "bronze",
    xp: 25,
    target: 10,
    progress: (state) => state.savedSlang.length,
    check: (state) => state.savedSlang.length >= 10,
  },
  {
    id: "slang-complete",
    title: "Al día con 2026",
    description: "Completa las dos sesiones de slang.",
    icon: "message-square",
    tier: "gold",
    xp: 60,
    target: 2,
    progress: (state) =>
      Number(Boolean(state.completedSessions["m7-l1"])) +
      Number(Boolean(state.completedSessions["m7-l2"])),
    check: (state) =>
      Boolean(state.completedSessions["m7-l1"]) &&
      Boolean(state.completedSessions["m7-l2"]),
  },
  {
    id: "immersion",
    title: "Inmersión",
    description: "Alcanza la interfaz bilingüe o activa la inmersión en Ajustes.",
    icon: "languages",
    tier: "silver",
    xp: 30,
    target: 28,
    progress: (state) =>
      state.settings.immersion !== "auto" && state.settings.immersion !== "es"
        ? 28
        : getLanguageStatus(state).score,
    check: (state) =>
      getLanguageStatus(state).autoStage !== "es" ||
      (state.settings.immersion !== "auto" && state.settings.immersion !== "es"),
  },
  {
    id: "all-exercises",
    title: "Todos los ejercicios",
    description: "Resuelve todos los ejercicios del currículo.",
    icon: "check-check",
    tier: "gold",
    xp: 150,
    target: totalExercises(),
    progress: completedExercises,
    check: (state) => completedExercises(state) >= totalExercises(),
  },
  {
    id: "all-sessions",
    title: "Core completo",
    description: "Completa todas las sesiones del Core.",
    icon: "trophy",
    tier: "gold",
    xp: 150,
    target: ALL_SESSIONS.length,
    progress: completedSessions,
    check: (state) => completedSessions(state) === ALL_SESSIONS.length,
  },
];

export function evaluateAchievements(state: ProgressState): Achievement[] {
  return ACHIEVEMENTS.filter(
    (achievement) => !state.achievements[achievement.id] && achievement.check(state),
  );
}
