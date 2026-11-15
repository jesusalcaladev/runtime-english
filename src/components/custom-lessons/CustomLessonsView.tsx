import { useMemo, useState } from "preact/hooks";
import {
  BookPlus,
  Copy,
  FileJson,
  Lightbulb,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-preact";
import { route } from "../../lib/routes";
import { emitToast } from "../../lib/toast";
import {
  buildAiLessonPrompt,
  deleteCustomLesson,
  getCustomLesson,
  importCustomLessonJson,
  loadCustomLessons,
  upsertCustomLesson,
  type CustomLesson,
} from "../../lib/customLessons";

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString();
  } catch {
    return "";
  }
}

export default function CustomLessonsView() {
  const [lessons, setLessons] = useState<CustomLesson[]>(() => loadCustomLessons());
  const [showAdd, setShowAdd] = useState(false);
  const [topic, setTopic] = useState("have to / must / should");
  const [jsonText, setJsonText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const prompt = useMemo(() => buildAiLessonPrompt(topic), [topic]);

  function refresh() {
    setLessons(loadCustomLessons());
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      emitToast("Prompt copiado. Pégalo en tu IA favorita.", "success");
    } catch {
      emitToast("No se pudo copiar el prompt.", "error");
    }
  }

  function handleImport() {
    setImporting(true);
    setErrors([]);
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      const result = importCustomLessonJson(parsed, { source: "ai", topic });
      if (!result.ok || !result.lesson) {
        setErrors(result.errors.length ? result.errors : ["No se pudo importar la lección."]);
        return;
      }

      // Avoid accidental exact-id collisions by regenerating id if it already exists.
      if (getCustomLesson(result.lesson.id)) {
        result.lesson = {
          ...result.lesson,
          id: `${result.lesson.id}-${Math.random().toString(36).slice(2, 6)}`,
          updatedAt: Date.now(),
        };
      }

      upsertCustomLesson(result.lesson);
      setJsonText("");
      setShowAdd(false);
      refresh();
      emitToast("Lección guardada en Mis lecciones.", "success");
      window.location.href = route(`/my-lesson?id=${encodeURIComponent(result.lesson.id)}`);
    } catch {
      setErrors(["JSON inválido. Revisa comas, comillas y llaves."]);
    } finally {
      setImporting(false);
    }
  }

  function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar esta lección personalizada?")) return;
    deleteCustomLesson(id);
    refresh();
    emitToast("Lección eliminada.", "success");
  }

  return (
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="mono-label">Personaliza tu aprendizaje</p>
          <h2 class="font-pixel mt-1 text-[2rem] leading-none tracking-tight">Mis lecciones</h2>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-base-content/55">
            Crea tus propias lecciones (por ejemplo: <span class="font-medium text-base-content/75">have to</span>,
            phrasal verbs, entrevistas, etc.). Puedes generarlas con una IA usando un prompt y luego importar el JSON.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((value) => !value)}
          class="btn btn-primary h-10 rounded-xl px-4"
        >
          <Plus class="h-4 w-4" />
          {showAdd ? "Cerrar" : "Agregar lección"}
        </button>
      </div>

      {showAdd && (
        <section class="space-y-4 rounded-3xl bg-base-200 p-4 sm:p-5">
          <div class="flex items-start gap-3">
            <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
              <Wand2 class="h-4 w-4" />
            </span>
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-semibold">Agregar lección con JSON (manual o con IA)</h3>
              <p class="mt-1 text-[12px] leading-relaxed text-base-content/55">
                Flujo rápido: 1) escribe el tema, 2) copia el prompt, 3) pégalo en ChatGPT/DeepSeek/Gemini, 4) copia el JSON que te devuelva, 5) impórtalo aquí.
              </p>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="space-y-3 rounded-2xl bg-base-100/50 p-4">
              <div class="flex items-center gap-2">
                <Sparkles class="h-4 w-4 text-accent" />
                <p class="text-[13px] font-medium">1) Genera el JSON con una IA</p>
              </div>
              <label class="flex flex-col gap-1.5">
                <span class="text-[11px] font-medium text-base-content/45">Tema que quieres aprender</span>
                <input
                  type="text"
                  value={topic}
                  onInput={(event) => setTopic((event.currentTarget as HTMLInputElement).value)}
                  placeholder="Ej: have to, present perfect, code review feedback..."
                  class="h-10 w-full rounded-xl bg-base-100 px-3.5 text-sm"
                />
              </label>
              <div class="rounded-xl bg-base-100 p-3">
                <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-base-content/35">Prompt listo para copiar</p>
                <pre class="max-h-56 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-base-content/70">{prompt}</pre>
              </div>
              <button type="button" onClick={copyPrompt} class="btn btn-sm rounded-lg bg-base-100">
                <Copy class="h-3.5 w-3.5" /> Copiar prompt
              </button>
            </div>

            <div class="space-y-3 rounded-2xl bg-base-100/50 p-4">
              <div class="flex items-center gap-2">
                <FileJson class="h-4 w-4 text-accent" />
                <p class="text-[13px] font-medium">2) Pega el JSON y guárdalo</p>
              </div>
              <label class="flex flex-col gap-1.5">
                <span class="text-[11px] font-medium text-base-content/45">JSON de la lección</span>
                <textarea
                  value={jsonText}
                  onInput={(event) => setJsonText((event.currentTarget as HTMLTextAreaElement).value)}
                  placeholder='Pega aquí el JSON que te devolvió la IA (o tu JSON manual)...'
                  class="min-h-[260px] w-full rounded-xl bg-base-100 p-3 font-mono text-[12px] leading-relaxed"
                />
              </label>
              {errors.length > 0 && (
                <div class="rounded-xl bg-error/10 p-3 text-[12px] text-error">
                  <p class="font-medium">Revisa esto antes de guardar:</p>
                  <ul class="mt-1.5 list-disc space-y-1 pl-4">
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleImport} disabled={importing || !jsonText.trim()} class="btn btn-primary btn-sm rounded-lg">
                  <BookPlus class="h-3.5 w-3.5" /> {importing ? "Guardando..." : "Validar y guardar lección"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJsonText("");
                    setErrors([]);
                  }}
                  class="btn btn-ghost btn-sm rounded-lg"
                >
                  Limpiar
                </button>
              </div>
              <p class="text-[11px] leading-relaxed text-base-content/45">
                <Lightbulb class="mr-1 inline h-3.5 w-3.5 text-warning/70" />
                Las lecciones personalizadas se guardan en este dispositivo (localmente) por ahora.
              </p>
            </div>
          </div>
        </section>
      )}

      {lessons.length === 0 ? (
        <div class="rounded-3xl bg-base-200 p-8 text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-base-100/70 text-base-content/45">
            <BookPlus class="h-6 w-6" />
          </div>
          <h3 class="mt-4 text-sm font-semibold">Aún no tienes lecciones personalizadas</h3>
          <p class="mt-2 text-sm text-base-content/55">
            Agrega tu primera lección con un tema que quieras practicar (por ejemplo, <span class="font-medium">have to</span>).
          </p>
        </div>
      ) : (
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => (
            <article key={lesson.id} class="group rounded-2xl bg-base-200 p-4 transition hover:bg-base-300/50">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">{lesson.cefr}</span>
                    <span class="rounded-full bg-base-100/70 px-2 py-0.5 text-[10px] text-base-content/45">{lesson.minutes} min</span>
                  </div>
                  <h3 class="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{lesson.title}</h3>
                  <p class="mt-1 line-clamp-2 text-[12px] leading-relaxed text-base-content/55">{lesson.summary}</p>
                </div>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-base-content/40">
                <span>{lesson.exercises.length} ejercicios</span>
                <span>·</span>
                <span>{lesson.blocks.length} bloques</span>
                {lesson.updatedAt ? (
                  <>
                    <span>·</span>
                    <span>{formatDate(lesson.updatedAt)}</span>
                  </>
                ) : null}
              </div>
              <div class="mt-4 flex items-center gap-2">
                <a href={route(`/my-lesson?id=${encodeURIComponent(lesson.id)}`)} class="btn btn-sm btn-primary flex-1 rounded-lg">
                  Abrir lección
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(lesson.id)}
                  class="btn btn-sm btn-ghost rounded-lg text-error"
                  aria-label="Eliminar lección"
                  title="Eliminar lección"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
