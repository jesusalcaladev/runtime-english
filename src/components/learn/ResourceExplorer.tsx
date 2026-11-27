import { ChevronDown, ExternalLink, Search } from 'lucide-preact'
import { useMemo, useState } from 'preact/hooks'
import type { LearningResource } from '../../data/learningResources'
import { useUiStage } from '../../hooks/useUiStage'
import { tAction } from '../../lib/i18n'

type KindFilter = 'all' | LearningResource['kind']
type LevelFilter = 'all' | LearningResource['level']

const KIND_OPTIONS: { value: KindFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'web', label: 'Web' },
]

const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'Cualquier nivel' },
  { value: 'A1-A2', label: 'A1-A2' },
  { value: 'B1-B2', label: 'B1-B2' },
  { value: 'C1-C2', label: 'C1-C2' },
  { value: 'Todos', label: 'Todos los niveles' },
]

function chipClass(active: boolean): string {
  return `h-8 rounded-full px-3 text-[11px] transition ${
    active
      ? 'bg-accent/12 font-medium text-accent'
      : 'bg-base-200 text-base-content/55 hover:text-base-content'
  }`
}

interface Props {
  resources: LearningResource[]
}

export default function ResourceExplorer({ resources }: Props) {
  const stage = useUiStage()
  const [kind, setKind] = useState<KindFilter>('all')
  const [level, setLevel] = useState<LevelFilter>('all')
  const [query, setQuery] = useState('')
  const [showTips, setShowTips] = useState(false)

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return resources.filter((resource) => {
      if (kind !== 'all' && resource.kind !== kind) return false
      if (level !== 'all' && resource.level !== level) return false
      if (!needle) return true
      return [resource.name, resource.description, resource.tip, ...resource.focus]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [resources, kind, level, query])

  return (
    <div class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        {KIND_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setKind(option.value)}
            aria-pressed={kind === option.value}
            class={chipClass(kind === option.value)}
          >
            {option.label}
          </button>
        ))}
        <span class="mx-1 hidden h-4 w-px bg-base-content/10 sm:block" />
        {LEVEL_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setLevel(option.value)}
            aria-pressed={level === option.value}
            class={chipClass(level === option.value)}
          >
            {option.label}
          </button>
        ))}
        <label class="ml-auto flex h-8 min-w-[180px] items-center gap-2 rounded-full bg-base-200 px-3">
          <Search class="h-3.5 w-3.5 text-base-content/35" />
          <input
            type="search"
            value={query}
            onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
            placeholder={tAction(stage, 'filterResources')}
            aria-label={tAction(stage, 'filterResources')}
            class="w-full bg-transparent text-[12px] text-base-content/85 outline-none placeholder:text-base-content/50"
          />
        </label>
      </div>

      <div class="rounded-2xl bg-base-200/70">
        <button
          type="button"
          onClick={() => setShowTips((value) => !value)}
          aria-expanded={showTips}
          class="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-left text-[12px] font-medium text-base-content/70"
        >
          Cómo aprovechar estos recursos
          <ChevronDown
            class={`h-4 w-4 text-base-content/45 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${showTips ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {showTips && (
          <ul class="hint-text list-disc space-y-1 px-5 pb-3">
            {visible.map((resource) => (
              <li key={resource.id}>
                <span class="font-medium text-base-content/75">{resource.name}:</span>{' '}
                {resource.tip}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p class="hint-text font-mono">
        {visible.length} recurso{visible.length === 1 ? '' : 's'}
      </p>

      {visible.length === 0 ? (
        <div class="rounded-2xl bg-base-200 p-6 text-center text-[13px] text-base-content/50">
          {tAction(stage, 'noResources')}
        </div>
      ) : (
        <div class="grid gap-2 sm:grid-cols-2">
          {visible.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-start justify-between gap-3 rounded-xl bg-base-200 p-3 ring-1 ring-base-content/[0.04] transition hover:bg-base-300/60 hover:ring-accent/20"
            >
              <div class="min-w-0">
                <p class="flex items-center gap-1.5 text-[13px] font-medium text-base-content/85 group-hover:text-accent">
                  <span class="truncate">{resource.name}</span>
                  <span class="shrink-0 rounded-full bg-base-100/70 px-1.5 py-0.5 text-[9px] font-normal text-base-content/50">
                    {resource.kind === 'youtube' ? 'YouTube' : 'Web'}
                  </span>
                </p>
                <p class="mt-1 line-clamp-2 text-[11px] leading-snug text-base-content/55">
                  {resource.description}
                </p>
              </div>
              <ExternalLink class="mt-0.5 h-3.5 w-3.5 shrink-0 text-base-content/25 group-hover:text-accent" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
