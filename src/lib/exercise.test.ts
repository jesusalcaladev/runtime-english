import { describe, expect, it } from "vitest";
import type { Exercise } from "./types";
import {
  canCheckExercise,
  getCorrectAnswerText,
  getUserAnswerText,
  isExerciseAnswerCorrect,
  normalizeAnswer,
  shuffleIndices,
  splitBlankAlts,
} from "./exercise";

const base = { selected: null, picked: [], text: "", blankValues: [], dialoguePicked: [], heardText: "" };

describe("exercise utils", () => {
  it("normalizes and splits alternatives", () => {
    expect(normalizeAnswer("  ¡Hola,  Múndo!  ")).toBe("hola mundo");
    expect(splitBlankAlts(" at | in ")).toEqual(["at", "in"]);
  });

  it("shuffles indices and avoids trivial same order when possible", () => {
    const out = shuffleIndices(3, () => 0); // deterministic but should still produce a permutation
    expect(out.sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });

  it("evaluates choice, builder and text exercises", () => {
    const choice: Exercise = { id: "c", type: "choice", prompt: "", options: ["a", "b"], answer: 1, explanation: "" };
    expect(canCheckExercise(choice, base)).toBe(false);
    expect(isExerciseAnswerCorrect(choice, { ...base, selected: 1 })).toBe(true);
    expect(getCorrectAnswerText(choice)).toBe("b");

    const builder: Exercise = { id: "b", type: "builder", prompt: "", words: ["bug", "I", "fixed"], answer: "I fixed bug", explanation: "" };
    expect(isExerciseAnswerCorrect(builder, { ...base, picked: [1, 2, 0] })).toBe(true);
    expect(getUserAnswerText(builder, { ...base, picked: [1, 2, 0] })).toBe("I fixed bug");

    const write: Exercise = { id: "w", type: "write", prompt: "", answer: "I fixed the bug.", accept: ["I fixed the bug"], explanation: "" };
    expect(isExerciseAnswerCorrect(write, { ...base, text: "i fixed the bug" })).toBe(true);
  });

  it("evaluates fill-blank and dialogue-order", () => {
    const fill: Exercise = { id: "f", type: "fill-blank", prompt: "", template: "I work ___ a ___", blanks: ["at|in", "startup"], explanation: "" };
    expect(canCheckExercise(fill, { ...base, blankValues: ["at", "startup"] })).toBe(true);
    expect(isExerciseAnswerCorrect(fill, { ...base, blankValues: ["at", "startup"] })).toBe(true);
    expect(getCorrectAnswerText(fill)).toBe("at · startup");

    const dialog: Exercise = { id: "d", type: "dialogue-order", prompt: "", lines: ["Hi", "Hello"], explanation: "" };
    expect(isExerciseAnswerCorrect(dialog, { ...base, dialoguePicked: [0, 1] })).toBe(true);
    expect(isExerciseAnswerCorrect(dialog, { ...base, dialoguePicked: [1, 0] })).toBe(false);
  });

  it("evaluates speak with exact/accepted text fallback", () => {
    const speak: Exercise = { id: "s", type: "speak", prompt: "", answer: "I fixed the bug", accept: ["I fixed it"], explanation: "" };
    expect(canCheckExercise(speak, { ...base, heardText: "I fixed the bug" })).toBe(true);
    expect(isExerciseAnswerCorrect(speak, { ...base, heardText: "I fixed the bug" })).toBe(true);
    expect(isExerciseAnswerCorrect(speak, { ...base, text: "I fixed it" })).toBe(true);
  });
});
