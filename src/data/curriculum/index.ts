import { getSessionMinutes } from '../../lib/sessionTime'
import type { Exercise, Module, Session } from '../../lib/types'
import { m1 } from './m1'
import { m2 } from './m2'
import { m3 } from './m3'
import { m4 } from './m4'
import { m5 } from './m5'
import { m6 } from './m6'
import { m7 } from './m7'
import { m8 } from './m8'
import { m9 } from './m9'
import { m10 } from './m10'
import { m11 } from './m11'

/**
 * Añadir un módulo nuevo = crear su archivo y sumarlo a esta lista.
 * La ruta empieza en A1 y termina con práctica intensiva y repasos.
 */
export const MODULES: Module[] = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11]

export interface SessionWithModule {
  session: Session
  module: Module
}

export interface NavSession {
  id: string
  slug: string
  title: string
  step: string
  cefr: Session['cefr']
  minutes: number
  summary: string
  exerciseCount: number
}

export interface NavModule {
  id: string
  code: string
  level: Module['level']
  title: string
  shortTitle: string
  description: string
  featured: boolean
  sessions: NavSession[]
}

/** Versión ligera del currículo para islas de cliente (no serializa ejercicios). */
export function getNavData(): NavModule[] {
  return MODULES.map((module) => ({
    id: module.id,
    code: module.code,
    level: module.level,
    title: module.title,
    shortTitle: module.shortTitle,
    description: module.description,
    featured: Boolean(module.featured),
    sessions: module.sessions.map((session) => ({
      id: session.id,
      slug: session.slug,
      title: session.title,
      step: session.step,
      cefr: session.cefr,
      minutes: getSessionMinutes(session),
      summary: session.summary,
      exerciseCount: session.exercises.length,
    })),
  }))
}

/**
 * Orden canónico del roadmap: se respeta el orden de `MODULES` y de cada
 * `module.sessions`. Algunas sesiones de repaso mantienen un ID de otro módulo
 * (p. ej. `m8-l3` integrada en MOD 03) a propósito: el roadmap las muestra con
 * la etiqueta "Integrada" y `getAdjacentSession` las sigue en este mismo orden.
 */
export const ALL_SESSIONS: SessionWithModule[] = MODULES.flatMap((module) =>
  module.sessions.map((session) => ({ session, module })),
)

export const TOTAL_SESSIONS = ALL_SESSIONS.length

export const TOTAL_EXERCISES = ALL_SESSIONS.reduce(
  (total, entry) => total + entry.session.exercises.length,
  0,
)

export function getSessionBySlug(slug: string): SessionWithModule | undefined {
  return ALL_SESSIONS.find((entry) => entry.session.slug === slug)
}

export function getSessionById(id: string): SessionWithModule | undefined {
  return ALL_SESSIONS.find((entry) => entry.session.id === id)
}

export function getAdjacentSession(id: string): {
  previous?: SessionWithModule
  next?: SessionWithModule
} {
  const index = ALL_SESSIONS.findIndex((entry) => entry.session.id === id)
  return {
    previous: index > 0 ? ALL_SESSIONS[index - 1] : undefined,
    next: index >= 0 && index < ALL_SESSIONS.length - 1 ? ALL_SESSIONS[index + 1] : undefined,
  }
}

export function getFirstIncompleteSession(
  completedSessions: Record<string, unknown>,
): SessionWithModule {
  return (
    ALL_SESSIONS.find((entry) => !completedSessions[entry.session.id]) ??
    ALL_SESSIONS[ALL_SESSIONS.length - 1]
  )
}

export function getAllExerciseIds(): string[] {
  return ALL_SESSIONS.flatMap((entry) =>
    entry.session.exercises.map((exercise: Exercise) => exercise.id),
  )
}

export function levelStats(level: Module['level'], completedSessions: Record<string, unknown>) {
  const entries = ALL_SESSIONS.filter((entry) => entry.module.level === level)
  const done = entries.filter((entry) => completedSessions[entry.session.id]).length
  return {
    done,
    total: entries.length,
    pct: entries.length === 0 ? 0 : Math.round((done / entries.length) * 100),
  }
}
