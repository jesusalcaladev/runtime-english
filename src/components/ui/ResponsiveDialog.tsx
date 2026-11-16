import { type ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import BottomSheet from './BottomSheet'
import Modal from './Modal'

interface ResponsiveDialogProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: ComponentChildren
  children: ComponentChildren
  /** Desktop layout of the actions. */
  footer?: ComponentChildren
  /** Mobile layout of the actions; falls back to `footer`. */
  sheetFooter?: ComponentChildren
  dismissible?: boolean
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 640px)').matches
      : false,
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(min-width: 640px)')
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches)
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])

  return isDesktop
}

/**
 * Picks a distinct UI per breakpoint: a swipeable bottom sheet on phones,
 * a centered dialog on desktop. Only one of them is ever mounted.
 */
export default function ResponsiveDialog({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  sheetFooter,
  dismissible = true,
}: ResponsiveDialogProps) {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        icon={icon}
        footer={footer}
        dismissible={dismissible}
      >
        {children}
      </Modal>
    )
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      footer={sheetFooter ?? footer}
      dismissible={dismissible}
    >
      {children}
    </BottomSheet>
  )
}
