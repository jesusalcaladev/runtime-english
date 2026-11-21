import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { VIDEO_LESSONS } from '../../data/learningResources'

interface RouteState {
  date: string
  steps: unknown[]
  done: string[]
}

const { mocks } = vi.hoisted(() => {
  const todayKey = () => {
    const date = new Date()
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }
  return {
    mocks: {
      state: {} as { dailyRoute?: RouteState },
      reviewPhrase: vi.fn(),
      saveDailyRoute: vi.fn((steps: unknown[]) => {
        mocks.state.dailyRoute = { date: todayKey(), steps, done: [] }
      }),
      setDailyRouteDone: vi.fn((ids: string[]) => {
        const current = mocks.state.dailyRoute ?? { date: todayKey(), steps: [], done: [] }
        mocks.state.dailyRoute = { ...current, done: ids }
      }),
      resetDailyRoute: vi.fn(() => {
        mocks.state.dailyRoute = { date: '', steps: [], done: [] }
      }),
    },
  }
})

vi.mock('../../hooks/useUiStage', () => ({ useUiStage: () => 'es' }))
vi.mock('../../lib/useProgress', () => ({ useProgress: () => mocks.state }))
vi.mock('../../lib/progress', () => ({
  phraseId: (en: string) => en,
  progressStore: {
    reviewPhrase: mocks.reviewPhrase,
    saveDailyRoute: mocks.saveDailyRoute,
    setDailyRouteDone: mocks.setDailyRouteDone,
    resetDailyRoute: mocks.resetDailyRoute,
  },
}))

import DailyRoute from './DailyRoute'

const lessons = VIDEO_LESSONS.filter((lesson) =>
  ['world-wide-web', 'all-nighter-brain'].includes(lesson.id),
)

beforeEach(() => {
  vi.clearAllMocks()
  mocks.state = {
    settings: {
      diagnostic: { level: 'A1', score: 80, completedAt: 1 },
      plan: { dailyMinutes: 30 },
    },
    videoLab: {
      progress: {
        'world-wide-web': { position: 40, duration: 235, completed: false, updatedAt: 100 },
      },
      quiz: {},
    },
    phrasebook: {
      hello: {
        id: 'hello',
        en: 'Hello world',
        es: 'Hola mundo',
        source: 'VideoLab',
        addedAt: 1,
        updatedAt: 1,
        seen: 0,
        correct: 0,
        saved: true,
        box: 0,
        due: 0,
        last: 0,
        correctStreak: 0,
      },
    },
    dailyRoute: { date: '', steps: [], done: [] },
  } as never
})

afterEach(() => cleanup())

describe('DailyRoute', () => {
  it('builds a routine from due phrases, resume and new content', () => {
    render(<DailyRoute lessons={lessons} onOpenLesson={vi.fn()} />)
    expect(screen.getByText('Rutina de hoy')).toBeTruthy()
    expect(screen.getAllByLabelText(/Empezar paso/)).toHaveLength(3)
    expect(screen.getByTitle(/Repasar frases vencidas/)).toBeTruthy()
    expect(mocks.saveDailyRoute).toHaveBeenCalledTimes(1)
  })

  it('opens a lesson when a video step is clicked', () => {
    const onOpenLesson = vi.fn()
    render(<DailyRoute lessons={lessons} onOpenLesson={onOpenLesson} />)
    fireEvent.click(screen.getByLabelText(/Empezar paso 2/))
    expect(onOpenLesson).toHaveBeenCalledWith('world-wide-web')
  })

  it('reviews due phrases without leaving the page', () => {
    render(<DailyRoute lessons={lessons} onOpenLesson={vi.fn()} />)
    fireEvent.click(screen.getByLabelText(/Empezar paso 1/))
    expect(screen.getByText('Hello world')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Ver traducción' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lo sabía' }))
    expect(mocks.reviewPhrase).toHaveBeenCalledWith('Hello world', true)
  })

  it('keeps the same plan after a rerender', () => {
    const { rerender } = render(<DailyRoute lessons={lessons} onOpenLesson={vi.fn()} />)
    const before = screen.getAllByLabelText(/Empezar paso/).length
    rerender(<DailyRoute lessons={lessons} onOpenLesson={vi.fn()} />)
    expect(screen.getAllByLabelText(/Empezar paso/)).toHaveLength(before)
  })

  it('marks a step as done and can regenerate the plan', () => {
    const { rerender } = render(<DailyRoute lessons={lessons} onOpenLesson={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Marcar paso como hecho 1'))
    expect(mocks.setDailyRouteDone).toHaveBeenCalledTimes(1)
    rerender(<DailyRoute lessons={lessons} onOpenLesson={vi.fn()} />)
    expect(screen.getByLabelText('Marcar paso como hecho 1').getAttribute('aria-pressed')).toBe(
      'true',
    )
    fireEvent.click(screen.getByLabelText('Cambiar plan'))
    expect(mocks.resetDailyRoute).toHaveBeenCalledTimes(1)
  })

  it('marks the phrase step done after reviewing every card', () => {
    render(<DailyRoute lessons={lessons} onOpenLesson={vi.fn()} />)
    fireEvent.click(screen.getByLabelText(/Empezar paso 1/))
    fireEvent.click(screen.getByRole('button', { name: 'Ver traducción' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lo sabía' }))
    expect(mocks.setDailyRouteDone).toHaveBeenCalled()
  })
})
