import { X } from 'lucide-preact'
import { type ComponentChildren } from 'preact'
import { useRef, useState } from 'preact/hooks'
import { useDialogBehavior } from '../../hooks/useDialogBehavior'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: ComponentChildren
  children: ComponentChildren
  footer?: ComponentChildren
  dismissible?: boolean
}

let modalCounter = 0

/** Desktop-only centered dialog. Mobile uses BottomSheet instead. */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  dismissible = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [titleId] = useState(() => `runtimeenglish-modal-${++modalCounter}`)

  const { visible, closing, reducedMotion } = useDialogBehavior({
    open,
    onClose,
    dismissible,
    dialogRef,
    exitMs: 180,
  })

  if (!visible) return null

  return (
    <div class="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        class={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
          reducedMotion ? '' : closing ? 'animate-fade-out' : 'animate-fade-in'
        }`}
        aria-hidden="true"
        onClick={dismissible && !closing ? onClose : undefined}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        class={`relative z-10 flex max-h-[min(85dvh,44rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 shadow-2xl outline-none ${
          reducedMotion ? '' : closing ? 'animate-pop-out' : 'animate-pop'
        }`}
      >
        <div class="flex shrink-0 items-start gap-3 border-b border-base-content/[0.06] px-6 pb-3 pt-6">
          {icon && (
            <span class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
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
              class="-mr-1 shrink-0 rounded-lg p-1.5 text-base-content/40 transition hover:bg-base-200 hover:text-base-content/70"
            >
              <X class="h-4 w-4" />
            </button>
          )}
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">{children}</div>

        {footer && (
          <div class="shrink-0 border-t border-base-content/[0.06] bg-base-100 px-6 pb-5 pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
