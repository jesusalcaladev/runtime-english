import { describe, expect, it } from 'vitest'
import { speechMatchScore } from './match'

describe('speechMatchScore', () => {
  it('returns 1 for an exact phrase', () => {
    expect(speechMatchScore('hello world', 'hello world')).toBe(1)
  })

  it('ignores accents, punctuation and casing', () => {
    expect(speechMatchScore('¿Cómo estás?', 'como estas')).toBe(1)
  })

  it('penalizes missing and extra words', () => {
    expect(speechMatchScore('hello world', 'hello')).toBeCloseTo(0.667, 2)
    expect(speechMatchScore('hello world', 'hello world foo')).toBeCloseTo(0.8, 2)
  })

  it('penalizes repetitions and wrong word order', () => {
    expect(speechMatchScore('hello', 'hello hello')).toBeCloseTo(0.667, 2)
    expect(speechMatchScore('hello world', 'world hello')).toBeCloseTo(0.5, 2)
  })

  it('returns 0 when nothing was heard', () => {
    expect(speechMatchScore('hello world', '')).toBe(0)
  })
})
