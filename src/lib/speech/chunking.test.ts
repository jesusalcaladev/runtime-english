import { describe, expect, it } from 'vitest'
import { splitIntoChunks } from './chunking'

describe('splitIntoChunks', () => {
  it('keeps short sentences intact, even with commas', () => {
    expect(splitIntoChunks('First, check the logs.', 100)).toEqual(['First, check the logs.'])
  })

  it('splits on sentence boundaries and keeps punctuation', () => {
    expect(splitIntoChunks('Check the logs. Then roll back the deploy.', 100)).toEqual([
      'Check the logs.',
      'Then roll back the deploy.',
    ])
  })

  it('splits long sentences on commas before hard wrapping', () => {
    const text =
      'Before you merge, make sure the tests pass in CI, review the diff with a teammate, and update the changelog.'
    const chunks = splitIntoChunks(text, 60)
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.join(' ')).toBe(text)
  })

  it('hard-wraps clauses longer than the limit without cutting words', () => {
    const text =
      'This is a very long line with many words that should be wrapped into several smaller audio chunks because it exceeds the limit'
    const chunks = splitIntoChunks(text, 40)
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.join(' ')).toBe(text)
    for (const chunk of chunks) expect(chunk.length).toBeLessThanOrEqual(40)
  })

  it('collapses whitespace and ignores empty input', () => {
    expect(splitIntoChunks('   ', 100)).toEqual([])
    expect(splitIntoChunks('  one   two\n three  ', 100)).toEqual(['one two three'])
  })
})
