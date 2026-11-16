import { describe, expect, it } from 'vitest'
import {
  canCheckExercise,
  getCorrectAnswerText,
  getUserAnswerText,
  isExerciseAnswerCorrect,
  normalizeAnswer,
  orderExercises,
  shuffleIndices,
  splitBlankAlts,
} from './exercise'
import type { Exercise } from './types'

const base = {
  selected: null,
  picked: [],
  text: '',
  blankValues: [],
  dialoguePicked: [],
  heardText: '',
}

describe('exercise utils', () => {
  it('normalizes and splits alternatives', () => {
    expect(normalizeAnswer('  ¡Hola,  Múndo!  ')).toBe('hola mundo')
    expect(splitBlankAlts(' at | in ')).toEqual(['at', 'in'])
  })

  it('shuffles indices and avoids trivial same order when possible', () => {
    const out = shuffleIndices(3, () => 0) // deterministic but should still produce a permutation
    expect(out.sort((a, b) => a - b)).toEqual([0, 1, 2])
  })

  it('evaluates choice, builder and text exercises', () => {
    const choice: Exercise = {
      id: 'c',
      type: 'choice',
      prompt: '',
      options: ['a', 'b'],
      answer: 1,
      explanation: '',
    }
    expect(canCheckExercise(choice, base)).toBe(false)
    expect(isExerciseAnswerCorrect(choice, { ...base, selected: 1 })).toBe(true)
    expect(getCorrectAnswerText(choice)).toBe('b')

    const builder: Exercise = {
      id: 'b',
      type: 'builder',
      prompt: '',
      words: ['bug', 'I', 'fixed'],
      answer: 'I fixed bug',
      explanation: '',
    }
    expect(isExerciseAnswerCorrect(builder, { ...base, picked: [1, 2, 0] })).toBe(true)
    expect(getUserAnswerText(builder, { ...base, picked: [1, 2, 0] })).toBe('I fixed bug')

    const write: Exercise = {
      id: 'w',
      type: 'write',
      prompt: '',
      answer: 'I fixed the bug.',
      accept: ['I fixed the bug'],
      explanation: '',
    }
    expect(isExerciseAnswerCorrect(write, { ...base, text: 'i fixed the bug' })).toBe(true)
  })

  it('evaluates fill-blank and dialogue-order', () => {
    const fill: Exercise = {
      id: 'f',
      type: 'fill-blank',
      prompt: '',
      template: 'I work ___ a ___',
      blanks: ['at|in', 'startup'],
      explanation: '',
    }
    expect(canCheckExercise(fill, { ...base, blankValues: ['at', 'startup'] })).toBe(true)
    expect(isExerciseAnswerCorrect(fill, { ...base, blankValues: ['at', 'startup'] })).toBe(true)
    expect(getCorrectAnswerText(fill)).toBe('at · startup')

    const dialog: Exercise = {
      id: 'd',
      type: 'dialogue-order',
      prompt: '',
      lines: ['Hi', 'Hello'],
      explanation: '',
    }
    expect(isExerciseAnswerCorrect(dialog, { ...base, dialoguePicked: [0, 1] })).toBe(true)
    expect(isExerciseAnswerCorrect(dialog, { ...base, dialoguePicked: [1, 0] })).toBe(false)
  })

  it('orders exercises by comprehension, controlled practice and production', () => {
    const exercises: Exercise[] = [
      { id: 'w', type: 'write', prompt: '', answer: 'Hi', explanation: '' },
      { id: 'c', type: 'choice', prompt: '', options: ['a', 'b'], answer: 0, explanation: '' },
      {
        id: 'b',
        type: 'builder',
        prompt: '',
        words: ['Hi', 'there'],
        answer: 'Hi there',
        explanation: '',
      },
      { id: 's', type: 'shadow', prompt: '', answer: 'Hi there', explanation: '' },
      { id: 'm', type: 'match', prompt: '', pairs: [{ en: 'hi', es: 'hola' }], explanation: '' },
    ]
    expect(orderExercises(exercises).map((exercise) => exercise.id)).toEqual([
      'c',
      'm',
      'b',
      'w',
      's',
    ])
  })

  it('evaluates match, multi-choice and shadow exercises', () => {
    const match: Exercise = {
      id: 'm',
      type: 'match',
      prompt: '',
      pairs: [
        { en: 'set up', es: 'configurar' },
        { en: 'roll back', es: 'revertir' },
      ],
      explanation: '',
    }
    expect(canCheckExercise(match, base)).toBe(false)
    expect(isExerciseAnswerCorrect(match, { ...base, matchedPairs: [0, 1] })).toBe(true)
    expect(isExerciseAnswerCorrect(match, { ...base, matchedPairs: [0] })).toBe(false)

    const multi: Exercise = {
      id: 'mc',
      type: 'multi-choice',
      prompt: '',
      options: ['a', 'b', 'c', 'd'],
      answers: [0, 2],
      explanation: '',
    }
    expect(canCheckExercise(multi, base)).toBe(false)
    expect(isExerciseAnswerCorrect(multi, { ...base, multiPicked: [2, 0] })).toBe(true)
    expect(isExerciseAnswerCorrect(multi, { ...base, multiPicked: [0, 1] })).toBe(false)
    expect(getCorrectAnswerText(multi)).toBe('a · c')

    const shadow: Exercise = {
      id: 'sh',
      type: 'shadow',
      prompt: '',
      answer: 'We roll back the deploy',
      explanation: '',
    }
    expect(isExerciseAnswerCorrect(shadow, { ...base, heardText: 'we roll back the deploy' })).toBe(
      true,
    )
    expect(getUserAnswerText(shadow, { ...base, text: 'we roll back the deploy' })).toBe(
      'we roll back the deploy',
    )
  })

  it('evaluates dialogue-branch choices step by step', () => {
    const dialogue: Exercise = {
      id: 'db',
      type: 'dialogue-branch',
      prompt: '',
      steps: [
        {
          speaker: 'Maya',
          line: 'Any blockers?',
          choices: [
            { en: 'Yes, I am blocked.', correct: true, feedback: 'Bien.' },
            { en: 'No, I hate tests.', correct: false, feedback: 'Mejor explica.' },
          ],
        },
      ],
      explanation: '',
    }
    expect(canCheckExercise(dialogue, base)).toBe(false)
    expect(isExerciseAnswerCorrect(dialogue, { ...base, dialogueBranchPicked: [1] })).toBe(false)
    expect(isExerciseAnswerCorrect(dialogue, { ...base, dialogueBranchPicked: [0] })).toBe(true)
    expect(getUserAnswerText(dialogue, { ...base, dialogueBranchPicked: [0] })).toBe(
      'Yes, I am blocked.',
    )
  })

  it('evaluates speak with exact/accepted text fallback', () => {
    const speak: Exercise = {
      id: 's',
      type: 'speak',
      prompt: '',
      answer: 'I fixed the bug',
      accept: ['I fixed it'],
      explanation: '',
    }
    expect(canCheckExercise(speak, { ...base, heardText: 'I fixed the bug' })).toBe(true)
    expect(isExerciseAnswerCorrect(speak, { ...base, heardText: 'I fixed the bug' })).toBe(true)
    expect(isExerciseAnswerCorrect(speak, { ...base, text: 'I fixed it' })).toBe(true)
  })
})
