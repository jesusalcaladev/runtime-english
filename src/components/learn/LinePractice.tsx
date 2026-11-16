import { Check, PenLine, X } from 'lucide-preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { VideoCue } from '../../data/learningResources'
import { tAction } from '../../lib/i18n'

interface Props {
  cue: VideoCue | null
  stage: 'es' | 'mixed' | 'en'
}

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
}

/** Rellena el hueco con el fragmento resaltado de la línea que suena ahora. */
export default function LinePractice({ cue, stage }: Props) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'right' | 'wrong'>('idle')

  const phrase = cue?.highlight?.[0]?.trim() ?? ''
  const prompt = useMemo(() => {
    if (!cue || !phrase) return ''
    const index = cue.en.toLowerCase().indexOf(phrase.toLowerCase())
    if (index < 0) return cue.en
    return `${cue.en.slice(0, index)}______${cue.en.slice(index + phrase.length)}`
  }, [cue, phrase])

  useEffect(() => {
    setValue('')
    setStatus('idle')
  }, [cue?.start])

  if (!cue || !phrase) return null

  function check() {
    if (!value.trim()) return
    setStatus(normalize(value) === normalize(phrase) ? 'right' : 'wrong')
  }

  return (
    <div class="rounded-2xl bg-base-100/60 p-3.5 ring-1 ring-accent/10">
      <div class="flex items-center gap-2">
        <PenLine class="h-3.5 w-3.5 text-accent/80" />
        <p class="mono-label text-accent/80">{tAction(stage, 'linePractice')}</p>
      </div>
      <p class="mt-2 rounded-lg bg-base-100 px-3 py-2 text-[13px] leading-relaxed text-base-content/85">
        {prompt}
      </p>
      {cue.es && <p class="mt-1 text-[11px] text-base-content/50">{cue.es}</p>}
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={value}
          onInput={(event) => {
            setValue((event.target as HTMLInputElement).value)
            if (status !== 'idle') setStatus('idle')
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') check()
          }}
          placeholder={tAction(stage, 'linePracticePlaceholder')}
          aria-label={tAction(stage, 'linePracticePlaceholder')}
          class="min-w-0 flex-1 rounded-lg bg-base-100 px-3 py-2 text-[12px] text-base-content/85 outline-none ring-1 ring-base-content/10 placeholder:text-base-content/35 focus:ring-accent/40"
        />
        <button
          type="button"
          onClick={check}
          disabled={!value.trim()}
          class="btn btn-sm btn-primary rounded-xl disabled:opacity-30"
        >
          {tAction(stage, 'check')}
        </button>
      </div>
      {status === 'right' && (
        <p class="mt-2 flex items-center gap-1.5 text-[11px] text-success">
          <Check class="h-3.5 w-3.5" /> {tAction(stage, 'linePracticeRight')}
        </p>
      )}
      {status === 'wrong' && (
        <p class="mt-2 flex items-center gap-1.5 text-[11px] text-error">
          <X class="h-3.5 w-3.5" /> {tAction(stage, 'linePracticeWrong')}{' '}
          <span class="font-mono text-accent">{phrase}</span>
        </p>
      )}
    </div>
  )
}
