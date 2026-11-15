import { useMemo, useState } from "preact/hooks";
import {
  Bookmark,
  BookmarkCheck,
  Bot,
  Globe,
  Search,
  Sparkles,
  Terminal,
  TriangleAlert,
  Users,
  Volume2,
  X,
} from "lucide-preact";
import type { SlangEntry } from "../../lib/types";
import { progressStore } from "../../lib/progress";
import { useProgress } from "../../lib/useProgress";

interface Props {
  entries: SlangEntry[];
}

const CATEGORIES = [
  { id: "all", label: "Todo", icon: Sparkles },
  { id: "ai", label: "IA & dev", icon: Bot },
  { id: "dev", label: "Día a día", icon: Terminal },
  { id: "work", label: "Reuniones", icon: Users },
  { id: "internet", label: "Internet", icon: Globe },
] as const;

export default function SlangExplorer({ entries }: Props) {
  const state = useProgress();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [onlySaved, setOnlySaved] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (category !== "all" && entry.category !== category) return false;
      if (onlySaved && !state.savedSlang.includes(entry.id)) return false;
      if (onlyNew && entry.status !== "2026") return false;
      if (!search) return true;
      return [entry.term, entry.meaningEs, entry.meaningEn, entry.example, entry.exampleEs]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [entries, query, category, onlySaved, onlyNew, state.savedSlang]);

  const newCount = entries.filter((entry) => entry.status === "2026").length;

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setOnlySaved(false);
    setOnlyNew(false);
  }

  return (
    <div class="space-y-5">
      <div class="rounded-3xl bg-base-200 p-3 sm:p-4">
        <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <label class="relative block w-full lg:max-w-md">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/25" />
            <input
              type="search"
              value={query}
              onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
              placeholder="Busca vibe coding, cooked, workslop…"
              class="h-10 w-full rounded-xl bg-base-100 pl-10 pr-9 text-sm text-base-content placeholder:text-base-content/25"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                class="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-base-content/25 transition hover:bg-base-300 hover:text-base-content/60"
                aria-label="Limpiar búsqueda"
              >
                <X class="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          <div class="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOnlyNew((value) => !value)}
              class={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium transition ${
                onlyNew
                  ? "bg-accent/12 text-accent"
                  : "text-base-content/45 hover:bg-base-300/70 hover:text-base-content/70"
              }`}
            >
              <Sparkles class="h-3 w-3" />
              <span class="hidden sm:inline">Solo 2026</span><span class="sm:hidden">2026</span>
              <span class="hidden font-mono text-[9px] opacity-60 sm:inline">{newCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setOnlySaved((value) => !value)}
              class={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium transition ${
                onlySaved
                  ? "bg-accent text-accent-content shadow-sm"
                  : "bg-base-100 text-base-content/70 hover:bg-base-300/70 hover:text-base-content"
              }`}
              aria-pressed={onlySaved}
            >
              {onlySaved ? <BookmarkCheck class="h-3.5 w-3.5" /> : <Bookmark class="h-3.5 w-3.5" />}
              <span class="hidden sm:inline">Mis guardados</span><span class="sm:hidden">Guardados</span>
              <span class={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${onlySaved ? "bg-accent-content/15" : "bg-base-200 text-base-content/60"}`}>
                {state.savedSlang.length}
              </span>
            </button>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-1">
          {CATEGORIES.map((item) => {
            const count =
              item.id === "all"
                ? entries.length
                : entries.filter((entry) => entry.category === item.id).length;
            const active = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                class={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                  active
                    ? "bg-base-100 text-base-content"
                    : "text-base-content/40 hover:bg-base-300/60 hover:text-base-content/65"
                }`}
              >
                <item.icon class="h-3 w-3" />
                {item.label}
                <span class="hidden font-mono text-[9px] opacity-50 sm:inline">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {state.savedSlang.length > 0 && !onlySaved && (
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-accent/[0.07] px-4 py-3">
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <BookmarkCheck class="h-4 w-4" />
            </span>
            <div>
              <p class="text-[13px] font-medium text-base-content/85">Tus términos guardados</p>
              <p class="hidden text-[11px] text-base-content/50 sm:block">
                {state.savedSlang.length} guardado{state.savedSlang.length === 1 ? "" : "s"} · se actualiza cuando marcas términos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOnlySaved(true)}
            class="rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-medium text-accent-content transition hover:opacity-90"
          >
            Ver mis guardados
          </button>
        </div>
      )}

      {onlySaved && (
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-base-200 px-4 py-3">
          <p class="text-[13px] text-base-content/70">
            <span class="sm:hidden">Guardados ({filtered.length})</span>
            <span class="hidden sm:inline">Mostrando tu lista personal de slang guardado ({filtered.length}).</span>
          </p>
          <button
            type="button"
            onClick={() => setOnlySaved(false)}
            class="rounded-full bg-base-100 px-3 py-1.5 text-[12px] font-medium text-base-content/70 transition hover:text-base-content"
          >
            Ver todos
          </button>
        </div>
      )}

      <div class="flex items-center justify-between gap-3 px-1">
        <p class="text-[12px] text-base-content/55">
          <span class="font-mono font-medium text-base-content">{filtered.length}</span> términos
          {onlySaved ? " guardados" : ""} <span class="hidden sm:inline">· nov 2026</span>
        </p>
        <p class="hidden items-center gap-1.5 text-[11px] text-base-content/50 sm:flex">
          <Bookmark class="h-3 w-3" />
          Toca el marcador en cada tarjeta para guardarla
        </p>
      </div>

      {filtered.length === 0 ? (
        <div class="rounded-3xl bg-base-200 px-4 py-12 text-center sm:px-6 sm:py-16">
          <p class="text-sm font-medium text-base-content/55">No hay términos con ese filtro.</p>
          <button
            type="button"
            onClick={clearFilters}
            class="mt-3 rounded-full bg-base-100 px-3 py-1.5 text-xs font-medium text-base-content/60 transition hover:text-base-content"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entry) => {
            const saved = state.savedSlang.includes(entry.id);
            const categoryLabel = CATEGORIES.find((item) => item.id === entry.category)?.label;
            return (
              <article
                key={entry.id}
                class={`group flex flex-col rounded-2xl p-4 transition ${
                  saved ? "bg-accent/[0.06]" : "bg-base-200 hover:bg-base-300/55"
                }`}
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-1.5">
                      <h3 class="font-mono text-[15px] font-medium tracking-tight">{entry.term}</h3>
                      <span
                        class={`rounded-full px-2 py-0.5 text-[8px] font-medium tracking-wide ${
                          entry.status === "2026"
                            ? "bg-accent/10 text-accent"
                            : entry.status === "en alza"
                              ? "bg-info/10 text-info"
                              : "bg-base-100/60 text-base-content/35"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <p class="mt-1 text-[12px] text-base-content/55">
                      {categoryLabel} · {entry.register}
                    </p>
                  </div>
                  <div class="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      data-speak={entry.term}
                      aria-label={`Escuchar término: ${entry.term}`}
                      title={`Escuchar ${entry.term}`}
                      class="speak-btn flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-base-content/30 transition hover:bg-base-100 hover:text-base-content/70 hover:scale-[1.03] active:scale-95"
                    >
                      <Volume2 class="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => progressStore.toggleSavedSlang(entry.id)}
                      class={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                        saved
                          ? "bg-accent/10 text-accent"
                          : "text-base-content/20 hover:bg-base-100 hover:text-base-content/60"
                      }`}
                      aria-label={saved ? "Quitar de guardados" : "Guardar término"}
                      aria-pressed={saved}
                    >
                      {saved ? (
                        <BookmarkCheck class="h-4 w-4" />
                      ) : (
                        <Bookmark class="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p class="mt-3 flex-1 text-[13px] leading-relaxed text-base-content/70">
                  {entry.meaningEs}
                </p>

                <div class="mt-3 rounded-xl bg-base-100/60 px-3 py-2.5">
                  <p class="text-[13px] italic leading-relaxed text-base-content/85">
                    “{entry.example}”
                  </p>
                  <p class="mt-1 text-[12px] leading-relaxed text-base-content/55">
                    {entry.exampleEs}
                  </p>
                </div>

                {entry.caution && (
                  <div class="mt-2.5 flex items-start gap-1.5 px-0.5">
                    <TriangleAlert class="mt-0.5 h-3 w-3 shrink-0 text-warning/70" />
                    <p class="text-[11px] leading-relaxed text-warning/90">{entry.caution}</p>
                  </div>
                )}

                <p class="mt-3 hidden text-[10px] tracking-[0.08em] text-base-content/45 sm:block">
                  {entry.updated}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
