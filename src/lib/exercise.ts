import { speechMatchScore } from './speech'
import type { Exercise } from './types'

export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function splitBlankAlts(value: string): string[] {
  return value
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Fases didácticas: comprensión → práctica controlada → producción. */
const EXERCISE_STAGE: Record<Exercise['type'], 1 | 2 | 3> = {
  choice: 1,
  match: 1,
  'multi-choice': 1,
  listen: 1,
  'dialogue-order': 1,
  'fill-blank': 1,
  'fix-error': 2,
  'dialogue-branch': 2,
  builder: 2,
  write: 3,
  speak: 3,
  roleplay: 3,
  shadow: 3,
}

/**
 * Ordena los ejercicios por fase didáctica manteniendo el orden original dentro
 * de cada fase. Se aplica al mostrar la sesión; no cambia los IDs guardados.
 */
export function orderExercises(exercises: Exercise[]): Exercise[] {
  return exercises
    .map((exercise, index) => ({ exercise, index }))
    .sort(
      (a, b) =>
        EXERCISE_STAGE[a.exercise.type] - EXERCISE_STAGE[b.exercise.type] || a.index - b.index,
    )
    .map(({ exercise }) => exercise)
}

export function shuffleIndices(length: number, random: () => number = Math.random): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  if (length > 1) {
    const sameOrder = indices.every((value, i) => value === i)
    if (sameOrder) [indices[0], indices[1]] = [indices[1], indices[0]]
  }
  return indices
}

export interface ExerciseInteraction {
  selected: number | null
  picked: number[]
  text: string
  blankValues: string[]
  dialoguePicked: number[]
  heardText: string
  /** Options ticked in a `multi-choice` exercise. */
  multiPicked?: number[]
  /** Pair indexes already matched in a `match` exercise. */
  matchedPairs?: number[]
  /** One chosen option per step in a `dialogue-branch` exercise. */
  dialogueBranchPicked?: number[]
}

export function getCorrectAnswerText(exercise: Exercise): string {
  switch (exercise.type) {
    case 'choice':
      return exercise.options[exercise.answer] ?? ''
    case 'fill-blank':
      return exercise.blanks.map((b) => splitBlankAlts(b)[0]).join(' · ')
    case 'dialogue-order':
      return exercise.lines.join(' / ')
    case 'builder':
    case 'write':
    case 'listen':
    case 'speak':
    case 'fix-error':
    case 'roleplay':
    case 'shadow':
      return exercise.answer
    case 'multi-choice':
      return exercise.answers.map((index) => exercise.options[index] ?? '').join(' · ')
    case 'match':
      return exercise.pairs.map((pair) => `${pair.en} = ${pair.es}`).join(' · ')
    case 'dialogue-branch':
      return exercise.steps
        .map((step) => step.choices.find((choice) => choice.correct)?.en ?? '')
        .filter(Boolean)
        .join(' / ')
  }
}

export function getUserAnswerText(exercise: Exercise, input: ExerciseInteraction): string {
  if (exercise.type === 'choice')
    return input.selected !== null ? (exercise.options[input.selected] ?? '') : ''
  if (exercise.type === 'builder') return input.picked.map((i) => exercise.words[i]).join(' ')
  if (
    exercise.type === 'write' ||
    exercise.type === 'listen' ||
    exercise.type === 'fix-error' ||
    exercise.type === 'roleplay'
  )
    return input.text
  if (exercise.type === 'speak' || exercise.type === 'shadow') return input.heardText || input.text
  if (exercise.type === 'fill-blank') return input.blankValues.join(' | ')
  if (exercise.type === 'dialogue-order')
    return input.dialoguePicked.map((i) => exercise.lines[i]).join(' / ')
  if (exercise.type === 'multi-choice')
    return (input.multiPicked ?? [])
      .slice()
      .sort((a, b) => a - b)
      .map((i) => exercise.options[i] ?? '')
      .join(' · ')
  if (exercise.type === 'match')
    return (input.matchedPairs ?? []).map((i) => exercise.pairs[i]?.en ?? '').join(' · ')
  if (exercise.type === 'dialogue-branch')
    return (input.dialogueBranchPicked ?? [])
      .map((choiceIndex, stepIndex) => exercise.steps[stepIndex]?.choices[choiceIndex]?.en ?? '')
      .filter(Boolean)
      .join(' / ')
  return ''
}

export function canCheckExercise(exercise: Exercise, input: ExerciseInteraction): boolean {
  if (exercise.type === 'choice') return input.selected !== null
  if (exercise.type === 'builder') return input.picked.length > 0
  if (
    exercise.type === 'write' ||
    exercise.type === 'listen' ||
    exercise.type === 'fix-error' ||
    exercise.type === 'roleplay'
  )
    return input.text.trim().length > 0
  if (exercise.type === 'speak' || exercise.type === 'shadow')
    return (input.heardText || input.text).trim().length > 0
  if (exercise.type === 'multi-choice') return (input.multiPicked ?? []).length > 0
  if (exercise.type === 'match') return (input.matchedPairs ?? []).length > 0
  if (exercise.type === 'dialogue-branch')
    return (input.dialogueBranchPicked ?? []).some((value) => value >= 0)
  if (exercise.type === 'fill-blank')
    return (
      input.blankValues.length === exercise.blanks.length &&
      input.blankValues.every((v) => v.trim().length > 0)
    )
  if (exercise.type === 'dialogue-order') return input.dialoguePicked.length > 0
  return false
}

export function isExerciseAnswerCorrect(exercise: Exercise, input: ExerciseInteraction): boolean {
  if (exercise.type === 'choice') return input.selected === exercise.answer
  if (exercise.type === 'builder') {
    return (
      normalizeAnswer(input.picked.map((wordIndex) => exercise.words[wordIndex]).join(' ')) ===
      normalizeAnswer(exercise.answer)
    )
  }
  if (
    exercise.type === 'write' ||
    exercise.type === 'listen' ||
    exercise.type === 'fix-error' ||
    exercise.type === 'roleplay'
  ) {
    const candidates = [exercise.answer, ...(exercise.accept ?? [])]
    return candidates.some(
      (candidate) => normalizeAnswer(candidate) === normalizeAnswer(input.text),
    )
  }
  if (exercise.type === 'speak' || exercise.type === 'shadow') {
    const candidates = [exercise.answer, ...(exercise.accept ?? [])]
    const heard = input.heardText || input.text
    if (candidates.some((c) => normalizeAnswer(c) === normalizeAnswer(heard))) return true
    return speechMatchScore(exercise.answer, heard) >= 0.72
  }
  if (exercise.type === 'multi-choice') {
    const picked = [...(input.multiPicked ?? [])].sort((a, b) => a - b)
    const answers = [...exercise.answers].sort((a, b) => a - b)
    return picked.length === answers.length && picked.every((value, i) => value === answers[i])
  }
  if (exercise.type === 'match') {
    const matched = [...(input.matchedPairs ?? [])].sort((a, b) => a - b)
    return matched.length === exercise.pairs.length && matched.every((value, i) => value === i)
  }
  if (exercise.type === 'dialogue-branch') {
    const answered = (input.dialogueBranchPicked ?? [])
      .map((choiceIndex, stepIndex) => ({ stepIndex, choiceIndex }))
      .filter(({ choiceIndex }) => choiceIndex >= 0)
    return (
      answered.length > 0 &&
      answered.every(
        ({ stepIndex, choiceIndex }) =>
          exercise.steps[stepIndex]?.choices[choiceIndex]?.correct === true,
      )
    )
  }
  if (exercise.type === 'fill-blank') {
    if (input.blankValues.length !== exercise.blanks.length) return false
    return exercise.blanks.every((b, i) => {
      const alts = splitBlankAlts(b)
      const v = normalizeAnswer(input.blankValues[i] || '')
      return alts.some((a) => normalizeAnswer(a) === v)
    })
  }
  if (exercise.type === 'dialogue-order') {
    if (input.dialoguePicked.length !== exercise.lines.length) return false
    return input.dialoguePicked.every((lineIdx, pos) => lineIdx === pos)
  }
  return false
}
