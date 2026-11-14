import { describe, expect, it } from "vitest";
import { createDefaultState } from "./progress";
import { compactState, expandState, mergeProgressDetailed } from "./progressSync";

describe("progressSync", () => {
  it("compacts and expands core progress fields", () => {
    const state = createDefaultState();
    state.xp = 120;
    state.completedExercises["m1-l1-e1"] = 1234;
    state.completedSessions["m1-l1"] = 1234;
    state.savedSlang = ["ship"];
    state.settings.name = "Ana";
    state.settings.onboarded = true;

    const compact = compactState(state);
    expect(compact.xp).toBe(120);
    expect((compact as any).ce["m1-l1-e1"]).toBe(1234);
    expect((compact as any).se.name).toBe("Ana");

    const expanded = expandState(compact, createDefaultState());
    expect(expanded.xp).toBe(120);
    expect(expanded.completedExercises["m1-l1-e1"]).toBe(1234);
    expect(expanded.savedSlang).toContain("ship");
    expect(expanded.settings.name).toBe("Ana");
    expect(expanded.settings.onboarded).toBe(true);
  });

  it("merges progress without losing completions and keeps max xp", () => {
    const local = createDefaultState();
    const remote = createDefaultState();
    local.xp = 50;
    remote.xp = 80;
    local.completedExercises["e1"] = 100;
    remote.completedExercises["e2"] = 200;
    local.attempts["e1"] = 2;
    remote.attempts["e1"] = 4;
    local.savedSlang = ["a"];
    remote.savedSlang = ["b"];

    const res = mergeProgressDetailed(local, remote);
    expect(res.merged.completedExercises["e1"]).toBe(100);
    expect(res.merged.completedExercises["e2"]).toBe(200);
    expect(res.merged.attempts["e1"]).toBe(4);
    expect(res.merged.savedSlang).toEqual(expect.arrayContaining(["a", "b"]));
    expect(res.merged.xp).toBeGreaterThanOrEqual(80);
  });

  it("returns non-compact full state when expanding partial full objects", () => {
    const defaults = createDefaultState();
    const expanded = expandState({ xp: 33, settings: { ...defaults.settings, name: "Bob" } }, defaults);
    expect(expanded.xp).toBe(33);
    expect(expanded.settings.name).toBe("Bob");
  });
});
