import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { VideoCue } from '../../data/learningResources'
import SubtitleList, { KaraokeText } from './SubtitleList'

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

function renderList(activeIndex: number, currentTime: number) {
  return render(
    <SubtitleList
      cues={cues}
      activeIndex={activeIndex}
      playing={false}
      follow
      onShadow={vi.fn()}
      shadowLine={null}
      shadowScore={null}
      listening="Escuchando…"
      shadowLabel="Repetir esta línea"
      matchLabel="Coincidencia"
      onSeek={vi.fn()}
      currentTime={currentTime}
    />,
  )
}

describe('SubtitleList', () => {
  it('shows the active translation and seeks on click without timestamps', () => {
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
        currentTime={8}
      />,
    )

    expect(screen.getByText('Necesitamos escuchar primero.')).toBeTruthy()
    expect(screen.queryByText('Estamos perdiendo la escucha.')).toBeNull()
    expect(screen.queryByText(/0:08/)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Ir a: We need to listen first/ }))
    expect(onSeek).toHaveBeenCalledWith(8)
  })

  it('keeps the static highlight on inactive cues', () => {
    renderList(0, 2)
    const mark = screen.getByText('listen first')
    expect(mark.tagName.toLowerCase()).toBe('mark')
  })
})

describe('KaraokeText', () => {
  it('uses exact word timings when the cue provides them', () => {
    const timedCue: VideoCue = {
      start: 0,
      end: 4,
      en: 'I work at home',
      words: [
        { t: 0, d: 0.5 },
        { t: 0.5, d: 0.8 },
        { t: 1.3, d: 0.6 },
        { t: 1.9, d: 1 },
      ],
    }
    const { container } = render(<KaraokeText cue={timedCue} currentTime={1.5} />)
    const lit = [...container.querySelectorAll('span')].filter((span) =>
      span.className.includes('bg-accent'),
    )
    expect(lit).toHaveLength(1)
    expect(lit[0].textContent?.trim()).toBe('at')
  })

  it('lights the word being spoken at the current time', () => {
    const { container } = render(<KaraokeText cue={cues[1]} currentTime={13.5} />)
    const words = [...container.querySelectorAll('span')]
    const lit = words.filter((span) => span.className.includes('bg-accent'))

    expect(lit).toHaveLength(1)
    expect(lit[0].textContent?.trim()).toBe('listen')
  })
})
