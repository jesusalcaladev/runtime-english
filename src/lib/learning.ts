import { ALL_SESSIONS } from '../data/curriculum'
import { type ErrorSkill, inferExerciseSkills, SKILL_LABELS } from './errorPatterns'
import { getDuePhraseEntries, isExerciseDue, type ProgressState } from './progress'

export type ReviewTaskKind = 'retention' | 'exercise' | 'phrase'

export interface ReviewTask {
  id: string
  kind: ReviewTaskKind
  dueAt: number
  label: string
  prompt: string
  answer?: string
  skill?: ErrorSkill
  exerciseId?: string
  phraseId?: string
  sessionTitle?: string
}

export interface SkillProfileItem {
  skill: ErrorSkill
  label: string
  seen: number
  errors: number
  accuracy: number
  weakness: number
  recentErrors: number
}

const DAY_MS = 86_400_000

/** Perfil de habilidades derivado del historial real de intentos y errores. */
export function getSkillProfile(state: ProgressState, now = Date.now()): SkillProfileItem[] {
  const totals = new Map<ErrorSkill, { seen: number; errors: number; recentErrors: number }>()
  const exerciseSkills = new Map<string, ErrorSkill[]>()
  const findSkills = (exerciseId: string): ErrorSkill[] => {
    let skills = exerciseSkills.get(exerciseId)
    if (!skills) {
      const entry = ALL_SESSIONS.flatMap(({ session }) => session.exercises).find(
        (exercise) => exercise.id === exerciseId,
      )
      skills = entry ? inferExerciseSkills(entry) : []
      exerciseSkills.set(exerciseId, skills)
    }
    return skills
  }

  for (const [exerciseId, attempts] of Object.entries(state.attempts ?? {})) {
    if (attempts <= 0) continue
    const errors = (state.errorEvents ?? []).filter(
      (event) => event.exerciseId === exerciseId,
    ).length
    const recentErrors = (state.errorEvents ?? []).filter(
      (event) => event.exerciseId === exerciseId && now - event.at <= 7 * DAY_MS,
    ).length
    for (const skill of findSkills(exerciseId)) {
      const current = totals.get(skill) ?? { seen: 0, errors: 0, recentErrors: 0 }
      current.seen += attempts
      current.errors += errors
      current.recentErrors += recentErrors
      totals.set(skill, current)
    }
  }

  return Array.from(totals.entries())
    .map(([skill, value]) => {
      const accuracy = value.seen === 0 ? 0 : Math.max(0, (value.seen - value.errors) / value.seen)
      const recency = Math.min(1, value.recentErrors / 3)
      return {
        skill,
        label: SKILL_LABELS[skill],
        seen: value.seen,
        errors: value.errors,
        accuracy: Math.round(accuracy * 100),
        weakness: Math.min(1, (1 - accuracy) * 0.7 + recency * 0.3),
        recentErrors: value.recentErrors,
      }
    })
    .sort((a, b) => b.weakness - a.weakness || b.seen - a.seen)
}

/** Una sola cola de repaso: retención diferida, ejercicios SRS y frases. */
export function getUnifiedReviewQueue(
  state: ProgressState,
  now = Date.now(),
  limit = 20,
): ReviewTask[] {
  const tasks: ReviewTask[] = []
  const exerciseById = new Map(
    ALL_SESSIONS.flatMap(({ session }) =>
      session.exercises.map((exercise) => [exercise.id, { exercise, session }] as const),
    ),
  )

  for (const [key, check] of Object.entries(state.retentionChecks ?? {})) {
    if (check.done || check.dueAt > now) continue
    const found = exerciseById.get(check.exerciseId)
    if (!found) continue
    tasks.push({
      id: `retention-${key}`,
      kind: 'retention',
      dueAt: check.dueAt,
      label: check.offsetDays === 1 ? 'Retención 24 h' : 'Retención 72 h',
      prompt: found.exercise.prompt,
      answer: 'answer' in found.exercise ? String(found.exercise.answer) : undefined,
      skill: inferExerciseSkills(found.exercise)[0],
      exerciseId: check.exerciseId,
      sessionTitle: found.session.title,
    })
  }

  const retentionDueIds = new Set(
    Object.values(state.retentionChecks ?? {})
      .filter((check) => !check.done && check.dueAt <= now)
      .map((check) => check.exerciseId),
  )

  for (const { session, exercise } of ALL_SESSIONS.flatMap(({ session }) =>
    session.exercises.map((exercise) => ({ session, exercise })),
  )) {
    if (retentionDueIds.has(exercise.id)) continue
    if (!isExerciseDue(state, exercise.id, now)) continue
    const srs = state.exerciseSrs?.[exercise.id]
    tasks.push({
      id: `exercise-${exercise.id}`,
      kind: 'exercise',
      dueAt: srs?.due ?? now,
      label: session.title,
      prompt: exercise.prompt,
      answer: 'answer' in exercise ? String(exercise.answer) : undefined,
      skill: inferExerciseSkills(exercise)[0],
      exerciseId: exercise.id,
      sessionTitle: session.title,
    })
  }

  for (const entry of getDuePhraseEntries(state, now)) {
    tasks.push({
      id: `phrase-${entry.id}`,
      kind: 'phrase',
      dueAt: entry.due ?? now,
      label: 'Frase · diccionario',
      prompt: entry.en,
      answer: entry.es,
      phraseId: entry.id,
    })
  }

  return tasks.sort((a, b) => a.dueAt - b.dueAt).slice(0, limit)
}

export interface NextRecommendation {
  sessionId: string
  slug: string
  title: string
  reason: string
  reviewFirst: boolean
  dueCount: number
  weakSkill?: SkillProfileItem
}

/**
 * Siguiente paso con criterio de dominio: primero repasar si hay deuda,
 * después reforzar la habilidad más débil y, si no, avanzar en el orden canónico.
 */
export function getRecommendedNextSession(
  state: ProgressState,
  now = Date.now(),
): NextRecommendation {
  const dueCount = getUnifiedReviewQueue(state, now, 50).length
  const flat = ALL_SESSIONS
  const firstIncomplete =
    flat.find(({ session }) => !state.completedSessions[session.id]) ?? flat[flat.length - 1]
  const weak = getSkillProfile(state, now)[0]

  const targeted = weak
    ? flat.find(({ session }) => {
        if (state.completedSessions[session.id]) return false
        const skills = session.exercises.flatMap((exercise) => inferExerciseSkills(exercise))
        return skills.includes(weak.skill)
      })
    : undefined

  if (dueCount >= 5) {
    return {
      sessionId: firstIncomplete.session.id,
      slug: firstIncomplete.session.slug,
      title: firstIncomplete.session.title,
      reason: `Tienes ${dueCount} repasos pendientes. Repasar antes de avanzar mejora la retención.`,
      reviewFirst: true,
      dueCount,
      weakSkill: weak,
    }
  }

  if (targeted && (!weak || weak.weakness >= 0.4)) {
    return {
      sessionId: targeted.session.id,
      slug: targeted.session.slug,
      title: targeted.session.title,
      reason: `Refuerza ${weak?.label ?? 'tu habilidad más débil'} antes de seguir la ruta.`,
      reviewFirst: false,
      dueCount,
      weakSkill: weak,
    }
  }

  return {
    sessionId: firstIncomplete.session.id,
    slug: firstIncomplete.session.slug,
    title: firstIncomplete.session.title,
    reason: 'Siguiente sesión del recorrido: tus habilidades bases están en buen estado.',
    reviewFirst: false,
    dueCount,
    weakSkill: weak,
  }
}

export interface RetentionStats {
  scheduled: number
  due: number
  passed: number
  failed: number
  rate: number
  byOffset: Record<1 | 3, { passed: number; failed: number; rate: number }>
}

/** Métrica real de retención diferida (24 h y 72 h). */
export function getRetentionStats(state: ProgressState, now = Date.now()): RetentionStats {
  const checks = Object.values(state.retentionChecks ?? {})
  const byOffset: RetentionStats['byOffset'] = {
    1: { passed: 0, failed: 0, rate: 0 },
    3: { passed: 0, failed: 0, rate: 0 },
  }
  let passed = 0
  let failed = 0
  for (const check of checks) {
    const correct = check.correct > 0
    if (check.attempts > 0) {
      if (correct) passed++
      else failed++
      byOffset[check.offsetDays][correct ? 'passed' : 'failed']++
    }
  }
  for (const offset of [1, 3] as const) {
    const total = byOffset[offset].passed + byOffset[offset].failed
    byOffset[offset].rate = total === 0 ? 0 : Math.round((byOffset[offset].passed / total) * 100)
  }
  const total = passed + failed
  return {
    scheduled: checks.length,
    due: checks.filter((check) => !check.done && check.dueAt <= now).length,
    passed,
    failed,
    rate: total === 0 ? 0 : Math.round((passed / total) * 100),
    byOffset,
  }
}
