import { act, cleanup, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Mascot from './Mascot'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Mascot', () => {
  it('is just a circle with two pill eyes', () => {
    render(<Mascot mood="idle" />)
    expect(document.querySelectorAll('.mascot__body circle')).toHaveLength(1)
    expect(document.querySelectorAll('.mascot__eyes rect')).toHaveLength(2)
    cleanup()
  })

  it('changes only the mood class (and therefore the color)', () => {
    render(<Mascot mood="listening" />)
    expect(document.querySelector('.mascot--listening')).toBeTruthy()
    expect(document.querySelectorAll('.mascot__body circle')).toHaveLength(1)
    cleanup()
  })

  it('shows several phrases over time', () => {
    vi.useFakeTimers()
    render(<Mascot lines={['Uno', 'Dos', 'Tres']} />)
    expect(screen.getByText('Uno')).toBeTruthy()
    act(() => {
      vi.advanceTimersByTime(3300)
    })
    expect(screen.getByText('Dos')).toBeTruthy()
    act(() => {
      vi.advanceTimersByTime(3300)
    })
    expect(screen.getByText('Tres')).toBeTruthy()
  })

  it('omits the bubble when no lines are given', () => {
    render(<Mascot mood="idle" />)
    expect(document.querySelector('.mascot__line')).toBeNull()
  })
})
