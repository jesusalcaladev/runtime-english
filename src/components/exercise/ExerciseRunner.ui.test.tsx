import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Exercise } from '../../lib/types'
import ExerciseRunner from './ExerciseRunner'

vi.mock('../../lib/speech', () => ({
  ensureMicrophonePermission: vi.fn().mockResolvedValue(true),
  getSpeechLanguage: vi.fn().mockReturnValue('en-US'),
  isSpeechRecognitionSupported: vi.fn().mockReturnValue(false),
  recognizeOnce: vi.fn().mockResolvedValue({ transcript: '', confidence: 0, supported: false }),
  releaseMicStream: vi.fn(),
  speechMatchScore: vi.fn().mockReturnValue(1),
  startMicLevelMeter: vi.fn().mockResolvedValue(() => {}),
  stopSpeechRecognition: vi.fn(),
}))

const checkButton = () => screen.getByRole('button', { name: /Comprobar|Check/ })

afterEach(() => cleanup())

describe('ExerciseRunner new exercise types', () => {
  it('matches pairs and shows feedback', () => {
    const exercise: Exercise = {
      id: 'test-match',
      type: 'match',
      prompt: 'Empareja los chunks',
      pairs: [
        { en: 'set up', es: 'configurar' },
        { en: 'roll back', es: 'revertir' },
      ],
      explanation: 'Pares correctos.',
    }
    render(
      <ExerciseRunner
        sessionId="test-match-session"
        sessionTitle="Test"
        exercises={[exercise]}
        next={null}
      />,
    )

    expect(screen.getByText('Empareja los chunks')).toBeTruthy()
    fireEvent.click(screen.getByText('set up'))
    fireEvent.click(screen.getByText('configurar'))
    fireEvent.click(screen.getByText('roll back'))
    fireEvent.click(screen.getByText('revertir'))

    expect(screen.getAllByText('2 / 2 parejas').length).toBeGreaterThan(0)
    fireEvent.click(checkButton())
    expect(screen.getByText('Pares correctos.')).toBeTruthy()
  })

  it('lets the learner choose replies in a branching dialogue', () => {
    const exercise: Exercise = {
      id: 'test-branch',
      type: 'dialogue-branch',
      prompt: '¿Qué dices?',
      steps: [
        {
          speaker: 'Maya',
          line: 'Any blockers today?',
          choices: [
            {
              en: 'Yes, I am blocked by the API token.',
              correct: true,
              feedback: 'Contexto claro.',
            },
            { en: 'No, I hate tests.', correct: false, feedback: 'Mejor explica el bloqueo.' },
          ],
        },
      ],
      explanation: 'Comunicación clara.',
    }
    render(
      <ExerciseRunner
        sessionId="test-branch-session"
        sessionTitle="Test"
        exercises={[exercise]}
        next={null}
      />,
    )

    expect(screen.getByText('Any blockers today?')).toBeTruthy()
    fireEvent.click(screen.getByText('Yes, I am blocked by the API token.'))
    expect(screen.getByText('Contexto claro.')).toBeTruthy()
    fireEvent.click(checkButton())
    expect(screen.getByText('Comunicación clara.')).toBeTruthy()
  })

  it('accepts several correct answers in multi-choice', () => {
    const exercise: Exercise = {
      id: 'test-multi',
      type: 'multi-choice',
      prompt: 'Elige todas',
      options: ['set up', 'roll back', 'comment out', 'wrap up'],
      answers: [0, 1],
      explanation: 'Dos acciones de despliegue.',
    }
    render(
      <ExerciseRunner
        sessionId="test-multi-session"
        sessionTitle="Test"
        exercises={[exercise]}
        next={null}
      />,
    )

    fireEvent.click(screen.getByText('set up'))
    fireEvent.click(screen.getByText('roll back'))
    fireEvent.click(checkButton())
    expect(screen.getByText('Dos acciones de despliegue.')).toBeTruthy()
  })
})
