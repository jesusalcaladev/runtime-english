import { fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { closeTopDialog } from '../../lib/dialogStack'
import ResponsiveDialog from './ResponsiveDialog'

describe('ResponsiveDialog', () => {
  const originalMatchMedia = globalThis.matchMedia
  const unmounts: Array<() => void> = []

  afterEach(() => {
    unmounts.splice(0).forEach((unmount) => unmount())
    globalThis.matchMedia = originalMatchMedia
    vi.unstubAllGlobals()
  })

  function setDesktop(value: boolean) {
    globalThis.matchMedia = vi.fn().mockReturnValue({
      matches: value,
      media: '(min-width: 640px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof globalThis.matchMedia
  }

  function renderDialog(desktop = false, onClose = vi.fn()) {
    setDesktop(desktop)
    const result = render(
      <ResponsiveDialog
        open
        onClose={onClose}
        title="Novedades"
        footer={
          <div>
            <button type="button">Primero</button>
            <button type="button">Último</button>
          </div>
        }
      >
        <p>Contenido</p>
      </ResponsiveDialog>,
    )
    unmounts.push(result.unmount)
    return { ...result, onClose }
  }

  it('renders a swipeable bottom sheet on phones', () => {
    const { container } = renderDialog(false)

    expect(screen.getByText('Novedades')).toBeTruthy()
    expect(screen.getByText('Contenido')).toBeTruthy()
    expect(container.querySelector('.rounded-t-\\[28px\\]')).toBeTruthy()
    expect(container.querySelector('.touch-none')).toBeTruthy()
  })

  it('closes the sheet when it is swiped down', () => {
    const { container, onClose } = renderDialog(false)
    const dragArea = container.querySelector('.touch-none') as HTMLElement

    fireEvent.pointerDown(dragArea, { clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(dragArea, { clientY: 230, pointerId: 1 })
    fireEvent.pointerUp(dragArea, { clientY: 230, pointerId: 1 })

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not close on a short swipe', () => {
    const { container, onClose } = renderDialog(false)
    const dragArea = container.querySelector('.touch-none') as HTMLElement

    fireEvent.pointerDown(dragArea, { clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(dragArea, { clientY: 130, pointerId: 1 })
    fireEvent.pointerUp(dragArea, { clientY: 130, pointerId: 1 })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders a centered dialog on desktop', () => {
    const { container } = renderDialog(true)

    expect(container.querySelector('.rounded-3xl')).toBeTruthy()
    expect(container.querySelector('.rounded-t-\\[28px\\]')).toBeNull()
  })

  it('closes on Escape', () => {
    const { onClose } = renderDialog(false)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('lets the native back button close the dialog', () => {
    const { onClose } = renderDialog(false)
    expect(closeTopDialog()).toBe(true)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('keeps Tab focus inside the dialog', () => {
    renderDialog(false)
    const last = screen.getByText('Último')
    last.focus()
    expect(document.activeElement).toBe(last)

    fireEvent.keyDown(document, { key: 'Tab' })

    expect(document.activeElement).toBe(screen.getByLabelText('Cerrar'))
  })
})
