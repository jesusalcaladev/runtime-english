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

/**
 * Pronunciation score (0..1) based on the longest common subsequence of words.
 * Unlike a bag-of-words comparison this respects word order and repetitions.
 * Uses an F1 balance so extra words also lower the score.
 */
export function speechMatchScore(expected: string, heard: string): number {
  const expectedWords = normalizeSpeechComparison(expected)
  const heardWords = normalizeSpeechComparison(heard)
  if (expectedWords.length === 0) return 0
  if (heardWords.length === 0) return 0

  const rows = expectedWords.length
  const cols = heardWords.length
  const lcs = Array.from({ length: rows + 1 }, () => new Uint16Array(cols + 1))

  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      lcs[i + 1][j + 1] =
        expectedWords[i] === heardWords[j] ? lcs[i][j] + 1 : Math.max(lcs[i][j + 1], lcs[i + 1][j])
    }
  }

  const matches = lcs[rows][cols]
  const recall = matches / rows
  const precision = matches / cols
  return (2 * precision * recall) / (precision + recall)
}
