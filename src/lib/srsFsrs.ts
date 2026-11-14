import { type Card, type CardInput, createEmptyCard, fsrs, Rating, State } from "ts-fsrs";
import type { ExerciseSrs } from "./progress";

// Fine-tuned FSRS scheduler for short language practice sessions:
// - target retention around 90%
// - short-term learning steps enabled for quick recovery after mistakes
// - bounded maximum interval to keep reviews relevant
// - deterministic scheduling (no fuzz) for predictable due times/tests
const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 365,
  enable_fuzz: false,
  enable_short_term: true,
});

function clampBox(box: number): number {
  if (!Number.isFinite(box)) return 0;
  return Math.max(0, Math.min(10, Math.round(box)));
}

function toCardInput(prev: ExerciseSrs | undefined, now: Date): CardInput {
  if (!prev) {
    const empty = createEmptyCard(now);
    return empty as unknown as CardInput;
  }

  const due = new Date(prev.due);
  const last = new Date(prev.last);
  const reps = Math.max(0, prev.correctStreak || 0);
  const lapses = prev.box === 0 && prev.correctStreak === 0 ? 1 : 0;
  const elapsedDays = Math.max(0, (now.getTime() - prev.last) / 86_400_000);
  const scheduledDays = Math.max(0, (prev.due - prev.last) / 86_400_000);
  const state =
    prev.correctStreak <= 0 ? State.Learning : reps >= 2 ? State.Review : State.Learning;

  // Approximate stability/difficulty from retained progress to smooth migration.
  const stability = Math.max(0.4, 0.6 + prev.box * 1.4 + Math.min(reps, 5) * 0.25);
  const difficulty = Math.min(9.5, Math.max(1.5, 6.8 - prev.box * 0.45));

  return {
    due,
    stability,
    difficulty,
    elapsed_days: elapsedDays,
    scheduled_days: scheduledDays,
    reps,
    lapses,
    learning_steps: 0,
    state,
    last_review: last,
  } as unknown as CardInput;
}

export interface NextSrsOptions {
  struggled?: boolean;
}

export function nextSrsFsrs(
  prev: ExerciseSrs | undefined,
  correct: boolean,
  nowMs = Date.now(),
  options: NextSrsOptions = {},
): ExerciseSrs {
  const now = new Date(nowMs);
  const card = toCardInput(prev, now);
  const rating = !correct ? Rating.Again : options.struggled ? Rating.Hard : Rating.Good;

  const result = scheduler.next(card as unknown as Card, now, rating);
  const nextCard = result.card;

  if (!correct) {
    return {
      box: 0,
      due: nextCard.due.getTime(),
      last: nowMs,
      correctStreak: 0,
    };
  }

  const prevBox = prev?.box ?? 0;
  const step = options.struggled ? 0 : 1;
  return {
    box: clampBox(prevBox + step),
    due: nextCard.due.getTime(),
    last: nowMs,
    correctStreak: (prev?.correctStreak ?? 0) + 1,
  };
}
