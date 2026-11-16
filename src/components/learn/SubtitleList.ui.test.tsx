import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { VideoCue } from '../../data/learningResources'
import SubtitleList from './SubtitleList'

vi.mock('../../lib/speech', () => ({ speak: vi.fn() }))
vi.mock('../session/SavePhraseButton', () => ({
  default: () => <span>save</span>,
}))

afterEach(() => cleanup())

const cues: VideoCue[] = [
  { start: 0, end: 8, en: 'We are losing our listening.', es: 'Estamos perdiendo la escucha.' },
  {
    start: 8,
    end: 16,
    en: 'We need to listen first.',
    es: 'Necesitamos escuchar primero.',
    highlight: ['listen first'],
  },
]

describe('SubtitleList', () => {
  it('highlights the active cue, shows its translation and seeks on click', () => {
    const onSeek = vi.fn()
    render(
      <SubtitleList
        cues={cues}
        activeIndex={1}
        playing={false}
        follow
        onShadow={vi.fn()}
        shadowLine={null}
        shadowScore={null}
        listening="Escuchando…"
        shadowLabel="Repetir esta línea"
        matchLabel="Coincidencia"
        onSeek={onSeek}
      />,
    )

    expect(screen.getByText('Necesitamos escuchar primero.')).toBeTruthy()
    expect(screen.queryByText('Estamos perdiendo la escucha.')).toBeNull()

    const mark = screen.getByText('listen first')
    expect(mark.tagName.toLowerCase()).toBe('mark')

    fireEvent.click(screen.getByRole('button', { name: /Ir a 0:08/ }))
    expect(onSeek).toHaveBeenCalledWith(8)
  })
})
