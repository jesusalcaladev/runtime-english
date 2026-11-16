export type ToastType = 'success' | 'error' | 'info' | 'achievement'

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

type ToastListener = (toast: ToastMessage) => void

const listeners = new Set<ToastListener>()
let nextId = 1

export function emitToast(message: string, type: ToastType = 'success') {
  const toast: ToastMessage = { id: nextId++, message, type }
  listeners.forEach((listener) => {
    listener(toast)
  })
}

export function subscribeToasts(listener: ToastListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
