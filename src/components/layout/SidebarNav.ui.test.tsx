import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDefaultState } from '../../lib/progress'
import SidebarNav from './SidebarNav'

const mocks = vi.hoisted(() => ({ setOpen: vi.fn() }))

vi.mock('../../hooks/useSidebarNav', () => ({
  useSidebarNav: () => ({ open: false, setOpen: mocks.setOpen, path: '/', search: '' }),
}))
vi.mock('../../lib/useProgress', () => ({ useProgress: () => createDefaultState() }))

afterEach(() => cleanup())

describe('SidebarNav', () => {
  it('cambia de nivel dentro del dashboard sin recargar y avisa al contenido', () => {
    const onSelect = vi.fn()
    window.addEventListener('runtimeenglish:select-level', onSelect)

    render(<SidebarNav />)
    fireEvent.click(screen.getByRole('link', { name: /A1-A2/ }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect((onSelect.mock.calls[0][0] as CustomEvent<string>).detail).toBe('A1-A2')
    expect(window.location.search).toContain('level=A1-A2')
    expect(mocks.setOpen).toHaveBeenCalledWith(false)

    window.removeEventListener('runtimeenglish:select-level', onSelect)
  })

  it('incluye C1-C2 como nivel navegable', () => {
    render(<SidebarNav />)
    const link = screen.getByText('C1-C2').closest('a')
    expect(link?.getAttribute('href')).toContain('level=C1-C2')
  })
})
