import { ALL_SESSIONS } from '../data/curriculum'
import type { ProgressState } from './progress'

/** Un ejercicio se considera dominado tras 2 aciertos seguidos (FSRS). */
export const MASTERY_STREAK = 2
/** Una sesión se domina al tener al menos este porcentaje de ejercicios dominados. */
export const MASTERY_THRESHOLD = 85

export interface SessionMastery {
  mastered: number
  total: number
  pct: number
  isMastered: boolean
}

export function getSessionMastery(state: ProgressState, sessionId: string): SessionMastery {
  const session = ALL_SESSIONS.find((entry) => entry.session.id === sessionId)?.session
  if (!session) return { mastered: 0, total: 0, pct: 0, isMastered: false }

  const mastered = session.exercises.filter(
    (exercise) => (state.exerciseSrs?.[exercise.id]?.correctStreak ?? 0) >= MASTERY_STREAK,
  ).length
  const total = session.exercises.length
  const pct = total === 0 ? 0 : Math.round((mastered / total) * 100)
  return { mastered, total, pct, isMastered: pct >= MASTERY_THRESHOLD }
}

export function getMasteredSessionIds(state: ProgressState): string[] {
  return ALL_SESSIONS.filter(({ session }) => getSessionMastery(state, session.id).isMastered).map(
    ({ session }) => session.id,
  )
}
