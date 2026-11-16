import { beforeEach, describe, expect, it } from 'vitest'
import {
  createDefaultState,
  getDueExerciseIds,
  getDuePhraseEntries,
  getReviewStats,
  isExerciseDue,
  mergeState,
  PROGRESS_SCHEMA_VERSION,
  phraseId,
  progressStore,
} from './progress'
import type { Exercise } from './types'

const ex: Exercise = {
  id: 'm1-l1-e1',
  type: 'choice',
  prompt: 'Choose: I ___ at a startup.',
  options: ['work', 'works', 'working', 'worked'],
  answer: 0,
  explanation: "Use base form with 'I'.",
}

const ex2: Exercise = {
  id: 'm1-l1-e2',
  type: 'write',
  prompt: 'Write: I fixed the bug.',
  answer: 'I fixed the bug.',
  explanation: 'Past simple.',
}

describe('progress', () => {
  beforeEach(() => {
    progressStore.reset()
  })

  it('creates default state with current schema and empty error events', () => {
    const s = createDefaultState()
    expect(s.version).toBe(PROGRESS_SCHEMA_VERSION)
    expect(s.errorEvents).toEqual([])
    expect(s.phrasebook).toEqual({})
    expect(s.exerciseSrs).toEqual({})
  })

  it('mergeState normalizes and keeps recent error events', () => {
    const merged = mergeState({
      xp: 10,
      attempts: { a: 1 },
      errorEvents: [
        {
          exerciseId: 'x1',
          exerciseType: 'choice',
          prompt: 'p',
          userAnswer: 'u',
          correctAnswer: 'c',
          skills: ['tenses', 'prepositions'],
          at: 100,
        },
        { bad: true },
      ],
    } as any)
    expect(merged.xp).toBe(10)
    expect(merged.attempts.x1 ?? merged.attempts.a).toBeDefined()
    expect(merged.errorEvents.length).toBe(1)
    expect(merged.errorEvents[0]).toMatchObject({
      exerciseId: 'x1',
      exerciseType: 'choice',
      prompt: 'p',
      userAnswer: 'u',
      correctAnswer: 'c',
      skills: ['tenses', 'prepositions'],
    })
  })

  it('mergeState unwraps export envelope format', () => {
    const base = createDefaultState()
    base.xp = 77
    const merged = mergeState({
      format: 'runtimeenglish-progress',
      schemaVersion: 3,
      state: base,
    } as any)
    expect(merged.xp).toBe(77)
    expect(merged.errorEvents).toEqual([])
  })

  it('migrates the pronunciation session moved from MOD 08 to MOD 02', () => {
    const merged = mergeState({
      completedSessions: { 'm8-l2': 1234 },
      completedExercises: { 'm8-l2-e1': 1234, 'm8-l2-e2': 1234 },
    } as any)
    expect(merged.completedSessions['m2-l4']).toBe(1234)
    expect(merged.completedSessions['m8-l2']).toBeUndefined()
    expect(merged.completedExercises['m2-l4-e1']).toBe(1234)
    expect(merged.completedExercises['m2-l4-e2']).toBe(1234)
    expect(merged.completedExercises['m8-l2-e1']).toBeUndefined()
  })

  it('recordExercise stores detailed error event on incorrect answer', () => {
    progressStore.recordExercise(ex, false, {
      userAnswer: 'works',
      correctAnswer: 'work',
      skills: ['agreement', 'tenses'],
      sessionId: 'm1-l1',
    })
    const s = progressStore.getState()
    expect(s.attempts[ex.id]).toBe(1)
    expect(s.completedExercises[ex.id]).toBeUndefined()
    expect(s.exerciseSrs[ex.id]).toBeDefined()
    expect(s.exerciseSrs[ex.id].box).toBe(0)
    expect(s.errorEvents.length).toBe(1)
    expect(s.errorEvents[0]).toMatchObject({
      exerciseId: ex.id,
      sessionId: 'm1-l1',
      exerciseType: 'choice',
      userAnswer: 'works',
      correctAnswer: 'work',
    })
    expect(s.errorEvents[0].skills).toEqual(expect.arrayContaining(['agreement', 'tenses']))
  })

  it('recordExercise does not create error event on correct answer and awards first completion', () => {
    progressStore.recordExercise(ex, true, {
      userAnswer: 'work',
      correctAnswer: 'work',
      skills: [],
    })
    const s1 = progressStore.getState()
    expect(s1.errorEvents.length).toBe(0)
    expect(s1.completedExercises[ex.id]).toBeTypeOf('number')
    expect(s1.attempts[ex.id]).toBe(1)
    const xpAfterFirst = s1.xp
    // Second correct attempt should not re-award exercise XP
    progressStore.recordExercise(ex, true, {
      userAnswer: 'work',
      correctAnswer: 'work',
      skills: [],
    })
    const s2 = progressStore.getState()
    expect(s2.attempts[ex.id]).toBe(2)
    expect(s2.xp).toBe(xpAfterFirst)
  })

  it('review stats and due detection work with attempts and srs', () => {
    progressStore.recordExercise(ex, false, {
      userAnswer: 'x',
      correctAnswer: 'y',
      skills: ['general'],
    })
    progressStore.recordExercise(ex2, true)
    const s = progressStore.getState()
    const ids = [ex.id, ex2.id, 'm1-l1-e3']
    const stats = getReviewStats(s, ids, Date.now())
    expect(stats.unseen).toBe(1)
    expect(stats.weak).toBeGreaterThanOrEqual(1)
    expect(isExerciseDue(s, ex.id, Date.now() + 11 * 60 * 1000)).toBe(true)
    const due = getDueExerciseIds(s, ids, Date.now() + 11 * 60 * 1000)
    expect(due).toContain(ex.id)
  })

  it('phrasebook helpers: phraseId stable, save/review and due phrases', () => {
    const id = phraseId('Deploy the service')
    expect(id).toBe(phraseId('  Deploy   the service  '))
    progressStore.savePhrase('Deploy the service', 'Desplegar el servicio', 'Manual')
    let s = progressStore.getState()
    expect(s.phrasebook[id]).toBeDefined()
    expect(s.phrasebook[id].saved).toBe(true)
    expect(s.phrasebook[id].es).toContain('Desplegar')
    progressStore.reviewPhrase(id, false)
    s = progressStore.getState()
    expect(s.phrasebook[id].seen).toBeGreaterThan(0)
    expect(s.phrasebook[id].correctStreak).toBe(0)
    const due = getDuePhraseEntries(s, Date.now() + 11 * 60 * 1000)
    expect(due.some((p) => p.id === id)).toBe(true)
  })

  it('caps error events history to recent entries', () => {
    for (let i = 0; i < 350; i++) {
      progressStore.recordExercise({ ...ex, id: `e-${i}` } as Exercise, false, {
        userAnswer: 'u',
        correctAnswer: 'c',
        skills: ['general'],
      })
    }
    const s = progressStore.getState()
    expect(s.errorEvents.length).toBeLessThanOrEqual(300)
    expect(s.errorEvents[s.errorEvents.length - 1].exerciseId).toBe('e-349')
  })
})
