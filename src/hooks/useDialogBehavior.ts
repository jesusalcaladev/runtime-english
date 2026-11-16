import { useEffect, useRef, useState } from 'preact/hooks'
import { registerDialog } from '../lib/dialogStack'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface DialogBehaviorOptions {
  open: boolean
  onClose: () => void
  dismissible: boolean
  dialogRef: { current: HTMLElement | null }
  /** Exit animation length in ms; ignored when reduced motion is enabled. */
  exitMs: number
}

function vibrate(milliseconds: number): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(milliseconds)
    }
  } catch {
    // haptics are optional
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Shared dialog plumbing: delayed unmount for the exit animation, body scroll
 * lock, focus trap, focus restoration and the native back-button integration.
 */
export function useDialogBehavior({
  open,
  onClose,
  dismissible,
  dialogRef,
  exitMs,
}: DialogBehaviorOptions) {
  const [visible, setVisible] = useState(open)
  const [closing, setClosing] = useState(false)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const reducedMotion = prefersReducedMotion()

  useEffect(() => {
    if (open) {
      setVisible(true)
      setClosing(false)
    } else {
      setClosing(true)
      const timer = window.setTimeout(() => setVisible(false), reducedMotion ? 0 : exitMs)
      return () => window.clearTimeout(timer)
    }
  }, [open, exitMs, reducedMotion])

  // Mount/unmount: lock scroll, focus the dialog, restore focus on close.
  useEffect(() => {
    if (!visible) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    vibrate(8)

    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocused.current?.focus?.()
      vibrate(5)
    }
  }, [visible, dialogRef])

  // While open: Escape, focus trap and native back button.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const root = dialogRef.current
      if (!root) return
      const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.hasAttribute('hidden'),
      )
      if (focusable.length === 0) {
        event.preventDefault()
        root.focus()
        return
      }

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === root)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      } else if (!root.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const unregister = dismissible ? registerDialog(onClose) : () => {}

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unregister()
    }
  }, [open, dismissible, onClose, dialogRef])

  return { visible, closing, reducedMotion }
}
