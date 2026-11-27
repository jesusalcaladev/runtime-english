import { Volume2 } from 'lucide-preact'
import { useState } from 'preact/hooks'
import type { MicroPost } from '../../data/posts'
import { progressStore } from '../../lib/progress'
import { speak } from '../../lib/speech'
import ExerciseRunner from '../exercise/ExerciseRunner'

interface Props {
  post: MicroPost
}

const KIND_LABEL: Record<MicroPost['kind'], string> = {
  tip: 'Tip',
  chunk: 'Chunk',
  real: 'Real',
}

/** Renderiza `en` resaltando los `highlights` (sin romper el texto). */
function renderHighlighted(text: string, highlights?: string[]) {
  if (!highlights?.length) return text
  const sorted = [...highlights].sort((a, b) => b.length - a.length)
  const parts: (string | { key: string; text: string })[] = [text]
  for (const phrase of sorted) {
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i]
      if (typeof part !== 'string') continue
      const index = part.toLowerCase().indexOf(phrase.toLowerCase())
      if (index === -1) continue
      const before = part.slice(0, index)
      const match = part.slice(index, index + phrase.length)
      const after = part.slice(index + phrase.length)
      parts.splice(i, 1, before, { key: `${phrase}-${i}`, text: match }, after)
      i += 1
    }
  }
  return parts.map((part, index) =>
    typeof part === 'string' ? (
      part
    ) : (
      <mark key={part.key + index} class="rounded bg-accent/15 px-0.5 text-base-content">
        {part.text}
      </mark>
    ),
  )
}

/** Micro-post estilo X integrado; practica y guarda frase sin salir. */
export default function MicroPostCard({ post }: Props) {
  const [practice, setPractice] = useState(false)

  return (
    <article class="rounded-2xl bg-base-200 p-4 ring-1 ring-base-content/[0.04]">
      <div class="flex items-center justify-between gap-2">
        <span class="rounded-full bg-base-100/70 px-2 py-0.5 text-[10px] text-base-content/55">
          {KIND_LABEL[post.kind]}
        </span>
        <div class="flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => speak(post.en, event.currentTarget)}
            class="flex h-8 w-8 items-center justify-center rounded-full text-base-content/45 transition hover:bg-base-300 hover:text-base-content"
            aria-label="Escuchar"
            title="Escuchar"
          >
            <Volume2 class="h-4 w-4" />
          </button>
        </div>
      </div>

      {post.title && <p class="mt-2 text-[13px] font-medium text-base-content/85">{post.title}</p>}

      <p class="mt-1.5 text-[14px] leading-relaxed text-base-content/85">
        {renderHighlighted(post.en, post.highlights)}
      </p>
      <p class="mt-1 text-[12px] leading-snug text-base-content/50">{post.es}</p>

      {post.note && <p class="mt-2 text-[11px] leading-snug text-base-content/45">{post.note}</p>}

      {post.source && (
        <p class="mt-2 text-[10px] text-base-content/40">
          {post.source.name}
          {post.source.attribution ? ` · ${post.source.attribution}` : ''}
          {post.source.url ? ' · ' : ''}
          {post.source.url && (
            <a
              href={post.source.url}
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-base-content/70"
            >
              origen
            </a>
          )}
        </p>
      )}

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => progressStore.savePhrase(post.en, post.es, 'Post')}
          class="rounded-full bg-base-100/70 px-3 py-1.5 text-[11px] text-base-content/60 transition hover:bg-base-300 hover:text-base-content"
        >
          Guardar frase
        </button>
        {post.check && !practice && (
          <button
            type="button"
            onClick={() => setPractice(true)}
            class="rounded-full bg-accent/12 px-3 py-1.5 text-[11px] font-medium text-accent transition hover:bg-accent/20"
          >
            Practicar
          </button>
        )}
      </div>

      {practice && post.check && (
        <div class="mt-4 border-t border-base-content/[0.06] pt-4">
          <ExerciseRunner
            sessionId={`post-${post.id}`}
            sessionTitle={post.title ?? 'Post'}
            exercises={[post.check]}
            next={null}
            level={post.level}
          />
        </div>
      )}
    </article>
  )
}
