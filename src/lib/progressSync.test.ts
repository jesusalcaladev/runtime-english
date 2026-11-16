import { describe, expect, it } from 'vitest'
import { createDefaultState } from './progress'
import { compactState, expandState, mergeProgressDetailed } from './progressSync'

describe('progressSync', () => {
  it('compacts and expands core progress fields', () => {
    const state = createDefaultState()
    state.xp = 120
    state.completedExercises['m1-l1-e1'] = 1234
    state.completedSessions['m1-l1'] = 1234
    state.savedSlang = ['ship']
    state.settings.name = 'Ana'
    state.settings.onboarded = true

    const compact = compactState(state)
    expect(compact.xp).toBe(120)
    expect((compact as any).ce['m1-l1-e1']).toBe(1234)
    expect((compact as any).se.name).toBe('Ana')

    const expanded = expandState(compact, createDefaultState())
    expect(expanded.xp).toBe(120)
    expect(expanded.completedExercises['m1-l1-e1']).toBe(1234)
    expect(expanded.savedSlang).toContain('ship')
    expect(expanded.settings.name).toBe('Ana')
    expect(expanded.settings.onboarded).toBe(true)
  })

  it('merges progress without losing completions and keeps max xp', () => {
    const local = createDefaultState()
    const remote = createDefaultState()
    local.xp = 50
    remote.xp = 80
    local.completedExercises.e1 = 100
    remote.completedExercises.e2 = 200
    local.attempts.e1 = 2
    remote.attempts.e1 = 4
    local.savedSlang = ['a']
    remote.savedSlang = ['b']

    const res = mergeProgressDetailed(local, remote)
    expect(res.merged.completedExercises.e1).toBe(100)
    expect(res.merged.completedExercises.e2).toBe(200)
    expect(res.merged.attempts.e1).toBe(4)
    expect(res.merged.savedSlang).toEqual(expect.arrayContaining(['a', 'b']))
    expect(res.merged.xp).toBeGreaterThanOrEqual(80)
  })

  it('returns non-compact full state when expanding partial full objects', () => {
    const defaults = createDefaultState()
    const expanded = expandState(
      { xp: 33, settings: { ...defaults.settings, name: 'Bob' } },
      defaults,
    )
    expect(expanded.xp).toBe(33)
    expect(expanded.settings.name).toBe('Bob')
  })

  it('merges SRS and phrasebook preferring newer/richer progress', () => {
    const local = createDefaultState()
    const remote = createDefaultState()

    local.exerciseSrs.e1 = { box: 2, due: 1000, last: 100, correctStreak: 2 }
    remote.exerciseSrs.e1 = { box: 3, due: 2000, last: 200, correctStreak: 3 }

    local.phrasebook.p1 = {
      id: 'p1',
      en: 'to ship',
      es: 'desplegar',
      source: 's1',
      addedAt: 10,
      updatedAt: 10,
      seen: 1,
      correct: 1,
      saved: true,
      notes: 'nota corta',
      box: 1,
      due: 10,
      last: 10,
      correctStreak: 1,
    } as any
    remote.phrasebook.p1 = {
      id: 'p1',
      en: 'to ship',
      es: 'lanzar/desplegar',
      source: 's1',
      addedAt: 10,
      updatedAt: 20,
      seen: 3,
      correct: 2,
      saved: true,
      notes: 'nota más detallada',
      box: 2,
      due: 30,
      last: 30,
      correctStreak: 2,
    } as any

    const res = mergeProgressDetailed(local, remote)
    expect(res.merged.exerciseSrs.e1).toEqual({ box: 3, due: 2000, last: 200, correctStreak: 3 })
    expect(res.merged.phrasebook.p1.es).toBe('lanzar/desplegar')
    expect(res.merged.phrasebook.p1.notes).toBe('nota más detallada')
    expect(res.merged.phrasebook.p1.seen).toBe(3)
    expect(res.merged.phrasebook.p1.box).toBe(2)
  })

  it('prefers higher-ranked certificate and reports conflicts when states differ', () => {
    const local = createDefaultState()
    const remote = createDefaultState()

    local.certificate = {
      id: 'ABC123',
      name: 'Ana',
      issuedAt: '2026-01-01T00:00:00.000Z',
      completionDate: '2026-01-01',
      status: 'local',
      userId: null,
      issuedBy: 'local',
      lastVerifiedAt: null,
      shareUrl: null,
      lastError: null,
    }
    remote.certificate = {
      id: 'ABC123',
      name: 'Ana',
      issuedAt: '2026-01-02T00:00:00.000Z',
      completionDate: '2026-01-01',
      status: 'verified',
      userId: 'u1',
      issuedBy: 'server',
      lastVerifiedAt: '2026-01-02T00:00:00.000Z',
      shareUrl: 'https://app/verify?id=ABC123',
      lastError: null,
    }
    remote.completedExercises.e9 = 99

    const res = mergeProgressDetailed(local, remote)
    expect(res.hadConflict).toBe(true)
    expect(res.notes.length).toBeGreaterThan(0)
    expect(res.merged.certificate?.issuedBy).toBe('server')
    expect(res.merged.certificate?.status).toBe('verified')
    expect(res.merged.certificate?.userId).toBe('u1')
  })
})
