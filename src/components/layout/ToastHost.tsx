import { CircleAlert, CircleCheck, Info, Trophy } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import { subscribeToasts, type ToastMessage } from '../../lib/toast'

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    return subscribeToasts((toast) => {
      setToasts((current) => [...current, toast])
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id))
      }, 4200)
    })
  }, [])

  return (
    <div
      data-toast-host
      class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 print:hidden"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          class="pointer-events-auto flex animate-pop items-start gap-3 rounded-2xl bg-base-100 p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          role="status"
        >
          <span
            class={
              toast.type === 'achievement'
                ? 'mt-0.5 text-warning'
                : toast.type === 'error'
                  ? 'mt-0.5 text-error'
                  : 'mt-0.5 text-accent'
            }
          >
            {toast.type === 'achievement' ? (
              <Trophy class="h-4 w-4" />
            ) : toast.type === 'error' ? (
              <CircleAlert class="h-4 w-4" />
            ) : toast.type === 'info' ? (
              <Info class="h-4 w-4" />
            ) : (
              <CircleCheck class="h-4 w-4" />
            )}
          </span>
          <p class="text-xs font-medium leading-relaxed text-base-content/70">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}
