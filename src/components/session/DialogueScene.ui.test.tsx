import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import * as speech from '../../lib/speech'
import type { DialogueLine } from '../../lib/types'
import DialogueScene from './DialogueScene'

vi.mock('../../lib/speech', () => ({
  isSpeechRecognitionSupported: vi.fn().mockReturnValue(false),
  recognizeOnce: vi.fn().mockResolvedValue({ transcript: '', confidence: 0, supported: false }),
  speakLine: vi.fn().mockResolvedValue(undefined),
  speechMatchScore: vi.fn().mockReturnValue(1),
  stopSpeech: vi.fn(),
  warmConversationPhrases: vi.fn(),
  primeSpeechPhrase: vi.fn(),
  getKokoroPhraseStatus: vi.fn().mockReturnValue({ ready: 0, total: 2 }),
  subscribeKokoroPhraseStatus: vi.fn().mockReturnValue(() => {}),
  getSpeechPhraseStatus: vi.fn().mockReturnValue({ ready: 0, total: 2 }),
  subscribeSpeechPhraseStatus: vi.fn().mockReturnValue(() => {}),
}))

const lines: DialogueLine[] = [
  { speaker: 'a', name: 'Maya', role: 'Lead', en: 'Morning, Leo.', es: 'Buenos días, Leo.' },
  { speaker: 'b', name: 'Leo', role: 'Dev', en: 'Morning, Maya.', es: 'Buenos días, Maya.' },
]

describe('DialogueScene', () => {
  it('renders both avatars, their lines and the playback control', () => {
    render(<DialogueScene title="Daily" context="Un daily breve" lines={lines} />)

    expect(screen.getByText('Daily')).toBeTruthy()
    expect(screen.getByText('Un daily breve')).toBeTruthy()
    expect(screen.getByText('Maya')).toBeTruthy()
    expect(screen.getByText('Leo')).toBeTruthy()
    expect(screen.getByText('Morning, Leo.')).toBeTruthy()
    expect(screen.getByText('Morning, Maya.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reproducir conversación' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reproducir: Maya' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reproducir: Leo' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /micrófono|Repetir línea de/ })).toBeNull()
  })

  it('shows the scene setting and goal', () => {
    cleanup()
    render(
      <DialogueScene
        title="Daily"
        setting="Daily, sala de equipo"
        goal="Aclarar el bloqueo"
        context="Leo reporta un bloqueo con el token de la API."
        lines={lines}
      />,
    )

    expect(screen.getByText('Daily, sala de equipo')).toBeTruthy()
    expect(screen.getByText('Aclarar el bloqueo')).toBeTruthy()
    expect(screen.getByText('Leo reporta un bloqueo con el token de la API.')).toBeTruthy()
  })

  it('toggles Spanish translations and audio-only mode', () => {
    cleanup()
    render(<DialogueScene title="Daily" lines={lines} />)

    fireEvent.click(screen.getByRole('button', { name: 'ES' }))
    expect(screen.queryByText('Buenos días, Leo.')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Solo audio' }))
    expect(screen.queryByText('Morning, Leo.')).toBeNull()
    expect(screen.getByRole('button', { name: 'Reproducir: Maya' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Solo audio' }))
    expect(screen.getByText('Morning, Leo.')).toBeTruthy()
  })

  it('keeps a replayed line highlighted briefly even when speech ends instantly', async () => {
    cleanup()
    render(<DialogueScene title="Daily" lines={lines} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reproducir: Leo' }))
    await Promise.resolve()
    expect(document.querySelector('[data-active="true"]')?.textContent).toContain(
      'Morning, Maya.',
    )

    await new Promise((resolve) => setTimeout(resolve, 950))
    expect(document.querySelector('[data-active="true"]')).toBeNull()
  })

  it('shows when every line already has audio cached', () => {
    cleanup()
    const status = speech.getSpeechPhraseStatus as ReturnType<typeof vi.fn>
    status.mockReturnValue({ ready: 2, total: 2 })
    render(<DialogueScene title="Daily" lines={lines} />)
    expect(screen.getByText('Audio listo')).toBeTruthy()
    status.mockReturnValue({ ready: 0, total: 2 })
  })
})
