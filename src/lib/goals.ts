import type { ProgressSettings } from './progress'

export type LearningGoal = ProgressSettings['goal']

const DAILY = new Set([
  'daily-standup',
  'code-review-en-ingles',
  'pedir-ayuda-y-dar-contexto',
  'pair-programming-y-debugging-en-vivo',
  'estimaciones-y-plazos',
  'commits-prs-docs',
  'slack-trabajo-asincrono',
  'reuniones-cortas-y-actualizaciones',
  'async-avanzado-mensajes-claros',
  'conectores-y-discourse-markers',
  'incidentes-on-call',
  'git-y-errores',
  'conceptos-y-phrasal-verbs',
  'phrasal-verbs-dev-diario',
  'cuatro-tiempos',
  'preguntar-y-aclarar',
  'incidentes-rfc-demos-feedback',
  'verbos-reyes',
  'verbos-tecnicos',
  'numeros-versiones-fechas',
  'contar-un-bug',
  'pronunciacion-funcional-devs',
])

const INTERVIEWS = new Set([
  'entrevistas-tecnicas',
  'entrevista-tecnica-comportamental',
  'explicar-cambios-y-demos',
  'conectores-y-discourse-markers',
  'system-design-conversacion',
  'performance-y-profiling',
  'seguridad-y-secretos',
  'contar-un-bug',
  'estimaciones-y-plazos',
  'pedir-ayuda-y-dar-contexto',
  'commits-prs-docs',
  'drills-situaciones-reales',
  'checkpoint-arquitectura-seguridad-performance',
  'micro-repaso-comunicacion-b1-b2',
  'incidentes-rfc-demos-feedback',
  'cuatro-tiempos',
  'preguntar-y-aclarar',
  'pronunciacion-funcional-devs',
])

const WORK = new Set([
  'git-y-errores',
  'errores-stack-traces-y-logs',
  'api-http-bases-de-datos',
  'testing-y-calidad',
  'incidentes-on-call',
  'contar-un-bug',
  'leer-docs-y-specs-rapido',
  'prompts-y-ai-agents',
  'drills-situaciones-reales',
  'emails-tickets-y-mensajes-profesionales',
  'seguridad-y-secretos',
  'performance-y-profiling',
  'system-design-conversacion',
  'pair-programming-y-debugging-en-vivo',
  'conceptos-y-phrasal-verbs',
  'phrasal-verbs-dev-diario',
  'incidentes-rfc-demos-feedback',
  'verbos-tecnicos',
  'numeros-versiones-fechas',
  'pronunciacion-funcional-devs',
  'cuatro-tiempos',
])

/** All slugs referenced by any goal, used by the curriculum scanner. */
export const GOAL_SLUGS = new Set([...DAILY, ...INTERVIEWS, ...WORK])

function relevantSet(goal: LearningGoal): Set<string> | null {
  if (goal === 'daily') return DAILY
  if (goal === 'interviews') return INTERVIEWS
  if (goal === 'work') return WORK
  return null
}

export function isSessionRelevantToGoal(slug: string, goal: LearningGoal): boolean {
  const set = relevantSet(goal)
  return set ? set.has(slug) : false
}

export function goalRelevanceBoost(slug: string, goal: LearningGoal): number {
  return isSessionRelevantToGoal(slug, goal) ? 1 : 0
}

export const GOAL_LABELS: Record<LearningGoal, string> = {
  daily: 'Trabajo diario',
  interviews: 'Entrevistas',
  work: 'Inglés técnico',
  all: 'Ruta completa',
}
