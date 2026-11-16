import { Mic, Volume2 } from 'lucide-preact'
import { useEffect, useMemo, useRef } from 'preact/hooks'
import type { VideoCue } from '../../data/learningResources'
import { speak } from '../../lib/speech'
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

function HighlightedText({ cue }: { cue: VideoCue }) {
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

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
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
}: Props) {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!playing || !follow) return
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' })
  }, [activeIndex, playing, follow])

  return (
    <div class="mt-2 max-h-[360px] space-y-1.5 overflow-y-auto rounded-2xl bg-base-100/70 p-2">
      {cues.map((cue, index) => {
        const active = index === activeIndex
        return (
          <div
            key={`${cue.start}-${index}`}
            class={`group relative flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition ${
              active ? 'bg-accent/10 ring-1 ring-accent/25' : 'hover:bg-base-200/70'
            }`}
          >
            <button
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => onSeek(cue.start)}
              class="flex min-w-0 flex-1 items-start gap-2 text-left"
              aria-label={`Ir a ${formatTime(cue.start)}: ${cue.en}`}
            >
              <span
                class={`mt-0.5 w-8 shrink-0 font-mono text-[10px] ${active ? 'text-accent/70' : 'text-base-content/25'}`}
              >
                {formatTime(cue.start)}
              </span>
              <span class="min-w-0 flex-1">
                <span
                  class={`block font-mono text-[13px] leading-relaxed sm:text-[14px] ${active ? 'text-base-content/95' : 'text-base-content/55'}`}
                >
                  <HighlightedText cue={cue} />
                </span>
                {active && cue.es && (
                  <span class="mt-1 block text-[12px] text-base-content/50">{cue.es}</span>
                )}
              </span>
            </button>
            <span
              class={`flex shrink-0 items-center gap-1 transition ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <button
                type="button"
                onClick={() => void speak(cue.en)}
                class="flex h-7 w-7 items-center justify-center rounded-full text-base-content/40 transition hover:bg-base-200 hover:text-accent"
                aria-label={`Escuchar: ${cue.en}`}
              >
                <Volume2 class="h-3.5 w-3.5" />
              </button>
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
