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
  mascotHello: { es: '¡Hola! ¿Seguimos?', en: 'Hey! Shall we continue?' },
  mascotHello2: { es: 'Tu siguiente sesión te espera.', en: 'Your next session is waiting.' },
  mascotWelcome: { es: '¡Bienvenido! Vamos paso a paso.', en: "Welcome! We'll go step by step." },
  mascotCoach: { es: 'Piénsalo, tú puedes.', en: "Think it through, you've got this." },
  mascotNice: { es: '¡Correcto! Sigue así.', en: 'Correct! Keep it up.' },
  mascotOops: { es: 'Casi, inténtalo otra vez.', en: 'Almost, try again.' },
  mascotListen: { es: 'Escucha con atención…', en: 'Listen closely…' },
  mascotFinish: { es: '¡Sesión completada! Gran trabajo.', en: 'Session complete! Great work.' },
  mascotIdle: { es: '¡Hola! ¿Listo para escuchar?', en: 'Hi! Ready to listen?' },
  mascotReady: { es: 'Vamos con esta conversación.', en: "Let's go through this conversation." },
  mascotListening: { es: 'Te escucho…', en: "I'm listening…" },
  mascotTip: { es: 'Repite cada línea en voz alta.', en: 'Repeat each line out loud.' },
  mascotCheer: { es: '¡Tú puedes con esto!', en: 'You can do this!' },
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
  // VideoLab / recursos
  play: { es: 'Reproducir', en: 'Play' },
  pause: { es: 'Pausa', en: 'Pause' },
  speed: { es: 'Velocidad de reproducción', en: 'Playback speed' },
  pronunciation: { es: 'Pronunciación (TTS)', en: 'Pronunciation (TTS)' },
  voiceEverywhere: { es: 'Voz en toda la app', en: 'Voice across the app' },
  voiceEverywhereHint: {
    es: 'Muestra u oculta los botones de pronunciación.',
    en: 'Show or hide pronunciation buttons.',
  },
  toggleVoice: { es: 'Activar o desactivar la voz', en: 'Turn voice on or off' },
  accent: { es: 'Acento', en: 'Accent' },
  advancedVoice: { es: 'Opciones avanzadas de voz', en: 'Advanced voice options' },
  loading: { es: 'Cargando', en: 'Loading' },
  piperHint: {
    es: 'Piper usa modelos locales: la primera vez necesita conexión para bajar la voz; después es muy rápida.',
    en: 'Piper uses local models: the first time it needs a connection to download the voice; then it is very fast.',
  },
  repeatLine: { es: 'Repetir línea', en: 'Loop line' },
  listenDrill: { es: 'Escucha activa', en: 'Listen drill' },
  follow: { es: 'Seguir', en: 'Follow' },
  openYoutube: { es: 'Abrir en YouTube', en: 'Open on YouTube' },
  searchTranscript: { es: 'Buscar en la transcripción…', en: 'Search the transcript…' },
  noCueMatch: {
    es: 'Ninguna línea coincide con esa búsqueda.',
    en: 'No subtitle line matches that search.',
  },
  markWatched: { es: 'Marcar como vista', en: 'Mark as watched' },
  watched: { es: 'Vista', en: 'Watched' },
  resume: { es: 'Continuar desde', en: 'Resume from' },
  videoProgress: { es: 'Progreso del video', en: 'Video progress' },
  shadowLine: { es: 'Repetir esta línea', en: 'Repeat this line' },
  listening: { es: 'Escuchando…', en: 'Listening…' },
  matchPercent: { es: 'Coincidencia', en: 'Match' },
  keyboardHint: {
    es: 'Atajos: espacio = play/pausa · ← → = ±5 s · F = seguir · C = subtítulos en video',
    en: 'Shortcuts: space = play/pause · ← → = ±5 s · F = follow · C = on-video subtitles',
  },
  subtitlesOnVideo: { es: 'Subtítulos en video', en: 'On-video subtitles' },
  linePractice: { es: 'Practica esta línea', en: 'Practice this line' },
  linePracticePlaceholder: { es: 'Escribe el fragmento que falta…', en: 'Type the missing chunk…' },
  linePracticeRight: { es: '¡Correcto!', en: 'Correct!' },
  linePracticeWrong: { es: 'La respuesta era', en: 'The answer was' },
  quizBest: { es: 'Mejor', en: 'Best' },
  quizLast: { es: 'Último', en: 'Last' },
  retryMissed: { es: 'Repetir falladas', en: 'Retry missed' },
  retryAll: { es: 'Repetir todas', en: 'Retry all' },
  retryingMissed: { es: 'Solo preguntas falladas', en: 'Missed questions only' },
  fullscreen: { es: 'Pantalla completa', en: 'Fullscreen' },
  exitFullscreen: { es: 'Salir de pantalla completa', en: 'Exit fullscreen' },
  fullVideo: { es: 'Video completo', en: 'Full video' },
  videoLibrary: { es: 'Biblioteca de videos', en: 'Video library' },
  chooseVideo: { es: 'Elige un video para estudiar', en: 'Choose a video to study' },
  backToLibrary: { es: 'Volver a la biblioteca', en: 'Back to library' },
  videosAvailable: { es: 'videos con subtítulos completos', en: 'videos with full subtitles' },
  minutesWatched: { es: 'Minutos vistos', en: 'Minutes watched' },
  quizAccuracy: { es: 'Precisión quiz', en: 'Quiz accuracy' },
  continueWatching: { es: 'Continúa donde lo dejaste', en: 'Continue where you left off' },
  searchVideos: { es: 'Buscar video o tema…', en: 'Search video or topic…' },
  noVideoMatch: {
    es: 'No hay videos con esos filtros.',
    en: 'No videos match those filters.',
  },
  clearFilters: { es: 'Quitar filtros', en: 'Clear filters' },
  ttsEasyMode: { es: 'Modo fácil', en: 'Easy mode' },
  ttsEasyHint: {
    es: 'Voz rápida del dispositivo, sin descargas ni modelos pesados.',
    en: 'Fast device voice, no downloads or heavy models.',
  },
  ttsVoice: { es: 'Voz', en: 'Voice' },
  ttsPitch: { es: 'Tono', en: 'Pitch' },
  ttsPreview: { es: 'Probar esta voz', en: 'Preview this voice' },
  ttsStop: { es: 'Detener voz', en: 'Stop voice' },
  ttsVoiceHint: {
    es: 'Elige una voz en inglés y pruébala antes de guardarla.',
    en: 'Pick an English voice and try it before saving.',
  },
  filterAll: { es: 'Todas', en: 'All' },
  myLevel: { es: 'Mi nivel', en: 'My level' },
  filterByLevel: { es: 'Filtrar roadmap por nivel', en: 'Filter path by level' },
  masteredBadge: { es: 'Dominada', en: 'Mastered' },
  masteryProgress: { es: 'Dominio', en: 'Mastery' },
  comprehension: { es: 'Comprensión del video', en: 'Video comprehension' },
  comprehensionTip: {
    es: 'Responde sin volver a ver el video. Después, comprueba con la transcripción.',
    en: 'Answer without rewatching. Then check against the transcript.',
  },
  subtitlesTitle: {
    es: 'Subtítulos originales de YouTube · con resaltado',
    en: 'Original YouTube subtitles · highlighted',
  },
  subtitlesNote: {
    es: 'Subtítulos completos y sincronizados con todo el video. Toca una línea para saltar a ese punto; usa ±5s solo si tu reproductor va desfasado.',
    en: 'Full subtitles synced with the whole video. Tap a line to jump there; use ±5s only if your player drifts.',
  },
  playerUnavailable: {
    es: 'El reproductor no está disponible aquí. Puedes abrir el video en YouTube y seguir la transcripción de abajo.',
    en: 'The player is unavailable here. Open the video on YouTube and follow the transcript below.',
  },
  practiceSaved: { es: 'Practicar frases guardadas', en: 'Practice saved phrases' },
  savedPhrasesTip: {
    es: 'Guarda frases del video con el marcador y aparecerán aquí para repasarlas con repetición espaciada.',
    en: 'Save phrases from the video with the bookmark and they will appear here for spaced review.',
  },
  phraseSingular: { es: 'frase', en: 'phrase' },
  phrasesPlural: { es: 'frases', en: 'phrases' },
  fromThisVideo: { es: 'de este video', en: 'from this video' },
  reviewedCount: { es: 'Repasaste', en: 'You reviewed' },
  todayRoutine: { es: 'Rutina de hoy', en: "Today's routine" },
  nextStep: { es: 'Siguiente paso', en: 'Next step' },
  mastered: { es: 'dominados', en: 'mastered' },
  reviewVideoLab: { es: 'Repaso · VideoLab', en: 'Review · VideoLab' },
  closeReview: { es: 'Cerrar repaso', en: 'Close review' },
  showTranslation: { es: 'Ver traducción', en: 'Show translation' },
  gotIt: { es: 'Lo sabía', en: 'I knew it' },
  missedIt: { es: 'Fallé', en: 'Missed it' },
  wordsPerMinute: { es: 'palabras/min', en: 'words/min' },
  filterResources: { es: 'Buscar recurso…', en: 'Search resource…' },
  noResources: {
    es: 'No hay recursos con esos filtros. Prueba con otra búsqueda.',
    en: 'No resources match those filters. Try another search.',
  },
  // Diálogos y ejercicios
  soloAudio: { es: 'Solo audio', en: 'Audio only' },
  dialogueTip: {
    es: 'Escucha la conversación completa o toca una línea para oírla de nuevo. Usa ES para ocultar la traducción y Solo audio para practicar solo con el sonido.',
    en: 'Play the whole conversation or tap a line to hear it again. Use ES to hide translations and Audio only to practise by ear.',
  },
  matchPairs: {
    es: 'Empareja cada término con su significado.',
    en: 'Match each term with its meaning.',
  },
  shadowPrompt: {
    es: 'Escucha y repite en voz alta, con el mismo ritmo.',
    en: 'Listen and repeat out loud, with the same rhythm.',
  },
  quickReview: { es: 'Repaso rápido', en: 'Quick review' },
  hits: { es: 'Aciertos', en: 'Correct' },
  branchPrompt: {
    es: 'Elige la mejor respuesta en cada turno de la conversación.',
    en: 'Choose the best reply at each turn of the conversation.',
  },
  dialogueFinished: {
    es: 'Has llegado al final de la conversación.',
    en: "You've reached the end of the conversation.",
  },
  // Test de nivel
  levelTest: { es: 'Test de nivel', en: 'Level test' },
  yourLevel: { es: 'Tu nivel recomendado', en: 'Your recommended level' },
  firstSession: { es: 'Primera sesión recomendada', en: 'Recommended first session' },
  goToSession: { es: 'Ir a mi sesión', en: 'Go to my session' },
  repeatTest: { es: 'Repetir test', en: 'Retake test' },
  questionOf: { es: 'Pregunta', en: 'Question' },
  finishTest: { es: 'Terminar', en: 'Finish' },
  seeLevel: { es: 'Ver mi nivel', en: 'See my level' },
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
