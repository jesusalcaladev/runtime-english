import { describe, expect, it } from "vitest";
import { GOAL_LABELS, goalRelevanceBoost, isSessionRelevantToGoal } from "./goals";

describe("goals", () => {
  it("detects session relevance by goal", () => {
    expect(isSessionRelevantToGoal("daily-standup", "daily")).toBe(true);
    expect(isSessionRelevantToGoal("daily-standup", "work")).toBe(false);
    expect(isSessionRelevantToGoal("git-y-errores", "work")).toBe(true);
    expect(isSessionRelevantToGoal("entrevistas-tecnicas", "interviews")).toBe(true);
    expect(isSessionRelevantToGoal("anything", "all")).toBe(false);
  });

  it("returns relevance boost and labels", () => {
    expect(goalRelevanceBoost("daily-standup", "daily")).toBe(1);
    expect(goalRelevanceBoost("daily-standup", "interviews")).toBe(0);
    expect(GOAL_LABELS.daily).toMatch(/Trabajo/);
    expect(GOAL_LABELS.all).toBe("Ruta completa");
  });
});
