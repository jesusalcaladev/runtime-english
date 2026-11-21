import { getSlang } from '../../data/slang'
import { getCorrectAnswerText } from '../exercise'
import type { ContentBlock, Exercise } from '../types'

/**
 * Enumerates every English phrase a session can speak (dialogue lines, vocabulary,
 * answer models, options and feedback). The result is ordered by importance so the
 * first phrases are the ones a learner is most likely to tap.
 */
export function collectSessionSpeechTexts(
  blocks: ContentBlock[],
  exercises: Exercise[],
  pronunciation?: string,
): string[] {
  const texts: string[] = []
  const seen = new Set<string>()

  const add = (value: string | undefined | null) => {
    if (!value) return
    const clean = value.replace(/\s+/g, ' ').trim()
    if (!clean || seen.has(clean)) return
    seen.add(clean)
    texts.push(clean)
  }

  add(pronunciation)

  for (const block of blocks) {
    switch (block.type) {
      case 'dialogue':
        for (const line of block.lines) add(line.en)
        break
      case 'vocab':
        for (const item of block.items) add(item.example ?? item.en)
        break
      case 'phrases':
        for (const item of block.items) add(item.en)
        break
      case 'slang':
        for (const id of block.ids) {
          const entry = getSlang(id)
          add(entry?.term)
          add(entry?.example)
        }
        break
    }
  }

  for (const exercise of exercises) {
    switch (exercise.type) {
      case 'choice':
      case 'multi-choice':
        for (const option of exercise.options) add(option)
        break
      case 'listen':
        add(exercise.audioText)
        add(exercise.answer)
        break
      case 'builder':
        for (const word of exercise.words) add(word)
        add(exercise.answer)
        break
      case 'dialogue-order':
        for (const line of exercise.lines) add(line)
        break
      case 'dialogue-branch':
        for (const step of exercise.steps) {
          add(step.line)
          for (const choice of step.choices) add(choice.en)
        }
        break
      case 'match':
        for (const pair of exercise.pairs) add(pair.en)
        break
      case 'fill-blank':
        add(exercise.template.replace(/___/g, ''))
        break
    }
    // The feedback card always exposes the canonical answer with a speak button.
    add(getCorrectAnswerText(exercise))
  }

  return texts
}
