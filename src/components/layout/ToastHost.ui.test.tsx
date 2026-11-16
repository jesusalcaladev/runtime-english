import { act, render, screen } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import { emitToast } from '../../lib/toast'
import ToastHost from './ToastHost'

describe('ToastHost', () => {
  it('renders emitted toast messages', async () => {
    vi.useFakeTimers()
    render(<ToastHost />)
    act(() => {
      emitToast('Hola mundo', 'success')
    })
    expect(screen.getByText('Hola mundo')).toBeTruthy()
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    vi.useRealTimers()
  })
})
