import { beforeEach, describe, expect, it } from 'vitest'
import {
  createDefaultVideoLabState,
  mergeVideoLabStates,
  normalizeVideoLab,
  readLegacyVideoLab,
} from './videoLabState'

const store = new Map<string, string>()
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  },
})

const quizEntry = {
  attempts: [
    {
      questionIds: ['q1', 'q2'],
      answers: { q1: 0 },
      correct: 1,
      total: 2,
      missedQuestionIds: ['q2'],
      at: 100,
    },
  ],
  bestCorrect: 1,
  missedQuestionIds: ['q2'],
}

beforeEach(() => store.clear())

describe('videoLabState', () => {
  it('normalizes corrupt entries without dropping valid ones', () => {
    const state = normalizeVideoLab({
      progress: {
        good: { position: 12, duration: 100, completed: true, updatedAt: 5 },
        bad: { position: 'nope', duration: 100, updatedAt: 5 },
      },
      quiz: { good: quizEntry, bad: { attempts: [{ correct: 'x' }] } },
    })

    expect(Object.keys(state.progress)).toEqual(['good'])
    expect(Object.keys(state.quiz)).toEqual(['good'])
    expect(createDefaultVideoLabState().progress).toEqual({})
  })

  it('imports the old localStorage keys once', () => {
    store.set(
      'runtimeenglish_video_progress_v1',
      JSON.stringify({ old: { position: 20, duration: 60, completed: false, updatedAt: 7 } }),
    )
    store.set('runtimeenglish_video_quiz_v1', JSON.stringify({ old: quizEntry }))

    const legacy = readLegacyVideoLab()
    expect(legacy?.progress.old.position).toBe(20)
    expect(legacy?.quiz.old.bestCorrect).toBe(1)
  })

  it('merges local and remote quiz attempts without duplicates', () => {
    const local = normalizeVideoLab({ quiz: { lesson: quizEntry } })
    const remote = normalizeVideoLab({ quiz: { lesson: quizEntry } })
    const merged = mergeVideoLabStates(local, remote)

    expect(merged.quiz.lesson.attempts).toHaveLength(1)
    expect(merged.quiz.lesson.bestCorrect).toBe(1)
  })
})
