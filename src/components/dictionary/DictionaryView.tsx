import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  BookText,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Tag,
  Trash2,
  Volume2,
  X,
} from 'lucide-preact'
import { useState } from 'preact/hooks'
import { useDictionary } from '../../hooks/useDictionary'
import { type PhrasebookEntry, progressStore } from '../../lib/progress'

function mastery(entry: PhrasebookEntry) {
  if (entry.correct >= 3) return { label: 'Dominada', pct: 100, tone: 'text-accent bg-accent/10' }
  if (entry.correct >= 1) return { label: 'Aprendiendo', pct: 60, tone: 'text-info bg-info/10' }
  if (entry.saved) return { label: 'Guardada', pct: 20, tone: 'text-base-content/60 bg-base-200' }
  return { label: 'Nueva', pct: 10, tone: 'text-base-content/50 bg-base-200' }
}

function difficultyLabel(d?: string) {
  if (d === 'hard') return { label: 'Difícil', cls: 'bg-error/10 text-error' }
  if (d === 'easy') return { label: 'Fácil', cls: 'bg-success/10 text-success' }
  return { label: 'Normal', cls: 'bg-base-100 text-base-content/45' }
}

function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 8)
}

export default function DictionaryView() {
  const d = useDictionary()
  const {
    state,
    query,
    setQuery,
    filter,
    setFilter,
    manualEn,
    setManualEn,
    manualEs,
    setManualEs,
    editingId,
    setEditingId,
    reviewMode,
    setReviewMode,
    reviewIndex,
    revealed,
    setRevealed,
    reviewedCount,
    setReviewQueue,
    showAdd,
    setShowAdd,
    dueEntries,
    filtered,
    total,
    learned,
    mastered,
    hard,
    progressPct,
    addManual,
    startReview,
    answerReview,
    card,
  } = d

  return (
    <div class="space-y-6">
      <section class="rounded-3xl bg-base-200 p-4 sm:p-5 space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="flex items-center gap-2 text-sm font-medium">
              <Brain class="h-4 w-4 text-accent" /> Repasar (flashcards SRS)
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => startReview('due')}
              class="btn btn-primary btn-sm h-9 gap-2 rounded-xl px-3"
            >
              <BookOpen class="h-4 w-4" /> Repasar vencidas{' '}
              {dueEntries.length > 0 ? `(${dueEntries.length})` : ''}
            </button>
            <button
              type="button"
              onClick={() => startReview('weak')}
              class="btn btn-ghost btn-sm h-9 gap-2 rounded-xl bg-base-100 px-3"
            >
              <RotateCcw class="h-4 w-4" /> Reforzar débiles
            </button>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <Stat label="Total" value={String(total)} />
          <Stat label="Aprendidas" value={String(learned)} accent />
          <Stat label="Vencidas" value={String(dueEntries.length)} warn={dueEntries.length > 0} />
        </div>

        <div class="rounded-2xl bg-accent/[0.07] p-3">
          <div class="flex items-center justify-between gap-2">
            <p class="text-[10px] text-base-content/45">Dominio</p>
            <p class="font-mono text-sm font-medium leading-none text-accent">{progressPct}%</p>
          </div>
          <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-base-content/10">
            <div
              class="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {hard > 0 && (
            <p class="mt-1.5 text-[10px] text-base-content/45">
              {hard} difíciles · {mastered} dominadas
            </p>
          )}
        </div>

        {!state.dictionaryBackfilledAt && total > 0 && (
          <p class="rounded-xl bg-info/10 px-3 py-2 text-[11px] text-info">
            Importa frases del contenido y de tus ejercicios ya completados.{' '}
            <button
              type="button"
              class="font-medium underline"
              onClick={() => progressStore.backfillPhrasebook()}
            >
              Importar frases iniciales
            </button>
          </p>
        )}

        {reviewMode !== 'none' && card && (
          <div class="rounded-2xl bg-base-100 p-4 sm:p-6 ring-1 ring-accent/10">
            <div class="flex items-center justify-between gap-2 text-[11px] text-base-content/45">
              <span>
                Tarjeta {reviewIndex + 1} / {d.reviewQueue.length}
              </span>
              <span class="hidden sm:inline">
                {reviewedCount} respondida{reviewedCount === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setReviewMode('none')
                  setReviewQueue([])
                }}
                class="flex items-center gap-1 rounded-full px-2 py-1 hover:bg-base-200"
              >
                <X class="h-3.5 w-3.5" /> <span class="hidden sm:inline">Cerrar</span>
              </button>
            </div>
            <div class="mt-4 text-center">
              <p class="hidden text-[11px] font-medium text-base-content/40 sm:block">
                Frase en inglés
              </p>
              <div class="mt-2 inline-flex max-w-full items-center rounded-2xl bg-accent/[0.08] px-5 py-3 ring-1 ring-accent/15">
                <p class="font-mono text-lg font-medium text-base-content sm:text-xl">{card.en}</p>
              </div>
              <div class="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  data-speak={card.en}
                  class="btn btn-ghost btn-sm h-10 cursor-pointer gap-2 rounded-xl bg-base-200 transition hover:bg-base-300 hover:text-base-content active:scale-[0.99]"
                  aria-label={`Escuchar frase: ${card.en}`}
                >
                  <Volume2 class="h-4 w-4" aria-hidden="true" /> Escuchar
                </button>
                <button
                  type="button"
                  onClick={() => setRevealed((v) => !v)}
                  class="btn btn-ghost btn-sm h-10 cursor-pointer gap-2 rounded-xl bg-base-200 transition hover:bg-base-300 hover:text-base-content active:scale-[0.99]"
                  aria-pressed={revealed}
                >
                  {revealed ? (
                    <EyeOff class="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye class="h-4 w-4" aria-hidden="true" />
                  )}{' '}
                  {revealed ? 'Ocultar' : 'Revelar significado'}
                </button>
              </div>
              {revealed ? (
                <div class="mx-auto mt-4 max-w-2xl space-y-2 rounded-2xl bg-base-200/70 p-4 text-left">
                  <p class="text-sm leading-relaxed text-base-content/80">
                    <span class="hidden font-medium text-base-content/50 sm:inline">
                      Significado:{' '}
                    </span>
                    {card.es || '—'}
                  </p>
                  {card.userExample && (
                    <p class="hint-text">
                      <span class="font-medium text-base-content/75">Tu ejemplo: </span>
                      <span class="font-mono">{card.userExample}</span>
                    </p>
                  )}
                  {card.notes && (
                    <p class="hint-text">
                      <span class="font-medium text-base-content/75">Nota: </span>
                      {card.notes}
                    </p>
                  )}
                </div>
              ) : (
                <p class="hint-text mt-4">Piensa el significado y luego revélalo.</p>
              )}
            </div>
            <div class="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => answerReview(false)}
                class="btn h-11 flex-1 gap-2 rounded-xl bg-error/10 text-error hover:bg-error/20 sm:max-w-[180px]"
              >
                <X class="h-4 w-4" /> Aún no
              </button>
              <button
                type="button"
                onClick={() => answerReview(true, true)}
                class="btn h-11 flex-1 gap-2 rounded-xl bg-base-200 text-base-content/70 hover:bg-base-300 sm:max-w-[180px]"
              >
                <RotateCcw class="h-4 w-4" /> Me costó
              </button>
              <button
                type="button"
                onClick={() => answerReview(true)}
                class="btn h-11 flex-1 gap-2 rounded-xl bg-accent text-accent-content hover:bg-accent/90 sm:max-w-[180px]"
              >
                <Check class="h-4 w-4" /> Lo recordé
              </button>
            </div>
          </div>
        )}
      </section>

      <section class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-sm font-medium text-base-content/80">Mis frases</h2>
          <span class="text-[11px] text-base-content/40">
            {filtered.length} de {total}
          </span>
        </div>
        <div class="rounded-3xl bg-base-200 p-3.5 space-y-3 sm:p-4">
          <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <label class="relative block w-full lg:max-w-md">
              <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/25" />
              <input
                type="search"
                value={query}
                onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
                placeholder="Busca en inglés, español, notas o etiquetas..."
                class="h-10 w-full rounded-xl bg-base-100 pl-10 pr-3 text-sm"
              />
            </label>
            <div class="flex flex-wrap gap-1.5">
              {(
                [
                  ['all', 'Todas'],
                  ['learned', 'Aprendidas'],
                  ['saved', 'Guardadas'],
                  ['hard', 'Difíciles'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  class={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${filter === id ? 'bg-base-content text-base-100' : 'bg-base-100 text-base-content/60 hover:text-base-content'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div class="rounded-3xl bg-base-200 px-4 py-10 text-center sm:px-6 sm:py-14">
            <BookText class="mx-auto h-8 w-8 text-base-content/20" />
            <p class="mt-3 text-sm font-medium text-base-content/55">
              {total === 0 ? 'Tu diccionario aún está vacío.' : 'No hay resultados con ese filtro.'}
            </p>
            <p class="mt-1 hidden text-xs text-base-content/40 sm:block">
              {total === 0
                ? 'Completa ejercicios, guarda frases en las lecciones o importa las iniciales.'
                : 'Prueba con otra búsqueda o filtro.'}
            </p>
            {total === 0 && (
              <button
                type="button"
                onClick={() => progressStore.backfillPhrasebook()}
                class="btn btn-primary btn-sm mt-4 h-9 gap-2 rounded-xl px-4"
              >
                <Download class="h-4 w-4" /> Importar frases iniciales
              </button>
            )}
          </div>
        ) : (
          <div class="grid gap-3 sm:grid-cols-2">
            {filtered.map((entry) => (
              <PhraseCard
                key={entry.id}
                entry={entry}
                editing={editingId === entry.id}
                onEdit={() => setEditingId(editingId === entry.id ? null : entry.id)}
                onClose={() => setEditingId(null)}
              />
            ))}
          </div>
        )}
      </section>

      <section class="rounded-3xl bg-base-200 p-4">
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          class="flex w-full cursor-pointer items-center justify-between gap-2 text-left transition hover:text-base-content"
          aria-expanded={showAdd}
        >
          <span class="flex items-center gap-2 text-sm font-medium">
            <Plus class="h-4 w-4 text-base-content/50" /> Añadir frase
          </span>
          <ChevronDown
            class={`h-4 w-4 text-base-content/40 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${showAdd ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        <div
          class={`grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${showAdd ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div class="overflow-hidden">
            <div class="mt-4 space-y-3 border-t border-base-content/10 pt-4">
              <div class="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  value={manualEn}
                  onInput={(e) => setManualEn((e.target as HTMLInputElement).value)}
                  placeholder="Frase en inglés"
                  aria-label="Frase en inglés"
                  class="h-10 rounded-xl bg-base-100 px-3 text-sm"
                />
                <input
                  value={manualEs}
                  onInput={(e) => setManualEs((e.target as HTMLInputElement).value)}
                  placeholder="Significado"
                  aria-label="Significado"
                  class="h-10 rounded-xl bg-base-100 px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={addManual}
                  class="btn btn-primary btn-sm h-10 rounded-xl px-4"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
  warn,
}: {
  label: string
  value: string
  accent?: boolean
  warn?: boolean
}) {
  return (
    <div class="rounded-2xl bg-base-100/60 p-3">
      <p
        class={`font-mono text-lg font-medium leading-none ${accent ? 'text-accent' : warn ? 'text-warning' : ''}`}
      >
        {value}
      </p>
      <p class="mt-1 text-[10px] text-base-content/45">{label}</p>
    </div>
  )
}

function PhraseCard({
  entry,
  editing,
  onEdit,
  onClose,
}: {
  entry: PhrasebookEntry
  editing: boolean
  onEdit: () => void
  onClose: () => void
}) {
  const m = mastery(entry)
  const diff = difficultyLabel(entry.difficulty)
  const [es, setEs] = useState(entry.es)
  const [notes, setNotes] = useState(entry.notes || '')
  const [userExample, setUserExample] = useState(entry.userExample || '')
  const [tagsText, setTagsText] = useState((entry.tags || []).join(', '))
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>(
    entry.difficulty || 'normal',
  )

  function saveEdit() {
    progressStore.updatePhrase(entry.id, {
      es: es.trim(),
      notes,
      userExample,
      tags: parseTags(tagsText),
      difficulty,
    })
    onClose()
  }

  return (
    <article class="flex flex-col rounded-2xl bg-base-200 p-4">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1">
          <div class="inline-flex max-w-full items-center rounded-xl bg-accent/[0.08] px-3 py-1.5 ring-1 ring-accent/15">
            <p class="truncate font-mono text-[14px] font-medium text-base-content">{entry.en}</p>
          </div>
          <p class="mt-2 text-[13px] leading-relaxed text-base-content/70">
            <span class="font-medium text-base-content/65">Significado: </span>
            {entry.es || '—'}
          </p>
          {entry.userExample && (
            <p class="hint-text mt-1.5 rounded-lg bg-base-100/60 px-2.5 py-2">
              <span class="font-medium text-base-content/75">Tu ejemplo: </span>
              <span class="font-mono">{entry.userExample}</span>
            </p>
          )}
          {entry.notes && (
            <p class="hint-text mt-1.5">
              <span class="font-medium text-base-content/75">Nota: </span>
              {entry.notes}
            </p>
          )}
          {(entry.tags?.length ?? 0) > 0 && (
            <div class="mt-2 hidden flex-wrap gap-1 sm:flex">
              {entry.tags?.map((t) => (
                <span
                  key={t}
                  class="inline-flex items-center gap-1 rounded-full bg-base-100 px-2 py-0.5 text-[10px] text-base-content/50"
                >
                  <Tag class="h-2.5 w-2.5" />
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div class="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            data-speak={entry.en}
            class="speak-btn flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-base-content/40 transition hover:bg-base-100 hover:text-base-content/70 hover:scale-[1.03] active:scale-95"
            aria-label={`Escuchar frase: ${entry.en}`}
            title="Escuchar frase"
          >
            <Volume2 class="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() =>
              progressStore.togglePhrase(entry.en, entry.es, entry.source || 'Diccionario')
            }
            class={`flex h-10 w-10 items-center justify-center rounded-full ${entry.saved ? 'text-accent bg-accent/10' : 'text-base-content/35 hover:bg-base-100'}`}
            aria-label={entry.saved ? 'Quitar de guardados' : 'Guardar frase'}
            aria-pressed={entry.saved}
          >
            {entry.saved ? (
              <BookmarkCheck class="h-4 w-4" aria-hidden="true" />
            ) : (
              <Bookmark class="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={onEdit}
            class={`flex h-10 w-10 items-center justify-center rounded-full ${editing ? 'bg-base-content text-base-100' : 'text-base-content/35 hover:bg-base-100'}`}
            aria-label={editing ? 'Cerrar edición' : 'Editar frase'}
            aria-expanded={editing}
          >
            {editing ? (
              <ChevronUp class="h-4 w-4" aria-hidden="true" />
            ) : (
              <Pencil class="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => progressStore.removePhrase(entry.id)}
            class="flex h-10 w-10 items-center justify-center rounded-full text-base-content/30 hover:bg-error/10 hover:text-error"
            aria-label={`Eliminar frase: ${entry.en}`}
          >
            <Trash2 class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <span class={`rounded-full px-2.5 py-1 text-[10px] font-medium ${m.tone}`}>{m.label}</span>
        <span class={`rounded-full px-2.5 py-1 text-[10px] font-medium ${diff.cls}`}>
          {diff.label}
        </span>
      </div>
      <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-base-content/[0.07]">
        <div
          class="h-full rounded-full bg-accent/70 transition-[width] duration-500"
          style={{ width: `${m.pct}%` }}
        />
      </div>

      {editing && (
        <div class="mt-3 space-y-2 rounded-xl bg-base-100/70 p-3">
          <label class="block">
            <span class="text-[10px] font-medium text-base-content/45">Significado</span>
            <input
              value={es}
              onInput={(e) => setEs((e.target as HTMLInputElement).value)}
              class="mt-1 h-9 w-full rounded-lg bg-base-100 px-2.5 text-sm"
            />
          </label>
          <label class="block">
            <span class="text-[10px] font-medium text-base-content/45">Tu ejemplo (en inglés)</span>
            <input
              value={userExample}
              onInput={(e) => setUserExample((e.target as HTMLInputElement).value)}
              placeholder="Ej. I fixed the bug before the release."
              class="mt-1 h-9 w-full rounded-lg bg-base-100 px-2.5 text-sm font-mono"
            />
          </label>
          <label class="block">
            <span class="text-[10px] font-medium text-base-content/45">Notas personales</span>
            <textarea
              value={notes}
              onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
              rows={2}
              placeholder="Cuándo usarla, matices, errores comunes..."
              class="mt-1 w-full rounded-lg bg-base-100 px-2.5 py-2 text-sm"
            />
          </label>
          <label class="block">
            <span class="text-[10px] font-medium text-base-content/45">
              Etiquetas (separadas por coma)
            </span>
            <input
              value={tagsText}
              onInput={(e) => setTagsText((e.target as HTMLInputElement).value)}
              placeholder="work, meetings, api"
              class="mt-1 h-9 w-full rounded-lg bg-base-100 px-2.5 text-sm"
            />
          </label>
          <div>
            <span class="text-[10px] font-medium text-base-content/45">Dificultad</span>
            <div class="mt-1 flex gap-1.5">
              {(
                [
                  ['easy', 'Fácil'],
                  ['normal', 'Normal'],
                  ['hard', 'Difícil'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDifficulty(id)}
                  class={`rounded-full px-3 py-1 text-[11px] font-medium ${difficulty === id ? 'bg-base-content text-base-100' : 'bg-base-100 text-base-content/55'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              class="btn btn-ghost btn-sm h-8 rounded-lg px-3"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveEdit}
              class="btn btn-primary btn-sm h-8 gap-1.5 rounded-lg px-3"
            >
              <Save class="h-3.5 w-3.5" /> Guardar
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
