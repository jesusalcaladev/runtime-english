import { render, screen } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import ProgressPill from "./ProgressPill";

vi.mock("../../lib/useProgress", () => ({
  useProgress: () => ({
    completedExercises: { e1: 1, e2: 2 },
    completedSessions: { s1: 1, s2: 2, s3: 3 },
  }),
}));

describe("ProgressPill", () => {
  it("renders CEFR, progress bar and percentage", () => {
    render(
      <ProgressPill
        a1SessionIds={["s1", "s2"]}
        b1SessionIds={["s3", "s4"]}
        totalSessions={10}
        totalExercises={20}
      />,
    );
    expect(screen.getByTitle(/sesiones · .* ejercicios/)).toBeTruthy();
    expect(screen.getByText("10%")).toBeTruthy();
    expect(screen.getByText(/A1-A2|A2 → B1|B1-B2/)).toBeTruthy();
  });
});
