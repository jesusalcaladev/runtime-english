import type { ContentBlock, Exercise, Session } from "./types";

export interface CustomLesson extends Session {
  createdAt: number;
  updatedAt: number;
  source: "manual" | "ai";
  topic?: string;
}

const STORAGE_KEY = "runtimeenglish_custom_lessons_v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "leccion";
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

export function generateCustomLessonId(): string {
  return `custom-${Date.now()}-${randomSuffix()}`;
}

export function loadCustomLessons(): CustomLesson[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCustomLessonLike).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function isCustomLessonLike(value: unknown): value is CustomLesson {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    Array.isArray(value.blocks) &&
    Array.isArray(value.exercises)
  );
}

function saveAll(lessons: CustomLesson[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
}

export function getCustomLesson(id: string): CustomLesson | null {
  return loadCustomLessons().find((lesson) => lesson.id === id || lesson.slug === id) ?? null;
}

export function upsertCustomLesson(lesson: CustomLesson): void {
  const lessons = loadCustomLessons();
  const idx = lessons.findIndex((item) => item.id === lesson.id);
  if (idx >= 0) lessons[idx] = lesson;
  else lessons.unshift(lesson);
  saveAll(lessons);
}

export function deleteCustomLesson(id: string): void {
  saveAll(loadCustomLessons().filter((lesson) => lesson.id !== id));
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((item) => typeof item === "string")) return null;
  return value as string[];
}

function validateExercise(value: unknown, index: number): { ok: true; exercise: Exercise } | { ok: false; error: string } {
  if (!isRecord(value)) return { ok: false, error: `Ejercicio #${index + 1}: debe ser un objeto.` };
  const type = asString(value.type);
  const prompt = asString(value.prompt)?.trim() ?? "";
  const explanation = asString(value.explanation)?.trim() ?? "";
  if (!type) return { ok: false, error: `Ejercicio #${index + 1}: falta "type".` };
  if (!prompt) return { ok: false, error: `Ejercicio #${index + 1}: falta "prompt".` };
  const id = (asString(value.id)?.trim() || `ex-${index + 1}-${randomSuffix()}`);

  switch (type) {
    case "choice": {
      const options = asStringArray(value.options);
      const answer = typeof value.answer === "number" ? value.answer : NaN;
      if (!options || options.length < 2) return { ok: false, error: `Ejercicio #${index + 1} (choice): "options" debe tener al menos 2 textos.` };
      if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) {
        return { ok: false, error: `Ejercicio #${index + 1} (choice): "answer" debe ser el índice correcto (0-${options.length - 1}).` };
      }
      return { ok: true, exercise: { id, type: "choice", prompt, options, answer, explanation, ...(asString(value.audio) ? { audio: asString(value.audio)! } : {}) } };
    }
    case "builder": {
      const words = asStringArray(value.words);
      const answer = asString(value.answer)?.trim() ?? "";
      if (!words || words.length < 2) return { ok: false, error: `Ejercicio #${index + 1} (builder): "words" debe tener al menos 2 palabras.` };
      if (!answer) return { ok: false, error: `Ejercicio #${index + 1} (builder): falta "answer".` };
      return { ok: true, exercise: { id, type: "builder", prompt, words, answer, explanation } };
    }
    case "write":
    case "listen":
    case "speak": {
      const answer = asString(value.answer)?.trim() ?? (type === "listen" ? asString(value.audioText)?.trim() ?? "" : "");
      if (!answer) return { ok: false, error: `Ejercicio #${index + 1} (${type}): falta "answer".` };
      const accept = asStringArray(value.accept) ?? undefined;
      const hint = asString(value.hint) ?? undefined;
      if (type === "listen") {
        const audioText = asString(value.audioText)?.trim() || answer;
        return { ok: true, exercise: { id, type: "listen", prompt, audioText, answer, ...(accept ? { accept } : {}), ...(hint ? { hint } : {}), explanation } };
      }
      if (type === "speak") {
        return { ok: true, exercise: { id, type: "speak", prompt, answer, ...(accept ? { accept } : {}), ...(hint ? { hint } : {}), explanation } };
      }
      return { ok: true, exercise: { id, type: "write", prompt, answer, ...(accept ? { accept } : {}), ...(hint ? { hint } : {}), explanation } };
    }
    case "fill-blank": {
      const template = asString(value.template)?.trim() ?? "";
      const blanks = asStringArray(value.blanks);
      if (!template || !template.includes("___")) return { ok: false, error: `Ejercicio #${index + 1} (fill-blank): "template" debe incluir ___ .` };
      if (!blanks || blanks.length === 0) return { ok: false, error: `Ejercicio #${index + 1} (fill-blank): "blanks" debe tener respuestas.` };
      const hint = asString(value.hint) ?? undefined;
      return { ok: true, exercise: { id, type: "fill-blank", prompt, template, blanks, ...(hint ? { hint } : {}), explanation } };
    }
    case "dialogue-order": {
      const lines = asStringArray(value.lines);
      if (!lines || lines.length < 2) return { ok: false, error: `Ejercicio #${index + 1} (dialogue-order): "lines" debe tener al menos 2 líneas.` };
      return { ok: true, exercise: { id, type: "dialogue-order", prompt, lines, explanation } };
    }
    case "fix-error": {
      const sentence = asString(value.sentence)?.trim() ?? "";
      const answer = asString(value.answer)?.trim() ?? "";
      if (!sentence || !answer) return { ok: false, error: `Ejercicio #${index + 1} (fix-error): faltan "sentence" o "answer".` };
      const accept = asStringArray(value.accept) ?? undefined;
      const hint = asString(value.hint) ?? undefined;
      return { ok: true, exercise: { id, type: "fix-error", prompt, sentence, answer, ...(accept ? { accept } : {}), ...(hint ? { hint } : {}), explanation } };
    }
    case "roleplay": {
      const scenario = asString(value.scenario)?.trim() ?? "";
      const goal = asString(value.goal)?.trim() ?? "";
      const answer = asString(value.answer)?.trim() ?? "";
      if (!scenario || !goal || !answer) return { ok: false, error: `Ejercicio #${index + 1} (roleplay): faltan "scenario", "goal" o "answer".` };
      const accept = asStringArray(value.accept) ?? undefined;
      const hint = asString(value.hint) ?? undefined;
      return { ok: true, exercise: { id, type: "roleplay", prompt, scenario, goal, answer, ...(accept ? { accept } : {}), ...(hint ? { hint } : {}), explanation } };
    }
    default:
      return { ok: false, error: `Ejercicio #${index + 1}: tipo "${type}" no soportado.` };
  }
}

function validateBlock(value: unknown, index: number): { ok: true; block: ContentBlock } | { ok: false; error: string } {
  if (!isRecord(value)) return { ok: false, error: `Bloque #${index + 1}: debe ser un objeto.` };
  const type = asString(value.type);
  if (!type) return { ok: false, error: `Bloque #${index + 1}: falta "type".` };

  switch (type) {
    case "technique": {
      const name = asString(value.name)?.trim() ?? "";
      const desc = asString(value.desc)?.trim() ?? "";
      if (!name || !desc) return { ok: false, error: `Bloque #${index + 1} (technique): faltan "name" o "desc".` };
      return { ok: true, block: { type: "technique", name, desc } };
    }
    case "text": {
      const body = asString(value.body)?.trim() ?? "";
      if (!body) return { ok: false, error: `Bloque #${index + 1} (text): falta "body".` };
      const title = asString(value.title)?.trim();
      return { ok: true, block: { type: "text", ...(title ? { title } : {}), body } };
    }
    case "vocab": {
      if (!Array.isArray(value.items)) return { ok: false, error: `Bloque #${index + 1} (vocab): "items" debe ser una lista.` };
      const items = value.items
        .filter(isRecord)
        .map((item) => ({
          en: asString(item.en)?.trim() ?? "",
          es: asString(item.es)?.trim() ?? "",
          ...(asString(item.example) ? { example: asString(item.example)!.trim() } : {}),
          ...(asString(item.note) ? { note: asString(item.note)!.trim() } : {}),
        }))
        .filter((item) => item.en && item.es);
      if (items.length === 0) return { ok: false, error: `Bloque #${index + 1} (vocab): agrega items con "en" y "es".` };
      const title = asString(value.title)?.trim();
      return { ok: true, block: { type: "vocab", ...(title ? { title } : {}), items } };
    }
    case "phrases": {
      if (!Array.isArray(value.items)) return { ok: false, error: `Bloque #${index + 1} (phrases): "items" debe ser una lista.` };
      const items = value.items
        .filter(isRecord)
        .map((item) => ({ en: asString(item.en)?.trim() ?? "", es: asString(item.es)?.trim() ?? "" }))
        .filter((item) => item.en && item.es);
      if (items.length === 0) return { ok: false, error: `Bloque #${index + 1} (phrases): agrega items con "en" y "es".` };
      const title = asString(value.title)?.trim();
      return { ok: true, block: { type: "phrases", ...(title ? { title } : {}), items } };
    }
    case "table": {
      const columns = asStringArray(value.columns);
      if (!columns || columns.length === 0) return { ok: false, error: `Bloque #${index + 1} (table): "columns" requerido.` };
      if (!Array.isArray(value.rows)) return { ok: false, error: `Bloque #${index + 1} (table): "rows" requerido.` };
      const rows = value.rows
        .filter((row): row is unknown[] => Array.isArray(row))
        .map((row) => row.map((cell) => String(cell ?? "")));
      const title = asString(value.title)?.trim();
      return { ok: true, block: { type: "table", ...(title ? { title } : {}), columns, rows } };
    }
    case "callout": {
      const title = asString(value.title)?.trim() ?? "";
      const body = asString(value.body)?.trim() ?? "";
      const tone = asString(value.tone);
      if (!title || !body) return { ok: false, error: `Bloque #${index + 1} (callout): faltan "title" o "body".` };
      const safeTone = tone === "warning" || tone === "info" ? tone : "tip";
      return { ok: true, block: { type: "callout", tone: safeTone, title, body } };
    }
    case "tenses": {
      if (!Array.isArray(value.items)) return { ok: false, error: `Bloque #${index + 1} (tenses): "items" requerido.` };
      const items = value.items.filter(isRecord).map((item) => ({
        name: asString(item.name)?.trim() ?? "",
        tag: asString(item.tag)?.trim() ?? "",
        formula: asString(item.formula)?.trim() ?? "",
        cases: asStringArray(item.cases) ?? [],
      })).filter((item) => item.name);
      if (items.length === 0) return { ok: false, error: `Bloque #${index + 1} (tenses): items inválidos.` };
      return { ok: true, block: { type: "tenses", items } };
    }
    case "slang": {
      const ids = asStringArray(value.ids);
      if (!ids || ids.length === 0) return { ok: false, error: `Bloque #${index + 1} (slang): "ids" requerido.` };
      const title = asString(value.title)?.trim();
      return { ok: true, block: { type: "slang", ...(title ? { title } : {}), ids } };
    }
    default:
      return { ok: false, error: `Bloque #${index + 1}: tipo "${type}" no soportado en lecciones personalizadas.` };
  }
}

export interface ImportResult {
  ok: boolean;
  lesson?: CustomLesson;
  errors: string[];
}

export function importCustomLessonJson(raw: unknown, options?: { source?: "manual" | "ai"; topic?: string }): ImportResult {
  const errors: string[] = [];
  if (!isRecord(raw)) return { ok: false, errors: ["El JSON debe ser un objeto de lección."] };

  const title = asString(raw.title)?.trim() ?? "";
  if (!title) errors.push('Falta "title".');

  const blocksRaw = Array.isArray(raw.blocks) ? raw.blocks : null;
  const exercisesRaw = Array.isArray(raw.exercises) ? raw.exercises : null;
  if (!blocksRaw) errors.push('"blocks" debe ser una lista.');
  if (!exercisesRaw) errors.push('"exercises" debe ser una lista.');
  if (errors.length > 0 || !blocksRaw || !exercisesRaw) return { ok: false, errors };

  const blocks: ContentBlock[] = [];
  blocksRaw.forEach((block, index) => {
    const result = validateBlock(block, index);
    if (result.ok) blocks.push(result.block);
    else errors.push(result.error);
  });

  const exercises: Exercise[] = [];
  exercisesRaw.forEach((exercise, index) => {
    const result = validateExercise(exercise, index);
    if (result.ok) exercises.push(result.exercise);
    else errors.push(result.error);
  });

  if (blocks.length === 0) errors.push("La lección debe tener al menos 1 bloque.");
  if (exercises.length === 0) errors.push("La lección debe tener al menos 1 ejercicio.");
  if (errors.length > 0) return { ok: false, errors: errors.slice(0, 8) };

  const now = Date.now();
  const id = asString(raw.id)?.trim() || generateCustomLessonId();
  const baseSlug = asString(raw.slug)?.trim() || slugify(title);
  const slug = `custom-${baseSlug}-${randomSuffix()}`;
  const objectives = asStringArray(raw.objectives)?.slice(0, 8) ?? ["Practicar el tema de la lección."];

  const lesson: CustomLesson = {
    id,
    slug,
    title,
    step: asString(raw.step)?.trim() || "Custom",
    cefr: (asString(raw.cefr) as CustomLesson["cefr"]) || "A2",
    minutes: typeof raw.minutes === "number" && Number.isFinite(raw.minutes) ? Math.max(1, Math.round(raw.minutes)) : 10,
    summary: asString(raw.summary)?.trim() || `Lección personalizada sobre ${title}.`,
    objectives,
    blocks,
    pronunciation: asString(raw.pronunciation)?.trim() || undefined,
    exercises,
    createdAt: now,
    updatedAt: now,
    source: options?.source ?? "manual",
    topic: options?.topic?.trim() || undefined,
  };

  return { ok: true, lesson, errors: [] };
}

export function buildAiLessonPrompt(topic: string): string {
  const cleanTopic = topic.trim() || "have to / must / should";
  return [
    `Actúa como diseñador de currículo para RuntimeEnglish (app para developers que aprenden inglés).`,
    `Crea UNA lección personalizada en español/inglés sobre este tema: "${cleanTopic}".`,
    ``,
    `Devuelve SOLO un JSON válido (sin markdown, sin comentarios, sin texto extra) con esta estructura:`,
    `{`,
    `  "title": "string",`,
    `  "summary": "string",`,
    `  "cefr": "A1|A2|B1|B2",`,
    `  "minutes": 10,`,
    `  "objectives": ["..."],`,
    `  "blocks": [`,
    `    { "type": "technique", "name": "...", "desc": "..." },`,
    `    { "type": "text", "title": "...", "body": "..." },`,
    `    { "type": "vocab", "title": "Vocabulario", "items": [{ "en": "...", "es": "...", "example": "..." }] },`,
    `    { "type": "phrases", "title": "Frases útiles", "items": [{ "en": "...", "es": "..." }] },`,
    `    { "type": "callout", "tone": "tip|warning|info", "title": "...", "body": "..." }`,
    `  ],`,
    `  "exercises": [`,
    `    { "id": "ex-1", "type": "choice", "prompt": "...", "options": ["A","B","C"], "answer": 0, "explanation": "..." },`,
    `    { "id": "ex-2", "type": "fill-blank", "prompt": "...", "template": "I ___ go now.", "blanks": ["have to"], "explanation": "..." },`,
    `    { "id": "ex-3", "type": "write", "prompt": "...", "answer": "...", "explanation": "..." }`,
    `  ]`,
    `}`,
    ``,
    `Reglas importantes:`,
    `- Enfoca ejemplos a contexto de developers/tech cuando sea natural.`,
    `- Explicaciones en español claro, contenido de práctica en inglés.`,
    `- Usa 4 a 6 bloques y 4 a 8 ejercicios variados (choice, builder, write, fill-blank, fix-error, dialogue-order, speak o listen).`,
    `- "answer" en choice es el índice numérico correcto (0-based).`,
    `- IDs de ejercicios únicos (ex-1, ex-2, ...).`,
    `- El JSON debe poder pegarse directamente en RuntimeEnglish.`,
  ].join("\n");
}
