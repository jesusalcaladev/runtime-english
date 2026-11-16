import { Mic } from 'lucide-preact'
import { useEffect, useMemo, useRef } from 'preact/hooks'
import type { VideoCue } from '../../data/learningResources'
import SavePhraseButton from '../session/SavePhraseButton'

interface Props {
  cues: VideoCue[]
  activeIndex: number
  playing: boolean
  follow: boolean
  onShadow(index: number, text: string): void
  shadowLine: number | null
  shadowScore: number | null
  listening: string
  shadowLabel: string
  matchLabel: string
  onSeek(seconds: number): void
  /** Tiempo efectivo del reproductor, para resaltar la palabra que suena. */
  currentTime: number
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function splitHighlight(cue: VideoCue): string[] {
  const words = cue.highlight ?? []
  if (words.length === 0) return [cue.en]
  const pattern = new RegExp(`(${words.map(escapeRegExp).join('|')})`, 'gi')
  return cue.en.split(pattern)
}

export function HighlightedText({ cue }: { cue: VideoCue }) {
  const parts = useMemo(() => splitHighlight(cue), [cue])
  const words = useMemo(() => (cue.highlight ?? []).map((word) => word.toLowerCase()), [cue])
  return (
    <span>
      {parts.map((part, index) =>
        words.includes(part.toLowerCase()) ? (
          <mark key={index} class="rounded bg-accent/25 px-0.5 text-accent">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  )
}

/** Resaltado palabra por palabra: la palabra en curso se ilumina y las demás se atenúan. */
export function KaraokeText({
  cue,
  currentTime,
  onDark = false,
}: {
  cue: VideoCue
  currentTime: number
  onDark?: boolean
}) {
  const words = useMemo(() => cue.en.split(/\s+/).filter(Boolean), [cue.en])
  if (!words.length) return <span>{cue.en}</span>

  const duration = Math.max(cue.end - cue.start, 0.1)
  const progress = Math.min(1, Math.max(0, (currentTime - cue.start) / duration))
  const timings = cue.words

  let activeIndex: number
  if (timings?.length) {
    // Tiempos reales por palabra (YouTube ASR): encontramos la palabra en curso.
    const local = currentTime - cue.start
    const found = timings.findIndex((word) => local >= word.t && local < word.t + word.d)
    activeIndex =
      found >= 0
        ? Math.min(found, words.length - 1)
        : local < timings[0].t
          ? 0
          : Math.min(timings.length - 1, words.length - 1)
  } else {
    // Sin datos por palabra: reparto proporcional dentro de la línea.
    activeIndex = Math.min(words.length - 1, Math.floor(progress * words.length))
  }

  return (
    <span>
      {words.map((word, index) => (
        <span
          key={`${index}-${word}`}
          class={
            index === activeIndex
              ? 'rounded bg-accent/25 px-0.5 text-accent'
              : index < activeIndex
                ? onDark
                  ? 'text-white/45'
                  : 'text-base-content/40'
                : onDark
                  ? 'text-white'
                  : 'text-base-content/85'
          }
        >
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

export default function SubtitleList({
  cues,
  activeIndex,
  playing,
  follow,
  onShadow,
  shadowLine,
  shadowScore,
  listening,
  shadowLabel,
  matchLabel,
  onSeek,
  currentTime,
}: Props) {
  const activeRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!playing || !follow) return
    const list = listRef.current
    const active = activeRef.current
    if (!list || !active) return
    // Desplazamos solo la lista para que la página no salte al seguir la línea activa.
    const listBox = list.getBoundingClientRect()
    const activeBox = active.getBoundingClientRect()
    list.scrollTop += activeBox.top - listBox.top - (listBox.height - activeBox.height) / 2
  }, [activeIndex, playing, follow])

  return (
    <div
      ref={listRef}
      class="mt-2 max-h-[440px] space-y-1 overflow-y-auto rounded-2xl bg-base-100/70 p-2 lg:max-h-[560px]"
    >
      {cues.map((cue, index) => {
        const active = index === activeIndex
        return (
          <div
            key={`${cue.start}-${index}`}
            class={`group relative flex w-full items-start gap-2 rounded-xl px-3.5 py-3 text-left transition ${
              active ? 'bg-accent/10 ring-1 ring-accent/25' : 'hover:bg-base-200/70'
            }`}
          >
            <button
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => onSeek(cue.start)}
              class="flex min-w-0 flex-1 items-start gap-2 text-left"
              aria-label={`Ir a: ${cue.en}`}
            >
              <span class="min-w-0 flex-1">
                <span
                  class={`block font-mono text-[14px] leading-relaxed sm:text-[15px] ${active ? 'text-base-content' : 'text-base-content/70'}`}
                >
                  {active ? (
                    <KaraokeText cue={cue} currentTime={currentTime} />
                  ) : (
                    <HighlightedText cue={cue} />
                  )}
                </span>
                {active && cue.es && (
                  <span class="mt-1 block text-[12.5px] text-base-content/60">{cue.es}</span>
                )}
              </span>
            </button>
            <span
              class={`flex shrink-0 items-center gap-1 transition ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <button
                type="button"
                onClick={() => onShadow(index, cue.en)}
                class={`flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-base-200 hover:text-accent ${shadowLine === index ? 'text-accent' : 'text-base-content/40'}`}
                aria-label={`${shadowLabel}: ${cue.en}`}
                title={shadowLabel}
              >
                <Mic class="h-3.5 w-3.5" />
              </button>
              <SavePhraseButton en={cue.en} es={cue.es ?? cue.en} source="VideoLab" />
            </span>
            {shadowLine === index && (
              <span class="absolute right-3 top-0 mt-0.5 text-[10px] text-accent/80">
                {shadowScore === null ? listening : `${matchLabel}: ${shadowScore}%`}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
