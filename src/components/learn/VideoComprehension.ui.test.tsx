import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import VideoComprehension from './VideoComprehension'

const store = new Map<string, string>()
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  },
})

const questions = [
  { id: 'q1', prompt: 'Pregunta uno', options: ['A', 'B'], answer: 0, explanation: 'Porque A.' },
  { id: 'q2', prompt: 'Pregunta dos', options: ['C', 'D'], answer: 0, explanation: 'Porque C.' },
]

function renderQuiz() {
  return render(
    <VideoComprehension
      lessonId="lesson-1"
      questions={questions}
      stage="es"
      title="Comprensión"
      tip="Responde"
    />,
  )
}

afterEach(() => cleanup())
beforeEach(() => store.clear())

describe('VideoComprehension', () => {
  it('saves the score and retries only the missed questions', () => {
    renderQuiz()

    fireEvent.click(screen.getByRole('button', { name: 'A' }))
    fireEvent.click(screen.getByRole('button', { name: 'D' }))
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))

    expect(screen.getByText(/1 \/ 2/)).toBeTruthy()
    expect(screen.getByText(/Mejor.*1\/2/)).toBeTruthy()
    expect(screen.getByText(/Último.*1\/2/)).toBeTruthy()
    expect(screen.getByText('Porque C.')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Repetir falladas \(1\)/ }))
    expect(screen.queryByText('Pregunta uno')).toBeNull()
    expect(screen.getByText('Pregunta dos')).toBeTruthy()
    expect(screen.getByText(/Solo preguntas falladas/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'C' }))
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(screen.getByText(/1 \/ 1/)).toBeTruthy()
  })

  it('restores the best and last scores after remounting', () => {
    renderQuiz()
    fireEvent.click(screen.getByRole('button', { name: 'B' }))
    fireEvent.click(screen.getByRole('button', { name: 'C' }))
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))

    cleanup()
    renderQuiz()

    expect(screen.getByText(/Mejor.*1\/2/)).toBeTruthy()
    expect(screen.getByText(/Último.*1\/2/)).toBeTruthy()
  })
})
