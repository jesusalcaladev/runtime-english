import { afterEach, describe, expect, it, vi } from 'vitest'
import { closeTopDialog, hasOpenDialog, registerDialog } from './dialogStack'

const cleanups: Array<() => void> = []

function register(close: () => void): () => void {
  const unregister = registerDialog(close)
  cleanups.push(unregister)
  return unregister
}

describe('dialogStack', () => {
  afterEach(() => {
    cleanups.splice(0).forEach((cleanup) => cleanup())
  })

  it('reports when there is no open dialog', () => {
    expect(hasOpenDialog()).toBe(false)
    expect(closeTopDialog()).toBe(false)
  })

  it('closes only the topmost dialog', () => {
    // In the real app, closing a dialog unregisters it via the hook cleanup.
    let unregisterBottom = () => {}
    let unregisterTop = () => {}
    const bottom = vi.fn(() => unregisterBottom())
    const top = vi.fn(() => unregisterTop())
    unregisterBottom = register(bottom)
    unregisterTop = register(top)

    expect(hasOpenDialog()).toBe(true)
    expect(closeTopDialog()).toBe(true)
    expect(top).toHaveBeenCalledOnce()
    expect(bottom).not.toHaveBeenCalled()

    expect(closeTopDialog()).toBe(true)
    expect(bottom).toHaveBeenCalledOnce()
    expect(closeTopDialog()).toBe(false)
  })

  it('removes a dialog when it unmounts', () => {
    const close = vi.fn()
    const unregister = register(close)
    unregister()

    expect(hasOpenDialog()).toBe(false)
    expect(closeTopDialog()).toBe(false)
  })
})
