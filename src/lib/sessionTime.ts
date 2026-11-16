import type { ContentBlock, Exercise } from './types'

/** Count words in a string (rough, good enough for reading-time estimates). */
function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function collectBlockText(block: ContentBlock): string[] {
  const parts: string[] = []
  switch (block.type) {
    case 'dialogue':
      if (block.title) parts.push(block.title)
      if (block.context) parts.push(block.context)
      for (const line of block.lines) {
        parts.push(line.name, line.en)
        if (line.es) parts.push(line.es)
      }
      break
    case 'technique':
      parts.push(block.name, block.desc)
      break
    case 'text':
      if (block.title) parts.push(block.title)
      parts.push(block.body)
      break
    case 'vocab':
      if (block.title) parts.push(block.title)
      for (const item of block.items) {
        parts.push(item.en, item.es)
        if (item.example) parts.push(item.example)
        if (item.note) parts.push(item.note)
      }
      break
    case 'table':
      if (block.title) parts.push(block.title)
      parts.push(...block.columns)
      for (const row of block.rows) parts.push(...row)
      break
    case 'phrases':
      if (block.title) parts.push(block.title)
      for (const item of block.items) parts.push(item.en, item.es)
      break
    case 'tenses':
      for (const item of block.items) {
        parts.push(item.name, item.tag, item.formula, ...item.cases)
      }
      break
    case 'slang':
      if (block.title) parts.push(block.title)
      break
    case 'callout':
      parts.push(block.title, block.body)
      break
  }
  return parts
}

function collectExerciseText(ex: Exercise): string[] {
  const parts: string[] = [ex.prompt, ex.explanation]
  switch (ex.type) {
    case 'choice':
      parts.push(...ex.options)
      break
    case 'builder':
      parts.push(...ex.words, ex.answer)
      break
    case 'write':
      parts.push(ex.answer)
      if (ex.hint) parts.push(ex.hint)
      if (ex.accept) parts.push(...ex.accept)
      break
    case 'listen':
      parts.push(ex.audioText, ex.answer)
      if (ex.hint) parts.push(ex.hint)
      if (ex.accept) parts.push(...ex.accept)
      break
    case 'speak':
      parts.push(ex.answer)
      if (ex.hint) parts.push(ex.hint)
      if (ex.accept) parts.push(...ex.accept)
      break
    case 'fill-blank':
      parts.push(ex.template, ...ex.blanks)
      if (ex.hint) parts.push(ex.hint)
      break
    case 'dialogue-order':
      parts.push(...ex.lines)
      break
    case 'fix-error':
      parts.push(ex.sentence, ex.answer)
      if (ex.hint) parts.push(ex.hint)
      if (ex.accept) parts.push(...ex.accept)
      break
    case 'roleplay':
      parts.push(ex.scenario, ex.goal, ex.answer)
      if (ex.hint) parts.push(ex.hint)
      if (ex.accept) parts.push(...ex.accept)
      break
  }
  return parts
}

/** Extra minutes per exercise type (beyond reading its text). */
function exerciseEffortMinutes(type: Exercise['type']): number {
  switch (type) {
    case 'choice':
      return 0.5
    case 'builder':
    case 'dialogue-order':
      return 0.7
    case 'fill-blank':
    case 'fix-error':
      return 0.8
    case 'write':
    case 'roleplay':
      return 1.0
    case 'listen':
      return 0.9
    case 'speak':
      return 1.0
    default:
      return 0.7
  }
}

export interface SessionLike {
  summary?: string
  objectives?: string[]
  pronunciation?: string
  blocks?: ContentBlock[]
  exercises?: Exercise[]
  minutes?: number
}

/**
 * Estimate session duration in minutes from its content.
 * Based on reading time (~140 wpm for mixed ES/EN technical learning content)
 * plus effort per exercise. Result is rounded and clamped to a sensible range.
 */
export function estimateSessionMinutes(session: SessionLike): number {
  const parts: string[] = []
  if (session.summary) parts.push(session.summary)
  if (session.pronunciation) parts.push(session.pronunciation)
  for (const obj of session.objectives ?? []) parts.push(obj)
  for (const block of session.blocks ?? []) parts.push(...collectBlockText(block))
  for (const ex of session.exercises ?? []) parts.push(...collectExerciseText(ex))

  const words = parts.reduce((sum, text) => sum + countWords(text), 0)
  const readingMinutes = words / 140

  const exercises = session.exercises ?? []
  const exerciseMinutes = exercises.reduce((sum, ex) => sum + exerciseEffortMinutes(ex.type), 0)

  // Small base overhead for context switching / UI
  const base = 1
  const total = base + readingMinutes + exerciseMinutes
  return Math.max(3, Math.min(60, Math.round(total)))
}

/** Returns the session's duration, computing it when not explicitly provided. */
export function getSessionMinutes(session: SessionLike): number {
  if (
    typeof session.minutes === 'number' &&
    Number.isFinite(session.minutes) &&
    session.minutes > 0
  ) {
    return Math.round(session.minutes)
  }
  return estimateSessionMinutes(session)
}
