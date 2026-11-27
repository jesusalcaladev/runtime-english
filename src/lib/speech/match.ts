function normalizeSpeechComparison(value: string): string[] {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
}

type LcsTable = {
  expected: string[]
  heard: string[]
  matches: number
  table: Uint16Array[]
}

function buildLcs(expectedText: string, heardText: string): LcsTable {
  const expected = normalizeSpeechComparison(expectedText)
  const heard = normalizeSpeechComparison(heardText)
  const table = Array.from({ length: expected.length + 1 }, () => new Uint16Array(heard.length + 1))
  for (let i = 0; i < expected.length; i += 1) {
    for (let j = 0; j < heard.length; j += 1) {
      table[i + 1][j + 1] =
        expected[i] === heard[j] ? table[i][j] + 1 : Math.max(table[i][j + 1], table[i + 1][j])
    }
  }
  return { expected, heard, matches: table[expected.length][heard.length], table }
}

function f1Score(expected: string[], heard: string[], matches: number): number {
  if (expected.length === 0 || heard.length === 0) return 0
  const recall = matches / expected.length
  const precision = matches / heard.length
  return (2 * precision * recall) / (precision + recall)
}

/**
 * Pronunciation score (0..1) based on the longest common subsequence of words.
 * Unlike a bag-of-words comparison this respects word order and repetitions.
 * Uses an F1 balance so extra words also lower the score.
 */
export function speechMatchScore(expected: string, heard: string): number {
  const { expected: expectedWords, heard: heardWords, matches } = buildLcs(expected, heard)
  return f1Score(expectedWords, heardWords, matches)
}

/**
 * Recognition often returns several plausible transcripts. For pronunciation
 * practice, pick the candidate that best matches the phrase under practice
 * instead of blindly trusting engine confidence (which is frequently 0).
 */
export function pickBestAlternative(expected: string | string[], alternatives: string[]): string {
  const candidates = Array.isArray(expected) ? expected : [expected]
  const unique = [...new Set(alternatives.map((item) => item.trim()).filter(Boolean))]
  if (unique.length === 0) return ''
  if (unique.length === 1) return unique[0]

  let best = unique[0]
  let bestScore = -1
  for (const candidate of unique) {
    const score = Math.max(...candidates.map((target) => speechMatchScore(target, candidate)))
    if (score > bestScore) {
      best = candidate
      bestScore = score
    }
  }
  return best
}

export type WordDiffToken = {
  word: string
  status: 'match' | 'missed' | 'extra'
}

export type WordDiff = {
  tokens: WordDiffToken[]
  missing: string[]
  extra: string[]
  score: number
}

/**
 * Word-level feedback for speaking exercises. A "missed" word was not picked
 * up by the recognizer — it is not a claim about the learner's phonetics.
 */
export function wordDiff(expected: string, heard: string): WordDiff {
  const { expected: expectedWords, heard: heardWords, matches, table } = buildLcs(expected, heard)
  const tokens: WordDiffToken[] = []
  let i = expectedWords.length
  let j = heardWords.length

  while (i > 0 && j > 0) {
    if (expectedWords[i - 1] === heardWords[j - 1]) {
      tokens.unshift({ word: expectedWords[i - 1], status: 'match' })
      i -= 1
      j -= 1
    } else if (table[i - 1][j] >= table[i][j - 1]) {
      tokens.unshift({ word: expectedWords[i - 1], status: 'missed' })
      i -= 1
    } else {
      tokens.unshift({ word: heardWords[j - 1], status: 'extra' })
      j -= 1
    }
  }
  while (i > 0) {
    tokens.unshift({ word: expectedWords[i - 1], status: 'missed' })
    i -= 1
  }
  while (j > 0) {
    tokens.unshift({ word: heardWords[j - 1], status: 'extra' })
    j -= 1
  }

  return {
    tokens,
    missing: tokens.filter((token) => token.status === 'missed').map((token) => token.word),
    extra: tokens.filter((token) => token.status === 'extra').map((token) => token.word),
    score: f1Score(expectedWords, heardWords, matches),
  }
}
