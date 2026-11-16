import { Pause, Play, Volume2 } from 'lucide-preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { useUiStage } from '../../hooks/useUiStage'
import { tAction } from '../../lib/i18n'
import {
  getKokoroPhraseStatus,
  primeSpeechPhrase,
  speakLine,
  stopSpeech,
  subscribeKokoroPhraseStatus,
  warmConversationPhrases,
} from '../../lib/speech'
import type { DialogueLine } from '../../lib/types'
import Mascot from '../ui/Mascot'

interface Props {
  title?: string
  context?: string
  lines: DialogueLine[]
}

interface DialoguePlayback {
  activeIndex: number | null
  isPlaying: boolean
  playLine: (index: number) => void
  togglePlayback: () => void
}

type AudioReadiness = { ready: number; total: number }

const LINE_GAP_MS = 280

/** Slight voice differences so Maya and Leo do not sound like the same person. */
const SPEAKER_STYLES: Record<DialogueLine['speaker'], { pitch: number; rateScale: number }> = {
  a: { pitch: 1.08, rateScale: 1 },
  b: { pitch: 0.93, rateScale: 0.98 },
}

function useAudioReadiness(lines: DialogueLine[]): AudioReadiness {
  const textsKey = lines.map((line) => line.en).join('\u0000')
  const [status, setStatus] = useState<AudioReadiness>(() =>
    getKokoroPhraseStatus(lines.map((line) => line.en)),
  )

  useEffect(() => {
    const texts = textsKey ? textsKey.split('\u0000') : []
    const update = () => {
      const next = getKokoroPhraseStatus(texts)
      setStatus((previous) =>
        previous.ready === next.ready && previous.total === next.total ? previous : next,
      )
    }
    update()
    return subscribeKokoroPhraseStatus(update)
  }, [textsKey])

  return status
}

/** Keeps playback state and TTS lifecycle out of the presentational component. */
function useDialoguePlayback(lines: DialogueLine[]): DialoguePlayback {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    warmConversationPhrases(lines.map((line) => line.en))
    return () => {
      isMounted.current = false
      stopSpeech()
    }
  }, [lines])

  const playLine = useCallback(
    async (index: number) => {
      const line = lines[index]
      if (!line) return
      setActiveIndex(index)
      await speakLine(line.en, SPEAKER_STYLES[line.speaker])
      if (isMounted.current) setActiveIndex(null)
    },
    [lines],
  )

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      stopSpeech()
      setIsPlaying(false)
      setActiveIndex(null)
      return
    }

    setIsPlaying(true)
    stopSpeech()
    for (let index = 0; index < lines.length; index += 1) {
      if (!isMounted.current) return
      // Keep the next lines generating while the current one is speaking.
      for (let ahead = 1; ahead <= 2; ahead += 1) {
        const upcoming = lines[index + ahead]
        if (upcoming) primeSpeechPhrase(upcoming.en)
      }
      const line = lines[index]
      if (!line) continue
      setActiveIndex(index)
      await speakLine(line.en, SPEAKER_STYLES[line.speaker])
      await new Promise((resolve) => setTimeout(resolve, LINE_GAP_MS))
    }
    if (isMounted.current) {
      setActiveIndex(null)
      setIsPlaying(false)
    }
  }, [isPlaying, lines])

  return { activeIndex, isPlaying, playLine, togglePlayback }
}

function AudioStatusPill({ status }: { status: AudioReadiness }) {
  const allReady = status.total > 0 && status.ready >= status.total
  return (
    <span
      class={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${allReady ? 'bg-success/10 text-success' : 'bg-base-200/80 text-base-content/45'}`}
      title="Estado de las voces guardadas en caché"
      aria-live="polite"
    >
      <span
        class={`h-1.5 w-1.5 rounded-full ${allReady ? 'bg-success' : 'animate-pulse bg-warning'}`}
      />
      {allReady ? 'Audio listo' : `Audio ${status.ready}/${status.total}`}
    </span>
  )
}

function SpeakingBars() {
  return (
    <span class="inline-flex h-3.5 items-end gap-0.5" aria-hidden="true">
      <span class="h-2 w-0.5 animate-pulse rounded-full bg-accent" />
      <span class="h-3.5 w-0.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
      <span class="h-2.5 w-0.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
    </span>
  )
}

function Avatar({
  name,
  role,
  isB,
  active,
}: {
  name: string
  role?: string
  isB: boolean
  active: boolean
}) {
  const avatarTone = isB ? 'bg-info text-info-content' : 'bg-accent text-accent-content'
  const activeTone = active
    ? 'scale-105 ring-2 ring-accent/50 ring-offset-2 ring-offset-base-100'
    : 'opacity-80'

  return (
    <div class="flex w-14 shrink-0 flex-col items-center gap-1.5">
      <div
        class={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-[15px] font-semibold transition-all duration-300 ${avatarTone} ${activeTone}`}
      >
        {name.charAt(0).toUpperCase()}
        <span class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-base-100 bg-success" />
      </div>
      <span class="text-[10px] font-medium leading-none text-base-content/60">{name}</span>
      {role ? <span class="text-[9px] leading-none text-base-content/35">{role}</span> : null}
    </div>
  )
}

function DialogueBubble({
  line,
  active,
  showEs,
  audioOnly,
  playLabel,
  onPlay,
}: {
  line: DialogueLine
  active: boolean
  showEs: boolean
  audioOnly: boolean
  playLabel: string
  onPlay: () => void
}) {
  const isB = line.speaker === 'b'
  const bubbleTone = isB ? 'bg-info/[0.08] ring-info/15' : 'bg-accent/[0.07] ring-accent/10'
  const activeTone = active
    ? 'translate-y-[-2px] bg-base-100 shadow-sm ring-2 ring-accent/35'
    : 'opacity-90'

  return (
    <div class={`flex items-start gap-2.5 sm:gap-3 ${isB ? 'flex-row-reverse' : ''}`}>
      <Avatar name={line.name} role={line.role} isB={isB} active={active} />
      <div
        data-active={active ? 'true' : 'false'}
        class={`min-w-0 max-w-[85%] rounded-2xl px-4 py-2.5 ring-1 transition-all duration-300 ${bubbleTone} ${activeTone}`}
      >
        {audioOnly ? (
          <p class="flex h-6 items-center gap-1.5">
            <span class="sr-only">Texto oculto, escucha la línea</span>
            <span class="h-1.5 w-1.5 rounded-full bg-accent/40" />
            <span class="h-1.5 w-1.5 rounded-full bg-accent/25" />
            <span class="h-1.5 w-1.5 rounded-full bg-accent/15" />
          </p>
        ) : (
          <>
            {active ? (
              <div class="mb-1 flex h-3.5 items-center">
                <SpeakingBars />
              </div>
            ) : null}
            <p class="font-mono text-[14px] leading-relaxed text-base-content/90">{line.en}</p>
            {line.es && showEs ? (
              <p class="mt-1.5 text-[11px] leading-relaxed text-base-content/45">{line.es}</p>
            ) : null}
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onPlay}
        class={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-95 focus-visible:outline-none ${active ? 'bg-accent/15 text-accent' : 'bg-base-100/80 text-base-content/45 hover:bg-base-100 hover:text-accent'}`}
        aria-label={`${playLabel}: ${line.name}`}
        title={`${playLabel}: ${line.name}`}
      >
        <Volume2 class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export default function DialogueScene({ title, context, lines }: Props) {
  const { activeIndex, isPlaying, playLine, togglePlayback } = useDialoguePlayback(lines)
  const audioReadiness = useAudioReadiness(lines)
  const stage = useUiStage()
  const [showEs, setShowEs] = useState(true)
  const [audioOnly, setAudioOnly] = useState(false)

  return (
    <div class="space-y-4">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0 space-y-1.5">
          <div class="flex flex-wrap items-center gap-2">
            <Mascot
              mood={isPlaying ? 'listening' : 'idle'}
              size="sm"
              lines={
                isPlaying
                  ? [
                      tAction(stage, 'mascotListening'),
                      tAction(stage, 'mascotTip'),
                      tAction(stage, 'mascotCheer'),
                    ]
                  : [tAction(stage, 'mascotIdle'), tAction(stage, 'mascotReady')]
              }
            />
            <p class="mono-label text-accent/80">Conversación</p>
            <AudioStatusPill status={audioReadiness} />
          </div>
          <h3 class="text-[17px] font-semibold tracking-tight text-base-content/90">
            {title ?? 'Escucha y entiende'}
          </h3>
          {context ? (
            <p class="max-w-2xl text-[12px] leading-relaxed text-base-content/50">{context}</p>
          ) : null}
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-0.5 rounded-full bg-base-200/70 p-1">
            <button
              type="button"
              onClick={() => setShowEs((value) => !value)}
              aria-pressed={showEs}
              class={`inline-flex h-7 items-center rounded-full px-3 text-[11px] transition ${showEs ? 'bg-base-100 text-accent shadow-sm' : 'text-base-content/45 hover:text-base-content'}`}
              title="Mostrar u ocultar la traducción al español"
            >
              <span class="font-mono text-[10px]">ES</span>
            </button>
            <button
              type="button"
              onClick={() => setAudioOnly((value) => !value)}
              aria-pressed={audioOnly}
              class={`inline-flex h-7 items-center rounded-full px-3 text-[11px] transition ${audioOnly ? 'bg-base-100 text-accent shadow-sm' : 'text-base-content/45 hover:text-base-content'}`}
              title={tAction(stage, 'soloAudio')}
            >
              {tAction(stage, 'soloAudio')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => void togglePlayback()}
            class="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[12px] font-medium text-accent-content transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none"
            aria-label={isPlaying ? 'Detener conversación' : 'Reproducir conversación'}
          >
            {isPlaying ? <Pause class="h-4 w-4" /> : <Play class="h-4 w-4" />}
            {isPlaying
              ? activeIndex !== null
                ? `Detener · ${activeIndex + 1}/${lines.length}`
                : 'Detener'
              : 'Reproducir'}
          </button>
        </div>
      </header>

      <div class="rounded-3xl bg-base-200/70 p-4 sm:p-5">
        <ol class="space-y-3">
          {lines.map((line, index) => (
            <li key={`${line.speaker}-${index}`}>
              <DialogueBubble
                line={line}
                active={activeIndex === index}
                showEs={showEs}
                audioOnly={audioOnly}
                playLabel={tAction(stage, 'play')}
                onPlay={() => void playLine(index)}
              />
            </li>
          ))}
        </ol>
      </div>

      <footer class="flex flex-wrap items-center justify-between gap-2 text-[11px] leading-relaxed text-base-content/35">
        <span>{tAction(stage, 'dialogueTip')}</span>
        <span class="font-mono">{lines.length} líneas</span>
      </footer>
    </div>
  )
}
