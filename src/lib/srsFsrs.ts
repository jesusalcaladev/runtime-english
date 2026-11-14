import { dateChrono, defineScheduler, Rating, State } from "ts-fsrs";
import {
  schedulerDesiredRetentionMiddleware,
  schedulerLearningStepsMiddleware,
  schedulerMaximumIntervalMiddleware,
} from "ts-fsrs/middlewares";
import { FSRS7_DEFAULT_WEIGHTS, FSRS7Model } from "ts-fsrs/models/fsrs-7";
import type { ExerciseSrs } from "./progress";

// Fine-tuned FSRS-7 scheduler for short language practice sessions:
// - ~90% target retention
// - short-term learning/relearning steps for quick recovery after mistakes
// - bounded maximum interval and deterministic scheduling (no fuzz)
const scheduler = defineScheduler({
  model: FSRS7Model,
  chrono: dateChrono,
})
  .use(schedulerDesiredRetentionMiddleware)
  .use(schedulerLearningStepsMiddleware)
  .use(schedulerMaximumIntervalMiddleware)
  .create({
    config: {
      weights: FSRS7_DEFAULT_WEIGHTS,
      fractionalDays: true,
      desiredRetention: 0.9,
      maximumInterval: 365,
      enableShortTerm: true,
      learningSteps: ["1m", "10m"],
      relearningSteps: ["10m"],
    },
  });

function clampBox(box: number): number {
  if (!Number.isFinite(box)) return 0;
  return Math.max(0, Math.min(10, Math.round(box)));
}

type FsrsCard = ReturnType<typeof scheduler.newCard>;

function toSchedulerCard(prev: ExerciseSrs | undefined, now: Date): FsrsCard {
  if (!prev) {
    return scheduler.newCard({ now });
  }

  const reps = Math.max(0, prev.correctStreak || 0);
  const box = clampBox(prev.box ?? 0);
  const stability = Math.max(0.4, 0.6 + box * 1.4 + Math.min(reps, 5) * 0.25);
  const difficulty = Math.min(9.5, Math.max(1.5, 6.8 - box * 0.45));
  const state = reps <= 0 ? State.Learning : reps >= 2 ? State.Review : State.Learning;
  const scheduleStatus = reps <= 0 ? "learning" : "review";

  return {
    stability,
    stabilityFast: Math.max(0.4, stability * 0.8),
    difficulty,
    state,
    scheduleStatus,
    dueAt: new Date(prev.due),
    lastReviewAt: new Date(prev.last),
    learningStep: reps <= 0 ? 0 : 0,
  } as unknown as FsrsCard;
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
  const card = toSchedulerCard(prev, now);
  const grade = !correct ? Rating.Again : options.struggled ? Rating.Hard : Rating.Good;

  const result = scheduler.review({ card, grade, now });
  const nextCard = result.card as any;

  if (!correct) {
    return {
      box: 0,
      due: (nextCard.dueAt as Date).getTime(),
      last: nowMs,
      correctStreak: 0,
    };
  }

  const prevBox = prev?.box ?? 0;
  const step = options.struggled ? 0 : 1;
  return {
    box: clampBox(prevBox + step),
    due: (nextCard.dueAt as Date).getTime(),
    last: nowMs,
    correctStreak: (prev?.correctStreak ?? 0) + 1,
  };
}
