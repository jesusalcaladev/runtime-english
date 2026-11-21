import { beforeEach, describe, expect, it } from 'vitest'
import { ALL_SESSIONS } from '../data/curriculum'
import {
  getRecommendedNextSession,
  getRetentionStats,
  getSkillProfile,
  getUnifiedReviewQueue,
} from './learning'
import { createDefaultState, phraseId, progressStore } from './progress'
import type { Exercise } from './types'

const firstExercise = ALL_SESSIONS[0].session.exercises[0]
const secondExercise = ALL_SESSIONS[0].session.exercises[1] ?? firstExercise

describe('learning engine', () => {
  beforeEach(() => progressStore.reset())

  it('builds a skill profile from attempts and recent errors', () => {
    const state = createDefaultState()
    state.attempts[firstExercise.id] = 5
    state.errorEvents = [
      {
        id: 'e1',
        exerciseId: firstExercise.id,
        exerciseType: firstExercise.type,
        prompt: firstExercise.prompt,
        userAnswer: 'I works',
        correctAnswer: 'I work',
        skills: ['tenses'],
        at: Date.now(),
      },
    ]

    const profile = getSkillProfile(state)
    expect(profile.length).toBeGreaterThan(0)
    expect(profile[0].seen).toBe(5)
    expect(profile[0].accuracy).toBeLessThan(100)
    expect(profile[0].weakness).toBeGreaterThan(0)
  })

  it('unifies retention, SRS exercises and phrases in one queue', () => {
    const state = createDefaultState()
    const now = Date.now()
    state.completedExercises[firstExercise.id] = now - 1000
    state.exerciseSrs[firstExercise.id] = {
      box: 0,
      due: now - 1000,
      last: now - 1000,
      correctStreak: 1,
    }
    state.retentionChecks[`${secondExercise.id}:1`] = {
      exerciseId: secondExercise.id,
      dueAt: now - 1000,
      offsetDays: 1,
      attempts: 0,
      correct: 0,
    }
    state.phrasebook[phraseId('ship the fix')] = {
      id: phraseId('ship the fix'),
      en: 'ship the fix',
      es: 'desplegar el arreglo',
      source: 'Práctica',
      addedAt: now - 10_000,
      updatedAt: now - 10_000,
      seen: 1,
      correct: 1,
      saved: true,
      box: 0,
      due: now - 1000,
      last: now - 10_000,
      correctStreak: 1,
    } as (typeof state.phrasebook)[string]

    const kinds = new Set(getUnifiedReviewQueue(state, now).map((task) => task.kind))
    expect(kinds.has('retention')).toBe(true)
    expect(kinds.has('exercise')).toBe(true)
    expect(kinds.has('phrase')).toBe(true)
  })

  it('recommends review first when there is enough review debt', () => {
    const state = createDefaultState()
    const now = Date.now()
    for (const { session } of ALL_SESSIONS.slice(0, 6)) {
      const exercise = session.exercises[0]
      state.attempts[exercise.id] = 2
      state.completedExercises[exercise.id] = now - 1000
      state.exerciseSrs[exercise.id] = {
        box: 0,
        due: now - 1000,
        last: now - 1000,
        correctStreak: 1,
      }
    }

    const rec = getRecommendedNextSession(state, now)
    expect(rec.reviewFirst).toBe(true)
    expect(rec.dueCount).toBeGreaterThanOrEqual(5)
    expect(rec.reason).toContain('repasos')
  })

  it('schedules 24 h retention checks after a correct answer', () => {
    const exercise: Exercise = { ...firstExercise, id: 'retention-test-e1' }
    progressStore.recordExercise(exercise, true)
    const checks = Object.values(progressStore.getState().retentionChecks)
    expect(checks.length).toBe(1)
    expect(checks[0].offsetDays).toBe(1)
    expect(checks[0].dueAt).toBeGreaterThan(Date.now())
  })

  it('reports retention rates by offset', () => {
    const state = createDefaultState()
    state.retentionChecks = {
      'a:1': { exerciseId: 'a', dueAt: 0, offsetDays: 1, attempts: 1, correct: 1, done: true },
      'b:3': { exerciseId: 'b', dueAt: 0, offsetDays: 3, attempts: 1, correct: 0, done: true },
    }
    const stats = getRetentionStats(state)
    expect(stats.rate).toBe(50)
    expect(stats.byOffset[1].rate).toBe(100)
    expect(stats.byOffset[3].rate).toBe(0)
  })
})
