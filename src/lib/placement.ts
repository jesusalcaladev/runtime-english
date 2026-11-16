import type { Cefr } from './types'

export interface PlacementQuestion {
  id: string
  level: Exclude<Cefr, 'B2'>
  prompt: string
  options: string[]
  answer: number
}

export interface PlacementResult {
  level: Exclude<Cefr, 'B2'>
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
]

export function scorePlacement(answers: (number | null)[]): PlacementResult {
  let a1 = 0
  let a2 = 0
  let b1 = 0
  let correct = 0

  PLACEMENT_QUESTIONS.forEach((question, index) => {
    if (answers[index] !== question.answer) return
    correct += 1
    if (question.level === 'A1') a1 += 1
    else if (question.level === 'A2') a2 += 1
    else b1 += 1
  })

  const level: PlacementResult['level'] = b1 >= 1 && a2 >= 2 ? 'B1' : a1 >= 2 ? 'A2' : 'A1'
  return { level, correct, total: PLACEMENT_QUESTIONS.length }
}

/** Primera sesión recomendada para cada nivel del test. */
export const PLACEMENT_START_SLUG: Record<PlacementResult['level'], string> = {
  A1: 'to-be-presente-pasado',
  A2: 'git-y-errores',
  B1: 'leer-docs-y-specs-rapido',
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

export function loadPlacementResult(): (PlacementResult & { date: string }) | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PLACEMENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PlacementResult & { date: string }
    if (!parsed.level || typeof parsed.correct !== 'number') return null
    return parsed
  } catch {
    return null
  }
}
