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
      return exercise.answer
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
  if (exercise.type === 'speak') return input.heardText || input.text
  if (exercise.type === 'fill-blank') return input.blankValues.join(' | ')
  if (exercise.type === 'dialogue-order')
    return input.dialoguePicked.map((i) => exercise.lines[i]).join(' / ')
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
  if (exercise.type === 'speak') return (input.heardText || input.text).trim().length > 0
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
  if (exercise.type === 'speak') {
    const candidates = [exercise.answer, ...(exercise.accept ?? [])]
    const heard = input.heardText || input.text
    if (candidates.some((c) => normalizeAnswer(c) === normalizeAnswer(heard))) return true
    return speechMatchScore(exercise.answer, heard) >= 0.72
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
