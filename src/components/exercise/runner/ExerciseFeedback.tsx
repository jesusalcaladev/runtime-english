import { BookText, Check, Tag, Volume2, X } from 'lucide-preact'
import { type ErrorSkill, skillLabel } from '../../../lib/errorPatterns'
import type { UiStage } from '../../../lib/i18n'
import { tAction } from '../../../lib/i18n'
import type { PhrasebookEntry } from '../../../lib/progress'
import { route } from '../../../lib/routes'
import MiniDrill from './MiniDrill'
import type { RunnerStatus } from './utils'

interface Props {
  stage: UiStage
  status: RunnerStatus
  correctAnswerText: string
  explanation: string
  detectedSkills: ErrorSkill[]
  showPhraseHint: boolean
  phraseEntry?: PhrasebookEntry
  drillSkill?: ErrorSkill
}

export function ExerciseFeedback({
  stage,
  status,
  correctAnswerText,
  explanation,
  detectedSkills,
  showPhraseHint,
  phraseEntry,
  drillSkill,
}: Props) {
  return (
    <div
      class={`mt-5 space-y-2.5 rounded-2xl p-4 ${status === 'correct' ? 'bg-accent/[0.07]' : 'bg-error/[0.06]'}`}
    >
      <div class="flex items-center justify-between gap-2">
        <p
          class={`flex items-center gap-1.5 text-xs font-semibold ${status === 'correct' ? 'text-accent' : 'text-error'}`}
        >
          {status === 'correct' ? (
            <>
              <Check class="h-3.5 w-3.5" /> {tAction(stage, 'correct')}
            </>
          ) : (
            <>
              <X class="h-3.5 w-3.5" /> {tAction(stage, 'notYet')}
            </>
          )}
        </p>
        <button
          type="button"
          data-speak={correctAnswerText}
          class="speak-btn inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[10px] font-medium text-base-content/45 transition hover:bg-base-100/70 hover:text-base-content/80 active:scale-[0.98]"
          aria-label={`${tAction(stage, 'answer')}: ${correctAnswerText}`}
          title="Escuchar respuesta correcta"
        >
          <Volume2 class="h-3.5 w-3.5" aria-hidden="true" />
          {tAction(stage, 'answer')}
        </button>
      </div>
      <p class="text-[13px] leading-relaxed text-base-content/70">{explanation}</p>

      {status === 'correct' && (
        <p class="hidden items-center gap-1.5 text-[11px] leading-relaxed text-accent/80 sm:flex">
          <BookText class="h-3.5 w-3.5" /> Se guarda en tu diccionario para repasar con flashcards.
        </p>
      )}

      {status === 'incorrect' && (
        <div class="space-y-2 pt-0.5">
          <div>
            <p class="text-[11px] font-medium text-base-content/45">
              {tAction(stage, 'correctAnswer')}
            </p>
            <p class="mt-1 inline-flex rounded-lg bg-accent/[0.08] px-3 py-2 font-mono text-[13px] font-medium text-base-content/90 ring-1 ring-accent/15">
              {correctAnswerText}
            </p>
          </div>
          {detectedSkills.length > 0 && (
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[10px] font-medium text-base-content/45">Patrón:</span>
              {detectedSkills.slice(0, 2).map((skill) => (
                <span
                  key={skill}
                  class="rounded-full bg-base-100/80 px-2 py-0.5 text-[10px] font-medium text-error/80 ring-1 ring-error/10"
                >
                  {skillLabel(skill)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {showPhraseHint && phraseEntry && (
        <div class="mt-1 rounded-xl bg-base-100/70 p-3 ring-1 ring-accent/10">
          <div class="flex items-center justify-between gap-2">
            <p class="flex items-center gap-1.5 text-[11px] font-medium text-accent">
              <BookText class="h-3.5 w-3.5" /> De tu diccionario
            </p>
            <a
              href={route('/dictionary')}
              class="text-[10px] text-base-content/45 hover:text-base-content/70"
            >
              Abrir diccionario
            </a>
          </div>
          {phraseEntry.userExample && (
            <p class="mt-1.5 text-[12px] leading-relaxed text-base-content/70">
              <span class="font-medium text-base-content/45">Tu ejemplo: </span>
              <span class="font-mono">{phraseEntry.userExample}</span>
            </p>
          )}
          {phraseEntry.notes && (
            <p class="mt-1 hidden text-[12px] leading-relaxed text-base-content/60 sm:block">
              <span class="font-medium text-base-content/45">Nota: </span>
              {phraseEntry.notes}
            </p>
          )}
          {(phraseEntry.tags?.length ?? 0) > 0 && (
            <div class="mt-1.5 hidden flex-wrap gap-1 sm:flex">
              {phraseEntry.tags?.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  class="inline-flex items-center gap-1 rounded-full bg-base-200 px-2 py-0.5 text-[10px] text-base-content/50"
                >
                  <Tag class="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          {phraseEntry.difficulty === 'hard' && (
            <p class="mt-1.5 hidden rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-medium text-error sm:inline-flex">
              Marcada como difícil
            </p>
          )}
        </div>
      )}

      {drillSkill && status === 'incorrect' && (
        <div class="mt-2 border-t border-error/10 pt-2">
          <MiniDrill skill={drillSkill} />
        </div>
      )}
    </div>
  )
}
