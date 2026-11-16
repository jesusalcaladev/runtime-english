import { Moon, Sun } from 'lucide-preact'
import { progressStore } from '../../lib/progress'
import { useProgress } from '../../lib/useProgress'

export default function ThemeToggle() {
  const state = useProgress()
  const dark = state.settings.theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => progressStore.setTheme(dark ? 'light' : 'dark')}
      class="surface-soft flex h-9 w-9 items-center justify-center rounded-full text-base-content/60 transition hover:bg-base-300 hover:text-base-content"
      aria-label={dark ? 'Activar tema claro' : 'Activar tema oscuro'}
      title={dark ? 'Tema claro' : 'Tema oscuro'}
    >
      {dark ? <Sun class="h-4 w-4" /> : <Moon class="h-4 w-4" />}
    </button>
  )
}
