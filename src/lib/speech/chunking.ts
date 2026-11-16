function splitKeeping(text: string, pattern: RegExp): string[] {
  try {
    return text.split(pattern)
  } catch {
    // Lookbehind is unsupported in a few old WebViews: drop it and keep splitting.
    return text.split(new RegExp(pattern.source.replace(/\(\?<=[^)]+\)/g, '')))
  }
}

/**
 * Split long text into audio-friendly chunks:
 * sentence boundaries first, commas only for long sentences, then a hard word
 * wrap. Short sentences stay intact so the voice keeps natural intonation.
 */
export function splitIntoChunks(text: string, maxChars: number): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []

  const limit = Math.max(40, maxChars)
  const result: string[] = []

  for (const sentence of splitKeeping(clean, /(?<=[.!?…])\s+/)) {
    const sentenceText = sentence.trim()
    if (!sentenceText) continue

    if (sentenceText.length <= limit) {
      result.push(sentenceText)
      continue
    }

    for (const clause of splitKeeping(sentenceText, /(?<=[,;:])\s+/)) {
      const clauseText = clause.trim()
      if (!clauseText) continue

      if (clauseText.length <= limit) {
        result.push(clauseText)
        continue
      }

      let buffer = ''
      for (const word of clauseText.split(/\s+/)) {
        const candidate = buffer ? `${buffer} ${word}` : word
        if (candidate.length > limit && buffer) {
          result.push(buffer)
          buffer = word
        } else {
          buffer = candidate
        }
      }
      if (buffer) result.push(buffer)
    }
  }

  return result
}
