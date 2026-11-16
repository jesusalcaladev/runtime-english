import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import VideoPhraseReview from './VideoPhraseReview'

const reviewPhrase = vi.fn()

vi.mock('../../lib/useProgress', () => ({
  useProgress: () => ({
    completedSessions: {},
    completedExercises: {},
    attempts: {},
    exerciseSrs: {},
    settings: { immersion: 'es' },
    xp: 0,
    phrasebook: {
      'the human voice': {
        id: 'the human voice',
        en: 'The human voice:',
        es: 'La voz humana:',
        source: 'VideoLab',
        updatedAt: 1,
      },
      other: {
        id: 'other',
        en: 'Unrelated phrase',
        es: 'Otra frase',
        source: 'Lección',
        updatedAt: 1,
      },
    },
  }),
}))

vi.mock('../../lib/progress', () => ({
  phraseId: (value: string) => value,
  progressStore: { reviewPhrase: (...args: unknown[]) => reviewPhrase(...args) },
}))

vi.mock('../session/SavePhraseButton', () => ({ default: () => <span>save</span> }))

afterEach(() => cleanup())

describe('VideoPhraseReview', () => {
  it('only reviews phrases saved from this video and schedules them through FSRS', () => {
    render(
      <VideoPhraseReview
        cues={[{ start: 1, end: 3, en: 'The human voice:', es: 'La voz humana:' }]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Practicar frases guardadas \(1\)/ }))
    expect(screen.getByText('The human voice:')).toBeTruthy()
    expect(screen.queryByText('Unrelated phrase')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Ver traducción' }))
    expect(screen.getByText('La voz humana:')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Lo sabía' }))
    expect(reviewPhrase).toHaveBeenCalledWith('The human voice:', true)
  })
})
