import { describe, expect, it } from "vitest";
import { createDefaultState } from "./progress";
import { getLanguageStatus, getUiStage, t, tAction } from "./i18n";

describe("i18n", () => {
  it("returns spanish stage by default and computes status shape", () => {
    const state = createDefaultState();
    const status = getLanguageStatus(state);
    expect(status.stage).toBeDefined();
    expect(status.autoStage).toBeDefined();
    expect(status.score).toBeGreaterThanOrEqual(0);
    expect(status.score).toBeLessThanOrEqual(100);
    expect(typeof status.reason).toBe("string");
    expect(getUiStage(state)).toBe(status.stage);
  });

  it("respects manual immersion preference", () => {
    const state = createDefaultState();
    state.settings.immersion = "en";
    expect(getLanguageStatus(state).stage).toBe("en");
    state.settings.immersion = "mixed";
    expect(getLanguageStatus(state).stage).toBe("mixed");
    state.settings.immersion = "es";
    expect(getLanguageStatus(state).stage).toBe("es");
  });

  it("translates ui strings by stage", () => {
    expect(t("es", "continue")).toBe("Continuar");
    expect(t("en", "continue")).toBe("Continue");
    expect(t("mixed", "continue")).toContain("Continuar");
    expect(t("mixed", "continue")).toContain("Continue");
    expect(t("es", "missing-key")).toBe("missing-key");
  });

  it("uses compact action translations", () => {
    expect(tAction("es", "continue")).toBe("Continuar");
    expect(tAction("en", "continue")).toBe("Continue");
    expect(tAction("mixed", "continue")).toBe("Continue");
  });
});
