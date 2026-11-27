import {
  ArrowRight,
  BookText,
  Brain,
  Check,
  CheckCircle2,
  NotebookPen,
  RotateCcw,
  Tag,
  Target,
  Volume2,
  X,
  Zap,
} from 'lucide-preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import {
  buildExercisePool,
  buildPhrasePool,
  getPracticeStats,
  type PracticeItem,
  type PracticeMode,
} from '../../lib/practice'
import { type PhrasebookEntry, progressStore } from '../../lib/progress'
import { route } from '../../lib/routes'
import { warmSpeechEngine } from '../../lib/speech'
import { useProgress } from '../../lib/useProgress'
import ExerciseRunner from '../exercise/ExerciseRunner'

interface Props {
  items: PracticeItem[]
}

const MODE_OPTIONS = [
  { id: 'review', label: 'Ejercicios (SRS) · Repasar hoy', short: 'Repasar' },
  { id: 'weak', label: 'Ejercicios · Reforzar', short: 'Reforzar' },
  { id: 'new', label: 'Ejercicios · Nuevos', short: 'Nuevos' },
  { id: 'mix', label: 'Ejercicios · Mezcla inteligente', short: 'Mezcla' },
  { id: 'phrases', label: 'Frases/Diccionario (flashcards)', short: 'Frases' },
] as const satisfies ReadonlyArray<{ id: PracticeMode; label: string; short: string }>

const COUNT_OPTIONS = [5, 10, 15] as const

function isPracticeMode(value: string | null): value is PracticeMode {
  return (
    value === 'review' ||
    value === 'weak' ||
    value === 'new' ||
    value === 'mix' ||
    value === 'phrases'
  )
}

export default function PracticeView({ items }: Props) {
  const state = useProgress()
  const [mode, setMode] = useState<PracticeMode>('review')
  const [count, setCount] = useState(10)
  const [seed, setSeed] = useState(0)

  useEffect(() => {
    try {
      const modeParam = new URLSearchParams(window.location.search).get('mode')
      if (isPracticeMode(modeParam)) setMode(modeParam)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      warmSpeechEngine()
    } catch {}
  }, [])

  // Keep a stable "now" per round so memoized pools/stats don't recompute on every render.
  const now = useMemo(() => Date.now(), [mode, count, seed, state.streak.lastActiveDate])

  const pool = useMemo(() => {
    if (mode === 'phrases') return []
    return buildExercisePool(items, state, mode, count, now)
  }, [items, state, mode, count, now])

  const sessionId = `practice-${mode}-${seed}`
  const exercises = useMemo(() => pool.map((item) => item.exercise), [pool])
  const sources = useMemo(() => pool.map((item) => ({ id: item.exercise.id, ...item })), [pool])

  const phrasePool = useMemo(() => buildPhrasePool(state, count), [state, count, now])

  const stats = useMemo(() => getPracticeStats(items, state, now), [items, state, now])

  return (
    <div class="page-shell animate-fade-up">
      <section class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="mono-label flex items-center gap-2">
            <Zap class="h-3.5 w-3.5 text-accent" />
            Práctica rápida
          </p>
          <h1 class="font-pixel mt-3 text-[2rem] leading-[1.05] tracking-tight sm:text-[3.05rem]">
            Entrena en modo fluido
          </h1>
          <p class="hint-text mt-2 max-w-xl">
            Repaso espaciado y frases guardadas, en una sola ronda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          class="btn btn-ghost h-10 gap-2 rounded-xl bg-base-200 px-3 text-base-content/70 sm:px-4"
          aria-label="Nueva ronda"
        >
          <RotateCcw class="h-4 w-4" /> <span class="hidden sm:inline">Nueva ronda</span>
          <span class="sm:hidden">Ronda</span>
        </button>
      </section>

      <section class="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-4 sm:gap-3">
        <div
          class={`rounded-2xl px-3 py-3 sm:px-4 sm:py-4 ${stats.dueReview > 0 ? 'bg-accent/[0.08] ring-1 ring-accent/20' : 'bg-base-200'}`}
        >
          <div class="hint-text flex items-center gap-2">
            <Brain class="h-3.5 w-3.5 text-accent" /> <span class="truncate">SRS</span>
          </div>
          <p class="mt-1.5 font-mono text-lg font-medium sm:mt-2 sm:text-xl">{stats.dueReview}</p>
          <p class="hint-text mt-0.5">Para repasar</p>
        </div>
        <div class="rounded-2xl bg-base-200 px-3 py-3 sm:px-4 sm:py-4">
          <div class="hint-text flex items-center gap-2">
            <Target class="h-3.5 w-3.5" /> <span class="truncate">Reforzar</span>
          </div>
          <p class="mt-1.5 font-mono text-lg font-medium sm:mt-2 sm:text-xl">{stats.weak}</p>
          <p class="hint-text mt-0.5">Más difíciles</p>
        </div>
        <div
          class={`rounded-2xl px-3 py-3 sm:px-4 sm:py-4 ${stats.duePhrases > 0 ? 'bg-accent/[0.08] ring-1 ring-accent/20' : 'bg-base-200'}`}
        >
          <div class="hint-text flex items-center gap-2">
            <BookText class="h-3.5 w-3.5 text-accent" /> <span class="truncate">Frases</span>
          </div>
          <p class="mt-1.5 font-mono text-lg font-medium sm:mt-2 sm:text-xl">{stats.duePhrases}</p>
          <p class="hint-text mt-0.5">Flashcards</p>
        </div>
        <div class="rounded-2xl bg-base-200 px-3 py-3 sm:px-4 sm:py-4">
          <div class="hint-text flex items-center gap-2">
            <CheckCircle2 class="h-3.5 w-3.5" /> <span class="truncate">Nuevos</span>
          </div>
          <p class="mt-1.5 font-mono text-lg font-medium sm:mt-2 sm:text-xl">{stats.unseen}</p>
          <p class="hint-text mt-0.5">Sin intentar</p>
        </div>
      </section>

      <section class="mt-5 rounded-2xl bg-base-200 p-3.5 sm:mt-6 sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {MODE_OPTIONS.map(({ id, label, short }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id)
                  setSeed((s) => s + 1)
                }}
                class={`min-h-10 rounded-xl px-3 py-2 text-left text-[13px] transition sm:text-sm ${mode === id ? 'bg-base-content text-base-100' : 'bg-base-100 text-base-content/65 hover:text-base-content'}`}
              >
                <span class="sm:hidden">{short}</span>
                <span class="hidden sm:inline">{label}</span>
                {id === 'review' && stats.dueReview > 0 && (
                  <span
                    class={`ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-[10px] ${mode === id ? 'bg-base-100/20 text-base-100' : 'bg-accent/20 text-accent'}`}
                  >
                    {stats.dueReview}
                  </span>
                )}
                {id === 'phrases' && stats.duePhrases > 0 && (
                  <span
                    class={`ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-[10px] ${mode === id ? 'bg-base-100/20 text-base-100' : 'bg-accent/20 text-accent'}`}
                  >
                    {stats.duePhrases}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div class="flex items-center justify-between gap-2 text-sm text-base-content/55 sm:ml-auto sm:justify-start">
            <span class="hidden text-[12px] sm:inline sm:text-sm">Cantidad</span>
            <div class="flex items-center gap-1.5">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setCount(n)
                    setSeed((s) => s + 1)
                  }}
                  class={`h-8 w-10 rounded-lg font-mono text-xs ${count === n ? 'bg-accent/15 text-accent' : 'bg-base-100 text-base-content/50'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {mode !== 'phrases' && sources.length > 0 && (
          <div class="mt-3 sm:mt-4">
            <div class="hidden flex-wrap gap-2 sm:flex">
              {sources.slice(0, 6).map((s) => (
                <a
                  key={s.id}
                  href={route(`/session/${s.sessionSlug}`)}
                  class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-base-100 px-3 py-1 text-[10px] text-base-content/45 hover:text-base-content/70"
                >
                  <span class="truncate">
                    {s.moduleCode} · {s.sessionTitle}
                  </span>
                  <ArrowRight class="h-3 w-3 shrink-0" />
                </a>
              ))}
              {sources.length > 6 && (
                <span class="px-2 py-1 text-[10px] text-base-content/35">
                  +{sources.length - 6} más
                </span>
              )}
            </div>
            <p class="hint-text">
              {sources.length} ejercicio{sources.length === 1 ? '' : 's'} de{' '}
              {new Set(sources.map((s) => s.moduleCode)).size} módulo(s) en esta ronda.
            </p>
          </div>
        )}
      </section>

      <section class="mt-8">
        {mode === 'phrases' ? (
          phrasePool.length === 0 ? (
            <div class="rounded-3xl bg-base-200/60 px-4 py-8 text-center sm:px-5 sm:py-10">
              <p class="text-sm font-medium text-base-content/60">
                No hay frases/diccionario para repasar ahora.
              </p>
              <p class="hint-text mt-2">
                Guarda frases desde lecciones, completa ejercicios o usa el backfill inicial en el
                Diccionario.
              </p>
              <div class="mt-4 flex flex-wrap justify-center gap-2">
                <a href={route('/dictionary')} class="btn btn-primary btn-sm h-9 rounded-xl px-4">
                  Ir al diccionario
                </a>
                <a
                  href={route('/dictionary?review=1')}
                  class="btn btn-ghost btn-sm h-9 rounded-xl bg-base-100 px-4"
                >
                  Ver flashcards
                </a>
              </div>
            </div>
          ) : (
            <PhraseReviewRunner key={`phr-${seed}`} entries={phrasePool} />
          )
        ) : exercises.length === 0 ? (
          <div class="rounded-3xl bg-base-200/60 px-4 py-8 text-center sm:px-5 sm:py-10">
            <p class="text-sm font-medium text-base-content/60">
              {mode === 'review'
                ? 'No tienes ejercicios (SRS) vencidos ahora mismo.'
                : mode === 'weak'
                  ? 'No hay ejercicios débiles que reforzar por ahora.'
                  : mode === 'new'
                    ? 'No hay ejercicios nuevos pendientes.'
                    : 'No hay ejercicios disponibles para este modo todavía.'}
            </p>
            <p class="hint-text mt-2">
              {mode === 'review'
                ? 'Prueba “Mezcla inteligente” o “Nuevos” mientras tanto.'
                : mode === 'weak'
                  ? 'Vuelve cuando algún ejercicio necesite refuerzo.'
                  : 'Cambia de modo o continúa desde Inicio.'}
            </p>
            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <a href={route('/')} class="btn btn-primary btn-sm h-9 rounded-xl px-4">
                Ir a Inicio
              </a>
              <button
                type="button"
                onClick={() => setMode('mix')}
                class="btn btn-ghost btn-sm h-9 rounded-xl bg-base-100 px-4"
              >
                Mezcla inteligente
              </button>
            </div>
          </div>
        ) : (
          <ExerciseRunner
            key={sessionId}
            sessionId={sessionId}
            sessionTitle={`Práctica rápida · ${mode === 'review' ? 'Repasar hoy' : mode === 'weak' ? 'Reforzar' : mode === 'new' ? 'Nuevos' : 'Mezcla inteligente'}`}
            exercises={exercises}
            next={null}
          />
        )}
      </section>
    </div>
  )
}

function PhraseReviewRunner({ entries }: { entries: PhrasebookEntry[] }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(0)
  const entry = entries[index]

  if (!entry) {
    return (
      <div class="rounded-2xl bg-base-200/60 px-5 py-10 text-center text-sm text-base-content/50">
        No hay frases para repasar.
      </div>
    )
  }

  if (index >= entries.length) {
    return (
      <div class="rounded-2xl bg-accent/[0.07] p-8 text-center">
        <p class="font-pixel text-2xl">Repaso de diccionario completado</p>
        <p class="mt-2 text-sm text-base-content/55">
          Has repasado {done} frase{done === 1 ? '' : 's'} usando tus notas y ejemplos.
        </p>
        <a href={route('/dictionary')} class="btn btn-primary btn-sm mt-4 rounded-xl">
          Ver diccionario
        </a>
      </div>
    )
  }

  function answer(correct: boolean, struggled = false) {
    progressStore.reviewPhrase(entry.id, correct, { struggled })
    setDone((d) => d + 1)
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between text-[11px] text-base-content/45">
        <span class="mono-label flex items-center gap-2">
          <BookText class="h-3.5 w-3.5 text-accent" /> Repaso de diccionario
        </span>
        <span class="font-mono">
          {index + 1} / {entries.length}
        </span>
      </div>
      <div class="rounded-[26px] bg-base-200 p-1.5">
        <div class="rounded-[20px] bg-base-100 p-5 sm:p-6">
          <p class="hint-text">Traduce o recuerda esta frase</p>
          <div class="mt-3 flex items-start justify-between gap-3">
            <p class="font-mono text-lg text-base-content/90 sm:text-xl">{entry.en}</p>
            <button
              type="button"
              data-speak={entry.en}
              class="speak-btn flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-base-200 text-base-content/55 transition hover:bg-base-300 hover:text-base-content/80 hover:scale-[1.03] active:scale-95"
              aria-label={`Escuchar frase: ${entry.en}`}
              title="Escuchar frase"
            >
              <Volume2 class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              class="btn btn-primary btn-sm mt-6 h-10 rounded-xl px-4"
            >
              Mostrar significado y mis notas
            </button>
          ) : (
            <div class="mt-5 space-y-3">
              <div class="rounded-xl bg-accent/[0.06] p-4 ring-1 ring-accent/10">
                <p class="text-[11px] font-medium text-base-content/45">Significado</p>
                <p class="mt-1 text-[14px] leading-relaxed text-base-content/80">
                  {entry.es || '—'}
                </p>
                {entry.userExample && (
                  <p class="mt-3 text-[12px] leading-relaxed text-base-content/70">
                    <span class="inline-flex items-center gap-1 font-medium text-base-content/45">
                      <NotebookPen class="h-3.5 w-3.5" /> Tu ejemplo:
                    </span>{' '}
                    <span class="font-mono">{entry.userExample}</span>
                  </p>
                )}
                {entry.notes && (
                  <p class="hint-text mt-2">
                    <span class="font-medium text-base-content/75">Nota:</span> {entry.notes}
                  </p>
                )}
                {(entry.tags?.length ?? 0) > 0 && (
                  <div class="mt-2 flex flex-wrap gap-1">
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
              <p class="text-[12px] text-base-content/55">¿La recordaste correctamente?</p>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => answer(false)}
                  class="btn btn-ghost h-10 gap-2 rounded-xl bg-error/10 px-4 text-error"
                >
                  <X class="h-4 w-4" /> No la sabía
                </button>
                <button
                  type="button"
                  onClick={() => answer(true, true)}
                  class="btn btn-ghost h-10 gap-2 rounded-xl bg-base-200 px-4 text-base-content/70"
                >
                  <RotateCcw class="h-4 w-4" /> Me costó
                </button>
                <button
                  type="button"
                  onClick={() => answer(true)}
                  class="btn btn-primary h-10 gap-2 rounded-xl px-4"
                >
                  <Check class="h-4 w-4" /> La sabía
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
