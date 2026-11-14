import { describe, expect, it } from "vitest";
import { createDefaultState } from "./progress";
import {
  getConsistencyFeedback,
  getConsistencyStats,
  getLearningRecommendations,
  recommendPlan,
  toStudyPlan,
} from "./studyPlan";

describe("studyPlan", () => {
  it("recommends a plan by level and goal and converts to StudyPlan", () => {
    const rec = recommendPlan("interviews", { level: "B1", score: 70, completedAt: Date.now() });
    expect(rec.level).toBe("B1");
    expect(rec.focus).toBe("interviews");
    expect(rec.dailyExercises).toBeGreaterThan(0);
    expect(rec.weeklySessions).toBeGreaterThan(0);
    expect(rec.summary).toContain("min/día");

    const plan = toStudyPlan(rec);
    expect(plan).toMatchObject({
      dailyMinutes: rec.dailyMinutes,
      dailyExercises: rec.dailyExercises,
      weeklySessions: rec.weeklySessions,
      weeklyExercises: rec.weeklyExercises,
      monthlySessions: rec.monthlySessions,
      monthlyExercises: rec.monthlyExercises,
      focus: "interviews",
      level: "B1",
    });
  });

  it("computes consistency stats for today/week/month activity", () => {
    const state = createDefaultState();
    const now = Date.now();
    const todayTs = now;
    const fiveDaysAgo = now - 5 * 86_400_000;
    state.completedExercises["e1"] = todayTs;
    state.completedExercises["e2"] = fiveDaysAgo;
    state.completedSessions["s1"] = todayTs;

    const stats = getConsistencyStats(state);
    expect(stats.todayExercises).toBeGreaterThanOrEqual(1);
    expect(stats.todaySessions).toBeGreaterThanOrEqual(1);
    expect(stats.weekExercises).toBeGreaterThanOrEqual(stats.todayExercises);
    expect(stats.monthExercises).toBeGreaterThanOrEqual(stats.weekExercises);
    expect(stats.activeDaysThisMonth).toBeGreaterThanOrEqual(1);
  });

  it("returns consistency feedback based on plan goals", () => {
    const stats = {
      todayExercises: 6,
      todaySessions: 1,
      weekExercises: 24,
      weekSessions: 4,
      monthExercises: 90,
      monthSessions: 14,
      activeDaysThisWeek: 4,
      activeDaysThisMonth: 10,
    };
    const plan = {
      dailyMinutes: 10,
      dailyExercises: 6,
      weeklySessions: 4,
      weeklyExercises: 24,
      monthlySessions: 14,
      monthlyExercises: 90,
      focus: "all" as const,
      level: "A1",
    };
    const tips = getConsistencyFeedback(stats, plan);
    expect(tips.length).toBeGreaterThan(0);
    expect(tips.join(" ")).toMatch(/Meta diaria|cumplida/i);

    const noPlan = getConsistencyFeedback(stats, null);
    expect(noPlan.join(" ")).toMatch(/Define un plan/i);
  });

  it("builds prioritized learning recommendations with limits", () => {
    const state = createDefaultState();
    const recs = getLearningRecommendations(state, {
      due: 3,
      weak: 2,
      unseen: 5,
      nextSessionSlug: "m1-l2",
      hardPhraseCount: 1,
      duePhrases: 4,
    });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(4);
    expect(recs.some((r) => r.href.includes("/practice?mode=review"))).toBe(true);
    expect(recs.some((r) => r.href.includes("phrases") || r.href.includes("dictionary"))).toBe(true);
  });
});
