import { describe, expect, it } from "vitest";
import { nextSrsFsrs } from "./srsFsrs";

describe("srsFsrs", () => {
  it("schedules incorrect reviews soon and resets streak/box", () => {
    const now = Date.now();
    const next = nextSrsFsrs(undefined, false, now);
    expect(next.box).toBe(0);
    expect(next.correctStreak).toBe(0);
    expect(next.last).toBe(now);
    expect(next.due).toBeGreaterThan(now);
    expect(next.due - now).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  it("schedules correct reviews in the future and increases streak/box", () => {
    const now = Date.now();
    const first = nextSrsFsrs(undefined, true, now);
    expect(first.box).toBeGreaterThanOrEqual(1);
    expect(first.correctStreak).toBe(1);
    expect(first.due).toBeGreaterThan(now);

    const second = nextSrsFsrs(first, true, first.last + 60_000);
    expect(second.correctStreak).toBe(2);
    expect(second.box).toBeGreaterThanOrEqual(first.box);
    expect(second.due).toBeGreaterThan(second.last);
  });

  it("treats struggled correct answers as progress without box jump", () => {
    const now = Date.now();
    const first = nextSrsFsrs(undefined, true, now);
    const struggled = nextSrsFsrs(first, true, first.last + 60_000, { struggled: true });
    expect(struggled.correctStreak).toBe(first.correctStreak + 1);
    expect(struggled.box).toBe(first.box);
    expect(struggled.due).toBeGreaterThan(struggled.last);
  });

  it("resets after repeated failures and can recover", () => {
    const now = Date.now();
    const ok = nextSrsFsrs(undefined, true, now);
    const fail1 = nextSrsFsrs(ok, false, ok.last + 60_000);
    const fail2 = nextSrsFsrs(fail1, false, fail1.last + 60_000);
    expect(fail2.box).toBe(0);
    expect(fail2.correctStreak).toBe(0);
    expect(fail2.due).toBeGreaterThan(fail2.last);

    const recover = nextSrsFsrs(fail2, true, fail2.last + 60_000);
    expect(recover.correctStreak).toBe(1);
    expect(recover.box).toBe(1);
  });
});
