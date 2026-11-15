import { getSessionMinutes } from "./sessionTime";
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
  lesson.minutes = getSessionMinutes(lesson);

  return { ok: true, lesson, errors: [] };
}

export function buildAiLessonPrompt(topic: string): string {
  const cleanTopic = topic.trim() || "have to / must / should";

  return [
    "Eres un generador experto de lecciones para RuntimeEnglish (app para developers que aprenden inglés).",
    `TEMA DE LA LECCIÓN: "${cleanTopic}"`,
    "",
    "TU RESPUESTA DEBE SER ÚNICAMENTE UN JSON VÁLIDO.",
    "- No escribas markdown.",
    "- No uses ```json ni ```.",
    "- No escribas comentarios, notas ni texto antes o después.",
    "- La respuesta completa debe empezar con { y terminar con }.",
    "",
    "OBJETIVO:",
    "Crear 1 lección personalizada de alta calidad, clara y 100% compatible con el importador de RuntimeEnglish.",
    "",
    "REQUISITOS GENERALES:",
    "- Usa español en explicaciones, descripciones y significados; usa inglés en ejemplos, vocabulario EN y ejercicios.",
    "- Enfoca los ejemplos a contexto de developers/tech cuando sea natural (código, bugs, PRs, reuniones, deploys, tickets, docs).",
    "- No uses emojis en ningún campo del JSON.",
    "- Crea exactamente 4 a 6 bloques en \"blocks\".",
    "- Crea exactamente 6 ejercicios en \"exercises\".",
    "- Usa IDs únicos: ex-1, ex-2, ex-3, ex-4, ex-5, ex-6.",
    "- Todos los strings deben estar entre comillas dobles.",
    "- No uses campos extra. No omitas campos obligatorios.",
    "- Antes de responder, verifica que el JSON sea válido y que cada ejercicio cumpla su esquema.",
    "",
    "ESQUEMA EXACTO DE LA LECCIÓN (CAMPOS OBLIGATORIOS):",
    "{",
    '  "title": "string",',
    '  "summary": "string",',
    '  "cefr": "A1" | "A2" | "B1" | "B2",',
    '  "objectives": ["string", "string", "string"],',
    '  "blocks": [ ...4 a 6 bloques válidos... ],',
    '  "exercises": [ ...6 ejercicios válidos... ]',
    "}",
    "",
    "NOTA: No incluyas \"minutes\"; la duración se calcula automáticamente a partir del contenido.",
    "",
    "BLOQUES PERMITIDOS (usa solo estos tipos):",
    '1) { "type": "technique", "name": "string", "desc": "string" }',
    '2) { "type": "text", "title": "string", "body": "string" }',
    '3) { "type": "vocab", "title": "string", "items": [ { "en": "string", "es": "string", "example": "string" } ] }',
    '4) { "type": "phrases", "title": "string", "items": [ { "en": "string", "es": "string" } ] }',
    '5) { "type": "callout", "tone": "tip" | "warning" | "info", "title": "string", "body": "string" }',
    "",
    "REGLAS DE EJERCICIOS (MUY IMPORTANTE):",
    "- Usa SOLO estos tipos: choice, builder, fill-blank, fix-error, dialogue-order, write.",
    "- Incluye exactamente estos 6 ejercicios en este orden:",
    "  ex-1 = choice",
    "  ex-2 = fill-blank",
    "  ex-3 = fix-error",
    "  ex-4 = builder",
    "  ex-5 = dialogue-order",
    "  ex-6 = write",
    "",
    "FORMATOS OBLIGATORIOS POR TIPO:",
    'A) choice: { "id":"ex-1", "type":"choice", "prompt":"...", "options":["A","B","C","D"], "answer":0, "explanation":"..." }',
    "   - options: mínimo 2 strings.",
    "   - answer: número entero 0-based (índice de la opción correcta).",
    "",
    'B) fill-blank: { "id":"ex-2", "type":"fill-blank", "prompt":"...", "template":"I ___ fix the bug.", "blanks":["have to"], "explanation":"..." }',
    '   - template: string obligatorio y DEBE contener "___" (tres guiones bajos).',
    "   - blanks: array con al menos 1 string (respuestas en orden).",
    "",
    'C) fix-error: { "id":"ex-3", "type":"fix-error", "prompt":"...", "sentence":"I have to fixed the bug.", "answer":"I have to fix the bug.", "explanation":"..." }',
    '   - sentence: frase con error (obligatoria).',
    '   - answer: frase corregida (obligatoria).',
    "   - sentence y answer deben ser diferentes.",
    "",
    'D) builder: { "id":"ex-4", "type":"builder", "prompt":"...", "words":["have","to","review","the","PR"], "answer":"have to review the PR", "explanation":"..." }',
    "   - words: array con al menos 2 palabras/tokens.",
    "   - answer: string con la oración correcta.",
    "   - words debe contener todas las palabras necesarias para formar answer.",
    "",
    'E) dialogue-order: { "id":"ex-5", "type":"dialogue-order", "prompt":"...", "lines":["A: ...","B: ...","A: ..."], "explanation":"..." }',
    "   - lines: array de strings con al menos 2 líneas.",
    "   - lines debe estar ya en el ORDEN CORRECTO final.",
    "",
    'F) write: { "id":"ex-6", "type":"write", "prompt":"...", "answer":"I have to deploy the hotfix today.", "explanation":"..." }',
    "   - answer: respuesta modelo en inglés (obligatoria).",
    "",
    "EJEMPLO COMPLETO VÁLIDO (SIGUE ESTE FORMATO Y NIVEL DE DETALLE):",
    "{",
    '  "title": "Have to para obligaciones en el trabajo dev",',
    '  "summary": "Aprende a usar have to para hablar de obligaciones y tareas necesarias en contextos de desarrollo de software.",',
    '  "cefr": "A2",',
    '  "objectives": [',
    '    "Usar have to para expresar obligaciones en inglés.",',
    '    "Formar oraciones afirmativas y corregir errores comunes.",',
    '    "Aplicar have to en situaciones reales de trabajo dev."',
    "  ],",
    '  "blocks": [',
    '    { "type": "technique", "name": "Have to = obligación", "desc": "Usa have to + verbo base para hablar de algo necesario u obligatorio: I have to fix this bug." },',
    '    { "type": "text", "title": "Uso básico", "body": "Have to expresa obligación. En presente: I/you/we/they have to, he/she/it has to. Después siempre va el verbo en forma base." },',
    '    { "type": "vocab", "title": "Vocabulario clave", "items": [',
    '      { "en": "have to", "es": "tener que (obligación)", "example": "I have to review the pull request." },',
    '      { "en": "fix a bug", "es": "corregir un bug", "example": "We have to fix a bug before release." },',
    '      { "en": "deploy", "es": "desplegar", "example": "She has to deploy the hotfix." }',
    "    ] },",
    '    { "type": "phrases", "title": "Frases útiles", "items": [',
    '      { "en": "I have to update the documentation.", "es": "Tengo que actualizar la documentación." },',
    '      { "en": "We have to finish this before the demo.", "es": "Tenemos que terminar esto antes de la demo." }',
    "    ] },",
    '    { "type": "callout", "tone": "tip", "title": "Tip rápido", "body": "Después de have to/has to usa el verbo base: have to fix, has to deploy (no fixed, no deploys)." }',
    "  ],",
    '  "exercises": [',
    '    { "id": "ex-1", "type": "choice", "prompt": "Elige la opción correcta: \\"She ___ deploy the hotfix today.\\"", "options": ["have to", "has to", "having to", "to have"], "answer": 1, "explanation": "Con he/she/it usamos has to: She has to deploy..." },',
    '    { "id": "ex-2", "type": "fill-blank", "prompt": "Completa la oración con la forma correcta.", "template": "We ___ review the code before merging.", "blanks": ["have to"], "explanation": "Con we usamos have to + verbo base." },',
    '    { "id": "ex-3", "type": "fix-error", "prompt": "Corrige el error en la oración.", "sentence": "I have to fixed the login bug.", "answer": "I have to fix the login bug.", "explanation": "Después de have to va el verbo base: fix (no fixed)." },',
    '    { "id": "ex-4", "type": "builder", "prompt": "Ordena las palabras para formar una oración correcta.", "words": ["have", "to", "update", "the", "documentation"], "answer": "have to update the documentation", "explanation": "La estructura es: have to + verbo base + complemento." },',
    '    { "id": "ex-5", "type": "dialogue-order", "prompt": "Ordena el diálogo correctamente.", "lines": ["A: We have to fix this bug before release.", "B: Okay, I have to test it after your fix.", "A: Great, then we have to deploy it."], "explanation": "El diálogo sigue una secuencia lógica: problema, acción siguiente y despliegue." },',
    '    { "id": "ex-6", "type": "write", "prompt": "Escribe una oración en inglés usando \\"have to\\" sobre una tarea de desarrollo.", "answer": "I have to finish the API tests today.", "explanation": "Respuesta modelo con have to + verbo base en contexto dev." }',
    "  ]",
    "}",
    "",
    "AHORA GENERA LA RESPUESTA FINAL: devuelve SOLO el JSON de la lección solicitada sobre el tema indicado, cumpliendo todas las reglas anteriores.",
  ].join("\n");
}
