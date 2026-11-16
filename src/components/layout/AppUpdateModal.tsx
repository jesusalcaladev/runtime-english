import { Download, RefreshCw } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { type AppUpdateInfo, openAppUpdateDownload } from '../../lib/appUpdate'
import ResponsiveDialog from '../ui/ResponsiveDialog'

interface AppUpdateModalProps {
  open: boolean
  update: AppUpdateInfo | null
  onDismiss: () => void
}

/** Modal replacement for the old bottom banner that announced a newer APK. */
export default function AppUpdateModal({ open, update, onDismiss }: AppUpdateModalProps) {
  const [busy, setBusy] = useState(false)

  if (!update) return null

  const onUpdate = async () => {
    setBusy(true)
    try {
      await openAppUpdateDownload(update.apkUrl)
    } finally {
      // Keep the modal visible in case the user comes back without installing.
      setBusy(false)
    }
  }

  const updateLabel = busy ? 'Abriendo…' : 'Actualizar'

  const desktopFooter = (
    <div class="flex flex-row-reverse gap-2">
      <button
        type="button"
        onClick={() => void onUpdate()}
        disabled={busy}
        class="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-semibold text-accent-content transition hover:opacity-90 disabled:opacity-60"
      >
        <Download class="h-4 w-4" />
        {updateLabel}
      </button>
      {!update.mandatory && (
        <button
          type="button"
          onClick={onDismiss}
          class="h-11 flex-1 rounded-2xl bg-base-200 text-sm font-medium text-base-content/70 transition hover:bg-base-300 hover:text-base-content"
        >
          Ahora no
        </button>
      )}
    </div>
  )

  // On phones the primary action owns the whole width and "Ahora no" is a quiet
  // text button underneath, so the sheet stays clean and thumb-friendly.
  const sheetFooter = (
    <div class="flex flex-col items-stretch gap-1">
      <button
        type="button"
        onClick={() => void onUpdate()}
        disabled={busy}
        class="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-semibold text-accent-content transition active:scale-[0.99] disabled:opacity-60"
      >
        <Download class="h-4 w-4" />
        {updateLabel}
      </button>
      {!update.mandatory && (
        <button
          type="button"
          onClick={onDismiss}
          class="h-11 w-full text-sm font-medium text-base-content/45"
        >
          Ahora no
        </button>
      )}
    </div>
  )

  return (
    <ResponsiveDialog
      open={open}
      onClose={onDismiss}
      dismissible={!update.mandatory}
      title={update.title}
      subtitle={`Versión ${update.latestVersionName} (build ${update.latestBuild})`}
      icon={<RefreshCw class="h-5 w-5" />}
      footer={desktopFooter}
      sheetFooter={sheetFooter}
    >
      <div class="rounded-2xl bg-base-200/70 p-4">
        <p class="text-[12px] leading-relaxed text-base-content/80">{update.notes}</p>
      </div>

      <p class="mt-3 font-mono text-[10px] text-base-content/40">
        Instalada: {update.currentVersionName} ({update.currentBuild}) · Nueva:{' '}
        {update.latestVersionName} ({update.latestBuild})
      </p>

      <p class="mt-3 text-[11px] leading-relaxed text-base-content/55">
        Al tocar “Actualizar” se abrirá la descarga del APK. Cuando termine, ábrelo e instala la
        nueva versión.
      </p>
    </ResponsiveDialog>
  )
}
