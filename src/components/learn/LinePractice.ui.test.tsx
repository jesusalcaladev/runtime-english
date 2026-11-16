import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it } from 'vitest'
import type { VideoCue } from '../../data/learningResources'
import LinePractice from './LinePractice'

const cue: VideoCue = {
  start: 10,
  end: 12,
  en: 'We need to listen first.',
  es: 'Necesitamos escuchar primero.',
  highlight: ['listen first'],
}

afterEach(() => cleanup())

describe('LinePractice', () => {
  it('fills the highlighted chunk and gives instant feedback', () => {
    const { rerender } = render(<LinePractice cue={cue} stage="es" />)

    expect(screen.getByText(/We need to ______/)).toBeTruthy()
    const input = screen.getByRole('textbox', { name: /Escribe el fragmento/ })

    fireEvent.input(input, { target: { value: 'talk first' } })
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(screen.getByText(/La respuesta era/)).toBeTruthy()
    expect(screen.getByText('listen first')).toBeTruthy()

    fireEvent.input(input, { target: { value: 'LISTEN FIRST!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(screen.getByText('¡Correcto!')).toBeTruthy()

    rerender(<LinePractice cue={{ ...cue, start: 20, highlight: ['listen'] }} stage="es" />)
    expect(screen.queryByText('¡Correcto!')).toBeNull()
  })

  it('renders nothing when the cue has no highlighted chunk', () => {
    const { container } = render(
      <LinePractice cue={{ start: 1, end: 2, en: 'No highlight here.' }} stage="es" />,
    )
    expect(container.textContent).toBe('')
  })
})
