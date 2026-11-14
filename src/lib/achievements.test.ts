import { describe, expect, it } from "vitest";
import { ALL_SESSIONS } from "../data/curriculum";
import { ACHIEVEMENTS, evaluateAchievements } from "./achievements";
import { createDefaultState } from "./progress";

describe("achievements", () => {
  it("unlocks first-step and first-session from basic progress", () => {
    const state = createDefaultState();
    const first = ALL_SESSIONS[0]?.session;
    expect(first).toBeTruthy();
    state.completedExercises[first.exercises[0].id] = Date.now();
    state.attempts[first.exercises[0].id] = 1;
    state.completedSessions[first.id] = Date.now();
    state.xp = 60;

    const unlocked = evaluateAchievements(state).map((a) => a.id);
    expect(unlocked).toContain("first-step");
    expect(unlocked).toContain("first-session");
  });

  it("does not re-evaluate already unlocked achievements", () => {
    const state = createDefaultState();
    const first = ALL_SESSIONS[0]?.session;
    state.completedExercises[first.exercises[0].id] = Date.now();
    state.attempts[first.exercises[0].id] = 1;
    state.completedSessions[first.id] = Date.now();
    state.achievements["first-step"] = Date.now();
    const unlocked = evaluateAchievements(state).map((a) => a.id);
    expect(unlocked).not.toContain("first-step");
  });

  it("has valid achievement definitions", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThan(5);
    const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
    expect(ids.size).toBe(ACHIEVEMENTS.length);
    for (const a of ACHIEVEMENTS) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(typeof a.check).toBe("function");
      expect(a.xp).toBeGreaterThanOrEqual(0);
    }
  });

  it("unlocks xp and streak milestones when thresholds are met", () => {
    const state = createDefaultState();
    state.xp = 1200;
    state.streak.longest = 7;
    state.streak.current = 7;
    const unlocked = evaluateAchievements(state).map((a) => a.id);
    expect(unlocked).toContain("xp-500");
    expect(unlocked).toContain("xp-1000");
    expect(unlocked).toContain("streak-3");
    expect(unlocked).toContain("streak-7");
  });
});
