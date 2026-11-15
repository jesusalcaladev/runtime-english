import type { Exercise } from "./types";

export type ErrorSkill =
  | "prepositions"
  | "tenses"
  | "articles"
  | "pronouns"
  | "word-order"
  | "spelling"
  | "vocabulary"
  | "agreement"
  | "negation"
  | "questions"
  | "plurals"
  | "general";

export interface ErrorPatternInsight {
  skill: ErrorSkill;
  label: string;
  count: number;
  examples: string[];
}

const SKILL_LABELS: Record<ErrorSkill, string> = {
  prepositions: "Preposiciones",
  tenses: "Tiempos verbales",
  articles: "Artículos (a/an/the)",
  pronouns: "Pronombres",
  "word-order": "Orden de palabras",
  spelling: "Ortografía/forma",
  vocabulary: "Vocabulario",
  agreement: "Concordancia (sujeto/verbo)",
  negation: "Negaciones",
  questions: "Preguntas",
  plurals: "Plurales",
  general: "General",
};

const PREP_RE = /\b(in|on|at|to|for|with|by|from|of|about|into|over|under|between|through|during|without|before|after)\b/i;
const TENSE_RE = /\b(am|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|can|could|should|may|might|must|going to|'s|'re|'m|n't)\b/i;
const ARTICLE_RE = /\b(a|an|the)\b/i;
const PRONOUN_RE = /\b(i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|her|its|our|their)\b/i;
const NEG_RE = /\b(not|n't|never|no)\b/i;
const QUESTION_RE = /\?|^(what|where|when|why|how|who|which|do|does|did|is|are|can|could|would|will)\b/i;
const PLURAL_RE = /\b\w+s\b/i;

function norm(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return norm(s).split(" ").filter(Boolean);
}

export function getExerciseText(exercise: Exercise): string {
  const parts: string[] = [exercise.prompt];
  if ("explanation" in exercise && exercise.explanation) parts.push(exercise.explanation);

  switch (exercise.type) {
    case "choice":
      parts.push(...exercise.options);
      break;
    case "builder":
      parts.push(exercise.answer, ...exercise.words);
      break;
    case "fill-blank":
      parts.push(exercise.template, ...exercise.blanks);
      break;
    case "dialogue-order":
      parts.push(...exercise.lines);
      break;
    case "fix-error":
      parts.push(exercise.sentence, exercise.answer);
      break;
    case "write":
    case "listen":
    case "speak":
      parts.push(exercise.answer);
      break;
    case "roleplay":
      parts.push(exercise.scenario, exercise.goal);
      break;
    default: {
      const exhaustiveCheck: never = exercise;
      return exhaustiveCheck;
    }
  }

  return parts.join(" ");
}

export function inferExerciseSkills(exercise: Exercise): ErrorSkill[] {
  const text = getExerciseText(exercise);
  const skills = new Set<ErrorSkill>();
  if (PREP_RE.test(text) || /\bprepos/i.test(exercise.prompt)) skills.add("prepositions");
  if (TENSE_RE.test(text) || /\b(past|present|future|tense|tiempo|verb)\b/i.test(exercise.prompt)) skills.add("tenses");
  if (ARTICLE_RE.test(text) || /\b(article|art[ií]culo)\b/i.test(exercise.prompt)) skills.add("articles");
  if (PRONOUN_RE.test(text)) skills.add("pronouns");
  if (NEG_RE.test(text) || /\b(negative|negaci[oó]n)\b/i.test(exercise.prompt)) skills.add("negation");
  if (QUESTION_RE.test(text) || /\b(question|pregunta)\b/i.test(exercise.prompt)) skills.add("questions");
  if (exercise.type === "builder" || exercise.type === "dialogue-order") skills.add("word-order");
  if (/\bagree|concord|third person|3rd person|singular\b/i.test(text)) skills.add("agreement");
  if (PLURAL_RE.test(text) || /\bplural/i.test(exercise.prompt)) skills.add("plurals");
  if (exercise.type === "write" || exercise.type === "listen") skills.add("spelling");
  if (skills.size === 0) skills.add("vocabulary");
  return Array.from(skills);
}

export function detectErrorSkills(exercise: Exercise, userAnswer: string, correctAnswer: string): ErrorSkill[] {
  const base = inferExerciseSkills(exercise);
  const skills = new Set<ErrorSkill>(base.length ? base : ["general"]);
  const u = norm(userAnswer);
  const c = norm(correctAnswer);
  const ut = tokens(userAnswer);
  const ct = tokens(correctAnswer);

  if (u && c) {
    if (exercise.type === "builder" || exercise.type === "dialogue-order") skills.add("word-order");
    // Preposition mismatch
    const up = ut.filter((t) => PREP_RE.test(t));
    const cp = ct.filter((t) => PREP_RE.test(t));
    if (JSON.stringify(up) !== JSON.stringify(cp) || (cp.length && !up.length)) skills.add("prepositions");
    // Article mismatch
    const ua = ut.filter((t) => ARTICLE_RE.test(t));
    const ca = ct.filter((t) => ARTICLE_RE.test(t));
    if (JSON.stringify(ua) !== JSON.stringify(ca)) skills.add("articles");
    // Tense/auxiliary mismatch
    const ux = ut.filter((t) => TENSE_RE.test(t));
    const cx = ct.filter((t) => TENSE_RE.test(t));
    if (JSON.stringify(ux) !== JSON.stringify(cx)) skills.add("tenses");
    // Negation mismatch
    if ((NEG_RE.test(c) !== NEG_RE.test(u)) || /\bnot\b/.test(c) !== /\bnot\b/.test(u)) skills.add("negation");
    // Agreement heuristic: -s endings / is-are differences
    if (/\b(is|are|was|were|has|have|does|do)\b/.test(c) && /\b(is|are|was|were|has|have|does|do)\b/.test(u) && u !== c) {
      skills.add("agreement");
    }
    // Spelling/typo (similar length, different characters)
    if (u !== c && Math.abs(u.length - c.length) <= 3) {
      const setU = new Set(ut);
      const common = ct.filter((t) => setU.has(t)).length;
      if (ct.length > 0 && common / ct.length >= 0.5) skills.add("spelling");
    }
    // Same word set in a different order
    const su = [...ut].sort().join(" ");
    const sc = [...ct].sort().join(" ");
    if (su === sc && u !== c) skills.add("word-order");
  }
  // Keep a focused list, prioritizing high-signal skills for this error
  let list = Array.from(skills);
  if (list.length > 1 && list.includes("general")) list = list.filter((s) => s !== "general");
  const priority: ErrorSkill[] = [];
  const push = (s: ErrorSkill) => { if (list.includes(s) && !priority.includes(s)) priority.push(s); };
  if (exercise.type === "builder" || exercise.type === "dialogue-order") push("word-order");
  // Same words in a different order -> strong signal
  const su = [...tokens(userAnswer)].sort().join(" ");
  const sc = [...tokens(correctAnswer)].sort().join(" ");
  if (su && sc && su === sc && norm(userAnswer) !== norm(correctAnswer)) push("word-order");
  if (/\b(is|are|was|were|has|have|does|do)\b/.test(norm(correctAnswer)) && norm(userAnswer) !== norm(correctAnswer)) push("agreement");
  for (const s of ["prepositions", "tenses", "articles", "negation", "questions", "pronouns", "plurals", "spelling", "vocabulary", "word-order", "agreement", "general"] as ErrorSkill[]) push(s);
  return priority.slice(0, 4);
}

export function aggregateErrorPatterns(
  events: Array<{ skills: (ErrorSkill | string)[]; userAnswer?: string; correctAnswer?: string; prompt?: string }>,
): ErrorPatternInsight[] {
  const map = new Map<ErrorSkill, { count: number; examples: string[] }>();
  for (const ev of events) {
    const ex = (ev.correctAnswer || ev.prompt || "").trim();
    const skills = (ev.skills && ev.skills.length ? ev.skills : ["general"]) as string[];
    for (const rawSkill of skills) {
      const skill = (rawSkill in SKILL_LABELS ? rawSkill : "general") as ErrorSkill;
      const cur = map.get(skill) ?? { count: 0, examples: [] };
      cur.count++;
      if (ex && cur.examples.length < 3 && !cur.examples.includes(ex)) cur.examples.push(ex.slice(0, 80));
      map.set(skill, cur);
    }
  }
  return Array.from(map.entries())
    .map(([skill, v]) => ({ skill, label: SKILL_LABELS[skill], count: v.count, examples: v.examples }))
    .sort((a, b) => b.count - a.count);
}

export function skillLabel(skill: ErrorSkill): string {
  return SKILL_LABELS[skill] || skill;
}
