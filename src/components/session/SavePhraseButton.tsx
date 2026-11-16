import { Bookmark, BookmarkCheck } from 'lucide-preact'
import { phraseId, progressStore } from '../../lib/progress'
import { emitToast } from '../../lib/toast'
import { useProgress } from '../../lib/useProgress'

interface Props {
  en: string
  es: string
  source?: string
  class?: string
  showLabel?: boolean
}

export default function SavePhraseButton({
  en,
  es,
  source = 'Lección',
  class: className,
  showLabel,
}: Props) {
  const state = useProgress()
  const id = phraseId(en)
  const entry = state.phrasebook?.[id]
  const saved = Boolean(entry?.saved)

  function toggle() {
    progressStore.togglePhrase(en, es, source)
    if (saved) {
      emitToast(
        'Frase quitada de guardados (sigue en tu diccionario si ya tenía progreso).',
        'info',
      )
    } else {
      emitToast('Guardada en tu diccionario. Repásala con flashcards cuando toque.', 'success')
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      class={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full transition ${
        showLabel ? 'h-8 px-3 text-[11px] font-medium' : 'h-8 w-8'
      } ${
        saved
          ? 'bg-accent/12 text-accent ring-1 ring-accent/15'
          : 'bg-base-100/70 text-base-content/35 hover:bg-base-100 hover:text-base-content/65'
      } ${className ?? ''}`}
      aria-label={saved ? 'Quitar de guardados en diccionario' : 'Guardar en diccionario'}
      aria-pressed={saved}
      title={saved ? 'Guardada en diccionario' : 'Guardar en diccionario'}
    >
      {saved ? <BookmarkCheck class="h-4 w-4" /> : <Bookmark class="h-4 w-4" />}
      {showLabel && <span>{saved ? 'Guardada' : 'Guardar'}</span>}
    </button>
  )
}
