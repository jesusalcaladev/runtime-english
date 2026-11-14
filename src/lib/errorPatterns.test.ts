import { describe, expect, it } from "vitest";
import type { Exercise } from "./types";
import { aggregateErrorPatterns, detectErrorSkills, inferExerciseSkills, skillLabel } from "./errorPatterns";

const choicePrep: Exercise = {
  id: "e1",
  type: "choice",
  prompt: "Complete: I work ___ a startup.",
  options: ["in", "on", "at", "to"],
  answer: 2,
  explanation: "We say 'work at a company/startup'.",
};

const builderOrder: Exercise = {
  id: "e2",
  type: "builder",
  prompt: "Build the sentence in the correct order.",
  words: ["I", "have", "a", "bug"],
  answer: "I have a bug",
  explanation: "Basic order.",
};

const writeTense: Exercise = {
  id: "e3",
  type: "write",
  prompt: "Write in past simple: 'I fix the bug yesterday'.",
  answer: "I fixed the bug yesterday.",
  accept: ["I fixed the bug yesterday"],
  explanation: "Past simple of fix is fixed.",
};

const fillArticle: Exercise = {
  id: "e4",
  type: "fill-blank",
  prompt: "Complete with the correct article.",
  template: "I found ___ error in the code.",
  blanks: ["an"],
  explanation: "Use 'an' before a vowel sound.",
};

describe("errorPatterns", () => {
  it("infers relevant skills from exercise content", () => {
    expect(inferExerciseSkills(choicePrep)).toContain("prepositions");
    expect(inferExerciseSkills(builderOrder)).toContain("word-order");
    expect(inferExerciseSkills(writeTense)).toEqual(expect.arrayContaining(["tenses"]));
    expect(inferExerciseSkills(fillArticle)).toContain("articles");
  });

  it("detects preposition mismatches on incorrect answers", () => {
    const skills = detectErrorSkills(choicePrep, "in", "at");
    expect(skills).toContain("prepositions");
  });

  it("detects tense/aux mismatches on incorrect answers", () => {
    const skills = detectErrorSkills(writeTense, "I fix the bug yesterday.", "I fixed the bug yesterday.");
    expect(skills).toEqual(expect.arrayContaining(["tenses"]));
  });

  it("detects article mismatches on incorrect answers", () => {
    const skills = detectErrorSkills(fillArticle, "a", "an");
    expect(skills).toContain("articles");
  });

  it("detects word order issues for builder exercises", () => {
    const skills = detectErrorSkills(builderOrder, "have I a bug", "I have a bug");
    expect(skills).toContain("word-order");
  });

  it("detects possible spelling/close-form errors", () => {
    const ex: Exercise = {
      id: "e5",
      type: "write",
      prompt: "Type: I deployed the service.",
      answer: "I deployed the service.",
      explanation: "",
    };
    const skills = detectErrorSkills(ex, "I deployd the service.", "I deployed the service.");
    expect(skills).toContain("spelling");
  });

  it("aggregates pattern counts and keeps examples", () => {
    const patterns = aggregateErrorPatterns([
      { skills: ["prepositions", "tenses"], correctAnswer: "I worked at home", prompt: "p1" },
      { skills: ["prepositions"], correctAnswer: "She is on call", prompt: "p2" },
      { skills: ["word-order"], correctAnswer: "I have a bug", prompt: "p3" },
    ]);
    expect(patterns[0]).toMatchObject({ skill: "prepositions", count: 2, label: skillLabel("prepositions") });
    expect(patterns[0].examples.length).toBeGreaterThan(0);
    const wordOrder = patterns.find((p) => p.skill === "word-order");
    expect(wordOrder?.count).toBe(1);
  });

  it("returns human labels for skills", () => {
    expect(skillLabel("prepositions")).toMatch(/Prepos/i);
    expect(skillLabel("tenses")).toMatch(/Tiempos/i);
  });
});
