import type { Exercise, Session } from '../../lib/types'

export interface AdvancedPhrase {
  en: string
  es: string
}

export interface AdvancedSessionSeed {
  id: string
  slug: string
  title: string
  step: string
  cefr: 'C1' | 'C2'
  summary: string
  objectives: string[]
  pronunciation: string
  prerequisite: string
  technique: { name: string; desc: string }
  phrases: AdvancedPhrase[]
  choice: {
    prompt: string
    options: [string, string, string]
    answer: number
    explanation: string
  }
  fix: { prompt: string; sentence: string; answer: string; hint: string; explanation: string }
  write: { prompt: string; answer: string; hint: string; explanation: string }
  speak: { prompt: string; answer: string; hint: string; explanation: string }
}

/** Builds a C1/C2 session that satisfies the curriculum integrity rules. */
export function makeAdvancedSession(seed: AdvancedSessionSeed): Session {
  const exercises: Exercise[] = [
    {
      id: `${seed.id}-e1`,
      type: 'choice',
      prompt: seed.choice.prompt,
      options: [...seed.choice.options],
      answer: seed.choice.answer,
      explanation: seed.choice.explanation,
    },
    {
      id: `${seed.id}-e2`,
      type: 'fix-error',
      prompt: seed.fix.prompt,
      sentence: seed.fix.sentence,
      answer: seed.fix.answer,
      hint: seed.fix.hint,
      explanation: seed.fix.explanation,
    },
    {
      id: `${seed.id}-e3`,
      type: 'builder',
      prompt: `Construye la frase: ${seed.write.prompt}`,
      words: seed.write.answer.split(' '),
      answer: seed.write.answer,
      explanation: seed.write.explanation,
    },
    {
      id: `${seed.id}-e4`,
      type: 'write',
      prompt: seed.write.prompt,
      answer: seed.write.answer,
      hint: seed.write.hint,
      explanation: seed.write.explanation,
    },
    {
      id: `${seed.id}-e5`,
      type: 'speak',
      prompt: seed.speak.prompt,
      answer: seed.speak.answer,
      hint: seed.speak.hint,
      explanation: seed.speak.explanation,
    },
  ]

  return {
    id: seed.id,
    slug: seed.slug,
    title: seed.title,
    step: seed.step,
    cefr: seed.cefr,
    summary: seed.summary,
    objectives: seed.objectives,
    pronunciation: seed.pronunciation,
    blocks: [
      {
        type: 'callout',
        tone: 'info',
        title: 'Antes de esta lección',
        body: seed.prerequisite,
      },
      {
        type: 'technique',
        name: seed.technique.name,
        desc: seed.technique.desc,
      },
      {
        type: 'phrases',
        title: 'Lenguaje de nivel avanzado',
        items: seed.phrases,
      },
    ],
    exercises,
  }
}
