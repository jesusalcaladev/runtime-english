import { Lightbulb, Mic, Settings, Volume2 } from 'lucide-preact'
import { openAppSettings } from '../../../lib/appSettings'
import type { WordDiff } from '../../../lib/speech'
import type { ShadowExercise } from '../../../lib/types'
import WordDiffView from './WordDiffView'

interface Props {
  exercise: ShadowExercise
  disabled: boolean
  micSupported: boolean
  micState: 'idle' | 'listening' | 'done'
  liveText: string
  heardText: string
  score: number | null
  diff: WordDiff | null
  wpm: number | null
  micError: string | null
  text: string
  onMicClick(): void
  onText(value: string): void
}

export default function ShadowInput({
  exercise,
  disabled,
  micSupported,
  micState,
  liveText,
  heardText,
  score,
  diff,
  wpm,
  micError,
  text,
  onMicClick,
  onText,
}: Props) {
  return (
    <div class="mt-5 space-y-3">
      <div class="rounded-2xl bg-base-200/70 p-4">
        <p class="text-[11px] font-medium text-base-content/45">
          Escucha el chunk y repítelo en voz alta, con el mismo ritmo:
        </p>
        <p class="mt-1.5 font-mono text-[15px] leading-relaxed text-base-content/85">
          {exercise.answer}
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            data-speak={exercise.answer}
            class="btn btn-sm h-10 cursor-pointer gap-2 rounded-xl bg-base-100 transition hover:bg-base-200 active:scale-[0.99]"
            aria-label={`Escuchar modelo: ${exercise.answer}`}
          >
            <Volume2 class="h-4 w-4" aria-hidden="true" /> Escuchar modelo
          </button>
          {micSupported ? (
            <button
              type="button"
              onClick={onMicClick}
              disabled={disabled}
              aria-pressed={micState === 'listening'}
              aria-busy={micState === 'listening'}
              class={`btn btn-sm h-10 gap-2 rounded-xl ${micState === 'listening' ? 'bg-error/15 text-error' : 'bg-accent/15 text-accent'}`}
            >
              <Mic class="h-4 w-4" aria-hidden="true" />
              {micState === 'listening' ? 'Detener' : 'Repetir con micrófono'}
            </button>
          ) : (
            <span class="hidden self-center text-[11px] text-base-content/40 sm:inline">
              Reconocimiento de voz no disponible. Puedes escribir lo que dices.
            </span>
          )}
        </div>
      </div>

      <div aria-live="polite" class="space-y-1">
        {micState === 'listening' && (
          <p class="text-[12px] text-accent/90">
            Escuchando…{' '}
            {liveText ? (
              <span class="font-mono text-base-content/80">{liveText}</span>
            ) : (
              'habla ahora.'
            )}
          </p>
        )}
        {heardText && (
          <p class="text-[12px] text-base-content/60">
            Detectado: <span class="font-mono text-base-content/80">{heardText}</span>
          </p>
        )}
        {score !== null && (
          <p class="text-[12px] text-base-content/55">
            Coincidencia:{' '}
            <span class={`font-mono ${score >= 0.72 ? 'text-success' : 'text-warning'}`}>
              {Math.round(score * 100)}%
            </span>
          </p>
        )}
        {diff && <WordDiffView diff={diff} />}
        {wpm !== null && (
          <p class="text-[12px] text-base-content/55">
            Ritmo: <span class="font-mono text-accent">{wpm} palabras/min</span>
          </p>
        )}
        {micError && (
          <p class="text-[12px] text-error/80" role="status">
            {micError}
          </p>
        )}
        {micError && /denegad|permiso/i.test(micError) && (
          <button
            type="button"
            onClick={() => void openAppSettings()}
            class="btn btn-xs h-7 gap-1.5 rounded-lg bg-base-100 px-2.5 text-[11px] text-base-content/70 transition hover:text-base-content"
          >
            <Settings class="h-3 w-3" aria-hidden="true" /> Abrir ajustes
          </button>
        )}
      </div>

      <textarea
        value={text}
        disabled={disabled}
        onInput={(event) => {
          onText((event.target as HTMLTextAreaElement).value)
        }}
        rows={2}
        placeholder="O escribe aquí lo que repetiste…"
        aria-label="Escribe lo que repetiste"
        class="w-full resize-none rounded-2xl bg-base-200 px-4 py-3.5 font-mono text-sm text-base-content placeholder:text-base-content/25 disabled:opacity-70"
        spellcheck={false}
      />
      {exercise.hint && (
        <p class="flex items-center gap-1.5 px-1 text-[12px] text-base-content/55">
          <Lightbulb class="h-3 w-3 text-warning/70" />
          {exercise.hint}
        </p>
      )}
    </div>
  )
}
