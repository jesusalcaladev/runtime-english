import { X } from 'lucide-preact'
import { type ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { useDialogBehavior } from '../../hooks/useDialogBehavior'

interface SheetPointerEvent {
  clientY: number
  pointerId: number
  currentTarget: HTMLDivElement
}

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: ComponentChildren
  children: ComponentChildren
  footer?: ComponentChildren
  dismissible?: boolean
}

let sheetCounter = 0

/**
 * Native-feeling mobile sheet: slides up from the bottom, has a drag handle,
 * can be swiped down to dismiss and respects the device safe area.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  dismissible = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ startY: number; delta: number; active: boolean } | null>(null)
  const [dragY, setDragY] = useState(0)
  const [animateIn, setAnimateIn] = useState(true)
  const [titleId] = useState(() => `runtimeenglish-sheet-${++sheetCounter}`)

  const { visible, closing, reducedMotion } = useDialogBehavior({
    open,
    onClose,
    dismissible,
    dialogRef: sheetRef,
    exitMs: 240,
  })

  useEffect(() => {
    if (open) {
      setAnimateIn(true)
      setDragY(0)
    }
  }, [open])

  if (!visible) return null

  const onPointerDown = (event: SheetPointerEvent) => {
    if (!dismissible || closing) return
    dragRef.current = { startY: event.clientY, delta: 0, active: true }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event: SheetPointerEvent) => {
    const drag = dragRef.current
    if (!drag?.active) return
    drag.delta = Math.max(0, event.clientY - drag.startY)
    setDragY(drag.delta)
  }

  const endDrag = () => {
    const drag = dragRef.current
    if (!drag?.active) return
    dragRef.current = null
    setDragY(0)
    if (drag.delta > 90) onClose()
  }

  const sheetAnimation = reducedMotion
    ? ''
    : closing
      ? 'animate-sheet-down'
      : animateIn
        ? 'animate-sheet-up'
        : ''
  const backdropAnimation = reducedMotion
    ? ''
    : closing
      ? 'animate-fade-out'
      : animateIn
        ? 'animate-fade-in'
        : ''

  return (
    <div class="fixed inset-0 z-[90]">
      <div
        class={`absolute inset-0 bg-black/60 ${backdropAnimation}`}
        aria-hidden="true"
        onClick={dismissible && !closing ? onClose : undefined}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && !closing) setAnimateIn(false)
        }}
        class={`absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] border-t border-base-content/10 bg-base-100 shadow-[0_-12px_40px_rgba(0,0,0,0.28)] outline-none ${sheetAnimation}`}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          class={`shrink-0 touch-none ${dismissible ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          {dismissible && (
            <div class="flex justify-center pb-1 pt-3" aria-hidden="true">
              <span class="h-1 w-10 rounded-full bg-base-content/20" />
            </div>
          )}
          <div class="flex items-start gap-3 px-5 pb-3 pt-2">
            {icon && (
              <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                {icon}
              </span>
            )}
            <div class="min-w-0 flex-1">
              <h2 id={titleId} class="text-base font-semibold leading-snug text-base-content">
                {title}
              </h2>
              {subtitle && (
                <p class="mt-0.5 text-[11px] leading-relaxed text-base-content/55">{subtitle}</p>
              )}
            </div>
            {dismissible && (
              <button
                type="button"
                aria-label="Cerrar"
                onClick={onClose}
                class="-mr-1 -mt-1 shrink-0 rounded-full bg-base-200 p-1.5 text-base-content/45"
              >
                <X class="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div
          class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4"
          onPointerDown={(event) => {
            // Dragging from the content should only close the sheet when it is
            // already scrolled to the top, otherwise it must scroll normally.
            if ((event.currentTarget as HTMLDivElement).scrollTop <= 0) onPointerDown(event)
          }}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {children}
        </div>

        {footer && (
          <div class="shrink-0 border-t border-base-content/[0.06] bg-base-100 px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
