import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VIDEO_LESSONS } from '../../data/learningResources'
import VideoLibrary from './VideoLibrary'

vi.mock('../../hooks/useUiStage', () => ({ useUiStage: () => 'es' }))

vi.mock('../../lib/useProgress', () => ({
  useProgress: () => ({
    settings: { immersion: 'es', diagnostic: { level: 'A1' } },
  }),
}))

vi.mock('../../lib/videoProgress', () => ({
  getAllVideoProgress: () => ({
    'world-wide-web': { position: 40, duration: 235, completed: false, updatedAt: 123 },
  }),
}))

vi.mock('../../lib/videoQuiz', () => ({
  getVideoQuizProgress: () => ({
    attempts: [
      {
        questionIds: ['q1'],
        answers: { q1: 0 },
        correct: 1,
        total: 1,
        missedQuestionIds: [],
        at: 1,
      },
    ],
    bestCorrect: 1,
    missedQuestionIds: [],
  }),
}))

vi.mock('./VideoLab', () => ({ default: () => <span>lab</span> }))

const lessons = [
  ...VIDEO_LESSONS.filter((lesson) => ['world-wide-web', 'all-nighter-brain'].includes(lesson.id)),
  ...VIDEO_LESSONS.filter((lesson) =>
    ['what-is-an-algorithm', 'hidden-network-internet'].includes(lesson.id),
  ),
]

afterEach(() => cleanup())

describe('VideoLibrary', () => {
  it('filters by level and searches, and surfaces progress stats', () => {
    render(<VideoLibrary lessons={lessons} />)

    expect(screen.getByText('0/4')).toBeTruthy()
    expect(screen.getByText(/Precisión quiz/)).toBeTruthy()
    expect(screen.getByText('Continúa donde lo dejaste')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Mi nivel/ }))
    expect(screen.getAllByText('What Is the World Wide Web?').length).toBeGreaterThan(0)
    expect(screen.queryByText("What's an Algorithm?")).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Todas' }))
    fireEvent.click(screen.getByRole('button', { name: 'B1-B2' }))
    expect(screen.getByText("What's an Algorithm?")).toBeTruthy()
    // Solo queda en el banner de reanudación, no en la cuadrícula filtrada.
    expect(screen.getAllByText('What Is the World Wide Web?')).toHaveLength(1)
  })

  it('shows an empty state and clears filters', () => {
    render(<VideoLibrary lessons={lessons} />)
    fireEvent.input(screen.getByRole('searchbox'), { target: { value: 'no existe' } })

    expect(screen.getByText('No hay videos con esos filtros.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }))
    expect(screen.queryByText('No hay videos con esos filtros.')).toBeNull()
  })
})
