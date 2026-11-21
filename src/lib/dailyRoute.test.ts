import { describe, expect, it } from 'vitest'
import {
  buildDailyRoute,
  type DailyRouteInput,
  type DailyRouteStep,
  mergeDailyRouteStates,
  normalizeDailyRouteState,
} from './dailyRoute'

const lessons: DailyRouteInput['lessons'] = [
  { id: 'l1', title: 'One', level: 'A1-A2', durationSeconds: 200 },
  { id: 'l2', title: 'Two', level: 'A1-A2', durationSeconds: 120 },
  { id: 'l3', title: 'Three', level: 'B1-B2', durationSeconds: 180 },
  { id: 'l4', title: 'Four', level: 'A1-A2', durationSeconds: 120 },
]

function input(overrides: Partial<DailyRouteInput> = {}): DailyRouteInput {
  return {
    now: new Date(2026, 10, 20, 10).getTime(),
    dailyMinutes: 30,
    level: 'A1-A2',
    lessons,
    progress: {
      l1: { position: 40, duration: 200, completed: false, updatedAt: 100 },
      l2: { position: 0, duration: 120, completed: true, updatedAt: 90 },
    },
    quiz: {
      l3: {
        attempts: [
          {
            questionIds: ['q1', 'q2', 'q3'],
            answers: {},
            correct: 1,
            total: 3,
            missedQuestionIds: ['q2', 'q3'],
            at: 80,
          },
        ],
        bestCorrect: 1,
        missedQuestionIds: ['q2', 'q3'],
      },
    },
    duePhrases: 4,
    ...overrides,
  }
}

describe('buildDailyRoute', () => {
  it('prioriza repaso, reanudación, quiz débil y contenido nuevo', () => {
    const steps = buildDailyRoute(input())
    expect(steps.map((step) => step.kind)).toEqual(['phrases', 'resume', 'quiz', 'new'])
    expect(steps[0].value).toBe(4)
    expect(steps[1].lessonId).toBe('l1')
    expect(steps[2].lessonId).toBe('l3')
    expect(steps[3].lessonId).toBe('l4')
  })

  it('respeta el presupuesto de minutos del día', () => {
    const steps = buildDailyRoute(input({ dailyMinutes: 5 }))
    expect(steps.map((step) => step.kind)).toEqual(['phrases', 'resume'])
    expect(steps.reduce((sum, step) => sum + step.minutes, 0)).toBeLessThanOrEqual(5)
  })

  it('ofrece contenido nuevo cuando no hay datos aún', () => {
    const steps = buildDailyRoute(input({ progress: {}, quiz: {}, duePhrases: 0 }))
    expect(steps).toHaveLength(1)
    expect(steps[0].kind).toBe('new')
    expect(steps[0].lessonId).toBe('l1')
  })

  it('siempre devuelve al menos un paso', () => {
    const steps = buildDailyRoute(input({ lessons: [], progress: {}, quiz: {}, duePhrases: 0 }))
    expect(steps).toEqual([
      { id: 'phrases-0', kind: 'phrases', lessonId: null, minutes: 5, value: 0 },
    ])
  })
})

describe('daily route state (sincronizable)', () => {
  const steps: DailyRouteStep[] = [
    { id: 'phrases-0', kind: 'phrases', lessonId: null, minutes: 2, value: 4 },
    { id: 'resume-1', kind: 'resume', lessonId: 'l1', minutes: 3, value: 20 },
  ]

  it('normaliza pasos y descarta ids de pasos inexistentes', () => {
    const state = normalizeDailyRouteState({
      date: '2026-11-20',
      steps: [...steps, { id: 'bad' }],
      done: ['phrases-0', 'ghost'],
    })
    expect(state.steps).toEqual(steps)
    expect(state.done).toEqual(['phrases-0'])
  })

  it('elige la ruta más reciente y une los pasos hechos del mismo día', () => {
    const local = { date: '2026-11-20', steps, done: ['phrases-0'] }
    const remote = { date: '2026-11-20', steps, done: ['resume-1'] }
    expect(mergeDailyRouteStates(local, remote).done).toEqual(['phrases-0', 'resume-1'])

    const newer = { date: '2026-11-21', steps: [steps[0]], done: [] }
    expect(mergeDailyRouteStates(local, newer)).toEqual(newer)
  })

  it('acepta una ruta vacía sin romper el merge', () => {
    const empty = normalizeDailyRouteState(undefined)
    expect(mergeDailyRouteStates(empty, { date: '2026-11-20', steps, done: [] }).steps).toEqual(
      steps,
    )
  })
})
