import { describe, expect, it } from 'vitest'
import { pickBestAlternative, speechMatchScore, wordDiff } from './match'

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

describe('pickBestAlternative', () => {
  it('picks the candidate that best matches the phrase, not the first one', () => {
    expect(
      pickBestAlternative('the build is green', ['the build is grey', 'the build is green']),
    ).toBe('the build is green')
  })

  it('accepts several correct answers and handles an empty list', () => {
    expect(pickBestAlternative(['hello world', 'hi world'], ['hi world', 'hello word'])).toBe(
      'hi world',
    )
    expect(pickBestAlternative('hello', [])).toBe('')
  })
})

describe('wordDiff', () => {
  it('marks matched, missing and extra words', () => {
    const diff = wordDiff('the build is green', 'the build was green today')
    expect(
      diff.tokens.filter((token) => token.status === 'match').map((token) => token.word),
    ).toEqual(['the', 'build', 'green'])
    expect(diff.missing).toEqual(['is'])
    expect(diff.extra).toEqual(['was', 'today'])
    expect(diff.score).toBeCloseTo(0.667, 2)
  })

  it('ignores punctuation and casing', () => {
    const diff = wordDiff('¿Cómo estás?', 'como estas')
    expect(diff.missing).toEqual([])
    expect(diff.extra).toEqual([])
    expect(diff.score).toBe(1)
  })
})
