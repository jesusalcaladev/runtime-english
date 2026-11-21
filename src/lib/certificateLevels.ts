import { ALL_SESSIONS } from '../data/curriculum'
import type { Level } from './types'

/**
 * Fuente única de verdad para los certificados por nivel.
 * El orden del array define también el desbloqueo progresivo (A1-A2 → B1-B2 → C1-C2).
 */

export interface ProgressForCertificates {
  completedSessions: Record<string, number>
  completedExercises: Record<string, number>
}

export interface CertificateLevelInfo {
  level: Level
  label: string
  i18nKey: 'a1' | 'b1' | 'c1'
  state: 'active' | 'upcoming'
}

export const CERTIFICATE_LEVELS: readonly CertificateLevelInfo[] = [
  { level: 'A1-A2', label: 'A1-A2', i18nKey: 'a1', state: 'active' },
  { level: 'B1-B2', label: 'B1-B2', i18nKey: 'b1', state: 'active' },
  { level: 'C1-C2', label: 'C1-C2', i18nKey: 'c1', state: 'active' },
] as const

const LEVEL_INDEX = new Map<Level, number>(CERTIFICATE_LEVELS.map((info, i) => [info.level, i]))

export function getCertificateLevelInfo(level: Level): CertificateLevelInfo {
  const index = LEVEL_INDEX.get(level) ?? 0
  return CERTIFICATE_LEVELS[index]
}

export function isUpcomingLevel(level: Level): boolean {
  return getCertificateLevelInfo(level).state === 'upcoming'
}

export function getLevelSessions(level: Level) {
  return ALL_SESSIONS.filter((entry) => entry.module.level === level)
}

export function getLevelStats(level: Level, progress: ProgressForCertificates) {
  const sessions = getLevelSessions(level)
  const exercises = sessions.flatMap((entry) => entry.session.exercises)
  const doneSessions = sessions.filter(
    (entry) => progress.completedSessions[entry.session.id],
  ).length
  const doneExercises = exercises.filter(
    (exercise) => progress.completedExercises[exercise.id],
  ).length
  return {
    sessions: sessions.length,
    exercises: exercises.length,
    doneSessions,
    doneExercises,
  }
}

/** Todas las sesiones y ejercicios del nivel están completados. */
export function isLevelComplete(level: Level, progress: ProgressForCertificates): boolean {
  if (isUpcomingLevel(level)) return false
  const stats = getLevelStats(level, progress)
  return (
    stats.sessions > 0 &&
    stats.doneSessions === stats.sessions &&
    stats.doneExercises === stats.exercises
  )
}

export function getPreviousLevel(level: Level): Level | undefined {
  const index = LEVEL_INDEX.get(level) ?? 0
  return index > 0 ? CERTIFICATE_LEVELS[index - 1].level : undefined
}

/** Desbloqueo progresivo: el nivel anterior debe estar completo. */
export function isLevelUnlocked(level: Level, progress: ProgressForCertificates): boolean {
  if (isUpcomingLevel(level)) return false
  const previous = getPreviousLevel(level)
  return !previous || isLevelComplete(previous, progress)
}

export function isLevelCertificateReady(level: Level, progress: ProgressForCertificates): boolean {
  return isLevelUnlocked(level, progress) && isLevelComplete(level, progress)
}

/** Sufijo corto para IDs de certificado únicos por nivel (A1-A2 → A1A2). */
export function levelSlug(level: Level): string {
  return level.replace(/[^A-Z0-9]/gi, '').toUpperCase()
}

export function levelCertificateId(baseId: string, level: Level): string {
  return `${baseId}-${levelSlug(level)}`
}
