import type { VideoLesson } from '../data/learningResources'
import type { VideoProgress, VideoQuizProgress } from './videoLabState'

export type DailyRouteKind = 'phrases' | 'resume' | 'quiz' | 'new'

export interface DailyRouteStep {
  id: string
  kind: DailyRouteKind
  lessonId: string | null
  minutes: number
  /** Frases vencidas, porcentaje de avance o precisión del quiz, según `kind`. */
  value: number
}

export interface DailyRouteInput {
  now: number
  dailyMinutes: number
  level?: string
  lessons: Array<Pick<VideoLesson, 'id' | 'title' | 'level' | 'durationSeconds'>>
  progress: Record<string, VideoProgress>
  quiz: Record<string, VideoQuizProgress>
  duePhrases: number
}

const LEGACY_STORAGE_KEY = 'runtimeenglish_daily_route_v1'
const LEGACY_DONE_KEY = 'runtimeenglish_daily_route_done_v1'
const MAX_STEPS = 4

export interface DailyRouteState {
  /** Clave local YYYY-MM-DD; una ruta de otro día se considera obsoleta. */
  date: string
  steps: DailyRouteStep[]
  done: string[]
}

export function createDefaultDailyRouteState(): DailyRouteState {
  return { date: '', steps: [], done: [] }
}

export function localDateKey(now: number): string {
  const date = new Date(now)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function isStep(value: unknown): value is DailyRouteStep {
  if (!value || typeof value !== 'object') return false
  const step = value as Record<string, unknown>
  return (
    typeof step.id === 'string' &&
    (step.kind === 'phrases' ||
      step.kind === 'resume' ||
      step.kind === 'quiz' ||
      step.kind === 'new') &&
    (step.lessonId === null || typeof step.lessonId === 'string') &&
    typeof step.minutes === 'number' &&
    typeof step.value === 'number'
  )
}

/**
 * Construye una ruta de estudio determinista y sin red: primero repasar lo que
 * vence, después retomar un video a medias, repasar el peor quiz y, por último,
 * abrir contenido nuevo del nivel del alumno.
 */
export function buildDailyRoute(input: DailyRouteInput): DailyRouteStep[] {
  const budget = Number.isFinite(input.dailyMinutes)
    ? Math.min(60, Math.max(5, input.dailyMinutes))
    : 15
  const steps: DailyRouteStep[] = []
  let used = 0

  const add = (step: Omit<DailyRouteStep, 'id'>) => {
    if (steps.length >= MAX_STEPS) return
    if (steps.length > 0 && used + step.minutes > budget) return
    steps.push({ ...step, id: `${step.kind}-${steps.length}` })
    used += step.minutes
  }

  if (input.duePhrases > 0) {
    add({
      kind: 'phrases',
      lessonId: null,
      minutes: Math.min(5, Math.max(2, Math.ceil(input.duePhrases / 3))),
      value: input.duePhrases,
    })
  }

  const resume = Object.entries(input.progress)
    .filter(
      ([id, entry]) =>
        !entry.completed &&
        entry.position > 5 &&
        entry.duration > entry.position &&
        input.lessons.some((lesson) => lesson.id === id),
    )
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0]
  if (resume) {
    const [lessonId, entry] = resume
    add({
      kind: 'resume',
      lessonId,
      minutes: Math.min(10, Math.max(2, Math.ceil((entry.duration - entry.position) / 60))),
      value: Math.min(100, Math.round((entry.position / Math.max(entry.duration, 1)) * 100)),
    })
  }

  const quiz = input.lessons
    .filter((lesson) => (input.quiz[lesson.id]?.attempts.length ?? 0) > 0)
    .map((lesson) => {
      const record = input.quiz[lesson.id]
      const total = record.attempts[0]?.total ?? 1
      const accuracy = Math.round(((record.bestCorrect ?? 0) / Math.max(total, 1)) * 100)
      return { lesson, accuracy, missed: record.missedQuestionIds.length }
    })
    .sort((a, b) => b.missed - a.missed || a.accuracy - b.accuracy)[0]
  if (quiz) {
    add({ kind: 'quiz', lessonId: quiz.lesson.id, minutes: 5, value: quiz.accuracy })
  }

  const isNew = (id: string) => {
    const entry = input.progress[id]
    return !entry || (!entry.completed && entry.position <= 5)
  }
  const newLessons = input.lessons.filter((lesson) => isNew(lesson.id))
  const next =
    newLessons.find((lesson) => lesson.level === input.level) ??
    newLessons.find((lesson) => lesson.level === 'A1-A2') ??
    newLessons[0]
  if (next) {
    add({
      kind: 'new',
      lessonId: next.id,
      minutes: Math.min(8, Math.max(3, Math.round(next.durationSeconds / 60))),
      value: 0,
    })
  }

  if (steps.length === 0) {
    add({ kind: 'phrases', lessonId: null, minutes: 5, value: 0 })
  }
  return steps
}

/** Normaliza datos locales/remotos antes de usarlos. */
export function normalizeDailyRouteState(raw: unknown): DailyRouteState {
  if (!raw || typeof raw !== 'object') return createDefaultDailyRouteState()
  const value = raw as Record<string, unknown>
  const steps = Array.isArray(value.steps) ? value.steps.filter(isStep).slice(0, 4) : []
  const done = Array.isArray(value.done)
    ? value.done.filter((id): id is string => typeof id === 'string').slice(0, 4)
    : []
  const stepIds = new Set(steps.map((step) => step.id))
  return {
    date: typeof value.date === 'string' ? value.date : '',
    steps,
    done: done.filter((id) => stepIds.has(id)),
  }
}

/** Gana la ruta del día más reciente; si es la misma, se unen los pasos hechos. */
export function mergeDailyRouteStates(
  local: DailyRouteState | undefined,
  remote: DailyRouteState | undefined,
): DailyRouteState {
  const a = normalizeDailyRouteState(local)
  const b = normalizeDailyRouteState(remote)
  if (!a.steps.length) return b
  if (!b.steps.length) return a
  if (b.date > a.date) return b
  if (a.date > b.date) return a
  return {
    date: a.date,
    steps: a.steps,
    done: Array.from(new Set([...a.done, ...b.done])).filter((id) =>
      a.steps.some((step) => step.id === id),
    ),
  }
}

/** Migración única de las claves anteriores a la sincronización. */
export function readLegacyDailyRoute(): DailyRouteState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { date?: unknown; steps?: unknown }
    const doneRaw = window.localStorage.getItem(LEGACY_DONE_KEY)
    const done = doneRaw ? (JSON.parse(doneRaw) as { ids?: unknown }).ids : []
    const state = normalizeDailyRouteState({ date: parsed.date, steps: parsed.steps, done })
    if (!state.steps.length) return null
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    window.localStorage.removeItem(LEGACY_DONE_KEY)
    return state
  } catch {
    return null
  }
}
