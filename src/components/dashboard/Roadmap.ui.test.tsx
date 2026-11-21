import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ALL_SESSIONS, type NavModule, type NavSession } from '../../data/curriculum'
import { createDefaultState, type ProgressState } from '../../lib/progress'
import Roadmap from './Roadmap'

const mocks = vi.hoisted(() => ({ state: null as ProgressState | null }))

vi.mock('../../lib/useProgress', () => ({
  useProgress: () => mocks.state ?? createDefaultState(),
}))

afterEach(() => {
  mocks.state = null
  cleanup()
})

function session(id: string): NavSession {
  return {
    id,
    slug: id,
    title: `Sesión ${id}`,
    step: `C1 · Paso ${id}`,
    cefr: 'C1',
    minutes: 10,
    summary: 'Resumen',
    exerciseCount: 5,
  }
}

const modules: NavModule[] = [
  {
    id: 'm10',
    code: 'MOD 10',
    level: 'C1-C2',
    title: 'Módulo 10',
    shortTitle: 'Dominio C1',
    description: 'Descubre el módulo',
    featured: false,
    sessions: [session('m10-l1'), session('m10-l2')],
  },
  {
    id: 'm11',
    code: 'MOD 11',
    level: 'C1-C2',
    title: 'Módulo 11',
    shortTitle: 'Maestría C2',
    description: 'Maestría',
    featured: false,
    sessions: [session('m11-l1')],
  },
]

describe('Roadmap', () => {
  it('muestra la tarjeta de certificado del nivel y permite desplegar módulos', () => {
    const state = createDefaultState()
    for (const entry of ALL_SESSIONS.filter((entry) => entry.module.level === 'B1-B2')) {
      state.completedSessions[entry.session.id] = Date.now()
      for (const exercise of entry.session.exercises) {
        state.completedExercises[exercise.id] = Date.now()
      }
    }
    mocks.state = state

    render(<Roadmap modules={modules} nextSessionId="m10-l1" level="C1-C2" />)

    const cert = screen.getByRole('link', { name: /Certificate|Certificado|progress|progreso/i })
    expect(cert.getAttribute('href')).toContain('/certificate.html?level=C1-C2')

    // The module with the next session starts open; the other one is collapsed.
    expect(screen.getByText('Sesión m10-l1')).toBeTruthy()
    expect(screen.queryByText('Sesión m11-l1')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Mostrar lecciones de Maestría C2/ }))
    expect(screen.getByText('Sesión m11-l1')).toBeTruthy()
  })
})
