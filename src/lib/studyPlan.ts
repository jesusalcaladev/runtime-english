import {
  startOfMonth as dfStartOfMonth,
  startOfWeek as dfStartOfWeek,
  isAfter,
  isEqual,
  isSameDay,
  startOfDay,
} from 'date-fns'
import type { LearningGoal } from './goals'
import { type DiagnosticResult, type ProgressState, type StudyPlan, todayKey } from './progress'

export interface PlanRecommendation {
  level: 'A1' | 'A2' | 'B1' | 'B2'
  dailyMinutes: number
  dailyExercises: number
  weeklySessions: number
  weeklyExercises: number
  monthlySessions: number
  monthlyExercises: number
  focus: LearningGoal
  label: string
  summary: string
}

export function recommendPlan(
  goal: LearningGoal,
  diagnostic?: DiagnosticResult | null,
): PlanRecommendation {
  const level = diagnostic?.level ?? 'A1'
  const base = {
    A1: {
      dailyMinutes: 10,
      dailyExercises: 6,
      weeklySessions: 4,
      weeklyExercises: 24,
      monthlySessions: 14,
      monthlyExercises: 90,
    },
    A2: {
      dailyMinutes: 12,
      dailyExercises: 8,
      weeklySessions: 4,
      weeklyExercises: 30,
      monthlySessions: 16,
      monthlyExercises: 110,
    },
    B1: {
      dailyMinutes: 15,
      dailyExercises: 10,
      weeklySessions: 5,
      weeklyExercises: 40,
      monthlySessions: 18,
      monthlyExercises: 140,
    },
    B2: {
      dailyMinutes: 15,
      dailyExercises: 10,
      weeklySessions: 5,
      weeklyExercises: 40,
      monthlySessions: 20,
      monthlyExercises: 160,
    },
  }[level]

  const focusLabel: Record<LearningGoal, string> = {
    daily: 'trabajo diario',
    interviews: 'entrevistas',
    work: 'inglés técnico',
    all: 'ruta completa',
  }

  const adjusted = { ...base }
  if (goal === 'interviews') {
    adjusted.dailyExercises += 2
    adjusted.weeklyExercises += 6
  } else if (goal === 'work') {
    adjusted.dailyMinutes += 2
  }

  return {
    level,
    ...adjusted,
    focus: goal,
    label: `Plan ${level} · ${focusLabel[goal]}`,
    summary: `${adjusted.dailyMinutes} min/día · ${adjusted.dailyExercises} ejercicios/día · ${adjusted.weeklySessions} sesiones/semana`,
  }
}

export function toStudyPlan(rec: PlanRecommendation): StudyPlan {
  return {
    dailyMinutes: rec.dailyMinutes,
    dailyExercises: rec.dailyExercises,
    weeklySessions: rec.weeklySessions,
    weeklyExercises: rec.weeklyExercises,
    monthlySessions: rec.monthlySessions,
    monthlyExercises: rec.monthlyExercises,
    focus: rec.focus,
    level: rec.level,
  }
}

export function startOfWeek(date = new Date()): Date {
  return dfStartOfWeek(date, { weekStartsOn: 1 })
}

export function startOfMonth(date = new Date()): Date {
  return dfStartOfMonth(date)
}

function countSince(record: Record<string, number>, since: Date): number {
  const t = since.getTime()
  let n = 0
  for (const ts of Object.values(record)) {
    if (typeof ts === 'number' && ts >= t) n++
  }
  return n
}

export interface ConsistencyStats {
  todayExercises: number
  todaySessions: number
  weekExercises: number
  weekSessions: number
  monthExercises: number
  monthSessions: number
  activeDaysThisWeek: number
  activeDaysThisMonth: number
}

export function getConsistencyStats(state: ProgressState): ConsistencyStats {
  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfDay(startOfWeek(now))
  const monthStart = startOfDay(startOfMonth(now))

  const inRange = (ts: unknown, since: Date) => {
    if (typeof ts !== 'number') return false
    const d = new Date(ts)
    return isEqual(d, since) || isAfter(d, since)
  }

  const todayExercises = Object.values(state.completedExercises).filter((ts) => {
    if (typeof ts !== 'number') return false
    return isSameDay(new Date(ts), todayStart)
  }).length
  const todaySessions = Object.values(state.completedSessions).filter((ts) => {
    if (typeof ts !== 'number') return false
    return isSameDay(new Date(ts), todayStart)
  }).length

  const weekExercises = countSince(state.completedExercises, weekStart)
  const weekSessions = countSince(state.completedSessions, weekStart)
  const monthExercises = countSince(state.completedExercises, monthStart)
  const monthSessions = countSince(state.completedSessions, monthStart)

  const activeDays = new Set<string>()
  for (const ts of [
    ...Object.values(state.completedExercises),
    ...Object.values(state.completedSessions),
  ]) {
    if (typeof ts !== 'number') continue
    activeDays.add(todayKey(new Date(ts)))
  }

  let activeDaysThisWeek = 0
  let activeDaysThisMonth = 0
  for (const ts of [
    ...Object.values(state.completedExercises),
    ...Object.values(state.completedSessions),
  ]) {
    if (typeof ts !== 'number') continue
    if (inRange(ts, weekStart)) {
      // count unique days by key in range
    }
    if (inRange(ts, monthStart)) {
      // placeholder, computed below
    }
  }
  // Recompute unique active days in ranges from keys for stability
  const weekDays = new Set<string>()
  const monthDays = new Set<string>()
  for (const ts of [
    ...Object.values(state.completedExercises),
    ...Object.values(state.completedSessions),
  ]) {
    if (typeof ts !== 'number') continue
    const d = new Date(ts)
    const key = todayKey(d)
    if (isEqual(d, weekStart) || isAfter(d, weekStart)) weekDays.add(key)
    if (isEqual(d, monthStart) || isAfter(d, monthStart)) monthDays.add(key)
  }
  activeDaysThisWeek = weekDays.size
  activeDaysThisMonth = monthDays.size

  return {
    todayExercises,
    todaySessions,
    weekExercises,
    weekSessions,
    monthExercises,
    monthSessions,
    activeDaysThisWeek,
    activeDaysThisMonth,
  }
}

export function getConsistencyFeedback(stats: ConsistencyStats, plan?: StudyPlan | null): string[] {
  const tips: string[] = []
  if (!plan) {
    tips.push(
      'Define un plan diario/semanal en onboarding o ajustes para recibir metas personalizadas.',
    )
    return tips
  }
  if (stats.todayExercises >= plan.dailyExercises)
    tips.push('Meta diaria de ejercicios cumplida hoy.')
  else
    tips.push(
      `Hoy: ${stats.todayExercises}/${plan.dailyExercises} ejercicios. Un bloque corto te acerca a tu meta.`,
    )
  if (stats.weekSessions >= plan.weeklySessions) tips.push('Meta semanal de sesiones cumplida.')
  else tips.push(`Semana: ${stats.weekSessions}/${plan.weeklySessions} sesiones completadas.`)
  if (stats.weekExercises >= plan.weeklyExercises) tips.push('Buen ritmo semanal de ejercicios.')
  else if (stats.weekExercises > 0)
    tips.push(`Semana: ${stats.weekExercises}/${plan.weeklyExercises} ejercicios.`)
  if (stats.activeDaysThisWeek >= 3)
    tips.push(`Constancia: ${stats.activeDaysThisWeek} días activos esta semana.`)
  return tips
}

export interface LearningRecommendation {
  title: string
  detail: string
  href: string
  tone: 'accent' | 'warn' | 'info'
}

export function getLearningRecommendations(
  _state: ProgressState,
  opts: {
    due: number
    weak: number
    unseen: number
    nextSessionSlug: string
    hardPhraseCount: number
    duePhrases?: number
  },
): LearningRecommendation[] {
  const recs: LearningRecommendation[] = []
  if (opts.due > 0) {
    recs.push({
      title: 'Repasar lo que vence hoy',
      detail: `${opts.due} ejercicio${opts.due === 1 ? '' : 's'} listos para repaso espaciado (mejor retención).`,
      href: '/practice?mode=review',
      tone: 'accent',
    })
  }
  if (opts.weak > 0) {
    recs.push({
      title: 'Reforzar puntos débiles',
      detail: `${opts.weak} ejercicio${opts.weak === 1 ? '' : 's'} con fallos o más intentos. Practícalos para consolidar.`,
      href: '/practice?mode=weak',
      tone: 'warn',
    })
  }
  if ((opts.duePhrases ?? 0) > 0) {
    recs.push({
      title: 'Repasar frases del diccionario',
      detail: `${opts.duePhrases} frase${opts.duePhrases === 1 ? '' : 's'} lista${opts.duePhrases === 1 ? '' : 's'} para repaso (SRS), con tus notas y ejemplos.`,
      href: '/practice?mode=phrases',
      tone: 'accent',
    })
  }
  if (opts.hardPhraseCount > 0) {
    recs.push({
      title: 'Repasar frases difíciles',
      detail: `${opts.hardPhraseCount} frase${opts.hardPhraseCount === 1 ? '' : 's'} marcada${opts.hardPhraseCount === 1 ? '' : 's'} como difícil en tu diccionario.`,
      href: '/dictionary?filter=hard',
      tone: 'info',
    })
  }
  recs.push({
    title: 'Continuar tu ruta',
    detail: 'Avanza en la siguiente sesión recomendada según tu progreso y objetivo.',
    href: `/session/${opts.nextSessionSlug}`,
    tone: 'info',
  })
  if (opts.unseen > 0) {
    recs.push({
      title: 'Descubrir contenido nuevo',
      detail: `${opts.unseen} ejercicio${opts.unseen === 1 ? '' : 's'} aún sin intentar.`,
      href: '/practice?mode=new',
      tone: 'info',
    })
  }
  return recs.slice(0, 4)
}
