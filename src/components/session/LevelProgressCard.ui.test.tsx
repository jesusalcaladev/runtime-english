import { cleanup, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getLevelSessions } from '../../lib/certificateLevels'
import { createDefaultState } from '../../lib/progress'
import LevelProgressCard from './LevelProgressCard'

const mocks = vi.hoisted(() => ({ state: null as ReturnType<typeof createDefaultState> | null }))

vi.mock('../../lib/useProgress', () => ({
  useProgress: () => mocks.state ?? createDefaultState(),
}))

afterEach(() => cleanup())

const firstTwo = getLevelSessions('A1-A2')
  .slice(0, 2)
  .map((entry) => entry.session)

describe('LevelProgressCard', () => {
  it('muestra el progreso del nivel y el siguiente enlace dentro del nivel', () => {
    const state = createDefaultState()
    state.completedSessions[firstTwo[0].id] = Date.now()
    mocks.state = state

    render(<LevelProgressCard level="A1-A2" currentSessionId={firstTwo[0].id} />)

    expect(screen.getByText('A1-A2')).toBeTruthy()
    expect(screen.getByText('1/16')).toBeTruthy()
    expect(screen.getByText(/Siguiente en este nivel|Next in this level/)).toBeTruthy()
    const next = screen.getByRole('link', { name: new RegExp(firstTwo[1].title) })
    expect(next.getAttribute('href')).toContain(`/session/${firstTwo[1].slug}.html`)
  })

  it('muestra el certificado del nivel cuando está desbloqueado', () => {
    const state = createDefaultState()
    for (const { session } of getLevelSessions('A1-A2')) {
      state.completedSessions[session.id] = Date.now()
      for (const exercise of session.exercises) state.completedExercises[exercise.id] = Date.now()
    }
    mocks.state = state

    render(<LevelProgressCard level="A1-A2" currentSessionId={firstTwo[0].id} />)

    expect(screen.getByText('16/16')).toBeTruthy()
    const cert = screen.getByRole('link', { name: /Certificado A1-A2|Certificate A1-A2/ })
    expect(cert.getAttribute('href')).toContain('/certificate.html?level=A1-A2')
  })
})
