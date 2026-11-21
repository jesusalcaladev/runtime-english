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

  it('round-trips and merges the daily study route', () => {
    const state = createDefaultState()
    const steps = [
      { id: 'phrases-0', kind: 'phrases' as const, lessonId: null, minutes: 2, value: 4 },
      { id: 'resume-1', kind: 'resume' as const, lessonId: 'm1-l1', minutes: 3, value: 20 },
    ]
    state.dailyRoute = { date: '2026-11-20', steps, done: ['phrases-0'] }

    const compact = compactState(state)
    expect(compact.dr).toEqual(state.dailyRoute)
    const expanded = expandState(compact, createDefaultState())
    expect(expanded.dailyRoute).toEqual(state.dailyRoute)

    const remote = createDefaultState()
    remote.dailyRoute = { date: '2026-11-20', steps, done: ['resume-1'] }
    const { merged } = mergeProgressDetailed(expanded, remote)
    expect(merged.dailyRoute.done).toEqual(['phrases-0', 'resume-1'])
  })

  it('compacts, expands and merges one certificate per level', () => {
    const state = createDefaultState()
    const a1 = {
      id: 'AB12CD-A1A2',
      name: 'Ana',
      issuedAt: '2026-01-01T00:00:00.000Z',
      completionDate: 'January 1, 2026',
      level: 'A1-A2' as const,
      status: 'verified' as const,
    }
    const b1 = {
      id: 'EF34GH-B1B2',
      name: 'Ana',
      issuedAt: '2026-02-01T00:00:00.000Z',
      completionDate: 'February 1, 2026',
      level: 'B1-B2' as const,
      status: 'local' as const,
    }
    state.certificates = { 'A1-A2': a1, 'B1-B2': b1 }

    const compact = compactState(state)
    expect((compact as any).certs['A1-A2'].id).toBe(a1.id)
    expect((compact as any).certs['B1-B2'].id).toBe(b1.id)

    const expanded = expandState(compact, createDefaultState())
    expect(expanded.certificates?.['A1-A2']?.level).toBe('A1-A2')
    expect(expanded.certificates?.['B1-B2']?.id).toBe(b1.id)

    const remote = createDefaultState()
    remote.certificates = {
      'A1-A2': { ...a1, status: 'local' },
    }
    const merged = mergeProgressDetailed(expanded, remote).merged
    expect(merged.certificates?.['A1-A2']?.status).toBe('verified')
    expect(merged.certificates?.['B1-B2']?.id).toBe(b1.id)
  })

  it('migrates the legacy certificate into A1-A2 when expanding', () => {
    const expanded = expandState(
      {
        v: 3,
        cert: {
          id: 'OLD123',
          name: 'Ana',
          issuedAt: '2026-01-01T00:00:00.000Z',
          completionDate: 'January 1, 2026',
        },
      },
      createDefaultState(),
    )
    expect(expanded.certificates?.['A1-A2']?.id).toBe('OLD123')
    expect(expanded.certificates?.['A1-A2']?.level).toBe('A1-A2')
  })

  it('syncs retention checks through compact state', () => {
    const state = createDefaultState()
    state.retentionChecks = {
      'm1-l0-e1:1': {
        exerciseId: 'm1-l0-e1',
        dueAt: 1234,
        offsetDays: 1,
        attempts: 1,
        correct: 1,
        done: true,
      },
    }
    const compact = compactState(state)
    expect((compact as any).rt['m1-l0-e1:1'].offsetDays).toBe(1)
    const expanded = expandState(compact, createDefaultState())
    expect(expanded.retentionChecks['m1-l0-e1:1'].correct).toBe(1)
    expect(expanded.retentionChecks['m1-l0-e1:1'].done).toBe(true)
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

  it('syncs VideoLab progress and quiz results inside the same compact row', () => {
    const state = createDefaultState()
    state.videoLab.progress['lesson-1'] = {
      position: 42.123,
      duration: 337,
      completed: false,
      updatedAt: 1000,
    }
    state.videoLab.quiz['lesson-1'] = {
      attempts: [
        {
          questionIds: ['q1', 'q2'],
          answers: { q1: 0, q2: 1 },
          correct: 1,
          total: 2,
          missedQuestionIds: ['q2'],
          at: 2000,
        },
      ],
      bestCorrect: 1,
      missedQuestionIds: ['q2'],
    }

    const compact = compactState(state)
    const expanded = expandState(compact, createDefaultState())

    expect(expanded.videoLab.progress['lesson-1'].position).toBeCloseTo(42.12, 1)
    expect(expanded.videoLab.progress['lesson-1'].updatedAt).toBe(1000)
    expect(expanded.videoLab.quiz['lesson-1'].attempts[0].answers.q2).toBe(1)
    expect(expanded.videoLab.quiz['lesson-1'].missedQuestionIds).toEqual(['q2'])
  })

  it('merges VideoLab data keeping the newest position and the best score', () => {
    const local = createDefaultState()
    const remote = createDefaultState()
    local.videoLab.progress['lesson-1'] = {
      position: 42,
      duration: 337,
      completed: false,
      updatedAt: 1000,
    }
    remote.videoLab.progress['lesson-1'] = {
      position: 90,
      duration: 337,
      completed: false,
      updatedAt: 2000,
    }
    local.videoLab.quiz['lesson-1'] = {
      attempts: [],
      bestCorrect: 3,
      missedQuestionIds: [],
    }
    remote.videoLab.quiz['lesson-1'] = {
      attempts: [],
      bestCorrect: 1,
      missedQuestionIds: [],
    }

    const merged = mergeProgressDetailed(local, remote).merged
    expect(merged.videoLab.progress['lesson-1'].position).toBe(90)
    expect(merged.videoLab.quiz['lesson-1'].bestCorrect).toBe(3)
  })
})
