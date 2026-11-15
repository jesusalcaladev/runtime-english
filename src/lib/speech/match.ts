function normalizeSpeechComparison(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

export function speechMatchScore(expected: string, heard: string): number {
  const expectedWords = normalizeSpeechComparison(expected);
  const heardWords = new Set(normalizeSpeechComparison(heard));
  if (expectedWords.length === 0) return 0;

  let hits = 0;
  for (const word of expectedWords) {
    if (heardWords.has(word)) hits += 1;
  }
  return hits / expectedWords.length;
}
