import { useEffect, useState } from "preact/hooks";
import { ArrowLeft, BookOpen, Clock, Layers, Trash2 } from "lucide-preact";
import { route } from "../../lib/routes";
import { getSessionMinutes } from "../../lib/sessionTime";
import { emitToast } from "../../lib/toast";
import { deleteCustomLesson, getCustomLesson, type CustomLesson } from "../../lib/customLessons";
import ExerciseRunner from "../exercise/ExerciseRunner";
import LessonBlocksClient from "./LessonBlocksClient";

export default function CustomLessonView() {
  const [lesson, setLesson] = useState<CustomLesson | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || params.get("slug") || "";
    setLesson(id ? getCustomLesson(id) : null);
    setLoaded(true);
  }, []);

  function handleDelete() {
    if (!lesson) return;
    if (!window.confirm("¿Eliminar esta lección personalizada?")) return;
    deleteCustomLesson(lesson.id);
    emitToast("Lección eliminada.", "success");
    window.location.href = route("/my-lessons");
  }

  if (!loaded) {
    return <div class="rounded-2xl bg-base-200 p-6 text-sm text-base-content/60">Cargando lección...</div>;
  }

  if (!lesson) {
    return (
      <div class="mx-auto max-w-2xl rounded-3xl bg-base-200 p-8 text-center">
        <h1 class="text-lg font-semibold">Lección no encontrada</h1>
        <p class="mt-2 text-sm text-base-content/60">Esta lección personalizada no existe en este dispositivo o fue eliminada.</p>
        <a href={route("/my-lessons")} class="btn btn-primary mt-5 rounded-xl">Volver a Mis lecciones</a>
      </div>
    );
  }

  return (
    <article class="mx-auto max-w-[1120px] animate-fade-up space-y-8">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <a href={route("/my-lessons")} class="inline-flex items-center gap-1.5 text-[12px] text-base-content/45 transition hover:text-base-content/70">
          <ArrowLeft class="h-3.5 w-3.5" /> Mis lecciones
        </a>
        <button type="button" onClick={handleDelete} class="btn btn-ghost btn-sm rounded-lg text-error">
          <Trash2 class="h-4 w-4" /> Eliminar
        </button>
      </div>

      <header class="space-y-4">
        <div>
          <p class="mono-label">Lección personalizada</p>
          <h1 class="font-pixel mt-2 text-[2.2rem] leading-tight tracking-tight sm:text-[2.6rem]">{lesson.title}</h1>
          <p class="mt-3 max-w-3xl text-sm leading-relaxed text-base-content/60">{lesson.summary}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent">{lesson.cefr}</span>
          <span class="flex items-center gap-1.5 rounded-full bg-base-200 px-2.5 py-1 text-[10px] text-base-content/45">
            <Clock class="h-3 w-3" /> {getSessionMinutes(lesson)} min
          </span>
          <span class="flex items-center gap-1.5 rounded-full bg-base-200 px-2.5 py-1 text-[10px] text-base-content/45">
            <Layers class="h-3 w-3" /> {lesson.exercises.length} ejercicios
          </span>
          <span class="flex items-center gap-1.5 rounded-full bg-base-200 px-2.5 py-1 text-[10px] text-base-content/45">
            <BookOpen class="h-3 w-3" /> {lesson.blocks.length} bloques
          </span>
        </div>
        {lesson.objectives?.length ? (
          <div class="rounded-2xl bg-base-200 p-4">
            <p class="mono-label">Objetivos</p>
            <ul class="mt-3 space-y-2">
              {lesson.objectives.map((objective, index) => (
                <li key={index} class="flex items-start gap-2 text-[12px] leading-relaxed text-base-content/60">
                  <span class="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div class="min-w-0">
          <LessonBlocksClient blocks={lesson.blocks} />
        </div>
        <aside class="hidden space-y-3 lg:block lg:sticky lg:top-20">
          <div class="rounded-2xl bg-base-200 p-4">
            <p class="mono-label">Progreso</p>
            <p class="mt-2 text-[12px] leading-relaxed text-base-content/55">
              Tus respuestas y XP se guardan igual que en las lecciones del curso.
            </p>
            <p class="mt-3 font-mono text-[10px] text-base-content/35">ID: {lesson.id}</p>
          </div>
        </aside>
      </div>

      <section id="practica" class="scroll-mt-20">
        <div class="mb-5">
          <p class="mono-label">Ponlo a prueba</p>
          <h2 class="font-pixel mt-2 text-[1.85rem] leading-tight tracking-tight">Ejercicios de la lección</h2>
          <p class="mt-2 max-w-xl text-xs leading-relaxed text-base-content/40">
            Practica esta lección personalizada. Los aciertos suman XP y se guardan en tu progreso.
          </p>
        </div>
        <ExerciseRunner
          sessionId={lesson.id}
          sessionTitle={lesson.title}
          exercises={lesson.exercises}
          next={null}
        />
      </section>
    </article>
  );
}
