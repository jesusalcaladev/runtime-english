import { useCallback, useEffect, useState } from 'preact/hooks'

const STORAGE_KEY = 'runtimeenglish_learn_offline_v1'

function readPreference(): boolean | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'offline') return true
    if (raw === 'online') return false
  } catch {
    // Almacenamiento no disponible: seguimos con la detección de red.
  }
  return null
}

/** Detecta falta de red y permite forzar el modo transcripción (útil en el APK). */
export function useOfflineMode() {
  const [networkOffline, setNetworkOffline] = useState(
    () => typeof navigator !== 'undefined' && navigator.onLine === false,
  )
  const [forced, setForcedState] = useState<boolean | null>(readPreference)
  const [transient, setTransient] = useState(false)

  useEffect(() => {
    const goOffline = () => setNetworkOffline(true)
    const goOnline = () => setNetworkOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  const setForced = useCallback((value: boolean) => {
    setForcedState(value)
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? 'offline' : 'online')
    } catch {
      // Preferencia no persistida; el modo sigue activo en esta sesión.
    }
  }, [])

  return {
    offline: forced ?? networkOffline ?? transient,
    networkOffline,
    forced,
    setForced,
    setTransient,
  }
}
