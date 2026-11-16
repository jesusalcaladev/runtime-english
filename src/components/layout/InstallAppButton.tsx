import { Download, Share } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import ResponsiveDialog from '../ui/ResponsiveDialog'

const APK_DOWNLOAD_URL =
  'https://github.com/jesusalcaladev/runtime-english/releases/latest/download/RuntimeEnglish.apk'

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as any).Capacitor
  try {
    return typeof cap?.isNativePlatform === 'function' && cap.isNativePlatform()
  } catch {
    return false
  }
}

export default function InstallAppButton() {
  const [open, setOpen] = useState(false)
  const [deferred, setDeferred] = useState<any>(null)
  const [platform, setPlatform] = useState<'android' | 'ios' | 'other'>('other')
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isStandalone() || isNativeApp()) {
      setHidden(true)
      return
    }
    const ua = window.navigator.userAgent || ''
    const isiOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (((navigator as any).platform === 'MacIntel' ||
        (navigator as any).userAgentData?.platform === 'macOS') &&
        navigator.maxTouchPoints > 1)
    const isAndroid = /Android/i.test(ua)
    const p = isiOS ? 'ios' : isAndroid ? 'android' : 'other'
    setPlatform(p)

    const onBip = (e: any) => {
      // En Android mostramos descarga directa del APK; no interceptar el prompt PWA
      // para evitar el warning "preventDefault() called... must call prompt()".
      if (p === 'android') return
      e.preventDefault?.()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  const apkUrl = APK_DOWNLOAD_URL

  if (hidden) return null

  if (platform === 'android') {
    return (
      <a
        href={apkUrl}
        download="RuntimeEnglish.apk"
        class="surface-soft inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base-content/70 transition hover:bg-base-300 hover:text-base-content sm:w-auto sm:gap-1.5 sm:px-3"
        title="Descargar APK para Android"
        aria-label="Descargar APK para Android"
      >
        <Download class="h-3.5 w-3.5" />
        <span class="hidden text-[11px] font-medium sm:inline">Descargar APK</span>
      </a>
    )
  }

  if (platform === 'ios') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          class="surface-soft inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base-content/70 transition hover:bg-base-300 hover:text-base-content sm:w-auto sm:gap-1.5 sm:px-3"
          aria-label="Instalar app"
          aria-haspopup="dialog"
          title="Instalar app (PWA)"
        >
          <Download class="h-3.5 w-3.5" />
          <span class="hidden text-[11px] font-medium sm:inline">Instalar app</span>
        </button>

        <ResponsiveDialog
          open={open}
          onClose={() => setOpen(false)}
          title="Instalar en iPhone/iPad"
          subtitle="Añade RuntimeEnglish a tu pantalla de inicio"
          icon={<Download class="h-5 w-5" />}
          footer={
            <button
              type="button"
              onClick={() => setOpen(false)}
              class="h-11 w-full rounded-2xl bg-base-200 text-sm font-medium text-base-content/70 transition hover:bg-base-300"
            >
              Entendido
            </button>
          }
          sheetFooter={
            <button
              type="button"
              onClick={() => setOpen(false)}
              class="h-12 w-full rounded-2xl bg-accent text-sm font-semibold text-accent-content"
            >
              Entendido
            </button>
          }
        >
          <ol class="space-y-2.5">
            {[
              <>
                Toca <Share class="inline h-3.5 w-3.5" aria-hidden="true" />{' '}
                <strong>Compartir</strong> en Safari.
              </>,
              <>
                Elige <strong>“Añadir a pantalla de inicio”</strong>.
              </>,
              <>Confirma para instalar la app (PWA).</>,
            ].map((step, index) => (
              <li key={index} class="flex items-start gap-3 rounded-2xl bg-base-200/60 p-3 sm:bg-transparent sm:p-0">
                <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-[11px] font-semibold text-accent">
                  {index + 1}
                </span>
                <span class="text-[12px] leading-relaxed text-base-content/75">{step}</span>
              </li>
            ))}
          </ol>
        </ResponsiveDialog>
      </>
    )
  }

  // Other platforms: offer PWA install if available, else APK link as fallback
  if (deferred) {
    return (
      <button
        type="button"
        onClick={async () => {
          try {
            deferred.prompt()
            await deferred.userChoice
          } catch {}
          setDeferred(null)
        }}
        class="surface-soft inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base-content/70 transition hover:bg-base-300 hover:text-base-content sm:w-auto sm:gap-1.5 sm:px-3"
        aria-label="Instalar app"
        title="Instalar app"
      >
        <Download class="h-3.5 w-3.5" />
        <span class="hidden text-[11px] font-medium sm:inline">Instalar app</span>
      </button>
    )
  }

  return (
    <a
      href={apkUrl}
      download="RuntimeEnglish.apk"
      class="surface-soft hidden h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium text-base-content/70 transition hover:bg-base-300 hover:text-base-content md:inline-flex"
      title="Descargar APK"
      aria-label="Descargar APK"
    >
      <Download class="h-3.5 w-3.5" />
      <span>Descargar APK</span>
    </a>
  )
}
