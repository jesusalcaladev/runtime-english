import { useEffect, useMemo, useState } from "preact/hooks";
import { ArrowRight, BookText, Brain, Check, CheckCircle2, NotebookPen, RotateCcw, Tag, Target, Volume2, X, Zap } from "lucide-preact";
import ExerciseRunner from "../exercise/ExerciseRunner";
import { progressStore, type PhrasebookEntry } from "../../lib/progress";
import {
  buildExercisePool,
  buildPhrasePool,
  getPracticeStats,
  type PracticeItem,
  type PracticeMode,
} from "../../lib/practice";
import { route } from "../../lib/routes";
import { useProgress } from "../../lib/useProgress";

interface Props {
  items: PracticeItem[];
}

export default function PracticeView({ items }: Props) {
  const state = useProgress();
  const [mode, setMode] = useState<PracticeMode>("review");
  const [count, setCount] = useState(10);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    try {
      const m = new URLSearchParams(window.location.search).get("mode");
      if (m === "review" || m === "weak" || m === "new" || m === "mix" || m === "phrases") {
        setMode(m);
      }
    } catch {}
  }, []);

  const now = Date.now();

  const pool = useMemo(() => {
    if (mode === "phrases") return [];
    return buildExercisePool(items, state, mode, count, now);
  }, [items, mode, count, seed, state, now]);

  const sessionId = `practice-${mode}-${seed}`;
  const exercises = pool.map((item) => item.exercise);
  const sources = pool.map((item) => ({ id: item.exercise.id, ...item }));

  const phrasePool = useMemo(() => buildPhrasePool(state, count), [state, count, seed, now]);

  const stats = useMemo(() => getPracticeStats(items, state, now), [items, state, now]);

  return (
    <div class="mx-auto max-w-[1120px] animate-fade-up">
      <section class="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p class="mono-label flex items-center gap-2">
            <Zap class="h-3.5 w-3.5 text-accent" />
            Práctica rápida
          </p>
          <h1 class="font-pixel mt-3 text-[2.2rem] leading-[1.05] tracking-tight sm:text-[3.05rem]">
            Entrena en modo fluido
          </h1>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-base-content/55">
            <span class="font-medium text-base-content/70">Ejercicios (SRS):</span> repaso espaciado y recuperación activa de lecciones.{" "}
            <span class="font-medium text-base-content/70">Frases/Diccionario (flashcards):</span> repasa tu vocabulario con significados, notas y ejemplos propios.
            {state.settings.goal && state.settings.goal !== "all" && " Las recomendaciones se ajustan suavemente a tu objetivo."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          class="btn btn-ghost h-10 gap-2 rounded-xl bg-base-200 px-4 text-base-content/70"
        >
          <RotateCcw class="h-4 w-4" /> Nueva ronda
        </button>
      </section>

      <section class="mt-6 grid gap-3 sm:grid-cols-4">
        <div class={`rounded-2xl px-4 py-4 ${stats.dueReview > 0 ? "bg-accent/[0.08] ring-1 ring-accent/20" : "bg-base-200"}`}>
          <div class="flex items-center gap-2 text-[11px] text-base-content/45"><Brain class="h-3.5 w-3.5 text-accent" /> Ejercicios (SRS)</div>
          <p class="mt-2 font-mono text-xl font-medium">{stats.dueReview}</p>
          <p class="mt-1 text-[10px] text-base-content/35">Vencidos para repasar hoy</p>
        </div>
        <div class="rounded-2xl bg-base-200 px-4 py-4">
          <div class="flex items-center gap-2 text-[11px] text-base-content/45"><Target class="h-3.5 w-3.5" /> A reforzar</div>
          <p class="mt-2 font-mono text-xl font-medium">{stats.weak}</p>
          <p class="mt-1 text-[10px] text-base-content/35">Fallos o con más intentos</p>
        </div>
        <div class={`rounded-2xl px-4 py-4 ${stats.duePhrases > 0 ? "bg-accent/[0.08] ring-1 ring-accent/20" : "bg-base-200"}`}>
          <div class="flex items-center gap-2 text-[11px] text-base-content/45"><BookText class="h-3.5 w-3.5 text-accent" /> Frases/Diccionario (flashcards)</div>
          <p class="mt-2 font-mono text-xl font-medium">{stats.duePhrases}</p>
          <p class="mt-1 text-[10px] text-base-content/35">Vencidas para repasar con tus notas</p>
        </div>
        <div class="rounded-2xl bg-base-200 px-4 py-4">
          <div class="flex items-center gap-2 text-[11px] text-base-content/45"><CheckCircle2 class="h-3.5 w-3.5" /> Sin intentar</div>
          <p class="mt-2 font-mono text-xl font-medium">{stats.unseen}</p>
          <p class="mt-1 text-[10px] text-base-content/35">Ejercicios nuevos</p>
        </div>
      </section>

      <section class="mt-6 rounded-2xl bg-base-200 p-4 sm:p-5">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex flex-wrap gap-2">
            {([
              ["review", "Ejercicios (SRS) · Repasar hoy"],
              ["weak", "Ejercicios · Reforzar"],
              ["new", "Ejercicios · Nuevos"],
              ["mix", "Ejercicios · Mezcla inteligente"],
              ["phrases", "Frases/Diccionario (flashcards)"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => { setMode(id); setSeed((s) => s + 1); }}
                class={`rounded-xl px-3.5 py-2 text-sm transition ${mode === id ? "bg-base-content text-base-100" : "bg-base-100 text-base-content/60 hover:text-base-content"}`}
              >
                {label}
                {id === "review" && stats.dueReview > 0 && (
                  <span class="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-accent/20 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                    {stats.dueReview}
                  </span>
                )}
                {id === "phrases" && stats.duePhrases > 0 && (
                  <span class="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-accent/20 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                    {stats.duePhrases}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div class="ml-auto flex items-center gap-2 text-sm text-base-content/55">
            <span>Preguntas:</span>
            {[5, 10, 15].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { setCount(n); setSeed((s) => s + 1); }}
                class={`h-8 w-10 rounded-lg font-mono text-xs ${count === n ? "bg-accent/15 text-accent" : "bg-base-100 text-base-content/50"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {mode !== "phrases" && sources.length > 0 && (
          <div class="mt-4 flex flex-wrap gap-2">
            {sources.slice(0, 8).map((s) => (
              <a key={s.id} href={route(`/session/${s.sessionSlug}`)} class="inline-flex items-center gap-1.5 rounded-full bg-base-100 px-3 py-1 text-[10px] text-base-content/45 hover:text-base-content/70">
                {s.moduleCode} · {s.sessionTitle}
                <ArrowRight class="h-3 w-3" />
              </a>
            ))}
            {sources.length > 8 && <span class="px-2 py-1 text-[10px] text-base-content/35">+{sources.length - 8} más</span>}
          </div>
        )}
      </section>

      <section class="mt-8">
        {mode === "phrases" ? (
          phrasePool.length === 0 ? (
            <div class="rounded-3xl bg-base-200/60 px-5 py-10 text-center">
              <p class="text-sm font-medium text-base-content/60">No hay frases/diccionario para repasar ahora.</p>
              <p class="mt-2 text-[12px] leading-relaxed text-base-content/45">Guarda frases desde una lección (botón Guardar), completa ejercicios (se guardan automáticamente al acertar) o usa el <span class="font-medium">backfill inicial</span> en el Diccionario.</p>
              <div class="mt-4 flex flex-wrap justify-center gap-2">
                <a href={route("/dictionary")} class="btn btn-primary btn-sm h-9 rounded-xl px-4">Ir al diccionario</a>
                <a href={route("/dictionary?review=1")} class="btn btn-ghost btn-sm h-9 rounded-xl bg-base-100 px-4">Ver flashcards</a>
              </div>
            </div>
          ) : (
            <PhraseReviewRunner key={`phr-${seed}`} entries={phrasePool} />
          )
        ) : exercises.length === 0 ? (
          <div class="rounded-3xl bg-base-200/60 px-5 py-10 text-center">
            <p class="text-sm font-medium text-base-content/60">
              {mode === "review"
                ? "No tienes ejercicios (SRS) vencidos ahora mismo."
                : mode === "weak"
                  ? "No hay ejercicios débiles que reforzar por ahora."
                  : mode === "new"
                    ? "No hay ejercicios nuevos pendientes."
                    : "No hay ejercicios disponibles para este modo todavía."}
            </p>
            <p class="mt-2 text-[12px] leading-relaxed text-base-content/45">
              {mode === "review"
                ? "Sigue practicando con “Mezcla inteligente” o “Nuevos”. Cuando aciertes, las respuestas se guardan/actualizan en tu diccionario y volverán con repaso espaciado."
                : mode === "weak"
                  ? "¡Buen trabajo! Completa sesiones o vuelve cuando algún ejercicio necesite refuerzo."
                  : "Completa sesiones desde Inicio o cambia de modo para seguir practicando."}
            </p>
            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <a href={route("/")} class="btn btn-primary btn-sm h-9 rounded-xl px-4">Ir a Inicio</a>
              <button type="button" onClick={() => setMode("mix")} class="btn btn-ghost btn-sm h-9 rounded-xl bg-base-100 px-4">Mezcla inteligente</button>
            </div>
          </div>
        ) : (
          <ExerciseRunner
            key={sessionId}
            sessionId={sessionId}
            sessionTitle={`Práctica rápida · ${mode === "review" ? "Repasar hoy" : mode === "weak" ? "Reforzar" : mode === "new" ? "Nuevos" : "Mezcla inteligente"}`}
            exercises={exercises}
            next={null}
          />
        )}
      </section>
    </div>
  );
}

function PhraseReviewRunner({ entries }: { entries: PhrasebookEntry[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const entry = entries[index];

  if (!entry) {
    return (
      <div class="rounded-2xl bg-base-200/60 px-5 py-10 text-center text-sm text-base-content/50">
        No hay frases para repasar.
      </div>
    );
  }

  if (index >= entries.length) {
    return (
      <div class="rounded-2xl bg-accent/[0.07] p-8 text-center">
        <p class="font-pixel text-2xl">Repaso de diccionario completado</p>
        <p class="mt-2 text-sm text-base-content/55">Has repasado {done} frase{done === 1 ? "" : "s"} usando tus notas y ejemplos.</p>
        <a href={route("/dictionary")} class="btn btn-primary btn-sm mt-4 rounded-xl">Ver diccionario</a>
      </div>
    );
  }

  function speakText(text: string) {
    try { if (typeof window !== "undefined") window.speechSynthesis?.speak(new SpeechSynthesisUtterance(text)); } catch {}
  }

  function answer(correct: boolean) {
    progressStore.reviewPhrase(entry.id, correct);
    setDone((d) => d + 1);
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between text-[11px] text-base-content/45">
        <span class="mono-label flex items-center gap-2"><BookText class="h-3.5 w-3.5 text-accent" /> Repaso de diccionario</span>
        <span class="font-mono">{index + 1} / {entries.length}</span>
      </div>
      <div class="rounded-[26px] bg-base-200 p-1.5">
        <div class="rounded-[20px] bg-base-100 p-5 sm:p-6">
          <p class="text-[11px] font-medium text-base-content/45">Traduce/recuerda esta frase</p>
          <div class="mt-3 flex items-start justify-between gap-3">
            <p class="font-mono text-lg text-base-content/90 sm:text-xl">{entry.en}</p>
            <button type="button" onClick={() => speakText(entry.en)} class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/50 hover:text-base-content/80" aria-label="Escuchar"><Volume2 class="h-4 w-4" /></button>
          </div>

          {!revealed ? (
            <button type="button" onClick={() => setRevealed(true)} class="btn btn-primary btn-sm mt-6 h-10 rounded-xl px-4">Mostrar significado y mis notas</button>
          ) : (
            <div class="mt-5 space-y-3">
              <div class="rounded-xl bg-accent/[0.06] p-4 ring-1 ring-accent/10">
                <p class="text-[11px] font-medium text-base-content/45">Significado</p>
                <p class="mt-1 text-[14px] leading-relaxed text-base-content/80">{entry.es || "—"}</p>
                {entry.userExample && (
                  <p class="mt-3 text-[12px] leading-relaxed text-base-content/70"><span class="inline-flex items-center gap-1 font-medium text-base-content/45"><NotebookPen class="h-3.5 w-3.5" /> Tu ejemplo:</span> <span class="font-mono">{entry.userExample}</span></p>
                )}
                {entry.notes && (
                  <p class="mt-2 text-[12px] leading-relaxed text-base-content/65"><span class="font-medium text-base-content/45">Nota:</span> {entry.notes}</p>
                )}
                {(entry.tags?.length ?? 0) > 0 && (
                  <div class="mt-2 flex flex-wrap gap-1">
                    {entry.tags!.map((t) => (
                      <span key={t} class="inline-flex items-center gap-1 rounded-full bg-base-100 px-2 py-0.5 text-[10px] text-base-content/50"><Tag class="h-2.5 w-2.5" />{t}</span>
                    ))}
                  </div>
                )}
                <div class="mt-2 flex flex-wrap gap-2 text-[10px] text-base-content/40">
                  {entry.source && <span>Origen: {entry.source}</span>}
                  {entry.difficulty && <span>· Dificultad: {entry.difficulty === "hard" ? "Difícil" : entry.difficulty === "easy" ? "Fácil" : "Normal"}</span>}
                  <span>· Aciertos: {entry.correct}</span>
                </div>
              </div>
              <p class="text-[12px] text-base-content/55">¿La recordaste correctamente?</p>
              <div class="flex flex-wrap gap-2">
                <button type="button" onClick={() => answer(false)} class="btn btn-ghost h-10 gap-2 rounded-xl bg-error/10 px-4 text-error"><X class="h-4 w-4" /> Me costó</button>
                <button type="button" onClick={() => answer(true)} class="btn btn-primary h-10 gap-2 rounded-xl px-4"><Check class="h-4 w-4" /> La sabía</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <p class="text-center text-[11px] text-base-content/40">Repasa en contexto: tus notas, ejemplos y etiquetas te ayudan a recordar matices.</p>
    </div>
  );
}
