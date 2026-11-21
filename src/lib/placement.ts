import type { Cefr } from './types'

export type PlacementLevel = Exclude<Cefr, 'B2'>

export interface PlacementQuestion {
  id: string
  level: PlacementLevel
  prompt: string
  options: string[]
  answer: number
}

export interface PlacementResult {
  level: PlacementLevel
  correct: number
  total: number
}

export const PLACEMENT_STORAGE_KEY = 'runtimeenglish_placement_v1'

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'p1',
    level: 'A1',
    prompt: 'I ___ a developer.',
    options: ['am', 'is', 'are', 'be'],
    answer: 0,
  },
  {
    id: 'p2',
    level: 'A1',
    prompt: 'She ___ bugs every day.',
    options: ['fixes', 'fix', 'fixed', 'fixing'],
    answer: 0,
  },
  {
    id: 'p3',
    level: 'A1',
    prompt: 'Choose the technical verb: "We ___ the code."',
    options: ['run', 'eat', 'sleep', 'walk'],
    answer: 0,
  },
  {
    id: 'p4',
    level: 'A2',
    prompt: 'I ___ the bug yesterday.',
    options: ['fixed', 'have fixed', 'fix', 'am fixing'],
    answer: 0,
  },
  {
    id: 'p5',
    level: 'A2',
    prompt: 'I am blocked ___ the API token.',
    options: ['by', 'in', 'at', 'for'],
    answer: 0,
  },
  {
    id: 'p6',
    level: 'A2',
    prompt: 'We need to ___ the environment before testing.',
    options: ['set up', 'look up', 'give up', 'show up'],
    answer: 0,
  },
  {
    id: 'p7',
    level: 'B1',
    prompt: 'I ___ the bug that broke the build yesterday.',
    options: ['have fixed', 'fixed', 'am fixing', 'fix'],
    answer: 0,
  },
  {
    id: 'p8',
    level: 'B1',
    prompt: 'If the build fails, we ___ roll back the release.',
    options: ['will', 'would have', 'are', 'did'],
    answer: 0,
  },
  {
    id: 'p9',
    level: 'C1',
    prompt: '___ the migration cost is high, the long-term gains are clear.',
    options: ['While', 'Despite', 'However', 'Although of'],
    answer: 0,
  },
  {
    id: 'p10',
    level: 'C1',
    prompt:
      'Choose the most professional nuance: "I see your point, ___ the risk at scale worries me."',
    options: ['though', 'but', 'and', 'so'],
    answer: 0,
  },
  {
    id: 'p11',
    level: 'C2',
    prompt: 'We ___ a phased rollout to limit exposure while we gather data.',
    options: ['recommend', 'suggests', 'are recommending to', 'recommend to'],
    answer: 0,
  },
  {
    id: 'p12',
    level: 'C2',
    prompt: 'Choose the precise phrase: "That fix is a bit of a ___; we need the root cause."',
    options: ['band-aid', 'sticker', 'patchwork', 'quick cover'],
    answer: 0,
  },
]

export function scorePlacement(answers: (number | null)[]): PlacementResult {
  const counts: Record<PlacementLevel, number> = { A1: 0, A2: 0, B1: 0, C1: 0, C2: 0 }
  let correct = 0

  PLACEMENT_QUESTIONS.forEach((question, index) => {
    if (answers[index] !== question.answer) return
    correct += 1
    counts[question.level] += 1
  })

  const level: PlacementLevel =
    counts.C2 >= 1 && counts.C1 >= 1
      ? 'C2'
      : counts.C1 >= 1 && counts.B1 >= 1
        ? 'C1'
        : counts.B1 >= 1 && counts.A2 >= 2
          ? 'B1'
          : counts.A1 >= 2
            ? 'A2'
            : 'A1'

  return { level, correct, total: PLACEMENT_QUESTIONS.length }
}

/** Primera sesión recomendada para cada nivel del test. */
export const PLACEMENT_START_SLUG: Record<PlacementLevel, string> = {
  A1: 'to-be-presente-pasado',
  A2: 'git-y-errores',
  B1: 'leer-docs-y-specs-rapido',
  C1: 'debatir-arquitectura-con-matices',
  C2: 'presentaciones-de-alto-nivel',
}

export function loadPlacementResult(): PlacementResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PLACEMENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PlacementResult>
    if (!parsed.level || !(parsed.level in PLACEMENT_START_SLUG)) return null
    return {
      level: parsed.level,
      correct: Number(parsed.correct) || 0,
      total: Number(parsed.total) || 0,
    }
  } catch {
    return null
  }
}

export function savePlacementResult(result: PlacementResult): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      PLACEMENT_STORAGE_KEY,
      JSON.stringify({ ...result, date: new Date().toISOString() }),
    )
  } catch {
    // Almacenamiento no disponible: el resultado sigue visible en pantalla.
  }
}
