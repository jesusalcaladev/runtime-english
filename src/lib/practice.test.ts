import { describe, expect, it } from "vitest";
import { createDefaultState } from "./progress";
import {
  buildExercisePool,
  buildPhrasePool,
  getPracticeStats,
  pickUnique,
  reviewScore,
  type PracticeItem,
} from "./practice";
import type { Exercise } from "./types";

function item(id: string, sessionSlug = "daily-standup"): PracticeItem {
  const exercise: Exercise = {
    id,
    type: "choice",
    prompt: `Prompt ${id}`,
    options: ["a", "b"],
    answer: 0,
    explanation: "",
  };
  return {
    exercise,
    sessionId: "s1",
    sessionSlug,
    sessionTitle: "Session",
    moduleCode: "M1",
    cefr: "A1",
  };
}

describe("practice", () => {
  it("pickUnique removes duplicate exercise ids and respects limit", () => {
    const items = [item("e1"), item("e1"), item("e2"), item("e3")];
    const picked = pickUnique(items, 2);
    expect(picked.map((i) => i.exercise.id)).toEqual(["e1", "e2"]);
  });

  it("reviewScore prioritizes attempted-but-not-done items", () => {
    const state = createDefaultState();
    const now = Date.now();
    const a = item("a");
    const b = item("b");
    state.attempts["a"] = 2; // attempted, not completed
    state.completedExercises["b"] = now;
    state.attempts["b"] = 1;
    state.exerciseSrs["b"] = { box: 1, due: now + 100000, last: now, correctStreak: 1 } as any;

    expect(reviewScore(a, state, now)).toBeGreaterThan(reviewScore(b, state, now));
  });

  it("getPracticeStats counts due, weak and unseen", () => {
    const state = createDefaultState();
    const now = Date.now();
    const items = [item("due"), item("weak"), item("new")];
    state.attempts["weak"] = 2; // no completion => weak
    state.attempts["due"] = 1;
    state.completedExercises["due"] = now - 1000;
    state.exerciseSrs["due"] = { box: 1, due: now - 1, last: now - 1000, correctStreak: 1 } as any;

    const stats = getPracticeStats(items, state, now);
    expect(stats.weak).toBeGreaterThanOrEqual(1);
    expect(stats.unseen).toBe(1);
    expect(stats.dueReview).toBeGreaterThanOrEqual(1);
    expect(stats.total).toBe(3);
  });

  it("buildExercisePool returns unique items up to count", () => {
    const state = createDefaultState();
    const now = Date.now();
    const items = [item("e1"), item("e2"), item("e3"), item("e3")];
    const pool = buildExercisePool(items, state, "mix", 3, now, () => 0.1);
    expect(pool.length).toBeLessThanOrEqual(3);
    expect(new Set(pool.map((p) => p.exercise.id)).size).toBe(pool.length);
  });

  it("buildPhrasePool merges due and weak phrase entries", () => {
    const state = createDefaultState();
    const now = Date.now();
    state.phrasebook = {
      a: {
        id: "a", en: "A", es: "A", source: "x", addedAt: now, updatedAt: now, seen: 1, correct: 0, saved: false,
        box: 0, due: now - 10, last: now - 10, correctStreak: 0,
      } as any,
      b: {
        id: "b", en: "B", es: "B", source: "x", addedAt: now, updatedAt: now, seen: 1, correct: 0, saved: false,
        box: 0, due: now + 100000, last: now, correctStreak: 0,
      } as any,
    };
    const pool = buildPhrasePool(state, 10);
    expect(pool.some((p) => p.id === "a")).toBe(true);
  });
});
