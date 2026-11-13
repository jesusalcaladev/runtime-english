import type { Exercise } from "./types";
import { evaluateAchievements } from "./achievements";
import { emitToast } from "./toast";
import { getAllExerciseIds, levelStats } from "../data/curriculum";

export interface ProgressSettings {
  theme: "light" | "dark";
  immersion: "auto" | "es" | "mixed" | "en";
  ttsEnabled: boolean;
  ttsRate: number;
  name: string;
}

export interface ProgressState {
  version: 2;
  xp: number;
  completedExercises: Record<string, number>;
  completedSessions: Record<string, number>;
  attempts: Record<string, number>;
  savedSlang: string[];
  achievements: Record<string, number>;
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string | null;
  };
  settings: ProgressSettings;
  startedAt: number;
}

export const STORAGE_KEY = "deveng_core_v2";

function preferredTheme(): "light" | "dark" {
  if (
    isBrowser() &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

export function createDefaultState(): ProgressState {
  return {
    version: 2,
    xp: 0,
    completedExercises: {},
    completedSessions: {},
    attempts: {},
    savedSlang: [],
    achievements: {},
    streak: { current: 0, longest: 0, lastActiveDate: null },
    settings: {
      theme: preferredTheme(),
      immersion: "auto",
      ttsEnabled: true,
      ttsRate: 1,
      name: "",
    },
    startedAt: Date.now(),
  };
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const first = new Date(`${a}T00:00:00`);
  const second = new Date(`${b}T00:00:00`);
  return Math.round((second.getTime() - first.getTime()) / 86_400_000);
}

// El módulo de slang pasó de m0 a m7 para que la ruta técnica empiece en A1.
// Conservamos el progreso de quien ya había completado esas sesiones.
const LEGACY_ID_MAP: Record<string, string> = {
  "m0-l1": "m7-l1",
  "m0-l2": "m7-l2",
  "m0-l1-e1": "m7-l1-e1",
  "m0-l1-e2": "m7-l1-e2",
  "m0-l1-e3": "m7-l1-e3",
  "m0-l1-e4": "m7-l1-e4",
  "m0-l2-e1": "m7-l2-e1",
  "m0-l2-e2": "m7-l2-e2",
  "m0-l2-e3": "m7-l2-e3",
  "m0-l2-e4": "m7-l2-e4",
};

function migrateKeys<T>(record: Record<string, T>): Record<string, T> {
  const next = { ...record };
  for (const [legacyId, currentId] of Object.entries(LEGACY_ID_MAP)) {
    if (legacyId in next) {
      if (!(currentId in next)) next[currentId] = next[legacyId];
      delete next[legacyId];
    }
  }
  return next;
}

function applyDocumentSettings(settings: ProgressSettings) {
  if (!isBrowser()) return;
  document.documentElement.dataset.theme =
    settings.theme === "dark" ? "deveng-dark" : "deveng";
  document.documentElement.dataset.tts = settings.ttsEnabled ? "on" : "off";
}

function mergeState(raw: unknown): ProgressState {
  const defaults = createDefaultState();
  if (!raw || typeof raw !== "object") return defaults;
  const parsed = raw as Partial<ProgressState>;
  return {
    ...defaults,
    ...parsed,
    completedExercises: migrateKeys(parsed.completedExercises ?? {}),
    completedSessions: migrateKeys(parsed.completedSessions ?? {}),
    attempts: migrateKeys(parsed.attempts ?? {}),
    savedSlang: Array.isArray(parsed.savedSlang) ? parsed.savedSlang : [],
    achievements: parsed.achievements ?? {},
    streak: { ...defaults.streak, ...(parsed.streak ?? {}) },
    settings: { ...defaults.settings, ...(parsed.settings ?? {}) },
  };
}

export function readProgress(): ProgressState {
  if (!isBrowser()) return createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return mergeState(raw ? JSON.parse(raw) : null);
  } catch {
    return createDefaultState();
  }
}

type Listener = (state: ProgressState) => void;

class ProgressStore {
  private state: ProgressState = createDefaultState();
  private listeners = new Set<Listener>();
  private hydrated = false;

  constructor() {
    if (isBrowser()) {
      this.state = readProgress();
      this.hydrated = true;
      window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY) {
          this.state = readProgress();
          this.notify();
        }
      });
    }
  }

  getState(): ProgressState {
    if (!this.hydrated && isBrowser()) {
      this.state = readProgress();
      this.hydrated = true;
    }
    return this.state;
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  };

  private persist() {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      emitToast("No se pudo guardar el progreso en localStorage.", "error");
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private commit(next: ProgressState) {
    this.state = next;
    this.persist();
    this.evaluate(next);
    this.notify();
  }

  update(updater: (state: ProgressState) => ProgressState) {
    this.commit(updater(this.getState()));
  }

  private evaluate(state: ProgressState) {
    let next = state;
    const unlocked: ReturnType<typeof evaluateAchievements> = [];

    // Los logros dan XP, y esa XP puede desbloquear otro logro en cadena.
    for (let round = 0; round < 4; round++) {
      const found = evaluateAchievements(next);
      if (found.length === 0) break;
      unlocked.push(...found);
      const timestamp = Date.now();
      next = {
        ...next,
        achievements: {
          ...next.achievements,
          ...Object.fromEntries(found.map((achievement) => [achievement.id, timestamp])),
        },
        xp: next.xp + found.reduce((sum, achievement) => sum + achievement.xp, 0),
      };
    }

    if (unlocked.length === 0) return;
    this.state = {
      ...this.state,
      achievements: next.achievements,
      xp: next.xp,
    };
    this.persist();
    unlocked.forEach((achievement) => {
      emitToast(`Logro desbloqueado · ${achievement.title}`, "achievement");
    });
  }

  recordExercise(exercise: Exercise, correct: boolean) {
    this.update((state) => {
      const previousAttempts = state.attempts[exercise.id] ?? 0;
      const attempts = { ...state.attempts, [exercise.id]: previousAttempts + 1 };
      if (!correct) return { ...state, attempts };

      const alreadyDone = Boolean(state.completedExercises[exercise.id]);
      const completedExercises = alreadyDone
        ? state.completedExercises
        : { ...state.completedExercises, [exercise.id]: Date.now() };

      return {
        ...state,
        attempts,
        completedExercises,
        xp: alreadyDone ? state.xp : state.xp + 10,
        streak: updateStreak(state.streak),
      };
    });
  }

  completeSession(sessionId: string) {
    this.update((state) => {
      if (state.completedSessions[sessionId]) return state;
      return {
        ...state,
        completedSessions: {
          ...state.completedSessions,
          [sessionId]: Date.now(),
        },
        xp: state.xp + 40,
      };
    });
  }

  toggleSavedSlang(id: string) {
    this.update((state) => {
      const exists = state.savedSlang.includes(id);
      return {
        ...state,
        savedSlang: exists
          ? state.savedSlang.filter((entry) => entry !== id)
          : [...state.savedSlang, id],
        xp: exists ? state.xp : state.xp + 5,
      };
    });
  }

  setSettings(patch: Partial<ProgressSettings>) {
    this.update((state) => ({
      ...state,
      settings: { ...state.settings, ...patch },
    }));
    applyDocumentSettings(this.getState().settings);
  }

  importProgress(raw: unknown): boolean {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
    const candidate = raw as { version?: unknown; xp?: unknown };
    if (candidate.version !== 2 || typeof candidate.xp !== "number") return false;
    if (!Number.isFinite(candidate.xp) || candidate.xp < 0) return false;
    const next = mergeState(raw);
    this.state = next;
    this.persist();
    this.notify();
    applyDocumentSettings(next.settings);
    return true;
  }

  setTheme(theme: ProgressSettings["theme"]) {
    this.setSettings({ theme });
  }

  reset() {
    const defaults = createDefaultState();
    this.commit(defaults);
    applyDocumentSettings(defaults.settings);
    emitToast("Progreso reiniciado. Empezamos de cero.", "info");
  }

  getXpLevel(): { level: number; label: string; intoLevel: number; nextAt: number } {
    const xp = this.getState().xp;
    const level = Math.max(1, Math.floor(xp / 150) + 1);
    const intoLevel = xp % 150;
    const labels = ["Rookie", "Junior", "Mid", "Senior", "Staff", "Principal"];
    return {
      level,
      label: labels[Math.min(labels.length - 1, level - 1)],
      intoLevel,
      nextAt: 150,
    };
  }
}

function updateStreak(streak: ProgressState["streak"]): ProgressState["streak"] {
  const today = todayKey();
  if (streak.lastActiveDate === today) return streak;

  let current = 1;
  if (streak.lastActiveDate && daysBetween(streak.lastActiveDate, today) === 1) {
    current = streak.current + 1;
  }

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDate: today,
  };
}

export const progressStore = new ProgressStore();

export function exerciseProgress(): { done: number; total: number; pct: number } {
  const state = progressStore.getState();
  const ids = getAllExerciseIds();
  const done = ids.filter((id) => state.completedExercises[id]).length;
  return {
    done,
    total: ids.length,
    pct: ids.length === 0 ? 0 : Math.round((done / ids.length) * 100),
  };
}

export function cefrNow(): "A1-A2" | "A2 → B1" | "B1-B2" {
  const state = progressStore.getState();
  const a = levelStats("A1-A2", state.completedSessions).pct;
  const b = levelStats("B1-B2", state.completedSessions).pct;
  if (a >= 90 && b >= 40) return "B1-B2";
  if (a >= 50) return "A2 → B1";
  return "A1-A2";
}

export function isSessionComplete(state: ProgressState, sessionId: string): boolean {
  return Boolean(state.completedSessions[sessionId]);
}

export function isExerciseDone(state: ProgressState, exerciseId: string): boolean {
  return Boolean(state.completedExercises[exerciseId]);
}
