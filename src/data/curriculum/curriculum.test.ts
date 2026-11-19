import { describe, expect, it } from 'vitest'
import type { Exercise, Session } from '../../lib/types'
import { SLANG } from '../slang'
import { ALL_SESSIONS, getNavData, getSessionById, MODULES } from './index'

const slangIds = new Set(SLANG.map((entry) => entry.id))

function stepMatch(step: string): RegExpMatchArray {
  const match = step.match(/(?:Paso|Especial)\s+(\d+)\.(\d+)/i)
  if (!match) throw new Error(`Paso no válido en step: "${step}"`)
  return match
}

function stepNumber(step: string): number {
  const match = stepMatch(step)
  return Number(match[1]) * 100 + Number(match[2])
}

function stepModule(step: string): number {
  return Number(stepMatch(step)[1])
}

function cefrAllowedFor(level: string, cefr: string): boolean {
  return level === 'A1-A2' ? ['A1', 'A2'].includes(cefr) : ['B1', 'B2'].includes(cefr)
}

function validateExercise(exercise: Exercise, session: Session) {
  expect(exercise.id.startsWith(`${session.id}-e`)).toBe(true)
  expect(exercise.prompt.trim().length).toBeGreaterThan(0)
  expect(exercise.explanation.trim().length).toBeGreaterThan(0)

  switch (exercise.type) {
    case 'choice':
      expect(exercise.options.length).toBeGreaterThanOrEqual(2)
      expect(new Set(exercise.options).size).toBe(exercise.options.length)
      expect(Number.isInteger(exercise.answer)).toBe(true)
      expect(exercise.answer).toBeGreaterThanOrEqual(0)
      expect(exercise.answer).toBeLessThan(exercise.options.length)
      break
    case 'builder':
      expect(exercise.words.length).toBeGreaterThan(0)
      expect(exercise.words.join(' ')).toBe(exercise.answer)
      break
    case 'fill-blank': {
      const blanksInTemplate = (exercise.template.match(/___/g) ?? []).length
      expect(blanksInTemplate).toBe(exercise.blanks.length)
      break
    }
    case 'listen':
      expect(exercise.audioText.trim().length).toBeGreaterThan(0)
      expect(exercise.answer.trim().length).toBeGreaterThan(0)
      break
    case 'speak':
      expect(exercise.answer.trim().length).toBeGreaterThan(0)
      break
    case 'dialogue-order':
      expect(
        exercise.context?.trim().length ?? 0,
        `${exercise.id} (dialogue-order) needs a scene context`,
      ).toBeGreaterThan(0)
      expect(exercise.lines.length).toBeGreaterThanOrEqual(2)
      break
    case 'fix-error':
      expect(exercise.sentence.trim().length).toBeGreaterThan(0)
      expect(exercise.answer.trim().length).toBeGreaterThan(0)
      break
    case 'roleplay':
      expect(exercise.scenario.trim().length).toBeGreaterThan(0)
      expect(exercise.goal.trim().length).toBeGreaterThan(0)
      expect(exercise.answer.trim().length).toBeGreaterThan(0)
      break
    case 'write':
    case 'shadow':
      expect(exercise.answer.trim().length).toBeGreaterThan(0)
      break
    case 'match':
      expect(exercise.pairs.length).toBeGreaterThanOrEqual(2)
      for (const pair of exercise.pairs) {
        expect(pair.en.trim().length).toBeGreaterThan(0)
        expect(pair.es.trim().length).toBeGreaterThan(0)
      }
      break
    case 'dialogue-branch':
      expect(
        exercise.context?.trim().length ?? 0,
        `${exercise.id} (dialogue-branch) needs a scene context`,
      ).toBeGreaterThan(0)
      expect(exercise.steps.length).toBeGreaterThanOrEqual(2)
      for (const step of exercise.steps) {
        expect(step.line.trim().length).toBeGreaterThan(0)
        expect(step.choices.filter((choice) => choice.correct).length).toBe(1)
        for (const choice of step.choices) {
          expect(choice.en.trim().length).toBeGreaterThan(0)
          expect(choice.feedback.trim().length).toBeGreaterThan(0)
        }
      }
      break
    case 'multi-choice':
      expect(exercise.options.length).toBeGreaterThanOrEqual(2)
      expect(exercise.answers.length).toBeGreaterThan(0)
      expect(new Set(exercise.answers).size).toBe(exercise.answers.length)
      for (const answer of exercise.answers) {
        expect(Number.isInteger(answer)).toBe(true)
        expect(answer).toBeGreaterThanOrEqual(0)
        expect(answer).toBeLessThan(exercise.options.length)
      }
      break
  }

  // Free-text items should always guide the learner with a usable hint.
  if ('hint' in exercise) {
    expect(exercise.hint?.trim().length ?? 0).toBeGreaterThan(0)
  }
}

describe('curriculum / roadmap integrity', () => {
  it('starts the roadmap with to be in present and past', () => {
    expect(ALL_SESSIONS[0]?.session.id).toBe('m1-l0')
    expect(ALL_SESSIONS[0]?.session.slug).toBe('to-be-presente-pasado')
  })

  it('has unique module, session, slug and exercise identifiers', () => {
    const moduleIds = MODULES.map((module) => module.id)
    expect(new Set(moduleIds).size).toBe(moduleIds.length)

    const sessionIds = ALL_SESSIONS.map(({ session }) => session.id)
    expect(new Set(sessionIds).size).toBe(sessionIds.length)

    const slugs = ALL_SESSIONS.map(({ session }) => session.slug)
    expect(new Set(slugs).size).toBe(slugs.length)

    const exerciseIds = ALL_SESSIONS.flatMap(({ session }) =>
      session.exercises.map((exercise) => exercise.id),
    )
    expect(new Set(exerciseIds).size).toBe(exerciseIds.length)
  })

  it.each(MODULES)('keeps $id sessions ordered and level-coherent', (module) => {
    const moduleNumber = Number(module.id.slice(1))
    const numbers = module.sessions.map((session) => stepNumber(session.step))
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b))
    expect(new Set(numbers).size).toBe(numbers.length)

    module.sessions.forEach((session, index) => {
      expect(stepModule(session.step)).toBe(moduleNumber)
      expect(cefrAllowedFor(module.level, session.cefr)).toBe(true)
      expect(session.summary.trim().length).toBeGreaterThan(0)
      expect(session.objectives.length).toBeGreaterThan(0)
      expect(session.blocks.length).toBeGreaterThan(0)
      expect(session.exercises.length).toBeGreaterThan(0)

      // Every session except the very first one states its prerequisite.
      if (!(index === 0 && moduleNumber === 1)) {
        const hasPrerequisite = session.blocks.some(
          (block) => block.type === 'callout' && block.title === 'Antes de esta lección',
        )
        expect(hasPrerequisite, `${session.id} should state its prerequisite`).toBe(true)
      }

      // Cross-module IDs are intentional integrated reviews and must be labelled as such.
      if (!session.id.startsWith(`${module.id}-`)) {
        const integratedLabel = `${session.step} ${session.title} ${session.summary}`
        expect(integratedLabel).toMatch(/repaso|integrad|checkpoint|micro-repaso/i)
      }

      for (const block of session.blocks) {
        if (block.type === 'dialogue') {
          expect(
            block.lines.length,
            `${session.id} dialogue should have 4-8 lines, got ${block.lines.length}`,
          ).toBeGreaterThanOrEqual(4)
          expect(block.lines.length).toBeLessThanOrEqual(8)
          expect(block.context?.trim(), `${session.id} dialogue needs a context`).toBeTruthy()
          expect(block.setting?.trim(), `${session.id} dialogue needs a setting`).toBeTruthy()
          expect(block.goal?.trim(), `${session.id} dialogue needs a goal`).toBeTruthy()

          const namesBySpeaker = new Map<string, string>()
          block.lines.forEach((line, lineIndex) => {
            expect(['a', 'b']).toContain(line.speaker)
            expect(line.name.trim().length).toBeGreaterThan(0)
            expect(line.en.trim().length).toBeGreaterThan(0)
            expect(line.es?.trim().length ?? 0).toBeGreaterThan(0)

            const previousName = namesBySpeaker.get(line.speaker)
            if (previousName) {
              expect(
                previousName,
                `${session.id} dialogue uses inconsistent names for speaker ${line.speaker}`,
              ).toBe(line.name)
            }
            namesBySpeaker.set(line.speaker, line.name)

            const nextLine = block.lines[lineIndex + 1]
            if (nextLine) {
              expect(
                nextLine.speaker,
                `${session.id} dialogue turns must alternate (lines ${lineIndex + 1}/${lineIndex + 2})`,
              ).not.toBe(line.speaker)
            }
          })
        }
      }

      for (const exercise of session.exercises) {
        validateExercise(exercise, session)
      }
    })
  })

  it('keeps at most 2 advice blocks per session', () => {
    for (const { session } of ALL_SESSIONS) {
      const advice = session.blocks.filter(
        (block) => block.type === 'technique' || block.type === 'callout',
      )
      expect(
        advice.length,
        `${session.id} should have at most 2 advice blocks (technique / callout), got ${advice.length}`,
      ).toBeLessThanOrEqual(2)
    }
  })

  it('keeps sessions focused (max 7 exercises and 7 blocks)', () => {
    for (const { session } of ALL_SESSIONS) {
      expect(
        session.exercises.length,
        `${session.id} has ${session.exercises.length} exercises`,
      ).toBeLessThanOrEqual(7)
      expect(
        session.blocks.length,
        `${session.id} has ${session.blocks.length} blocks`,
      ).toBeLessThanOrEqual(7)
    }
  })

  it('keeps a consistent learning cycle in every session', () => {
    const stageByType: Record<string, number> = {
      choice: 1,
      match: 1,
      'multi-choice': 1,
      listen: 1,
      'dialogue-order': 1,
      'fill-blank': 1,
      'fix-error': 2,
      'dialogue-branch': 2,
      builder: 2,
      write: 3,
      speak: 3,
      roleplay: 3,
      shadow: 3,
    }
    const special = new Set([
      'match',
      'multi-choice',
      'shadow',
      'dialogue-branch',
      'listen',
      'speak',
      'roleplay',
      'fix-error',
      'fill-blank',
      'dialogue-order',
    ])
    for (const { session } of ALL_SESSIONS) {
      const stages = new Set(session.exercises.map((exercise) => stageByType[exercise.type]))
      for (const stage of [1, 2, 3]) {
        expect(stages.has(stage), `${session.id} is missing learning stage ${stage}`).toBe(true)
      }
      const specialCount = session.exercises.filter((exercise) => special.has(exercise.type)).length
      expect(
        specialCount,
        `${session.id} has ${specialCount} special exercises (max 4)`,
      ).toBeLessThanOrEqual(4)
    }
  })

  it('gives every session at least one speaking exercise', () => {
    const speaking = new Set(['speak', 'listen', 'shadow'])
    for (const { session } of ALL_SESSIONS) {
      expect(
        session.exercises.some((exercise) => speaking.has(exercise.type)),
        `${session.id} should include speak/listen/shadow practice`,
      ).toBe(true)
    }
  })

  it('keeps the dedicated dev phrasal verbs session', () => {
    const entry = getSessionById('m3-l8')
    expect(entry?.session.slug).toBe('phrasal-verbs-dev-diario')
    const rows = (entry?.session.blocks ?? []).flatMap((block) =>
      block.type === 'table' ? block.rows : [],
    )
    expect(rows.length).toBeGreaterThanOrEqual(30)
    expect(rows.every((row) => row.length === 3)).toBe(true)
  })

  it('links slang blocks to real deck entries', () => {
    for (const { session } of ALL_SESSIONS) {
      for (const block of session.blocks) {
        if (block.type === 'slang') {
          for (const id of block.ids) {
            expect(slangIds.has(id), `${session.id} references unknown slang "${id}"`).toBe(true)
          }
        }
      }
    }
  })

  it('serializes the same lightweight nav data for the roadmap', () => {
    const nav = getNavData()
    expect(nav).toHaveLength(MODULES.length)
    expect(nav.reduce((sum, module) => sum + module.sessions.length, 0)).toBe(ALL_SESSIONS.length)
    for (const module of nav) {
      for (const session of module.sessions) {
        expect('exercises' in session).toBe(false)
      }
    }
  })
})
