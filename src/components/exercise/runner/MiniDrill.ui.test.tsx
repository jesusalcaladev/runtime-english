import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it } from 'vitest'
import MiniDrill from './MiniDrill'

afterEach(() => cleanup())

describe('MiniDrill', () => {
  it('grades a quick drill and explains the answer', () => {
    render(<MiniDrill skill="prepositions" />)
    expect(screen.getByText(/Repaso rápido/)).toBeTruthy()

    fireEvent.click(screen.getByText('by'))
    expect(screen.getByText(/Con 'blocked by'/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    fireEvent.click(screen.getByText('on'))
    fireEvent.click(screen.getByRole('button', { name: 'Ver resultado' }))
    expect(screen.getByText('Aciertos: 2 / 2')).toBeTruthy()
  })
})
