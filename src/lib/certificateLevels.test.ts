import { describe, expect, it } from 'vitest'
import {
  CERTIFICATE_LEVELS,
  getLevelSessions,
  getLevelStats,
  isLevelCertificateReady,
  isLevelComplete,
  isLevelUnlocked,
  isUpcomingLevel,
  levelCertificateId,
  levelSlug,
} from './certificateLevels'
import { createDefaultState } from './progress'
import type { Level } from './types'

function completeLevel(state: ReturnType<typeof createDefaultState>, level: Level) {
  const now = Date.now()
  for (const { session } of getLevelSessions(level)) {
    state.completedSessions[session.id] = now
    for (const exercise of session.exercises) state.completedExercises[exercise.id] = now
  }
}

describe('certificateLevels', () => {
  it('define los tres niveles en orden progresivo', () => {
    expect(CERTIFICATE_LEVELS.map((info) => info.level)).toEqual(['A1-A2', 'B1-B2', 'C1-C2'])
    expect(isUpcomingLevel('C1-C2')).toBe(false)
    expect(isUpcomingLevel('A1-A2')).toBe(false)
  })

  it('A1-A2 empieza desbloqueado y B1-B2 requiere completar A1-A2', () => {
    const state = createDefaultState()
    expect(isLevelUnlocked('A1-A2', state)).toBe(true)
    expect(isLevelUnlocked('B1-B2', state)).toBe(false)
    expect(isLevelCertificateReady('B1-B2', state)).toBe(false)

    completeLevel(state, 'A1-A2')
    expect(isLevelComplete('A1-A2', state)).toBe(true)
    expect(isLevelUnlocked('B1-B2', state)).toBe(true)

    completeLevel(state, 'B1-B2')
    expect(isLevelComplete('B1-B2', state)).toBe(true)
    expect(isLevelCertificateReady('B1-B2', state)).toBe(true)
  })

  it('C1-C2 requiere completar B1-B2 y luego su propio nivel', () => {
    const state = createDefaultState()
    expect(isLevelUnlocked('C1-C2', state)).toBe(false)

    completeLevel(state, 'A1-A2')
    expect(isLevelUnlocked('C1-C2', state)).toBe(false)

    completeLevel(state, 'B1-B2')
    expect(isLevelUnlocked('C1-C2', state)).toBe(true)
    expect(isLevelCertificateReady('C1-C2', state)).toBe(false)

    completeLevel(state, 'C1-C2')
    expect(isLevelCertificateReady('C1-C2', state)).toBe(true)
  })

  it('cuenta solo sesiones y ejercicios del nivel', () => {
    const state = createDefaultState()
    const stats = getLevelStats('A1-A2', state)
    expect(stats.sessions).toBe(16)
    expect(stats.exercises).toBe(109)
    expect(stats.doneSessions).toBe(0)
  })

  it('genera IDs únicos por nivel', () => {
    expect(levelSlug('A1-A2')).toBe('A1A2')
    expect(levelCertificateId('AB12CD', 'A1-A2')).toBe('AB12CD-A1A2')
    expect(levelCertificateId('AB12CD', 'B1-B2')).toBe('AB12CD-B1B2')
  })
})
