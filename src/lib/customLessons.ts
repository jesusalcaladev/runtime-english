import { getSessionMinutes } from './sessionTime'
import type { ContentBlock, Exercise, Session } from './types'

export interface CustomLesson extends Session {
  createdAt: number
  updatedAt: number
  source: 'manual' | 'ai'
  topic?: string
}

const STORAGE_KEY = 'runtimeenglish_custom_lessons_v1'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'leccion'
  )
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7)
}

export function generateCustomLessonId(): string {
  return `custom-${Date.now()}-${randomSuffix()}`
}

export function loadCustomLessons(): CustomLesson[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCustomLessonLike).sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

function isCustomLessonLike(value: unknown): value is CustomLesson {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    Array.isArray(value.blocks) &&
    Array.isArray(value.exercises)
  )
}

function saveAll(lessons: CustomLesson[]): void {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons))
}

export function getCustomLesson(id: string): CustomLesson | null {
  return loadCustomLessons().find((lesson) => lesson.id === id || lesson.slug === id) ?? null
}

export function upsertCustomLesson(lesson: CustomLesson): void {
  const lessons = loadCustomLessons()
  const idx = lessons.findIndex((item) => item.id === lesson.id)
  if (idx >= 0) lessons[idx] = lesson
  else lessons.unshift(lesson)
  saveAll(lessons)
}

export function deleteCustomLesson(id: string): void {
  saveAll(loadCustomLessons().filter((lesson) => lesson.id !== id))
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  if (!value.every((item) => typeof item === 'string')) return null
  return value as string[]
}

function validateExercise(
  value: unknown,
  index: number,
): { ok: true; exercise: Exercise } | { ok: false; error: string } {
  if (!isRecord(value)) return { ok: false, error: `Ejercicio #${index + 1}: debe ser un objeto.` }
  const type = asString(value.type)
  const prompt = asString(value.prompt)?.trim() ?? ''
  const explanation = asString(value.explanation)?.trim() ?? ''
  if (!type) return { ok: false, error: `Ejercicio #${index + 1}: falta "type".` }
  if (!prompt) return { ok: false, error: `Ejercicio #${index + 1}: falta "prompt".` }
  const id = asString(value.id)?.trim() || `ex-${index + 1}-${randomSuffix()}`

  switch (type) {
    case 'choice': {
      const options = asStringArray(value.options)
      const audio = asString(value.audio)?.trim()
      const answer = typeof value.answer === 'number' ? value.answer : NaN
      if (!options || options.length < 2)
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (choice): "options" debe tener al menos 2 textos.`,
        }
      if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) {
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (choice): "answer" debe ser el índice correcto (0-${options.length - 1}).`,
        }
      }
      return {
        ok: true,
        exercise: {
          id,
          type: 'choice',
          prompt,
          options,
          answer,
          explanation,
          ...(audio ? { audio } : {}),
        },
      }
    }
    case 'builder': {
      const words = asStringArray(value.words)
      const answer = asString(value.answer)?.trim() ?? ''
      if (!words || words.length < 2)
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (builder): "words" debe tener al menos 2 palabras.`,
        }
      if (!answer) return { ok: false, error: `Ejercicio #${index + 1} (builder): falta "answer".` }
      return { ok: true, exercise: { id, type: 'builder', prompt, words, answer, explanation } }
    }
    case 'write':
    case 'listen':
    case 'speak': {
      const answer =
        asString(value.answer)?.trim() ??
        (type === 'listen' ? (asString(value.audioText)?.trim() ?? '') : '')
      if (!answer) return { ok: false, error: `Ejercicio #${index + 1} (${type}): falta "answer".` }
      const accept = asStringArray(value.accept) ?? undefined
      const hint = asString(value.hint) ?? undefined
      if (type === 'listen') {
        const audioText = asString(value.audioText)?.trim() || answer
        return {
          ok: true,
          exercise: {
            id,
            type: 'listen',
            prompt,
            audioText,
            answer,
            ...(accept ? { accept } : {}),
            ...(hint ? { hint } : {}),
            explanation,
          },
        }
      }
      if (type === 'speak') {
        return {
          ok: true,
          exercise: {
            id,
            type: 'speak',
            prompt,
            answer,
            ...(accept ? { accept } : {}),
            ...(hint ? { hint } : {}),
            explanation,
          },
        }
      }
      return {
        ok: true,
        exercise: {
          id,
          type: 'write',
          prompt,
          answer,
          ...(accept ? { accept } : {}),
          ...(hint ? { hint } : {}),
          explanation,
        },
      }
    }
    case 'fill-blank': {
      const template = asString(value.template)?.trim() ?? ''
      const blanks = asStringArray(value.blanks)
      if (!template?.includes('___'))
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (fill-blank): "template" debe incluir ___ .`,
        }
      if (!blanks || blanks.length === 0)
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (fill-blank): "blanks" debe tener respuestas.`,
        }
      const hint = asString(value.hint) ?? undefined
      return {
        ok: true,
        exercise: {
          id,
          type: 'fill-blank',
          prompt,
          template,
          blanks,
          ...(hint ? { hint } : {}),
          explanation,
        },
      }
    }
    case 'dialogue-order': {
      const lines = asStringArray(value.lines)
      if (!lines || lines.length < 2)
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (dialogue-order): "lines" debe tener al menos 2 líneas.`,
        }
      const context = asString(value.context)?.trim()
      return {
        ok: true,
        exercise: {
          id,
          type: 'dialogue-order',
          prompt,
          ...(context ? { context } : {}),
          lines,
          explanation,
        },
      }
    }
    case 'fix-error': {
      const sentence = asString(value.sentence)?.trim() ?? ''
      const answer = asString(value.answer)?.trim() ?? ''
      if (!sentence || !answer)
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (fix-error): faltan "sentence" o "answer".`,
        }
      const accept = asStringArray(value.accept) ?? undefined
      const hint = asString(value.hint) ?? undefined
      return {
        ok: true,
        exercise: {
          id,
          type: 'fix-error',
          prompt,
          sentence,
          answer,
          ...(accept ? { accept } : {}),
          ...(hint ? { hint } : {}),
          explanation,
        },
      }
    }
    case 'roleplay': {
      const scenario = asString(value.scenario)?.trim() ?? ''
      const goal = asString(value.goal)?.trim() ?? ''
      const answer = asString(value.answer)?.trim() ?? ''
      if (!scenario || !goal || !answer)
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (roleplay): faltan "scenario", "goal" o "answer".`,
        }
      const accept = asStringArray(value.accept) ?? undefined
      const hint = asString(value.hint) ?? undefined
      return {
        ok: true,
        exercise: {
          id,
          type: 'roleplay',
          prompt,
          scenario,
          goal,
          answer,
          ...(accept ? { accept } : {}),
          ...(hint ? { hint } : {}),
          explanation,
        },
      }
    }
    case 'match': {
      if (!Array.isArray(value.pairs))
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (match): "pairs" debe ser una lista.`,
        }
      const pairs = value.pairs
        .filter(isRecord)
        .map((pair) => ({
          en: asString(pair.en)?.trim() ?? '',
          es: asString(pair.es)?.trim() ?? '',
        }))
        .filter((pair) => pair.en && pair.es)
      if (pairs.length < 2)
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (match): agrega al menos 2 pares con "en" y "es".`,
        }
      const hint = asString(value.hint) ?? undefined
      return {
        ok: true,
        exercise: { id, type: 'match', prompt, pairs, ...(hint ? { hint } : {}), explanation },
      }
    }
    case 'multi-choice': {
      const options = asStringArray(value.options)
      const answers = Array.isArray(value.answers)
        ? value.answers.filter((item): item is number => typeof item === 'number')
        : []
      if (!options || options.length < 2)
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (multi-choice): "options" debe tener al menos 2 textos.`,
        }
      if (answers.length === 0 || new Set(answers).size !== answers.length)
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (multi-choice): "answers" debe tener índices únicos y al menos uno.`,
        }
      if (
        answers.some(
          (answer) => !Number.isInteger(answer) || answer < 0 || answer >= options.length,
        )
      )
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (multi-choice): "answers" debe contener índices válidos (0-${options.length - 1}).`,
        }
      const hint = asString(value.hint) ?? undefined
      return {
        ok: true,
        exercise: {
          id,
          type: 'multi-choice',
          prompt,
          options,
          answers,
          ...(hint ? { hint } : {}),
          explanation,
        },
      }
    }
    case 'shadow': {
      const answer = asString(value.answer)?.trim() ?? ''
      if (!answer) return { ok: false, error: `Ejercicio #${index + 1} (shadow): falta "answer".` }
      const accept = asStringArray(value.accept) ?? undefined
      const hint = asString(value.hint) ?? undefined
      return {
        ok: true,
        exercise: {
          id,
          type: 'shadow',
          prompt,
          answer,
          ...(accept ? { accept } : {}),
          ...(hint ? { hint } : {}),
          explanation,
        },
      }
    }
    case 'dialogue-branch': {
      if (!Array.isArray(value.steps))
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (dialogue-branch): "steps" debe ser una lista.`,
        }
      const steps = value.steps
        .filter(isRecord)
        .map((step) => ({
          speaker: asString(step.speaker)?.trim() ?? '',
          line: asString(step.line)?.trim() ?? '',
          choices: Array.isArray(step.choices)
            ? step.choices
                .filter(isRecord)
                .map((choice) => ({
                  en: asString(choice.en)?.trim() ?? '',
                  correct: choice.correct === true,
                  feedback: asString(choice.feedback)?.trim() ?? '',
                  ...(typeof choice.next === 'number' ? { next: Math.trunc(choice.next) } : {}),
                }))
                .filter((choice) => choice.en && choice.feedback)
            : [],
        }))
        .filter((step) => step.speaker && step.line && step.choices.length >= 2)
      if (steps.length < 2 || steps.some((step) => !step.choices.some((choice) => choice.correct)))
        return {
          ok: false,
          error: `Ejercicio #${index + 1} (dialogue-branch): necesita al menos 2 pasos con 2 opciones y una respuesta correcta por paso.`,
        }
      const context = asString(value.context)?.trim()
      return {
        ok: true,
        exercise: {
          id,
          type: 'dialogue-branch',
          prompt,
          ...(context ? { context } : {}),
          steps,
          explanation,
        },
      }
    }
    default:
      return { ok: false, error: `Ejercicio #${index + 1}: tipo "${type}" no soportado.` }
  }
}

function validateBlock(
  value: unknown,
  index: number,
): { ok: true; block: ContentBlock } | { ok: false; error: string } {
  if (!isRecord(value)) return { ok: false, error: `Bloque #${index + 1}: debe ser un objeto.` }
  const type = asString(value.type)
  if (!type) return { ok: false, error: `Bloque #${index + 1}: falta "type".` }

  switch (type) {
    case 'technique': {
      const name = asString(value.name)?.trim() ?? ''
      const desc = asString(value.desc)?.trim() ?? ''
      if (!name || !desc)
        return { ok: false, error: `Bloque #${index + 1} (technique): faltan "name" o "desc".` }
      return { ok: true, block: { type: 'technique', name, desc } }
    }
    case 'text': {
      const body = asString(value.body)?.trim() ?? ''
      if (!body) return { ok: false, error: `Bloque #${index + 1} (text): falta "body".` }
      const title = asString(value.title)?.trim()
      return { ok: true, block: { type: 'text', ...(title ? { title } : {}), body } }
    }
    case 'dialogue': {
      if (!Array.isArray(value.lines))
        return { ok: false, error: `Bloque #${index + 1} (dialogue): "lines" debe ser una lista.` }
      const lines = value.lines
        .filter(isRecord)
        .map((line) => ({
          speaker: asString(line.speaker) === 'b' ? ('b' as const) : ('a' as const),
          name: asString(line.name)?.trim() ?? '',
          role: asString(line.role)?.trim(),
          en: asString(line.en)?.trim() ?? '',
          es: asString(line.es)?.trim(),
        }))
        .filter((line) => line.en && line.name)
      if (lines.length < 4)
        return {
          ok: false,
          error: `Bloque #${index + 1} (dialogue): agrega al menos 4 líneas con "name" y "en" para que sea una conversación real.`,
        }
      const context = asString(value.context)?.trim()
      if (!context)
        return {
          ok: false,
          error: `Bloque #${index + 1} (dialogue): falta "context". Describe la escena para que las líneas tengan sentido.`,
        }

      // A coherent scene: turns alternate and each speaker keeps the same name.
      const namesBySpeaker = new Map<string, string>()
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
        const line = lines[lineIndex]
        const previous = namesBySpeaker.get(line.speaker)
        if (previous && previous !== line.name)
          return {
            ok: false,
            error: `Bloque #${index + 1} (dialogue): "${line.speaker}" cambia de nombre (${previous} / ${line.name}). Usa los mismos nombres en toda la escena.`,
          }
        namesBySpeaker.set(line.speaker, line.name)
        const next = lines[lineIndex + 1]
        if (next && next.speaker === line.speaker)
          return {
            ok: false,
            error: `Bloque #${index + 1} (dialogue): los hablantes deben alternarse (líneas ${lineIndex + 1} y ${lineIndex + 2}).`,
          }
      }

      const title = asString(value.title)?.trim()
      const setting = asString(value.setting)?.trim()
      const goal = asString(value.goal)?.trim()
      return {
        ok: true,
        block: {
          type: 'dialogue',
          ...(title ? { title } : {}),
          ...(setting ? { setting } : {}),
          ...(goal ? { goal } : {}),
          context,
          lines,
        },
      }
    }
    case 'vocab': {
      if (!Array.isArray(value.items))
        return { ok: false, error: `Bloque #${index + 1} (vocab): "items" debe ser una lista.` }
      const items = value.items
        .filter(isRecord)
        .map((item) => ({
          en: asString(item.en)?.trim() ?? '',
          es: asString(item.es)?.trim() ?? '',
          ...(asString(item.example) ? { example: asString(item.example)?.trim() } : {}),
          ...(asString(item.note) ? { note: asString(item.note)?.trim() } : {}),
        }))
        .filter((item) => item.en && item.es)
      if (items.length === 0)
        return { ok: false, error: `Bloque #${index + 1} (vocab): agrega items con "en" y "es".` }
      const title = asString(value.title)?.trim()
      return { ok: true, block: { type: 'vocab', ...(title ? { title } : {}), items } }
    }
    case 'phrases': {
      if (!Array.isArray(value.items))
        return { ok: false, error: `Bloque #${index + 1} (phrases): "items" debe ser una lista.` }
      const items = value.items
        .filter(isRecord)
        .map((item) => ({
          en: asString(item.en)?.trim() ?? '',
          es: asString(item.es)?.trim() ?? '',
        }))
        .filter((item) => item.en && item.es)
      if (items.length === 0)
        return { ok: false, error: `Bloque #${index + 1} (phrases): agrega items con "en" y "es".` }
      const title = asString(value.title)?.trim()
      return { ok: true, block: { type: 'phrases', ...(title ? { title } : {}), items } }
    }
    case 'table': {
      const columns = asStringArray(value.columns)
      if (!columns || columns.length === 0)
        return { ok: false, error: `Bloque #${index + 1} (table): "columns" requerido.` }
      if (!Array.isArray(value.rows))
        return { ok: false, error: `Bloque #${index + 1} (table): "rows" requerido.` }
      const rows = value.rows
        .filter((row): row is unknown[] => Array.isArray(row))
        .map((row) => row.map((cell) => String(cell ?? '')))
      const title = asString(value.title)?.trim()
      return { ok: true, block: { type: 'table', ...(title ? { title } : {}), columns, rows } }
    }
    case 'callout': {
      const title = asString(value.title)?.trim() ?? ''
      const body = asString(value.body)?.trim() ?? ''
      const tone = asString(value.tone)
      if (!title || !body)
        return { ok: false, error: `Bloque #${index + 1} (callout): faltan "title" o "body".` }
      const safeTone = tone === 'warning' || tone === 'info' ? tone : 'tip'
      return { ok: true, block: { type: 'callout', tone: safeTone, title, body } }
    }
    case 'tenses': {
      if (!Array.isArray(value.items))
        return { ok: false, error: `Bloque #${index + 1} (tenses): "items" requerido.` }
      const items = value.items
        .filter(isRecord)
        .map((item) => ({
          name: asString(item.name)?.trim() ?? '',
          tag: asString(item.tag)?.trim() ?? '',
          formula: asString(item.formula)?.trim() ?? '',
          cases: asStringArray(item.cases) ?? [],
        }))
        .filter((item) => item.name)
      if (items.length === 0)
        return { ok: false, error: `Bloque #${index + 1} (tenses): items inválidos.` }
      return { ok: true, block: { type: 'tenses', items } }
    }
    case 'slang': {
      const ids = asStringArray(value.ids)
      if (!ids || ids.length === 0)
        return { ok: false, error: `Bloque #${index + 1} (slang): "ids" requerido.` }
      const title = asString(value.title)?.trim()
      return { ok: true, block: { type: 'slang', ...(title ? { title } : {}), ids } }
    }
    default:
      return {
        ok: false,
        error: `Bloque #${index + 1}: tipo "${type}" no soportado en lecciones personalizadas.`,
      }
  }
}

export interface ImportResult {
  ok: boolean
  lesson?: CustomLesson
  errors: string[]
}

export function importCustomLessonJson(
  raw: unknown,
  options?: { source?: 'manual' | 'ai'; topic?: string },
): ImportResult {
  const errors: string[] = []
  if (!isRecord(raw)) return { ok: false, errors: ['El JSON debe ser un objeto de lección.'] }

  const title = asString(raw.title)?.trim() ?? ''
  if (!title) errors.push('Falta "title".')

  const blocksRaw = Array.isArray(raw.blocks) ? raw.blocks : null
  const exercisesRaw = Array.isArray(raw.exercises) ? raw.exercises : null
  if (!blocksRaw) errors.push('"blocks" debe ser una lista.')
  if (!exercisesRaw) errors.push('"exercises" debe ser una lista.')
  if (errors.length > 0 || !blocksRaw || !exercisesRaw) return { ok: false, errors }

  const blocks: ContentBlock[] = []
  blocksRaw.forEach((block, index) => {
    const result = validateBlock(block, index)
    if (result.ok) blocks.push(result.block)
    else errors.push(result.error)
  })

  const exercises: Exercise[] = []
  exercisesRaw.forEach((exercise, index) => {
    const result = validateExercise(exercise, index)
    if (result.ok) exercises.push(result.exercise)
    else errors.push(result.error)
  })

  if (blocks.length === 0) errors.push('La lección debe tener al menos 1 bloque.')
  if (exercises.length === 0) errors.push('La lección debe tener al menos 1 ejercicio.')
  if (errors.length > 0) return { ok: false, errors: errors.slice(0, 8) }

  const now = Date.now()
  const id = asString(raw.id)?.trim() || generateCustomLessonId()
  const baseSlug = asString(raw.slug)?.trim() || slugify(title)
  const slug = `custom-${baseSlug}-${randomSuffix()}`
  const objectives = asStringArray(raw.objectives)?.slice(0, 8) ?? [
    'Practicar el tema de la lección.',
  ]

  const lesson: CustomLesson = {
    id,
    slug,
    title,
    step: asString(raw.step)?.trim() || 'Custom',
    cefr: (asString(raw.cefr) as CustomLesson['cefr']) || 'A2',
    summary: asString(raw.summary)?.trim() || `Lección personalizada sobre ${title}.`,
    objectives,
    blocks,
    pronunciation: asString(raw.pronunciation)?.trim() || undefined,
    exercises,
    createdAt: now,
    updatedAt: now,
    source: options?.source ?? 'manual',
    topic: options?.topic?.trim() || undefined,
  }
  lesson.minutes = getSessionMinutes(lesson)

  return { ok: true, lesson, errors: [] }
}

export function buildAiLessonPrompt(topic: string): string {
  const cleanTopic = topic.trim() || 'have to / must / should'

  return [
    'Eres un generador experto de lecciones para RuntimeEnglish, una app de inglés para developers.',
    `TEMA DE LA LECCIÓN: "${cleanTopic}"`,
    '',
    'TU RESPUESTA DEBE SER ÚNICAMENTE UN JSON VÁLIDO.',
    '- Empieza con { y termina con }.',
    '- No escribas markdown, bloques ```json, comentarios ni texto antes o después.',
    '- Usa comillas dobles en todas las claves y strings. Sin comas finales.',
    '- No uses emojis en ningún campo.',
    '',
    'OBJETIVO:',
    'Crea UNA lección personalizada, clara y 100% compatible con el importador de RuntimeEnglish.',
    '',
    'REGLAS DE IDIOMA:',
    '- Español: summary, objectives, explanations, significados (es), contextos y pistas (hint).',
    '- Inglés: title del vocabulario/frases (en), ejemplos, diálogos y respuestas de ejercicios.',
    '- Los ejemplos deben sonar a trabajo real de developers: bugs, PRs, tests, deploys, docs, reuniones o tickets.',
    '',
    'REGLAS DE PHRASAL VERBS (IMPORTANTE):',
    '- Incluye de 2 a 4 phrasal verbs de uso real en equipos de desarrollo (p. ej. set up, check out, run into, figure out, track down, roll back, follow up, wrap up).',
    '- Cada phrasal verb debe llevar su significado en español y un ejemplo corto en inglés dentro de un contexto dev.',
    '- Usa solo phrasal verbs naturales y correctos; no inventes combinaciones. Respeta la forma en pasado cuando haga falta (ran into, tracked down, rolled back).',
    '',
    'ESQUEMA DE LA LECCIÓN (TODOS LOS CAMPOS SON OBLIGATORIOS SALVO QUE SE INDIQUE "opcional"):',
    '{',
    '  "title": "string",',
    '  "summary": "string",',
    '  "cefr": "A1" | "A2" | "B1" | "B2",',
    '  "objectives": ["string", "string", "string"],',
    '  "blocks": [ ...4 a 6 bloques válidos, con 1 o 2 consejos como máximo... ],',
    '  "exercises": [ ...8 ejercicios válidos... ]',
    '}',
    'No incluyas "minutes": la app lo calcula automáticamente.',
    'No añadas campos fuera de este esquema.',
    '',
    'BLOQUES PERMITIDOS (usa SOLO estos 6 tipos):',
    '1) technique: { "type": "technique", "name": "string", "desc": "string" }',
    '2) text: { "type": "text", "title": "string", "body": "string" }',
    '3) vocab: { "type": "vocab", "title": "string", "items": [ { "en": "string", "es": "string", "example": "string" } ] }',
    '4) phrases: { "type": "phrases", "title": "string", "items": [ { "en": "string", "es": "string" } ] }',
    '5) callout: { "type": "callout", "tone": "tip" | "warning" | "info", "title": "string", "body": "string" }',
    '6) dialogue: { "type": "dialogue", "title": "string", "setting": "string", "goal": "string", "context": "string", "lines": [ { "speaker": "a" | "b", "name": "string", "role": "string" (opcional), "en": "string", "es": "string" (opcional) } ] }',
    '',
    'LÍMITE DE CONSEJOS (REGLA ESTRICTA):',
    '- Cuenta como "consejo" todo bloque "technique" y todo bloque "callout", sea cual sea su tone ("tip", "info" o "warning").',
    '- Genera SOLO 1 consejo por lección; como máximo 2 si el tema realmente lo justifica. NUNCA 3 ni más.',
    '- El resto de bloques debe ser contenido (vocab, phrases, dialogue, text, tablas), no más consejos.',
    '',
    'REGLAS PARA EL BLOQUE "dialogue" (IMPORTANTE):',
    '- Es OPCIONAL. Inclúyelo SOLO si el tema es una situación conversacional concreta (standups, code review, pedir ayuda, async, entrevistas, demos, incidentes).',
    '- Para temas puramente gramaticales (p. ej. "have to", pretéritos, preposiciones), NO uses dialogue: usa technique/vocab/phrases/callout.',
    '- "context" es OBLIGATORIO: 1 o 2 frases en español que digan quién habla, dónde y qué está pasando. "setting" es una etiqueta corta (p. ej. "Daily, sala de equipo") y "goal" dice qué se quiere lograr (p. ej. "Aclarar el bloqueo y pedir ayuda").',
    '- Si lo incluyes, usa entre 4 y 6 líneas, alterna "speaker" entre "a" y "b" en TODAS las líneas, y usa los MISMOS nombres y roles para cada hablante en toda la escena.',
    '- Las líneas DEBEN formar una conversación con arco: apertura → problema o pregunta → reacción/aclaración → cierre o solución. Cada línea responde o reacciona a la anterior; nada de saltos de tema.',
    '- PROHIBIDO escribir una lista de frases de ejemplo independientes para practicar gramática. Aunque el tema sea gramatical, si usas dialogue debe parecer una escena real: alguien pregunta, el otro contesta y se llega a un acuerdo.',
    '- Cada "en" debe ser una frase corta y natural; "es" es la traducción al español. Mantén la estructura gramatical del tema DENTRO del flujo conversacional.',
    '- La app reproducirá el diálogo con voz y mostrará dos avatares; por eso las líneas deben sonar a conversación real, no a lista de ejemplos.',
    '- Si incluyes dialogue, añade también 1 o 2 ejercicios de comprensión como choice dentro de los 6 ejercicios básicos.',
    '',
    'REGLAS DE EJERCICIOS (MUY IMPORTANTE):',
    '- Usa SOLO estos tipos: choice, fill-blank, fix-error, builder, dialogue-order, write, match, multi-choice, shadow, dialogue-branch (opcional).',
    '- El importador también acepta listen, speak y roleplay, pero ESTA PROMPT no los usa: no los generes.',
    '- Incluye exactamente 8 ejercicios, en este orden, con estos IDs:',
    '  ex-1 = choice',
    '  ex-2 = fill-blank',
    '  ex-3 = fix-error',
    '  ex-4 = builder',
    '  ex-5 = dialogue-order',
    '  ex-6 = write',
    '  ex-7 = match (emparejar 3-5 chunks en inglés con su significado en español)',
    '  ex-8 = shadow (repetir en voz alta un chunk de 4-10 palabras) o multi-choice (varias respuestas correctas)',
    '- Los 2 ejercicios extra (ex-7 y ex-8) son obligatorios: refuerzan vocabulario y pronunciación.',
    '- Todos los ejercicios necesitan "id", "type", "prompt" y "explanation".',
    '- La "explanation" siempre en español y debe explicar POR QUÉ la respuesta es correcta.',
    '',
    'FORMATO EXACTO POR TIPO:',
    'A) choice (ex-1):',
    '   { "id": "ex-1", "type": "choice", "prompt": "...", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "..." }',
    '   - options: entre 3 y 4 strings, sin duplicados y con una sola respuesta correcta.',
    '   - answer: entero 0-based (índice de la opción correcta).',
    '',
    'B) fill-blank (ex-2):',
    '   { "id": "ex-2", "type": "fill-blank", "prompt": "...", "template": "We ___ review the code.", "blanks": ["have to"], "explanation": "..." }',
    '   - template debe contener exactamente un "___" por cada elemento de blanks.',
    '   - blanks: array no vacío con las respuestas en orden. Usa "|" para alternativas, p. ej. "have to|\'ve to".',
    '   - "hint" es opcional y debe guiar, no revelar la respuesta completa.',
    '',
    'C) fix-error (ex-3):',
    '   { "id": "ex-3", "type": "fix-error", "prompt": "...", "sentence": "I have to fixed the bug.", "answer": "I have to fix the bug.", "explanation": "..." }',
    '   - sentence y answer deben ser diferentes.',
    '   - "hint" es opcional.',
    '',
    'D) builder (ex-4):',
    '   { "id": "ex-4", "type": "builder", "prompt": "...", "words": ["have", "to", "review", "the", "PR"], "answer": "have to review the PR", "explanation": "..." }',
    '   - words: al menos 2 tokens.',
    '   - REGLA ESTRICTA: words.join(" ") debe ser IGUAL a answer (mismo orden y puntuación).',
    '',
    'E) dialogue-order (ex-5):',
    '   { "id": "ex-5", "type": "dialogue-order", "prompt": "...", "context": "Quién habla, dónde y por qué: una escena concreta, no una lista de frases de gramática.", "lines": ["A: ...", "B: ...", "A: ..."], "explanation": "..." }',
    '   - lines: al menos 2 strings YA en el orden correcto final.',
    '   - context: obligatorio; describe la escena para que las líneas tengan sentido.',
    '',
    'F) write (ex-6):',
    '   { "id": "ex-6", "type": "write", "prompt": "...", "answer": "I have to deploy the hotfix today.", "hint": "...", "accept": ["I need to deploy the hotfix today."], "explanation": "..." }',
    '   - answer: respuesta modelo en inglés.',
    '   - hint: obligatoria; guía con la estructura, NO copies la respuesta.',
    '   - accept: opcional; incluye al menos una variante natural si existe (contracción vs forma extendida, "percent" vs "%", con/sin "the").',
    '',
    'G) match (ex-7):',
    '   { "id": "ex-7", "type": "match", "prompt": "Empareja cada chunk con su significado.", "pairs": [ { "en": "roll back", "es": "revertir un despliegue" }, { "en": "figure out", "es": "entender / resolver" }, { "en": "follow up", "es": "dar seguimiento" } ], "explanation": "..." }',
    '   - pairs: entre 3 y 5 objetos con "en" (inglés) y "es" (español), sin repetidos.',
    '',
    'H) shadow o multi-choice (ex-8):',
    '   { "id": "ex-8", "type": "shadow", "prompt": "Escucha y repite en voz alta.", "answer": "We have to roll back the release.", "explanation": "..." }',
    '   { "id": "ex-8", "type": "multi-choice", "prompt": "Elige TODAS las opciones correctas.", "options": ["A", "B", "C", "D"], "answers": [0, 2], "explanation": "..." }',
    '   - shadow: answer de 4-10 palabras en inglés; el usuario lo repite con el micrófono.',
    '   - multi-choice: answers es un array de índices 0-based únicos, con al menos 1 y más de 1 cuando tenga sentido.',
    '',
    'CHECKLIST ANTES DE RESPONDER (verifica mentalmente):',
    '- El JSON empieza con { y termina con }.',
    '- 4-6 bloques, todos de tipos permitidos.',
    '- Máximo 2 consejos en total (technique + callout de cualquier tone); el resto es contenido, no consejos.',
    '- Hay 2-4 phrasal verbs dev, cada uno con significado en español y ejemplo en inglés.',
    '- Si hay dialogue: 4-6 líneas, speakers alternados sin excepción, mismos nombres/roles, con context/setting/goal y un arco apertura → problema → reacción → cierre.',
    '- Exactamente 8 ejercicios: ex-1 choice, ex-2 fill-blank, ex-3 fix-error, ex-4 builder, ex-5 dialogue-order, ex-6 write, ex-7 match, ex-8 shadow o multi-choice.',
    '- En choice, answer es un índice válido.',
    '- En fill-blank, número de "___" = número de blanks.',
    '- En builder, words.join(" ") === answer.',
    '- En write, hint presente y no delata la respuesta.',
    '- En match, 3-5 pares en y es; en multi-choice, answers son índices válidos y únicos; en shadow, answer de 4-10 palabras.',
    '- Sin campos extra, sin emojis, sin markdown.',
    '',
    'EJEMPLO DE BLOQUE dialogue VÁLIDO (solo si el tema es conversacional):',
    '{ "type": "dialogue", "title": "Pedir ayuda en un daily", "setting": "Daily, sala de equipo", "goal": "Aclarar el bloqueo y acordar quién lo resuelve", "context": "Es el daily de la mañana. Leo tiene un bloqueo con un token de API y Maya quiere detalles para poder ayudar.", "lines": [',
    '  { "speaker": "a", "name": "Maya", "role": "Lead", "en": "Any blockers today?", "es": "¿Algún bloqueo hoy?" },',
    '  { "speaker": "b", "name": "Leo", "role": "Dev", "en": "Yes, I am blocked by the API token. The tests fail with a 401.", "es": "Sí, estoy bloqueado por el token de la API. Los tests fallan con un 401." },',
    '  { "speaker": "a", "name": "Maya", "role": "Lead", "en": "Thanks. Is the token expired or missing from the config?", "es": "Gracias. ¿El token está caducado o falta en la configuración?" },',
    '  { "speaker": "b", "name": "Leo", "role": "Dev", "en": "It is missing in staging. I can add it and rerun the suite.", "es": "Falta en staging. Puedo añadirlo y volver a correr la suite." },',
    '  { "speaker": "a", "name": "Maya", "role": "Lead", "en": "Great, do that and ping me if it is still red.", "es": "Perfecto, hazlo y avísame si sigue en rojo." }',
    '] }',
    '',
    'EJEMPLO COMPLETO (sigues este nivel de detalle, sin copiar el tema):',
    'Ojo: el ejemplo tiene exactamente 2 consejos (1 technique + 1 callout tip). No superes ese número.',
    '{',
    '  "title": "Have to para obligaciones en el trabajo dev",',
    '  "summary": "Aprende a usar have to para hablar de obligaciones y tareas necesarias en contextos de desarrollo de software.",',
    '  "cefr": "A2",',
    '  "objectives": [',
    '    "Usar have to para expresar obligaciones en inglés.",',
    '    "Formar oraciones afirmativas y corregir errores comunes.",',
    '    "Aplicar have to en situaciones reales de trabajo dev."',
    '  ],',
    '  "blocks": [',
    '    { "type": "technique", "name": "Have to = obligación", "desc": "Usa have to + verbo base para hablar de algo necesario u obligatorio: I have to fix this bug." },',
    '    { "type": "text", "title": "Uso básico", "body": "Have to expresa obligación. En presente: I/you/we/they have to, he/she/it has to. Después siempre va el verbo en forma base." },',
    '    { "type": "vocab", "title": "Vocabulario clave", "items": [',
    '      { "en": "have to", "es": "tener que (obligación)", "example": "I have to review the pull request." },',
    '      { "en": "roll back", "es": "revertir (un despliegue o cambio)", "example": "We have to roll back the release." },',
    '      { "en": "set up", "es": "configurar / preparar", "example": "I have to set up the test environment." },',
    '      { "en": "deploy", "es": "desplegar", "example": "She has to deploy the hotfix." }',
    '    ] },',
    '    { "type": "phrases", "title": "Frases útiles", "items": [',
    '      { "en": "I have to update the documentation.", "es": "Tengo que actualizar la documentación." },',
    '      { "en": "We have to finish this before the demo.", "es": "Tenemos que terminar esto antes de la demo." }',
    '    ] },',
    '    { "type": "callout", "tone": "tip", "title": "Tip rápido", "body": "Después de have to/has to usa el verbo base: have to fix, has to deploy (no fixed, no deploys)." }',
    '  ],',
    '  "exercises": [',
    '    { "id": "ex-1", "type": "choice", "prompt": "Elige la opción correcta: \'She ___ deploy the hotfix today.\'", "options": ["have to", "has to", "having to", "to have"], "answer": 1, "explanation": "Con he/she/it usamos has to: She has to deploy..." },',
    '    { "id": "ex-2", "type": "fill-blank", "prompt": "Completa la oración con la forma correcta.", "template": "We ___ review the code before merging.", "blanks": ["have to"], "explanation": "Con we usamos have to + verbo base." },',
    '    { "id": "ex-3", "type": "fix-error", "prompt": "Corrige el error en la oración.", "sentence": "I have to fixed the login bug.", "answer": "I have to fix the login bug.", "explanation": "Después de have to va el verbo base: fix (no fixed)." },',
    '    { "id": "ex-4", "type": "builder", "prompt": "Ordena las palabras para formar una oración correcta.", "words": ["have", "to", "update", "the", "documentation"], "answer": "have to update the documentation", "explanation": "La estructura es: have to + verbo base + complemento." },',
    '    { "id": "ex-5", "type": "dialogue-order", "prompt": "Ordena el diálogo correctamente.", "context": "En una reunión de release, Maya y Leo acuerdan arreglar un bug, probarlo y desplegarlo.", "lines": ["A: We have to fix this bug before release.", "B: Okay, I have to test it after your fix.", "A: Great, then we have to deploy it."], "explanation": "El diálogo sigue una secuencia lógica: problema, acción siguiente y despliegue." },',
    '    { "id": "ex-6", "type": "write", "prompt": "Escribe una oración en inglés usando \'have to\' sobre una tarea de desarrollo.", "answer": "I have to finish the API tests today.", "hint": "Empieza con I have to + verbo base.", "accept": ["I need to finish the API tests today."], "explanation": "Respuesta modelo con have to + verbo base en contexto dev." }',
    '    { "id": "ex-7", "type": "match", "prompt": "Empareja cada chunk con su significado.", "pairs": [ { "en": "set up", "es": "configurar / preparar" }, { "en": "roll back", "es": "revertir un despliegue" }, { "en": "follow up", "es": "dar seguimiento" } ], "explanation": "Chunks habituales en equipos de desarrollo." }',
    '    { "id": "ex-8", "type": "shadow", "prompt": "Escucha y repite en voz alta.", "answer": "I have to review the pull request today.", "explanation": "Repetir el chunk completo mejora ritmo y pronunciación." }',
    '  ]',
    '}',
    '',
    'AHORA GENERA LA RESPUESTA FINAL: devuelve SOLO el JSON de la lección solicitada sobre el tema indicado, cumpliendo todas las reglas anteriores.',
  ].join('\n')
}
