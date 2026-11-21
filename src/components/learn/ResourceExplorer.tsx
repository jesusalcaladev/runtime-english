import { ExternalLink, Search } from 'lucide-preact'
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
            class="w-full bg-transparent text-[11px] text-base-content/80 outline-none placeholder:text-base-content/30"
          />
        </label>
      </div>

      <p class="font-mono text-[10px] text-base-content/35">
        {visible.length} recurso{visible.length === 1 ? '' : 's'}
      </p>

      {visible.length === 0 ? (
        <div class="rounded-2xl bg-base-200 p-6 text-center text-[13px] text-base-content/50">
          {tAction(stage, 'noResources')}
        </div>
      ) : (
        <div class="grid gap-3 sm:grid-cols-2">
          {visible.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              class="group rounded-2xl bg-base-200 p-4 ring-1 ring-base-content/[0.04] transition hover:bg-base-300/60 hover:ring-accent/20"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-[14px] font-medium text-base-content/85 group-hover:text-accent">
                    {resource.name}
                  </p>
                  <p class="mt-1 flex flex-wrap items-center gap-1.5">
                    <span class="rounded-full bg-base-100/70 px-2 py-0.5 text-[9px] text-base-content/45">
                      {resource.kind === 'youtube' ? 'YouTube' : 'Web'}
                    </span>
                    <span class="rounded-full bg-base-100/70 px-2 py-0.5 text-[9px] text-base-content/45">
                      {resource.level}
                    </span>
                    {resource.focus.map((tag) => (
                      <span
                        key={tag}
                        class="rounded-full bg-accent/[0.08] px-2 py-0.5 text-[9px] text-accent/75"
                      >
                        {tag}
                      </span>
                    ))}
                  </p>
                </div>
                <ExternalLink class="h-3.5 w-3.5 shrink-0 text-base-content/25 group-hover:text-accent" />
              </div>
              <p class="mt-3 text-[12px] leading-relaxed text-base-content/60">
                {resource.description}
              </p>
              <p class="mt-2 rounded-xl bg-base-100/60 px-3 py-2 text-[11px] leading-relaxed text-base-content/50">
                <span class="font-medium text-accent/75">Consejo: </span>
                {resource.tip}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
