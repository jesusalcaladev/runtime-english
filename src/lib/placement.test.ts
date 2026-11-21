import { describe, expect, it } from 'vitest'
import { PLACEMENT_QUESTIONS, PLACEMENT_START_SLUG, scorePlacement } from './placement'

const answerAll = (wrongLevels: string[] = []) =>
  PLACEMENT_QUESTIONS.map((question) =>
    wrongLevels.includes(question.level) ? 99 : question.answer,
  )

describe('placement', () => {
  it('scores a beginner as A1 and an expert as C2', () => {
    expect(scorePlacement(PLACEMENT_QUESTIONS.map(() => 99)).level).toBe('A1')

    const result = scorePlacement(answerAll())
    expect(result.level).toBe('C2')
    expect(result.correct).toBe(PLACEMENT_QUESTIONS.length)
    expect(PLACEMENT_START_SLUG[result.level]).toBe('presentaciones-de-alto-nivel')
  })

  it('recommends B1 when only A1-A2 and B1 are covered', () => {
    const result = scorePlacement(answerAll(['C1', 'C2']))
    expect(result.level).toBe('B1')
    expect(PLACEMENT_START_SLUG[result.level]).toBe('leer-docs-y-specs-rapido')
  })

  it('recommends C1 when C1 nuance is correct but C2 is not', () => {
    const result = scorePlacement(answerAll(['C2']))
    expect(result.level).toBe('C1')
    expect(PLACEMENT_START_SLUG[result.level]).toBe('debatir-arquitectura-con-matices')
  })

  it('recommends A2 when the basics are covered but B1 is not', () => {
    const result = scorePlacement(answerAll(['B1', 'C1', 'C2']))
    expect(result.level).toBe('A2')
  })

  it('has unique question ids and valid options', () => {
    const ids = PLACEMENT_QUESTIONS.map((question) => question.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const question of PLACEMENT_QUESTIONS) {
      expect(question.options.length).toBeGreaterThanOrEqual(2)
      expect(question.answer).toBeGreaterThanOrEqual(0)
      expect(question.answer).toBeLessThan(question.options.length)
    }
  })
})
