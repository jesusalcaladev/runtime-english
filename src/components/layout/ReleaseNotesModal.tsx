import { Bug, Sparkles, Zap } from 'lucide-preact'
import { type ChangeKind, type ChangelogRelease, CURRENT_APP_VERSION } from '../../data/changelog'
import { SHOW_CHANGELOG_EVENT } from '../../lib/changelog'
import ResponsiveDialog from '../ui/ResponsiveDialog'

interface ReleaseNotesModalProps {
  open: boolean
  releases: ChangelogRelease[]
  mode: 'auto' | 'manual'
  onClose: () => void
}

const KIND_STYLES: Record<ChangeKind, { label: string; icon: typeof Sparkles; color: string }> = {
  feature: { label: 'Nuevo', icon: Sparkles, color: 'bg-accent/15 text-accent' },
  improvement: { label: 'Mejora', icon: Zap, color: 'bg-info/15 text-info' },
  fix: { label: 'Arreglo', icon: Bug, color: 'bg-warning/15 text-warning' },
}

export default function ReleaseNotesModal({
  open,
  releases,
  mode,
  onClose,
}: ReleaseNotesModalProps) {
  const showAll = () => {
    window.dispatchEvent(new CustomEvent(SHOW_CHANGELOG_EVENT))
  }

  const desktopFooter = (
    <div class="flex items-center gap-3">
      {mode === 'auto' && (
        <button
          type="button"
          onClick={showAll}
          class="shrink-0 text-[11px] font-medium text-base-content/55 hover:text-base-content"
        >
          Ver todas las versiones
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        class="h-11 flex-1 rounded-2xl bg-accent text-sm font-semibold text-accent-content transition hover:opacity-90"
      >
        Entendido
      </button>
    </div>
  )

  const sheetFooter = (
    <div class="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClose}
        class="flex h-12 w-full items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-accent-content transition active:scale-[0.99]"
      >
        Entendido
      </button>
      {mode === 'auto' && (
        <button
          type="button"
          onClick={showAll}
          class="h-10 w-full text-[12px] font-medium text-base-content/55"
        >
          Ver todas las versiones
        </button>
      )}
    </div>
  )

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={mode === 'manual' ? 'Historial de versiones' : '¡Hay novedades!'}
      subtitle={
        mode === 'manual'
          ? `Estás en la versión ${CURRENT_APP_VERSION}`
          : 'Esto cambió desde la última vez que abriste la app.'
      }
      icon={<Sparkles class="h-5 w-5" />}
      footer={desktopFooter}
      sheetFooter={sheetFooter}
    >
      <div class="space-y-5">
        {releases.map((release) => (
          <section key={release.version}>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-lg bg-base-200 px-2 py-1 font-mono text-[10px] font-semibold text-base-content/70">
                v{release.version}
              </span>
              {release.date && <span class="text-[10px] text-base-content/40">{release.date}</span>}
            </div>
            <h3 class="mt-2 text-sm font-semibold text-base-content">{release.title}</h3>

            <ul class="mt-3 space-y-2">
              {release.entries.map((entry, index) => {
                const style = KIND_STYLES[entry.kind]
                const Icon = style.icon
                return (
                  <li
                    key={`${release.version}-${index}`}
                    class="flex items-start gap-3 rounded-2xl bg-base-200/60 p-3 sm:gap-2.5 sm:rounded-none sm:bg-transparent sm:p-0"
                  >
                    <span
                      class={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${style.color}`}
                      title={style.label}
                    >
                      <Icon class="h-3.5 w-3.5" />
                    </span>
                    <p class="text-[12px] leading-relaxed text-base-content/75">{entry.text}</p>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      <p class="mt-5 text-center text-[10px] text-base-content/35 sm:border-t sm:border-base-content/[0.06] sm:pt-3">
        Puedes volver a ver esto cuando quieras desde Ajustes → Novedades.
      </p>
    </ResponsiveDialog>
  )
}
