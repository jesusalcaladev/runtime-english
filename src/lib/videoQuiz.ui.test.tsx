import { beforeEach, describe, expect, it } from 'vitest'
import { clearVideoQuizProgress, getVideoQuizProgress, saveVideoQuizAttempt } from './videoQuiz'

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

const attempt = (correct: number, missedQuestionIds: string[], at: number) => ({
  questionIds: ['q1', 'q2', 'q3'],
  answers: { q1: 0, q2: 1, q3: 0 },
  correct,
  total: 3,
  missedQuestionIds,
  at,
})

describe('video quiz progress', () => {
  beforeEach(() => store.clear())

  it('returns undefined for unknown videos', () => {
    expect(getVideoQuizProgress('missing')).toBeUndefined()
  })

  it('persists the latest score, best score and missed questions', () => {
    saveVideoQuizAttempt('lesson-1', attempt(1, ['q2', 'q3'], 100))
    const next = saveVideoQuizAttempt('lesson-1', attempt(2, ['q3'], 200))

    expect(next.bestCorrect).toBe(2)
    expect(next.missedQuestionIds).toEqual(['q3'])
    expect(next.attempts.map((entry) => entry.correct)).toEqual([2, 1])

    const stored = getVideoQuizProgress('lesson-1')
    expect(stored?.attempts[0].at).toBe(200)
    expect(stored?.bestCorrect).toBe(2)
  })

  it('keeps only the last five attempts', () => {
    for (let index = 0; index < 7; index += 1) {
      saveVideoQuizAttempt('lesson-1', attempt(index % 3, [], 100 + index))
    }
    expect(getVideoQuizProgress('lesson-1')?.attempts).toHaveLength(5)
  })

  it('clears the progress for one lesson without touching the others', () => {
    saveVideoQuizAttempt('lesson-1', attempt(3, [], 100))
    saveVideoQuizAttempt('lesson-2', attempt(2, ['q1'], 100))
    clearVideoQuizProgress('lesson-1')

    expect(getVideoQuizProgress('lesson-1')).toBeUndefined()
    expect(getVideoQuizProgress('lesson-2')?.bestCorrect).toBe(2)
  })

  it('ignores corrupted stored data', () => {
    store.set('runtimeenglish_video_quiz_v1', '{not json')
    expect(getVideoQuizProgress('lesson-1')).toBeUndefined()

    store.set(
      'runtimeenglish_video_quiz_v1',
      JSON.stringify({ 'lesson-1': { attempts: [{ correct: 'x' }], bestCorrect: null } }),
    )
    expect(getVideoQuizProgress('lesson-1')).toBeUndefined()
  })
})
