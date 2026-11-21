import { cleanup, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ExerciseFinishedScreen } from './ExerciseFinishedScreen'

afterEach(() => cleanup())

const baseProps = {
  stage: 'es' as const,
  sessionTitle: 'Mi sesión de práctica',
  next: null,
  wasComplete: false,
  solvedCount: 5,
  total: 5,
  accuracy: 88,
  reviewSkills: ['grammar', 'vocabulary'],
  level: 'A1-A2' as const,
  levelStats: { doneSessions: 16, sessions: 16 },
  levelDone: true,
  onRestart: vi.fn(),
}

describe('ExerciseFinishedScreen', () => {
  it('resume precisión, habilidades a repasar y acceso al certificado del nivel', () => {
    render(<ExerciseFinishedScreen {...baseProps} />)

    expect(screen.getByText(/Precisión 88%/)).toBeTruthy()
    expect(screen.getByText('Para repasar')).toBeTruthy()
    expect(screen.getByText('grammar')).toBeTruthy()
    expect(screen.getByText('vocabulary')).toBeTruthy()
    expect(screen.getByText('16/16')).toBeTruthy()

    const reviewLink = screen.getByRole('link', { name: /Repasar/ })
    expect(reviewLink.getAttribute('href')).toContain('/practice.html?mode=review')

    const certLink = screen.getByRole('link', { name: /¡Nivel completo!/ })
    expect(certLink.getAttribute('href')).toContain('/certificate.html?level=A1-A2')
  })

  it('no muestra el certificado cuando el nivel aún no está completo', () => {
    render(
      <ExerciseFinishedScreen
        {...baseProps}
        levelDone={false}
        levelStats={{ doneSessions: 4, sessions: 16 }}
      />,
    )

    expect(screen.getByText('4/16')).toBeTruthy()
    expect(screen.queryByRole('link', { name: /¡Nivel completo!/ })).toBeNull()
  })
})
