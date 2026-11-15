import { useMemo, useState } from "preact/hooks";
import { ArrowRight, BookOpen, Code2, MessageSquareText, Search, Sparkles } from "lucide-preact";

interface SearchItem {
  kind: "session" | "vocab" | "phrase" | "slang" | "exercise";
  title: string;
  body: string;
  href: string;
  meta: string;
}

interface Props {
  items: SearchItem[];
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const kindMeta = {
  session: { label: "Sesión", icon: BookOpen },
  vocab: { label: "Vocabulario", icon: Code2 },
  phrase: { label: "Frase", icon: MessageSquareText },
  slang: { label: "Slang", icon: Sparkles },
  exercise: { label: "Ejercicio", icon: Code2 },
} as const;

export default function SearchView({ items }: Props) {
  const [query, setQuery] = useState("");

  const indexed = useMemo(
    () =>
      items.map((item) => ({
        item,
        haystack: normalize(`${item.title} ${item.body} ${item.meta}`),
      })),
    [items],
  );

  const results = useMemo(() => {
    const q = normalize(query);
    if (q.length < 2) return [];
    const terms = q.split(" ").filter(Boolean);
    const scored = indexed
      .map(({ item, haystack }) => {
        if (!terms.every((term) => haystack.includes(term))) return null;
        let score = 0;
        const title = normalize(item.title);
        for (const term of terms) {
          if (title.includes(term)) score += 3;
          if (haystack.includes(term)) score += 1;
        }
        return { item, score };
      })
      .filter((entry): entry is { item: SearchItem; score: number } => Boolean(entry))
      .sort((a, b) => b.score - a.score)
      .slice(0, 60);
    return scored.map((entry) => entry.item);
  }, [indexed, query]);

  return (
    <div class="mx-auto max-w-[920px] animate-fade-up">
      <section>
        <p class="mono-label flex items-center gap-2">
          <Search class="h-3.5 w-3.5 text-accent" />
          Buscar
        </p>
        <h1 class="font-pixel mt-3 text-[2.2rem] leading-[1.05] tracking-tight sm:text-[2.85rem]">
          Encuentra lo que necesitas
        </h1>
        <p class="mt-3 hidden max-w-2xl text-sm leading-7 text-base-content/55 sm:block">
          Busca en sesiones, vocabulario, frases, ejercicios y slang.
        </p>
      </section>

      <div class="mt-6 rounded-2xl bg-base-200 p-2">
        <label class="flex items-center gap-3 rounded-xl bg-base-100 px-4 py-3">
          <Search class="h-4 w-4 text-base-content/35" />
          <input
            type="search"
            value={query}
            onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
            placeholder="Ej. pull request, deployment, bug, async, rizz..."
            class="w-full bg-transparent text-sm outline-none placeholder:text-base-content/30"
            autoFocus
          />
        </label>
      </div>

      <div class="mt-6">
        {query.trim().length < 2 ? (
          <div class="rounded-2xl bg-base-200/60 px-4 py-7 text-center sm:px-5 sm:py-8">
            <p class="text-sm text-base-content/45">Empieza a escribir para ver resultados.</p>
          </div>
        ) : results.length === 0 ? (
          <div class="rounded-2xl bg-base-200/60 px-4 py-7 text-center sm:px-5 sm:py-8">
            <p class="text-sm text-base-content/55">Sin resultados para "{query}".</p>
            <p class="mt-1 text-xs text-base-content/35">Prueba con otra palabra o en inglés/español.</p>
          </div>
        ) : (
          <div class="space-y-2">
            <p class="px-1 text-[11px] text-base-content/40">{results.length} resultados</p>
            {results.map((item, index) => {
              const meta = kindMeta[item.kind];
              const Icon = meta.icon;
              return (
                <a
                  key={`${item.href}-${item.title}-${index}`}
                  href={item.href}
                  class="group flex items-start justify-between gap-4 rounded-2xl bg-base-200/70 px-4 py-4 transition hover:bg-base-200"
                >
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="inline-flex items-center gap-1.5 rounded-full bg-base-100 px-2.5 py-1 text-[10px] font-medium text-base-content/55">
                        <Icon class="h-3 w-3" />
                        {meta.label}
                      </span>
                      <span class="hidden truncate text-[10px] text-base-content/35 sm:inline">{item.meta}</span>
                    </div>
                    <p class="mt-2 text-sm font-medium text-base-content/85">{item.title}</p>
                    <p class="mt-1 line-clamp-2 text-xs leading-5 text-base-content/45">{item.body}</p>
                  </div>
                  <ArrowRight class="mt-1 h-4 w-4 shrink-0 text-base-content/20 transition group-hover:translate-x-0.5 group-hover:text-accent/70" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
