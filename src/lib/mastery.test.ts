import { describe, expect, it } from 'vitest'
import { ALL_SESSIONS } from '../data/curriculum'
import { getMasteredSessionIds, getSessionMastery } from './mastery'
import type { ProgressState } from './progress'

const baseState = {
  exerciseSrs: {},
} as unknown as ProgressState

describe('session mastery', () => {
  it('requires two correct streaks on 85% of the exercises', () => {
    const session = ALL_SESSIONS[0].session
    const ids = session.exercises.map((exercise) => exercise.id)
    const needed = Math.ceil((ids.length * 85) / 100)
    const exerciseSrs: ProgressState['exerciseSrs'] = {}
    ids.slice(0, needed).forEach((id) => {
      exerciseSrs[id] = {
        box: 2,
        due: Date.now() + 86_400_000,
        last: Date.now(),
        correctStreak: 2,
      }
    })
    const state = { exerciseSrs } as unknown as ProgressState
    const mastery = getSessionMastery(state, session.id)
    expect(mastery.mastered).toBe(needed)
    expect(mastery.isMastered).toBe(true)
    expect(getMasteredSessionIds(state)).toContain(session.id)
  })

  it('does not mark a session as mastered with a single streak', () => {
    const session = ALL_SESSIONS[0].session
    expect(getSessionMastery(baseState, session.id).isMastered).toBe(false)
  })

  it('returns an empty result for an unknown session', () => {
    expect(getSessionMastery(baseState, 'unknown')).toEqual({
      mastered: 0,
      total: 0,
      pct: 0,
      isMastered: false,
    })
  })
})
