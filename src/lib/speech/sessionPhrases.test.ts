import { describe, expect, it } from 'vitest'
import { SLANG } from '../../data/slang'
import type { ContentBlock, Exercise } from '../types'
import { collectSessionSpeechTexts } from './sessionPhrases'

describe('collectSessionSpeechTexts', () => {
  it('collects the pronunciation and every speakable block phrase, without duplicates', () => {
    const blocks: ContentBlock[] = [
      {
        type: 'dialogue',
        setting: 'Slack, #backend',
        goal: 'Reportar un bug',
        context: 'Leo reporta un error.',
        lines: [
          { speaker: 'a', name: 'Maya', en: 'What is the error?' },
          { speaker: 'b', name: 'Leo', en: 'It says connection refused.' },
        ],
      },
      {
        type: 'vocab',
        items: [{ en: 'deploy', es: 'desplegar', example: 'We deploy on Friday.' }],
      },
      { type: 'phrases', items: [{ en: 'Keep me posted.', es: 'Avísame.' }] },
      { type: 'slang', ids: [SLANG[0].id] },
      { type: 'callout', tone: 'tip', title: 'Antes de esta lección', body: 'Repasa M1.' },
    ]

    const texts = collectSessionSpeechTexts(blocks, [], 'I fix bugs.')

    expect(texts).toContain('I fix bugs.')
    expect(texts).toContain('What is the error?')
    expect(texts).toContain('It says connection refused.')
    expect(texts).toContain('We deploy on Friday.')
    expect(texts).toContain('Keep me posted.')
    expect(texts).toContain(SLANG[0].term)
    expect(texts).not.toContain('Repasa M1.')
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('collects answers, options and feedback text from every exercise type', () => {
    const exercises = [
      {
        id: 'e1',
        type: 'choice',
        prompt: 'p',
        options: ['Pull changes', 'Push changes'],
        answer: 0,
        explanation: 'e',
      },
      {
        id: 'e2',
        type: 'builder',
        prompt: 'p',
        words: ['Run', 'the tests'],
        answer: 'Run the tests',
        explanation: 'e',
      },
      {
        id: 'e3',
        type: 'listen',
        prompt: 'p',
        audioText: 'The build failed',
        answer: 'The build failed',
        explanation: 'e',
      },
      { id: 'e4', type: 'speak', prompt: 'p', answer: 'I will deploy it', explanation: 'e' },
      {
        id: 'e5',
        type: 'shadow',
        prompt: 'p',
        answer: 'Ship it when tests pass',
        explanation: 'e',
      },
      {
        id: 'e6',
        type: 'fill-blank',
        prompt: 'p',
        template: 'I ___ the bug',
        blanks: ['fixed'],
        explanation: 'e',
      },
      {
        id: 'e7',
        type: 'dialogue-order',
        prompt: 'p',
        lines: ['Any blockers?', 'No, all clear.'],
        explanation: 'e',
      },
      {
        id: 'e8',
        type: 'dialogue-branch',
        prompt: 'p',
        steps: [
          {
            speaker: 'Maya',
            line: 'Any blockers?',
            choices: [{ en: 'No, all clear.', correct: true, feedback: 'Bien.' }],
          },
        ],
        explanation: 'e',
      },
      {
        id: 'e9',
        type: 'match',
        prompt: 'p',
        pairs: [{ en: 'roll back', es: 'revertir' }],
        explanation: 'e',
      },
      {
        id: 'e10',
        type: 'multi-choice',
        prompt: 'p',
        options: ['git push', 'git pull'],
        answers: [0, 1],
        explanation: 'e',
      },
      {
        id: 'e11',
        type: 'fix-error',
        prompt: 'p',
        sentence: 'He fix the bug',
        answer: 'He fixed the bug',
        explanation: 'e',
      },
      {
        id: 'e12',
        type: 'roleplay',
        prompt: 'p',
        scenario: 'Un incidente',
        goal: 'Reportar impacto',
        answer: 'We are rolling back now',
        explanation: 'e',
      },
      { id: 'e13', type: 'write', prompt: 'p', answer: 'I will review the PR', explanation: 'e' },
    ] as Exercise[]

    const texts = collectSessionSpeechTexts([], exercises)

    for (const expected of [
      'Pull changes',
      'Push changes',
      'Run the tests',
      'The build failed',
      'I will deploy it',
      'Ship it when tests pass',
      'Any blockers?',
      'No, all clear.',
      'roll back',
      'git push',
      'git pull',
      'He fixed the bug',
      'We are rolling back now',
      'I will review the PR',
      'fixed',
    ]) {
      expect(texts, `missing ${expected}`).toContain(expected)
    }
    expect(texts).not.toContain('Un incidente')
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('returns no phrases for an empty lesson', () => {
    expect(collectSessionSpeechTexts([], [])).toEqual([])
  })
})
