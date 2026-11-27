import type { WordDiff } from '../../../lib/speech'

interface Props {
  diff: WordDiff
}

/** Word-by-word feedback for speaking practice. */
export default function WordDiffView({ diff }: Props) {
  if (diff.tokens.length === 0) return null
  return (
    <div class="space-y-1.5" aria-live="polite">
      <p class="hint-text">
        Palabras reconocidas ({Math.round(diff.score * 100)}%). Lo marcado como «omitido» no fue
        detectado por el micrófono.
      </p>
      <p class="flex flex-wrap gap-1 rounded-xl bg-base-100/70 p-2.5 font-mono text-[13px] leading-relaxed">
        {diff.tokens.map((token, index) => (
          <span
            key={`${token.word}-${index}`}
            class={
              token.status === 'match'
                ? 'rounded-md bg-accent/10 px-1.5 py-0.5 text-accent'
                : token.status === 'missed'
                  ? 'rounded-md bg-error/10 px-1.5 py-0.5 text-error line-through decoration-error/50'
                  : 'rounded-md bg-warning/10 px-1.5 py-0.5 text-warning'
            }
            title={
              token.status === 'missed'
                ? 'No reconocida'
                : token.status === 'extra'
                  ? 'Palabra extra'
                  : 'Reconocida'
            }
          >
            {token.word}
          </span>
        ))}
      </p>
      {diff.missing.length > 0 && (
        <p class="text-[11px] text-error/80">
          No detectadas: <span class="font-mono">{diff.missing.join(' · ')}</span>
        </p>
      )}
      {diff.extra.length > 0 && (
        <p class="text-[11px] text-warning/80">
          Dichas de más: <span class="font-mono">{diff.extra.join(' · ')}</span>
        </p>
      )}
    </div>
  )
}
