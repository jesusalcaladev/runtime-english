import { Download, RefreshCw, X } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import {
  type AppUpdateInfo,
  checkForAppUpdateDetailed,
  dismissAppUpdate,
  openAppUpdateDownload,
} from '../../lib/appUpdate'

export default function AppUpdateBanner() {
  const [update, setUpdate] = useState<AppUpdateInfo | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async (force = false) => {
      const result = await checkForAppUpdateDetailed({ force })
      if (!cancelled) setUpdate(result.info)
    }

    void run(false)

    const onFocus = () => void run(false)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void run(false)
    }
    const onManual = () => void run(true)
    window.addEventListener('focus', onFocus)
    window.addEventListener('runtimeenglish:check-update', onManual as EventListener)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('runtimeenglish:check-update', onManual as EventListener)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  if (!update) return null

  const onUpdate = async () => {
    setBusy(true)
    try {
      await openAppUpdateDownload(update.apkUrl)
    } finally {
      // keep banner visible in case user comes back without installing
      setBusy(false)
    }
  }

  return (
    <div class="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] z-[80] px-3 sm:px-4">
      <div class="pointer-events-auto mx-auto max-w-xl rounded-2xl border border-base-content/10 bg-base-100/95 p-3 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-base-100/85">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <RefreshCw class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-base-content">{update.title}</p>
            <p class="mt-0.5 hidden text-[11px] leading-relaxed text-base-content/65 sm:block">
              {update.notes}
            </p>
            <p class="mt-1 font-mono text-[10px] text-base-content/45">
              <span class="sm:hidden">
                Nueva: {update.latestVersionName} ({update.latestBuild})
              </span>
              <span class="hidden sm:inline">
                Instalada: {update.currentVersionName} ({update.currentBuild}) · Nueva:{' '}
                {update.latestVersionName} ({update.latestBuild})
              </span>
            </p>
            <p class="mt-1 hidden text-[10px] text-base-content/45 sm:block">
              Al tocar “Actualizar” se abrirá la descarga del APK. Cuando termine, ábrelo e instala
              la nueva versión.
            </p>
            <div class="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onUpdate}
                disabled={busy}
                class="inline-flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-[11px] font-semibold text-accent-content transition hover:opacity-90 disabled:opacity-60"
              >
                <Download class="h-3.5 w-3.5" />
                {busy ? 'Abriendo…' : 'Actualizar'}
              </button>
              {!update.mandatory && (
                <button
                  type="button"
                  onClick={() => {
                    dismissAppUpdate(update.latestBuild)
                    setUpdate(null)
                  }}
                  class="inline-flex h-9 items-center rounded-xl bg-base-200 px-3 text-[11px] font-medium text-base-content/70 transition hover:bg-base-300 hover:text-base-content"
                >
                  Después
                </button>
              )}
            </div>
          </div>
          {!update.mandatory && (
            <button
              type="button"
              aria-label="Cerrar aviso de actualización"
              onClick={() => {
                dismissAppUpdate(update.latestBuild)
                setUpdate(null)
              }}
              class="rounded-lg p-1.5 text-base-content/40 transition hover:bg-base-200 hover:text-base-content/70"
            >
              <X class="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
