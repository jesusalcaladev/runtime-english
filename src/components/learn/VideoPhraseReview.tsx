import { Brain, Check, RotateCcw, X } from 'lucide-preact'
import { useMemo, useState } from 'preact/hooks'
import type { VideoCue } from '../../data/learningResources'
import { useUiStage } from '../../hooks/useUiStage'
import { tAction } from '../../lib/i18n'
import { type PhrasebookEntry, phraseId, progressStore } from '../../lib/progress'
import { useProgress } from '../../lib/useProgress'
import SavePhraseButton from '../session/SavePhraseButton'

interface Props {
  cues: VideoCue[]
}

export default function VideoPhraseReview({ cues }: Props) {
  const state = useProgress()
  const stage = useUiStage()
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  const videoPhrases = useMemo(() => {
    const texts = new Set(cues.map((cue) => cue.en.trim()))
    return (Object.values(state.phrasebook ?? {}) as PhrasebookEntry[]).filter(
      (entry) => entry.source === 'VideoLab' && texts.has(entry.en.trim()),
    )
  }, [state.phrasebook, cues])

  const card = videoPhrases[index]
  const done = index >= videoPhrases.length

  function answer(correct: boolean) {
    if (!card) return
    progressStore.reviewPhrase(phraseId(card.en), correct)
    setReviewed((value) => value + 1)
    setRevealed(false)
    setIndex((value) => value + 1)
  }

  function restart() {
    setIndex(0)
    setRevealed(false)
    setReviewed(0)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={videoPhrases.length === 0}
        class="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-accent/10 px-3 text-[11px] font-medium text-accent transition hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
        title={
          videoPhrases.length === 0
            ? 'Guarda frases del video con el marcador para poder repasarlas'
            : 'Repasar con repetición espaciada'
        }
      >
        <Brain class="h-3.5 w-3.5" />
        {tAction(stage, 'practiceSaved')} ({videoPhrases.length})
      </button>
    )
  }

  return (
    <div class="mt-3 rounded-2xl bg-base-200 p-4 ring-1 ring-accent/15">
      <div class="flex items-center justify-between gap-2">
        <p class="mono-label text-accent/80">{tAction(stage, 'reviewVideoLab')}</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          class="flex h-7 w-7 items-center justify-center rounded-full text-base-content/40 transition hover:bg-base-100 hover:text-base-content"
          aria-label={tAction(stage, 'closeReview')}
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>

      {videoPhrases.length === 0 ? (
        <p class="mt-2 text-[12px] leading-relaxed text-base-content/60">
          {tAction(stage, 'savedPhrasesTip')}
        </p>
      ) : done ? (
        <div class="mt-2 text-center">
          <p class="text-[13px] text-base-content/80">
            {tAction(stage, 'reviewedCount')} {reviewed}{' '}
            {reviewed === 1 ? tAction(stage, 'phraseSingular') : tAction(stage, 'phrasesPlural')}{' '}
            {tAction(stage, 'fromThisVideo')}.
          </p>
          <button
            type="button"
            onClick={restart}
            class="btn btn-sm mt-2 gap-1.5 rounded-xl bg-base-100"
          >
            <RotateCcw class="h-3.5 w-3.5" /> {tAction(stage, 'repeatTest')}
          </button>
        </div>
      ) : (
        <div class="mt-3 space-y-3">
          <p class="font-mono text-[10px] text-base-content/35">
            {index + 1} / {videoPhrases.length}
          </p>
          <p class="rounded-xl bg-base-100 px-4 py-3 font-mono text-[14px] text-base-content/90">
            {card.en}
          </p>
          {revealed && (
            <p class="rounded-xl bg-accent/[0.07] px-4 py-3 text-[13px] text-base-content/75">
              {card.es}
            </p>
          )}
          <div class="flex flex-wrap items-center gap-2">
            {!revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                class="btn btn-sm btn-primary rounded-xl"
              >
                {tAction(stage, 'showTranslation')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => answer(false)}
                  class="btn btn-sm gap-1.5 rounded-xl bg-error/10 text-error"
                >
                  <X class="h-3.5 w-3.5" /> {tAction(stage, 'missedIt')}
                </button>
                <button
                  type="button"
                  onClick={() => answer(true)}
                  class="btn btn-sm gap-1.5 rounded-xl bg-accent/15 text-accent"
                >
                  <Check class="h-3.5 w-3.5" /> {tAction(stage, 'gotIt')}
                </button>
              </>
            )}
            <SavePhraseButton en={card.en} es={card.es} source="VideoLab" />
          </div>
        </div>
      )}
    </div>
  )
}
