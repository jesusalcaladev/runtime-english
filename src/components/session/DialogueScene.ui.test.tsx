import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import type { DialogueLine } from '../../lib/types'
import DialogueScene from './DialogueScene'

vi.mock('../../lib/speech', () => ({
  isSpeechRecognitionSupported: vi.fn().mockReturnValue(false),
  recognizeOnce: vi.fn().mockResolvedValue({ transcript: '', confidence: 0, supported: false }),
  speakLine: vi.fn().mockResolvedValue(undefined),
  speechMatchScore: vi.fn().mockReturnValue(1),
  stopSpeech: vi.fn(),
  warmConversationPhrases: vi.fn(),
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
    expect(screen.getByRole('button', { name: 'Escuchar a Maya' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Escuchar a Leo' })).toBeTruthy()
  })

  it('toggles Spanish translations and audio-only mode', () => {
    cleanup()
    render(<DialogueScene title="Daily" lines={lines} />)

    fireEvent.click(screen.getByRole('button', { name: 'ES' }))
    expect(screen.queryByText('Buenos días, Leo.')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Solo audio' }))
    expect(screen.queryByText('Morning, Leo.')).toBeNull()
    expect(screen.getByRole('button', { name: 'Escuchar a Maya' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Solo audio' }))
    expect(screen.getByText('Morning, Leo.')).toBeTruthy()
  })
})
