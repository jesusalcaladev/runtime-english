import { describe, expect, it } from 'vitest'
import { PLACEMENT_QUESTIONS, PLACEMENT_START_SLUG, scorePlacement } from './placement'

describe('placement', () => {
  it('scores a beginner as A1 and an advanced learner as B1', () => {
    const allWrong = PLACEMENT_QUESTIONS.map(() => 99)
    expect(scorePlacement(allWrong).level).toBe('A1')

    const allRight = PLACEMENT_QUESTIONS.map((question) => question.answer)
    const result = scorePlacement(allRight)
    expect(result.level).toBe('B1')
    expect(result.correct).toBe(PLACEMENT_QUESTIONS.length)
    expect(PLACEMENT_START_SLUG[result.level]).toBe('leer-docs-y-specs-rapido')
  })

  it('recommends A2 when the basics are covered but B1 is not', () => {
    const answers = PLACEMENT_QUESTIONS.map((question) =>
      question.level === 'B1' ? 99 : question.answer,
    )
    expect(scorePlacement(answers).level).toBe('A2')
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
