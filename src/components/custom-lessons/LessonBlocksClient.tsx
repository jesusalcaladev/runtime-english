import {
  CircleCheckBig,
  Info,
  Languages,
  Lightbulb,
  Table2,
  Terminal,
  TriangleAlert,
  Volume2,
} from 'lucide-preact'
import { getSlang } from '../../data/slang'
import { speak } from '../../lib/speech'
import type { ContentBlock } from '../../lib/types'
import DialogueScene from '../session/DialogueScene'
import SavePhraseButton from '../session/SavePhraseButton'

interface Props {
  blocks: ContentBlock[]
}

function SpeakBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => void speak(text)}
      class={`inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-base-100/80 px-3 text-[11px] font-medium text-base-content/55 transition hover:bg-base-100 hover:text-base-content hover:shadow-sm active:scale-[0.98] ${label ? 'min-w-[2.5rem]' : 'w-10 px-0'}`}
      aria-label={label ? `Escuchar: ${text}` : `Escuchar en inglés: ${text}`}
      title={label ? `Escuchar: ${label}` : 'Escuchar en inglés'}
    >
      <Volume2 class="h-4 w-4" aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </button>
  )
}

export default function LessonBlocksClient({ blocks }: Props) {
  return (
    <div class="space-y-8">
      <div class="mb-2 flex flex-wrap items-center gap-2 rounded-2xl bg-accent/[0.06] px-4 py-3 text-[12px] leading-relaxed text-base-content/65 ring-1 ring-accent/10">
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/12 text-accent">
          <Lightbulb class="h-3.5 w-3.5" />
        </span>
        <span>
          <span class="font-medium text-base-content/80">Lección personalizada:</span> usa{' '}
          <span class="font-medium">Escuchar</span> y <span class="font-medium">Guardar</span> para
          practicar.
        </span>
      </div>

      {blocks.map((block, idx) => (
        <section key={`${block.type}-${idx}`}>
          {block.type === 'dialogue' && (
            <DialogueScene title={block.title} context={block.context} lines={block.lines} />
          )}

          {block.type === 'technique' && (
            <div class="relative overflow-hidden rounded-3xl bg-accent/[0.06] p-5 sm:p-6">
              <div class="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-accent/[0.08] blur-2xl" />
              <div class="relative flex gap-4">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Lightbulb class="h-5 w-5" />
                </span>
                <div class="space-y-2">
                  <p class="mono-label text-accent/85">Técnica clave</p>
                  <h3 class="text-[17px] font-semibold tracking-tight text-base-content/90">
                    {block.name}
                  </h3>
                  <p class="max-w-3xl text-[15px] leading-7 text-base-content/75">{block.desc}</p>
                </div>
              </div>
            </div>
          )}

          {block.type === 'text' && (
            <div class="space-y-2.5">
              {block.title ? (
                <h3 class="text-[17px] font-semibold tracking-tight text-base-content/90">
                  {block.title}
                </h3>
              ) : null}
              <p class="max-w-3xl whitespace-pre-wrap text-[15px] leading-7 text-base-content/75">
                {block.body}
              </p>
            </div>
          )}

          {block.type === 'vocab' && (
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <Languages class="h-4 w-4 text-accent" />
                <h3 class="text-[17px] font-semibold tracking-tight text-base-content/90">
                  {block.title ?? 'Vocabulario'}
                </h3>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                {block.items.map((item, itemIdx) => (
                  <div
                    key={`${item.en}-${itemIdx}`}
                    class="group rounded-2xl bg-base-200 p-4 sm:p-5 transition hover:bg-base-300/60"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0 flex-1">
                        <div class="inline-flex max-w-full items-center rounded-lg bg-accent/[0.08] px-2.5 py-1.5 ring-1 ring-accent/15">
                          <p class="font-mono text-[15px] font-semibold tracking-tight text-base-content">
                            {item.en}
                          </p>
                        </div>
                        <p class="mt-2 text-[13px] leading-relaxed text-base-content/70">
                          <span class="font-medium text-base-content/45">ES: </span>
                          {item.es}
                        </p>
                      </div>
                      <div class="flex shrink-0 items-center gap-1">
                        <SavePhraseButton
                          en={item.en}
                          es={item.example ? `${item.es} · Ejemplo: ${item.example}` : item.es}
                          source="Lección personalizada"
                        />
                        <SpeakBtn text={item.example ?? item.en} />
                      </div>
                    </div>
                    {item.example ? (
                      <div class="mt-3.5 rounded-xl bg-base-100/80 px-3.5 py-3">
                        <p class="mono-label mb-1 text-accent/70">Ejemplo</p>
                        <p class="font-mono text-[14px] leading-relaxed text-base-content/90">
                          {item.example}
                        </p>
                        {item.note ? (
                          <p class="mt-1.5 text-[12px] leading-relaxed text-base-content/60">
                            {item.note}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {block.type === 'phrases' && (
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <Terminal class="h-4 w-4 text-accent" />
                <h3 class="text-[17px] font-semibold tracking-tight text-base-content/90">
                  {block.title ?? 'Frases útiles'}
                </h3>
              </div>
              <div class="space-y-2">
                {block.items.map((item, itemIdx) => (
                  <div
                    key={`${item.en}-${itemIdx}`}
                    class="flex flex-col gap-3 rounded-2xl bg-base-200 p-4 transition hover:bg-base-300/50 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div class="min-w-0 flex-1 space-y-2">
                      <div class="inline-flex max-w-full items-start rounded-xl bg-base-100/80 px-3.5 py-2.5 ring-1 ring-accent/10">
                        <p class="font-mono text-[15px] font-medium leading-relaxed text-base-content">
                          <span class="mr-1.5 text-accent/60">EN</span>
                          {item.en}
                        </p>
                      </div>
                      <p class="text-[13px] leading-relaxed text-base-content/70">
                        <span class="font-medium text-base-content/45">Significado: </span>
                        {item.es}
                      </p>
                    </div>
                    <div class="flex shrink-0 items-center gap-1">
                      <SavePhraseButton en={item.en} es={item.es} source="Lección personalizada" />
                      <SpeakBtn text={item.en} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {block.type === 'table' && (
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <Table2 class="h-4 w-4 text-accent" />
                <h3 class="text-[17px] font-semibold tracking-tight text-base-content/90">
                  {block.title ?? 'Referencia'}
                </h3>
              </div>
              <div class="overflow-x-auto rounded-2xl bg-base-200 p-1.5">
                <table class="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr class="bg-base-100/70">
                      {block.columns.map((column) => (
                        <th
                          key={column}
                          class="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] font-semibold tracking-wide text-base-content/60"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        class="border-t border-base-100/50 transition hover:bg-base-100/40"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            class={`px-4 py-3.5 align-top text-[14px] leading-relaxed ${cellIndex === 0 ? 'font-mono font-medium text-base-content/90' : 'text-base-content/70'}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {block.type === 'tenses' && (
            <div class="grid gap-3 md:grid-cols-2">
              {block.items.map((tense, tenseIdx) => (
                <div key={`${tense.name}-${tenseIdx}`} class="rounded-2xl bg-base-200 p-5">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 class="text-sm font-medium">{tense.name}</h3>
                      <p class="mt-1 text-[12px] text-base-content/55">{tense.tag}</p>
                    </div>
                    <span class="rounded-full bg-base-100/60 px-2.5 py-1 font-mono text-[10px] font-medium text-base-content/55">
                      {tense.formula}
                    </span>
                  </div>
                  <ul class="mt-4 space-y-2">
                    {tense.cases.map((example, caseIdx) => (
                      <li
                        key={caseIdx}
                        class="flex items-start gap-2 text-[13px] leading-relaxed text-base-content/70"
                      >
                        <span class="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {block.type === 'callout' && (
            <div
              class={`flex gap-3.5 rounded-2xl p-4 sm:p-4.5 ${block.tone === 'warning' ? 'bg-warning/[0.08]' : block.tone === 'info' ? 'bg-info/[0.07]' : 'bg-accent/[0.06]'}`}
            >
              <span
                class={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${block.tone === 'warning' ? 'bg-warning/12 text-warning' : block.tone === 'info' ? 'bg-info/12 text-info' : 'bg-accent/12 text-accent'}`}
              >
                {block.tone === 'warning' ? (
                  <TriangleAlert class="h-4 w-4" />
                ) : block.tone === 'info' ? (
                  <Info class="h-4 w-4" />
                ) : (
                  <CircleCheckBig class="h-4 w-4" />
                )}
              </span>
              <div class="space-y-1.5">
                <p class="text-[14px] font-semibold text-base-content/90">{block.title}</p>
                <p class="text-[14px] leading-relaxed text-base-content/75">{block.body}</p>
              </div>
            </div>
          )}

          {block.type === 'slang' && (
            <div class="space-y-3 rounded-2xl bg-base-200 p-4">
              <h3 class="text-[15px] font-medium tracking-tight">{block.title ?? 'Slang'}</h3>
              <div class="grid gap-2 sm:grid-cols-2">
                {block.ids.map((id) => {
                  const entry = getSlang(id)
                  if (!entry) {
                    return (
                      <div
                        key={id}
                        class="rounded-xl bg-base-100/60 p-3 text-[12px] text-base-content/50"
                      >
                        Slang: {id}
                      </div>
                    )
                  }
                  return (
                    <div key={id} class="rounded-xl bg-base-100/60 p-3">
                      <p class="font-mono text-sm font-medium">{entry.term}</p>
                      <p class="mt-1 text-[12px] text-base-content/65">{entry.meaningEs}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
