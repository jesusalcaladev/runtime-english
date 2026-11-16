import { ALL_SESSIONS, levelStats } from '../data/curriculum'
import type { ProgressState } from './progress'

export type UiStage = 'es' | 'mixed' | 'en'

export interface LanguageStatus {
  stage: UiStage
  autoStage: UiStage
  score: number
  a1Pct: number
  b1Pct: number
  exercisePct: number
  accuracyPct: number
  nextTarget: number | null
  reason: string
}

/**
 * Immersion combines three signals:
 * - 55%: A1-A2 session progress.
 * - 15%: accuracy (completed exercises / attempts).
 * - 20%: curriculum exercises solved.
 * - 10%: B1-B2 progress.
 *
 * The UI switches to mixed at 28 points and to English at 58,
 * but English also requires 55% A1-A2 progress and 55% accuracy, so the UI does not switch
 * too early for users who only complete sessions without consolidating.
 */
export function getLanguageStatus(state: ProgressState): LanguageStatus {
  const a1 = levelStats('A1-A2', state.completedSessions)
  const b1 = levelStats('B1-B2', state.completedSessions)
  const allExerciseIds = ALL_SESSIONS.flatMap(({ session }) =>
    session.exercises.map((exercise) => exercise.id),
  )
  const doneExercises = Object.keys(state.completedExercises).length
  const exercisePct =
    allExerciseIds.length === 0
      ? 0
      : Math.min(100, Math.round((doneExercises / allExerciseIds.length) * 100))
  const totalAttempts = Object.values(state.attempts).reduce((total, value) => total + value, 0)
  const accuracyPct =
    totalAttempts === 0 ? 0 : Math.min(100, Math.round((doneExercises / totalAttempts) * 100))

  const score = Math.round(a1.pct * 0.55 + exercisePct * 0.2 + accuracyPct * 0.15 + b1.pct * 0.1)
  const englishGate = a1.pct >= 55 && accuracyPct >= 55
  const autoStage: UiStage = score >= 58 && englishGate ? 'en' : score >= 28 ? 'mixed' : 'es'
  const preference = state.settings.immersion
  const stage: UiStage = preference === 'auto' ? autoStage : preference

  let nextTarget: number | null = autoStage === 'es' ? 28 : autoStage === 'mixed' ? 58 : null
  let reason = ''
  if (preference !== 'auto') {
    reason = 'Modo de idioma fijado manualmente en Ajustes.'
  } else if (autoStage === 'en') {
    reason = 'Interfaz en inglés desbloqueada. El contenido técnico sigue bilingüe.'
  } else if (score >= 58 && !englishGate) {
    nextTarget = 58
    reason =
      accuracyPct < 55
        ? 'La preparación es suficiente, pero necesitas al menos 55% de precisión para pasar a inglés.'
        : 'Necesitas al menos 55% de las sesiones A1-A2 para pasar a inglés.'
  } else if (autoStage === 'mixed') {
    reason = 'Interfaz bilingüe. La siguiente etapa es inglés al 58% de preparación.'
  } else {
    reason = 'Interfaz en español. Las etiquetas bilingües llegan al 28% de preparación.'
  }

  return {
    stage,
    autoStage,
    score,
    a1Pct: a1.pct,
    b1Pct: b1.pct,
    exercisePct,
    accuracyPct,
    nextTarget,
    reason,
  }
}

export function getUiStage(state: ProgressState): UiStage {
  return getLanguageStatus(state).stage
}

type Entry = { es: string; en: string }

export const UI_STRINGS: Record<string, Entry> = {
  workspace: { es: 'Espacio de trabajo', en: 'Workspace' },
  roadmap: { es: 'Roadmap Técnico', en: 'Technical Roadmap' },
  slang: { es: 'Slang 2026', en: 'Slang 2026' },
  achievements: { es: 'Logros', en: 'Achievements' },
  settings: { es: 'Ajustes', en: 'Settings' },
  a1: { es: 'Nivel A1–A2 · Fundamentos', en: 'Level A1–A2 · Foundations' },
  b1: { es: 'Nivel B1–B2 · Producción', en: 'Level B1–B2 · Production' },
  continue: { es: 'Continuar', en: 'Continue' },
  start: { es: 'Empezar', en: 'Start' },
  completed: { es: 'Completada', en: 'Completed' },
  sessions: { es: 'Sesiones', en: 'Sessions' },
  exercises: { es: 'Ejercicios', en: 'Exercises' },
  minutes: { es: 'min', en: 'min' },
  progress: { es: 'Progreso', en: 'Progress' },
  streak: { es: 'Racha', en: 'Streak' },
  days: { es: 'días', en: 'days' },
  record: { es: 'récord', en: 'best' },
  toLevel: { es: 'para nivel', en: 'to level' },
  achievementsUnlocked: { es: 'logros desbloqueados', en: 'achievements unlocked' },
  of: { es: 'de', en: 'of' },
  active: { es: 'Activo', en: 'Live' },
  closeMenu: { es: 'Cerrar menú', en: 'Close menu' },
  featured: { es: 'Destacado', en: 'Featured' },
  slangYear: { es: 'Slang del año', en: 'Slang of the year' },
  slangYearBody: {
    es: 'vibe coding, workslop, meat proxy y jerga de equipo.',
    en: 'vibe coding, workslop, meat proxy and team jargon.',
  },
  slangTitle: { es: 'El slang que está vivo en 2026', en: 'The slang that is alive in 2026' },
  slangBody: {
    es: 'vibe coding, workslop, meat proxy y más',
    en: 'vibe coding, workslop, meat proxy and more',
  },
  level: { es: 'Nivel', en: 'Level' },
  nextUp: { es: 'Siguiente sesión', en: 'Next session' },
  yourRoadmap: { es: 'Tu roadmap', en: 'Your roadmap' },
  modules: { es: 'módulos', en: 'modules' },
  route: { es: 'Ruta', en: 'Path' },
  pathTitle: { es: 'Ruta de aprendizaje', en: 'Learning path' },
  pathDone: { es: 'de la ruta completada', en: 'of the path complete' },
  stage: { es: 'Etapa', en: 'Stage' },
  session: { es: 'sesión', en: 'session' },
  continueHere: { es: 'Continúa aquí', en: 'Continue here' },
  solved: { es: 'resueltos', en: 'solved' },
  unlocked: { es: 'desbloqueados', en: 'unlocked' },
  ofCore: { es: 'del Core', en: 'of the Core' },
  foundations: { es: 'Fundamentos', en: 'Foundations' },
  production: { es: 'Producción', en: 'Production' },
  special: { es: 'Especial', en: 'Special' },
  next: { es: 'Siguiente', en: 'Next' },
  completedSessions: { es: 'completadas', en: 'completed' },
  heroTitle: {
    es: 'Inglés técnico que sí usarás mañana',
    en: 'Technical English you will actually use tomorrow',
  },
  heroBody: {
    es: 'Sesiones cortas de A1 a B2, ejercicios reales de código y el slang que define 2026.',
    en: 'Short A1–B2 sessions, real coding exercises and the slang shaping 2026.',
  },
  review: { es: 'Repasar', en: 'Review' },
  locked: { es: 'Bloqueada', en: 'Locked' },
  ready: { es: 'Lista', en: 'Ready' },
  totalProgress: { es: 'Progreso total', en: 'Total progress' },
  exercise: { es: 'Ejercicio', en: 'Exercise' },
  alreadySolved: { es: 'ya resuelto', en: 'already solved' },
  shortcuts: { es: 'Atajos', en: 'Shortcuts' },
  restartSession: { es: 'Reiniciar sesión', en: 'Restart session' },
  chooseOption: { es: 'Elige la opción correcta', en: 'Choose the correct answer' },
  orderWords: { es: 'Ordena las palabras', en: 'Put the words in order' },
  writeAnswer: { es: 'Escribe la frase en inglés', en: 'Write the sentence in English' },
  check: { es: 'Comprobar', en: 'Check' },
  previous: { es: 'Anterior', en: 'Previous' },
  retry: { es: 'Reintentar', en: 'Try again' },
  seeResult: { es: 'Ver resultado', en: 'See result' },
  correct: { es: 'Correcto', en: 'Correct' },
  notYet: { es: 'Todavía no', en: 'Not yet' },
  answer: { es: 'respuesta', en: 'answer' },
  correctAnswer: { es: 'Respuesta correcta', en: 'Correct answer' },
  noPenalty: { es: 'Puedes reintentar sin penalización', en: 'You can retry without penalty' },
  tapWords: {
    es: 'Toca las palabras para construir la frase.',
    en: 'Tap the words to build the sentence.',
  },
  typeAnswer: { es: 'Escribe tu respuesta en inglés…', en: 'Type your answer in English…' },
  wordsSelected: { es: 'palabras seleccionadas', en: 'words selected' },
  sessionCompleted: { es: 'Sesión completada', en: 'Session completed' },
  sessionReviewed: { es: 'Sesión repasada', en: 'Session reviewed' },
  sessionXp: { es: '+40 XP de sesión', en: '+40 session XP' },
  backRoadmap: { es: 'Volver al roadmap', en: 'Back to roadmap' },
  savedBody: {
    es: 'Ejercicios resueltos y progreso guardado. Tu siguiente paso ya está listo.',
    en: 'Exercises complete and progress saved. Your next step is ready.',
  },
  lastBody: {
    es: 'Terminaste la última sesión del Core. Puedes repasar cualquier sesión o explorar el slang actualizado.',
    en: 'You finished the last Core session. Review any session or explore the updated slang.',
  },
  yourProgress: { es: 'Tu progreso', en: 'Your progress' },
  inProgress: { es: 'En progreso', en: 'In progress' },
  notStarted: { es: 'Sin empezar', en: 'Not started' },
  startPractice: { es: 'Empezar práctica', en: 'Start practice' },
  continuePractice: { es: 'Continuar práctica', en: 'Continue practice' },
  replaySession: { es: 'Repasar desde el inicio', en: 'Review from the start' },
  languageReady: { es: 'Preparación para inglés', en: 'English readiness' },
  englishStage: { es: 'English desbloqueado', en: 'English unlocked' },
  nextStage: { es: 'Siguiente etapa', en: 'Next stage' },
  upcoming: { es: 'Próximamente', en: 'Upcoming' },
  reviewFromStart: { es: 'Repasar desde el inicio', en: 'Review from the start' },
}

export function t(stage: UiStage, key: keyof typeof UI_STRINGS | string): string {
  const entry = UI_STRINGS[key]
  if (!entry) return key
  if (stage === 'mixed') return `${entry.es} · ${entry.en}`
  return entry[stage]
}

/** Compact actions: in mixed mode they already use English to encourage immersion. */
export function tAction(stage: UiStage, key: keyof typeof UI_STRINGS | string): string {
  const entry = UI_STRINGS[key]
  if (!entry) return key
  return stage === 'es' ? entry.es : entry.en
}
