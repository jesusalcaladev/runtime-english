/**
 * Estado de VideoLab. Vive dentro del JSON compacto de `user_progress`,
 * así comparte la única fila por usuario de Supabase (sin tablas nuevas).
 */

export interface VideoProgress {
  position: number
  duration: number
  completed: boolean
  updatedAt: number
}

export interface VideoQuizAttempt {
  questionIds: string[]
  answers: Record<string, number>
  correct: number
  total: number
  missedQuestionIds: string[]
  at: number
}

export interface VideoQuizProgress {
  attempts: VideoQuizAttempt[]
  bestCorrect: number | null
  missedQuestionIds: string[]
}

export interface VideoLabState {
  progress: Record<string, VideoProgress>
  quiz: Record<string, VideoQuizProgress>
}

export interface CompactVideoLab {
  p: Record<string, { p: number; d: number; c: 0 | 1; u: number }>
  q: Record<
    string,
    {
      b: number | null
      m: string[]
      a: Array<{
        q: string[]
        a: Record<string, number>
        c: number
        t: number
        m: string[]
        at: number
      }>
    }
  >
}

const LEGACY_PROGRESS_KEY = 'runtimeenglish_video_progress_v1'
const LEGACY_QUIZ_KEY = 'runtimeenglish_video_quiz_v1'
const MAX_ATTEMPTS = 5

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function answers(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {}
  const result: Record<string, number> = {}
  for (const [id, answer] of Object.entries(value)) {
    const number = finite(answer)
    if (number !== null) result[id] = number
  }
  return result
}

export function createDefaultVideoLabState(): VideoLabState {
  return { progress: {}, quiz: {} }
}

function normalizeAttempt(raw: unknown): VideoQuizAttempt | null {
  if (!isRecord(raw)) return null
  const questionIds = strings(raw.questionIds ?? raw.q)
  const correct = finite(raw.correct ?? raw.c)
  const total = finite(raw.total ?? raw.t)
  const at = finite(raw.at ?? raw.at)
  if (!questionIds.length || correct === null || total === null || at === null) return null
  return {
    questionIds,
    answers: answers(raw.answers ?? raw.a),
    correct,
    total,
    missedQuestionIds: strings(raw.missedQuestionIds ?? raw.m).filter((id) =>
      questionIds.includes(id),
    ),
    at,
  }
}

function normalizeQuiz(raw: unknown): VideoQuizProgress | null {
  if (!isRecord(raw)) return null
  const attempts = (Array.isArray(raw.attempts) ? raw.attempts : Array.isArray(raw.a) ? raw.a : [])
    .map(normalizeAttempt)
    .filter((attempt): attempt is VideoQuizAttempt => attempt !== null)
    .slice(0, MAX_ATTEMPTS)
  if (!attempts.length) return null
  const best = finite(raw.bestCorrect ?? raw.b)
  return {
    attempts,
    bestCorrect: best ?? Math.max(...attempts.map((attempt) => attempt.correct)),
    missedQuestionIds: strings(raw.missedQuestionIds ?? raw.m).filter((id) =>
      attempts.some((attempt) => attempt.questionIds.includes(id)),
    ),
  }
}

/** Sanitiza datos locales o remotos antes de usarlos. */
export function normalizeVideoLab(raw: unknown): VideoLabState {
  const source = isRecord(raw) ? raw : {}
  const progress: Record<string, VideoProgress> = {}
  const rawProgress = isRecord(source.progress)
    ? source.progress
    : isRecord(source.p)
      ? source.p
      : {}

  for (const [id, value] of Object.entries(rawProgress)) {
    if (!isRecord(value)) continue
    const position = finite(value.position ?? value.p)
    const duration = finite(value.duration ?? value.d)
    const updatedAt = finite(value.updatedAt ?? value.u)
    if (position === null || duration === null || updatedAt === null) continue
    progress[id] = {
      position,
      duration,
      completed: value.completed === true || value.c === 1,
      updatedAt,
    }
  }

  const quiz: Record<string, VideoQuizProgress> = {}
  const rawQuiz = isRecord(source.quiz) ? source.quiz : isRecord(source.q) ? source.q : {}
  for (const [id, value] of Object.entries(rawQuiz)) {
    const normalized = normalizeQuiz(value)
    if (normalized) quiz[id] = normalized
  }

  return { progress, quiz }
}

/** Representación corta para el JSONB de Supabase. */
export function compactVideoLab(state: VideoLabState): CompactVideoLab | undefined {
  const progress: CompactVideoLab['p'] = {}
  for (const [id, entry] of Object.entries(state.progress)) {
    progress[id] = {
      p: Math.round(entry.position * 100) / 100,
      d: entry.duration,
      c: entry.completed ? 1 : 0,
      u: entry.updatedAt,
    }
  }

  const quiz: CompactVideoLab['q'] = {}
  for (const [id, entry] of Object.entries(state.quiz)) {
    quiz[id] = {
      b: entry.bestCorrect,
      m: entry.missedQuestionIds,
      a: entry.attempts.slice(0, MAX_ATTEMPTS).map((attempt) => ({
        q: attempt.questionIds,
        a: attempt.answers,
        c: attempt.correct,
        t: attempt.total,
        m: attempt.missedQuestionIds,
        at: attempt.at,
      })),
    }
  }

  if (!Object.keys(progress).length && !Object.keys(quiz).length) return undefined
  return { p: progress, q: quiz }
}

export function expandVideoLab(raw: unknown): VideoLabState {
  return normalizeVideoLab(raw)
}

/** Unión local/remota: gana el registro más reciente y el mejor intento. */
export function mergeVideoLabStates(local: VideoLabState, remote: VideoLabState): VideoLabState {
  const progress = { ...local.progress }
  for (const [id, entry] of Object.entries(remote.progress)) {
    if (!progress[id] || entry.updatedAt > progress[id].updatedAt) progress[id] = entry
  }

  const quiz = { ...local.quiz }
  for (const [id, entry] of Object.entries(remote.quiz)) {
    const current = quiz[id]
    if (!current) {
      quiz[id] = entry
      continue
    }
    const byAt = [...current.attempts, ...entry.attempts].sort((a, b) => b.at - a.at)
    const seen = new Set<string>()
    const attempts = byAt.filter((attempt) => {
      const key = `${attempt.at}:${attempt.questionIds.join(',')}:${attempt.correct}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    quiz[id] = {
      attempts: attempts.slice(0, MAX_ATTEMPTS),
      bestCorrect: Math.max(current.bestCorrect ?? 0, entry.bestCorrect ?? 0),
      // Los fallos del intento más reciente son los que importa repetir.
      missedQuestionIds: byAt[0]?.missedQuestionIds ?? [],
    }
  }

  return { progress, quiz }
}

/** Importa el almacenamiento anterior para no perder datos ya guardados. */
export function readLegacyVideoLab(): VideoLabState | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const rawProgress = window.localStorage.getItem(LEGACY_PROGRESS_KEY)
    const rawQuiz = window.localStorage.getItem(LEGACY_QUIZ_KEY)
    if (!rawProgress && !rawQuiz) return undefined

    const state = createDefaultVideoLabState()
    if (rawProgress) {
      const parsed: unknown = JSON.parse(rawProgress)
      if (isRecord(parsed)) {
        const imported = normalizeVideoLab({ progress: parsed })
        state.progress = imported.progress
      }
    }
    if (rawQuiz) {
      const parsed: unknown = JSON.parse(rawQuiz)
      if (isRecord(parsed)) {
        const imported = normalizeVideoLab({ quiz: parsed })
        state.quiz = imported.quiz
      }
    }
    return state
  } catch {
    return undefined
  }
}
