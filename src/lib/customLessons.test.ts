import { describe, expect, it } from 'vitest'
import { buildAiLessonPrompt, importCustomLessonJson } from './customLessons'

describe('importCustomLessonJson', () => {
  it('rejects non-object input', () => {
    const result = importCustomLessonJson(null)
    expect(result.ok).toBe(false)
    expect(result.errors[0]).toContain('objeto de lección')
  })

  it('reports missing required top-level fields', () => {
    const result = importCustomLessonJson({})
    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Falta "title".',
        '"blocks" debe ser una lista.',
        '"exercises" debe ser una lista.',
      ]),
    )
  })

  it('rejects unsupported block and exercise types with details', () => {
    const result = importCustomLessonJson({
      title: 'Test',
      blocks: [{ type: 'unknown' }],
      exercises: [{ type: 'unknown', prompt: 'p', explanation: '' }],
    })
    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('no soportado en lecciones personalizadas')
    expect(result.errors.join('\n')).toContain('tipo "unknown" no soportado')
  })

  it('imports a valid minimal lesson and normalizes defaults', () => {
    const result = importCustomLessonJson(
      {
        title: '  Condicionales en deploys  ',
        cefr: 'B1',
        summary: '  Practica condicionales  ',
        objectives: ['Obj 1'],
        blocks: [
          {
            type: 'text',
            title: 'Intro',
            body: '  Usa if/when en incidentes.  ',
          },
        ],
        exercises: [
          {
            type: 'choice',
            prompt: 'Choose the correct option',
            options: ['If the build fails, we rollback.', 'If the build fails we rollbacked.'],
            answer: 0,
            explanation: 'Zero/first conditional in ops context.',
          },
        ],
      },
      { source: 'ai', topic: 'conditionals' },
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.lesson).toBeDefined()
    const lesson = result.lesson!
    expect(lesson.title).toBe('Condicionales en deploys')
    expect(lesson.summary).toBe('Practica condicionales')
    expect(lesson.cefr).toBe('B1')
    expect(lesson.source).toBe('ai')
    expect(lesson.topic).toBe('conditionals')
    expect(lesson.slug).toMatch(/^custom-condicionales-en-deploys-[a-z0-9]+$/)
    expect(lesson.id).toMatch(/^custom-/)
    expect(lesson.blocks).toHaveLength(1)
    expect(lesson.blocks[0]).toEqual({
      type: 'text',
      title: 'Intro',
      body: 'Usa if/when en incidentes.',
    })
    expect(lesson.exercises).toHaveLength(1)
    expect(lesson.exercises[0]).toMatchObject({
      type: 'choice',
      prompt: 'Choose the correct option',
      options: ['If the build fails, we rollback.', 'If the build fails we rollbacked.'],
      answer: 0,
      explanation: 'Zero/first conditional in ops context.',
    })
    expect(typeof lesson.exercises[0].id).toBe('string')
    expect(lesson.minutes).toBeGreaterThan(0)
  })

  it('validates choice answer bounds and fill-blank template requirements', () => {
    const badChoice = importCustomLessonJson({
      title: 'T',
      blocks: [{ type: 'text', body: 'b' }],
      exercises: [{ type: 'choice', prompt: 'p', options: ['a', 'b'], answer: 2, explanation: '' }],
    })
    expect(badChoice.ok).toBe(false)
    expect(badChoice.errors.join('\n')).toContain('índice correcto')

    const badFill = importCustomLessonJson({
      title: 'T',
      blocks: [{ type: 'text', body: 'b' }],
      exercises: [
        {
          type: 'fill-blank',
          prompt: 'p',
          template: 'No placeholder',
          blanks: ['x'],
          explanation: '',
        },
      ],
    })
    expect(badFill.ok).toBe(false)
    expect(badFill.errors.join('\n')).toContain('debe incluir ___')
  })
})

describe('buildAiLessonPrompt', () => {
  it('includes the requested topic and core schema instructions', () => {
    const prompt = buildAiLessonPrompt('phrasal verbs for debugging')
    expect(prompt).toContain('TEMA DE LA LECCIÓN: "phrasal verbs for debugging"')
    expect(prompt).toContain('TU RESPUESTA DEBE SER ÚNICAMENTE UN JSON VÁLIDO')
    expect(prompt).toContain('"exercises": [ ...6 ejercicios válidos... ]')
    expect(prompt).toContain('ex-1 = choice')
  })

  it('limits advice blocks to at most 2', () => {
    const prompt = buildAiLessonPrompt('phrasal verbs for debugging')
    expect(prompt).toContain('LÍMITE DE CONSEJOS (REGLA ESTRICTA)')
    expect(prompt).toContain('NUNCA 3 ni más')
    expect(prompt).toContain('Máximo 2 consejos en total (technique + callout de cualquier tone)')
  })

  it('requires dev phrasal verbs with meaning and example', () => {
    const prompt = buildAiLessonPrompt('phrasal verbs for debugging')
    expect(prompt).toContain('REGLAS DE PHRASAL VERBS (IMPORTANTE)')
    expect(prompt).toContain(
      'Hay 2-4 phrasal verbs dev, cada uno con significado en español y ejemplo en inglés.',
    )
  })

  it('falls back to a default topic when input is empty', () => {
    const prompt = buildAiLessonPrompt('   ')
    expect(prompt).toContain('TEMA DE LA LECCIÓN: "have to / must / should"')
  })
})
