import { AudioLines, Languages, Mic, Pause, Play, Volume2 } from 'lucide-preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { useUiStage } from '../../hooks/useUiStage'
import { tAction } from '../../lib/i18n'
import {
  isSpeechRecognitionSupported,
  recognizeOnce,
  type SpeechStyle,
  speakLine,
  speechMatchScore,
  stopSpeech,
  warmConversationPhrases,
} from '../../lib/speech'
import type { DialogueLine } from '../../lib/types'

interface Props {
  title?: string
  context?: string
  lines: DialogueLine[]
}

interface ShadowFeedback {
  index: number
  /** null while the microphone is still listening. */
  score: number | null
}

interface DialoguePlayback {
  activeIndex: number | null
  isPlaying: boolean
  shadow: ShadowFeedback | null
  canRecognize: boolean
  playLine: (index: number) => void
  repeatLine: (index: number) => void
  togglePlayback: () => void
}

const LINE_GAP_MS = 280
const SHADOW_PASS_SCORE = 0.72

/** Slight voice differences so Maya and Leo do not sound like the same person. */
const SPEAKER_STYLES: Record<DialogueLine['speaker'], SpeechStyle> = {
  a: { pitch: 1.08, rateScale: 1 },
  b: { pitch: 0.93, rateScale: 0.98 },
}

/** Keeps playback state and TTS lifecycle out of the presentational component. */
function useDialoguePlayback(lines: DialogueLine[]): DialoguePlayback {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [shadow, setShadow] = useState<ShadowFeedback | null>(null)
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
      setShadow(null)
      setActiveIndex(index)
      await speakLine(line.en, SPEAKER_STYLES[line.speaker])
      if (isMounted.current) setActiveIndex(null)
    },
    [lines],
  )

  const repeatLine = useCallback(
    async (index: number) => {
      const line = lines[index]
      if (!line) return
      setShadow({ index, score: null })
      const result = await recognizeOnce()
      if (!isMounted.current) return
      const score = result.supported ? speechMatchScore(line.en, result.transcript) : -1
      setShadow({ index, score })
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
    setShadow(null)
    stopSpeech()
    for (let index = 0; index < lines.length; index += 1) {
      if (!isMounted.current) return
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

  return {
    activeIndex,
    isPlaying,
    shadow,
    canRecognize: isSpeechRecognitionSupported(),
    playLine,
    repeatLine,
    togglePlayback,
  }
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

function ShadowHint({ score }: { score: number | null }) {
  const message =
    score === null
      ? 'Escuchando…'
      : score >= SHADOW_PASS_SCORE
        ? '¡Muy bien!'
        : 'Casi: vuelve a intentarlo.'

  return (
    <p
      class={`mt-1.5 text-[10px] font-medium ${score !== null && score >= SHADOW_PASS_SCORE ? 'text-accent' : 'text-base-content/45'}`}
    >
      {message}
    </p>
  )
}

function DialogueBubble({
  line,
  active,
  shadow,
  canRecognize,
  showEs,
  audioOnly,
  onPlay,
  onRepeat,
}: {
  line: DialogueLine
  active: boolean
  shadow: ShadowFeedback | null
  canRecognize: boolean
  showEs: boolean
  audioOnly: boolean
  onPlay: () => void
  onRepeat: () => void
}) {
  const isB = line.speaker === 'b'
  const bubbleTone = isB ? 'bg-info/[0.08] ring-info/15' : 'bg-accent/[0.07] ring-accent/10'
  const activeTone = active
    ? 'translate-y-[-2px] bg-base-100 shadow-sm ring-2 ring-accent/35'
    : 'opacity-90'
  const hasShadow = shadow !== null && shadow.index >= 0

  return (
    <div class={`flex items-end gap-3 ${isB ? 'flex-row-reverse' : ''}`}>
      <Avatar name={line.name} role={line.role} isB={isB} active={active} />
      <div
        data-active={active ? 'true' : 'false'}
        class={`min-w-0 max-w-[85%] rounded-2xl px-4 py-3 ring-1 transition-all duration-300 ${bubbleTone} ${activeTone}`}
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
            <p class="font-mono text-[14px] leading-relaxed text-base-content/90">{line.en}</p>
            {line.es && showEs ? (
              <p class="mt-1.5 text-[11px] leading-relaxed text-base-content/45">{line.es}</p>
            ) : null}
          </>
        )}
        {hasShadow && shadow ? <ShadowHint score={shadow.score} /> : null}
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onPlay}
          class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-base-100/80 text-base-content/45 transition hover:bg-base-100 hover:text-accent active:scale-95 focus-visible:outline-none"
          aria-label={`Escuchar a ${line.name}`}
          title={`Escuchar a ${line.name}`}
        >
          <Volume2 class="h-4 w-4" aria-hidden="true" />
        </button>
        {canRecognize ? (
          <button
            type="button"
            onClick={onRepeat}
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-base-100/80 text-base-content/45 transition hover:bg-base-100 hover:text-accent active:scale-95 focus-visible:outline-none"
            aria-label={`Repetir línea de ${line.name}`}
            title={`Repetir línea de ${line.name}`}
          >
            <Mic class="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default function DialogueScene({ title, context, lines }: Props) {
  const { activeIndex, isPlaying, shadow, canRecognize, playLine, repeatLine, togglePlayback } =
    useDialoguePlayback(lines)
  const stage = useUiStage()
  const [showEs, setShowEs] = useState(true)
  const [audioOnly, setAudioOnly] = useState(false)

  return (
    <div class="space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1.5">
          <p class="mono-label text-accent/80">Conversación</p>
          <h3 class="text-[17px] font-semibold tracking-tight text-base-content/90">
            {title ?? 'Escucha y entiende'}
          </h3>
          {context ? (
            <p class="max-w-2xl text-[12px] leading-relaxed text-base-content/50">{context}</p>
          ) : null}
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEs((value) => !value)}
            aria-pressed={showEs}
            class={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] transition ${showEs ? 'bg-accent/15 text-accent' : 'bg-base-200 text-base-content/50 hover:text-base-content'}`}
            title="Mostrar u ocultar la traducción al español"
          >
            <Languages class="h-3.5 w-3.5" /> ES
          </button>
          <button
            type="button"
            onClick={() => setAudioOnly((value) => !value)}
            aria-pressed={audioOnly}
            class={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] transition ${audioOnly ? 'bg-accent/15 text-accent' : 'bg-base-200 text-base-content/50 hover:text-base-content'}`}
            title={tAction(stage, 'soloAudio')}
          >
            <AudioLines class="h-3.5 w-3.5" /> {tAction(stage, 'soloAudio')}
          </button>
          <button
            type="button"
            onClick={() => void togglePlayback()}
            class="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[12px] font-medium text-accent-content transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none"
            aria-label={isPlaying ? 'Detener conversación' : 'Reproducir conversación'}
          >
            {isPlaying ? <Pause class="h-4 w-4" /> : <Play class="h-4 w-4" />}
            {isPlaying ? 'Detener' : 'Reproducir conversación'}
          </button>
        </div>
      </div>

      <div class="space-y-3 rounded-3xl bg-base-200/70 p-4 sm:p-5">
        {lines.map((line, index) => (
          <DialogueBubble
            key={`${line.speaker}-${index}`}
            line={line}
            active={activeIndex === index}
            shadow={shadow?.index === index ? shadow : null}
            canRecognize={canRecognize}
            showEs={showEs}
            audioOnly={audioOnly}
            onPlay={() => void playLine(index)}
            onRepeat={() => void repeatLine(index)}
          />
        ))}
      </div>

      <p class="text-[11px] leading-relaxed text-base-content/35">
        {tAction(stage, 'dialogueTip')}
      </p>
    </div>
  )
}
