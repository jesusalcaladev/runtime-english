import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as speech from '../../lib/speech'
import type { Exercise } from '../../lib/types'
import ExerciseRunner from './ExerciseRunner'

vi.mock('../../lib/speech', () => ({
  ensureMicrophonePermission: vi.fn().mockResolvedValue(true),
  getSpeechLanguage: vi.fn().mockReturnValue('en-US'),
  isMicLevelMeterSupported: vi.fn().mockReturnValue(false),
  isSpeechRecognitionSupported: vi.fn().mockReturnValue(false),
  pickBestAlternative: vi
    .fn()
    .mockImplementation((_expected: unknown, alternatives: string[]) => alternatives[0] ?? ''),
  wordDiff: vi.fn().mockReturnValue(null),
  recognizeOnce: vi.fn().mockResolvedValue({ transcript: '', confidence: 0, supported: false }),
  releaseMicStream: vi.fn(),
  speechMatchScore: vi.fn().mockReturnValue(1),
  startMicLevelMeter: vi.fn().mockResolvedValue(() => {}),
  stopSpeechRecognition: vi.fn(),
}))

const checkButton = () => screen.getByRole('button', { name: /Comprobar|Check/ })

beforeEach(() => {
  vi.mocked(speech.isSpeechRecognitionSupported).mockReturnValue(false)
  vi.mocked(speech.recognizeOnce).mockResolvedValue({
    transcript: '',
    confidence: 0,
    supported: false,
  })
})

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

  it('shows the scene context before ordering a dialogue', () => {
    const exercise: Exercise = {
      id: 'test-order',
      type: 'dialogue-order',
      prompt: 'Ordena el diálogo',
      context: 'Maya pide a Leo que ejecute los tests antes del deploy.',
      lines: ['Can you run the tests?', 'Sure, I will run them now.', 'Thanks, let me know.'],
      explanation: 'Petición, respuesta y seguimiento.',
    }
    render(
      <ExerciseRunner
        sessionId="test-order-session"
        sessionTitle="Test"
        exercises={[exercise]}
        next={null}
      />,
    )

    expect(screen.getByText(/Maya pide a Leo que ejecute los tests/)).toBeTruthy()
    expect(screen.getByText('Can you run the tests?')).toBeTruthy()
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

  it('computes words-per-minute from speech time, not permission/startup time', async () => {
    vi.mocked(speech.isSpeechRecognitionSupported).mockReturnValue(true)
    vi.mocked(speech.recognizeOnce).mockResolvedValueOnce({
      transcript: 'hello world',
      confidence: 1,
      supported: true,
      speechDurationMs: 3_000,
    })
    const exercise: Exercise = {
      id: 'speak-wpm',
      type: 'speak',
      prompt: 'Di la frase',
      answer: 'hello world',
      explanation: 'Bien.',
    }
    render(
      <ExerciseRunner
        sessionId="test-speak"
        sessionTitle="Test"
        exercises={[exercise]}
        next={null}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Practicar pronunciación con micrófono' }))

    await waitFor(() => expect(screen.getByText(/palabras\/min/)).toBeTruthy())
    // Two words in three seconds of actual speech -> 40 ppm.
    expect(screen.getByText('40 palabras/min')).toBeTruthy()
  })

  it('auto-checks a successful mic transcript without pressing Comprobar', async () => {
    vi.mocked(speech.isSpeechRecognitionSupported).mockReturnValue(true)
    vi.mocked(speech.recognizeOnce).mockResolvedValueOnce({
      transcript: 'hello world',
      confidence: 1,
      supported: true,
      speechDurationMs: 3_000,
    })
    const exercise: Exercise = {
      id: 'speak-autocheck',
      type: 'speak',
      prompt: 'Di la frase',
      answer: 'hello world',
      explanation: 'Bien.',
    }
    render(
      <ExerciseRunner
        sessionId="test-speak-auto"
        sessionTitle="Test"
        exercises={[exercise]}
        next={null}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Practicar pronunciación con micrófono' }))
    await waitFor(() => expect(screen.getAllByText(/Correcto/).length).toBeGreaterThan(0), {
      timeout: 3_000,
    })
  })

  it('labels fill-in-the-blank inputs and checks the completed sentence', () => {
    const exercise: Exercise = {
      id: 'test-fill',
      type: 'fill-blank',
      prompt: 'Completa la frase',
      template: 'I ___ the PR yesterday.',
      blanks: ['pushed'],
      explanation: 'Uso correcto del pasado.',
    }
    render(
      <ExerciseRunner
        sessionId="test-fill-session"
        sessionTitle="Test"
        exercises={[exercise]}
        next={null}
      />,
    )

    const blank = screen.getByRole('textbox', { name: 'Espacio 1: completa la frase' })
    fireEvent.input(blank, { target: { value: 'pushed' } })
    fireEvent.click(checkButton())
    expect(screen.getByText('Uso correcto del pasado.')).toBeTruthy()
  })

  it('muestra y oculta la pista bajo demanda en cualquier tipo de ejercicio', () => {
    const exercise: Exercise = {
      id: 'test-hint',
      type: 'multi-choice',
      prompt: 'Elige las opciones correctas',
      options: ['first', 'second'],
      answers: [0],
      hint: 'Piensa en la primera opción.',
      explanation: 'La primera era correcta.',
    }
    render(
      <ExerciseRunner
        sessionId="test-hint-session"
        sessionTitle="Test"
        exercises={[exercise]}
        next={null}
      />,
    )

    expect(screen.queryByText('Piensa en la primera opción.')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Ver pista|Show hint/ }))
    expect(screen.getByText('Piensa en la primera opción.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Ocultar pista|Hide hint/ }))
    expect(screen.queryByText('Piensa en la primera opción.')).toBeNull()
  })
})
