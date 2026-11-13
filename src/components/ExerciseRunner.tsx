import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Keyboard,
  Lightbulb,
  ListOrdered,
  MousePointerClick,
  PenLine,
  RotateCcw,
  Trophy,
  Volume2,
  X,
} from "lucide-preact";
import type { Exercise } from "../lib/types";
import { getUiStage, t, tAction, type UiStage } from "../lib/i18n";
import { progressStore } from "../lib/progress";
import { useProgress } from "../lib/useProgress";

interface NextSession {
  slug: string;
  title: string;
  step: string;
}

interface Props {
  sessionId: string;
  sessionTitle: string;
  exercises: Exercise[];
  next: NextSession | null;
}

type Status = "idle" | "correct" | "incorrect";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function typeLabel(exercise: Exercise, stage: UiStage): string {
  if (exercise.type === "choice") return tAction(stage, "chooseOption");
  if (exercise.type === "builder") return tAction(stage, "orderWords");
  return tAction(stage, "writeAnswer");
}

function TypeIcon({ type }: { type: Exercise["type"] }) {
  if (type === "choice") return <MousePointerClick class="h-4 w-4" />;
  if (type === "builder") return <ListOrdered class="h-4 w-4" />;
  return <PenLine class="h-4 w-4" />;
}

function shuffleIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  if (length > 1) {
    const sameOrder = indices.every((value, i) => value === i);
    if (sameOrder) [indices[0], indices[1]] = [indices[1], indices[0]];
  }
  return indices;
}

function burstConfetti() {
  if (typeof document === "undefined") return;
  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    overflow: "hidden",
    zIndex: "9999",
  } as CSSStyleDeclaration);
  const colors = ["#0b8f6d", "#58d6ad", "#f3c969", "#2563eb", "#f08a8a", "#ffffff"];
  const count = 28;
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    const size = 6 + Math.random() * 6;
    const left = 30 + Math.random() * 40;
    const dx = (Math.random() - 0.5) * 220;
    const dy = 220 + Math.random() * 260;
    const rot = (Math.random() - 0.5) * 720;
    const dur = 900 + Math.random() * 700;
    Object.assign(piece.style, {
      position: "absolute",
      left: `${left}%`,
      top: "30%",
      width: `${size}px`,
      height: `${size * (0.6 + Math.random() * 0.8)}px`,
      background: colors[i % colors.length],
      borderRadius: `${Math.random() > 0.5 ? 2 : 999}px`,
      opacity: "0.95",
      transform: "translate(-50%, -50%)",
    } as CSSStyleDeclaration);
    root.appendChild(piece);
    piece.animate(
      [
        { transform: "translate(-50%, -50%) translate(0px, 0px) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
          opacity: 0,
        },
      ],
      { duration: dur, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" },
    );
  }
  document.body.appendChild(root);
  window.setTimeout(() => root.remove(), 1800);
}

export default function ExerciseRunner({
  sessionId,
  sessionTitle,
  exercises,
  next,
}: Props) {
  const state = useProgress();
  const stage = getUiStage(state);
  const initialRun = useRef((() => {
    const snapshot = progressStore.getState();
    const wasComplete = Boolean(snapshot.completedSessions[sessionId]);
    const solvedIds = wasComplete
      ? []
      : exercises
          .filter((item) => snapshot.completedExercises[item.id])
          .map((item) => item.id);
    const firstPending = exercises.findIndex(
      (item) => !snapshot.completedExercises[item.id],
    );
    return {
      wasComplete,
      solved: solvedIds,
      index: wasComplete || firstPending < 0 ? 0 : firstPending,
    };
  })()).current;
  const wasComplete = initialRun.wasComplete;
  const [index, setIndex] = useState(initialRun.index);
  const [selected, setSelected] = useState<number | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [solved, setSolved] = useState<string[]>(initialRun.solved);
  const [finished, setFinished] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<number[]>([]);

  const exercise = exercises[index];
  const total = exercises.length;
  const progress = Math.round((solved.length / Math.max(total, 1)) * 100);

  useEffect(() => {
    if (exercise?.type === "builder") {
      setShuffledWords(shuffleIndices(exercise.words.length));
    } else {
      setShuffledWords([]);
    }
  }, [exercise?.id, exercise?.type]);

  const isCorrectAnswer = useMemo(() => {
    if (!exercise) return false;
    if (exercise.type === "choice") return selected === exercise.answer;
    if (exercise.type === "builder") {
      return (
        normalize(picked.map((wordIndex) => exercise.words[wordIndex]).join(" ")) ===
        normalize(exercise.answer)
      );
    }
    const candidates = [exercise.answer, ...(exercise.accept ?? [])];
    return candidates.some((candidate) => normalize(candidate) === normalize(text));
  }, [exercise, selected, picked, text]);

  const canCheck =
    Boolean(exercise) &&
    ((exercise.type === "choice" && selected !== null) ||
      (exercise.type === "builder" && picked.length > 0) ||
      (exercise.type === "write" && text.trim().length > 0));

  function resetInteraction() {
    setSelected(null);
    setPicked([]);
    setText("");
    setStatus("idle");
    setAttempted(false);
    if (exercise?.type === "builder") {
      setShuffledWords(shuffleIndices(exercise.words.length));
    }
  }

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= total) return;
    setIndex(nextIndex);
    resetInteraction();
  }

  function restart() {
    setIndex(0);
    setSolved([]);
    setFinished(false);
    resetInteraction();
  }

  function check() {
    if (!exercise || !canCheck) return;
    const correct = isCorrectAnswer;
    progressStore.recordExercise(exercise, correct);
    setAttempted(true);
    if (correct) {
      setStatus("correct");
      setSolved((current) =>
        current.includes(exercise.id) ? current : [...current, exercise.id],
      );
      burstConfetti();
    } else {
      setStatus("incorrect");
    }
  }

  function advance() {
    if (!exercise) return;
    const solvedNow = new Set([...solved, exercise.id]);
    if (solvedNow.size < total) {
      const nextUnsolved = exercises.findIndex(
        (item, itemIndex) => itemIndex !== index && !solvedNow.has(item.id),
      );
      if (nextUnsolved >= 0) goTo(nextUnsolved);
      return;
    }
    progressStore.completeSession(sessionId);
    setFinished(true);
  }

  function retry() {
    setStatus("idle");
    setAttempted(false);
    if (exercise?.type === "choice") setSelected(null);
    if (exercise?.type === "builder") {
      setPicked([]);
      setShuffledWords(shuffleIndices(exercise.words.length));
    }
    if (exercise?.type === "write") setText("");
  }

  useEffect(() => {
    const onRestart = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string }>).detail;
      if (detail?.sessionId === sessionId) restart();
    };
    window.addEventListener("deveng:restart-session", onRestart);
    return () => window.removeEventListener("deveng:restart-session", onRestart);
  }, [sessionId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || finished) return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("button, a, input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        goTo(index - 1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (status === "correct") advance();
        else if (index < total - 1) goTo(index + 1);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        if (status === "correct") advance();
        else if (canCheck) check();
        return;
      }

      if (
        exercise?.type === "choice" &&
        status !== "correct" &&
        /^[1-9]$/.test(event.key)
      ) {
        const optionIndex = Number(event.key) - 1;
        if (optionIndex < exercise.options.length) {
          event.preventDefault();
          setSelected(optionIndex);
          if (status === "incorrect") {
            setStatus("idle");
            setAttempted(false);
          }
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [exercise, index, status, finished, canCheck, isCorrectAnswer, solved, selected, picked, text]);

  if (!exercise) return null;

  const correctAnswerText =
    exercise.type === "choice"
      ? exercise.options[exercise.answer]
      : exercise.answer;

  if (finished) {
    const isLast = !next;
    return (
      <div class="animate-pop overflow-hidden rounded-[26px] bg-base-200 p-1.5">
        <div class="relative overflow-hidden rounded-[20px] bg-base-100 px-6 py-12 text-center sm:px-10">
          <div class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-accent/[0.07] to-transparent" />
          <div class="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Trophy class="h-7 w-7" />
          </div>
          <p class="mono-label relative mt-5 text-accent/80">{tAction(stage, "sessionCompleted")}</p>
          <h3 class="font-pixel relative mx-auto mt-3 max-w-xl text-balance text-[1.7rem] leading-tight tracking-tight sm:text-[2.1rem]">
            {sessionTitle}
          </h3>
          <p class="relative mx-auto mt-3 max-w-md text-sm leading-6 text-base-content/50">
            {tAction(stage, isLast ? "lastBody" : "savedBody")}
          </p>

          <div class="relative mx-auto mt-6 flex max-w-sm flex-wrap items-center justify-center gap-2">
            <span class="rounded-full bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-medium text-accent">
              {tAction(stage, wasComplete ? "sessionReviewed" : "sessionXp")}
            </span>
            <span class="rounded-full bg-base-200 px-3 py-1.5 font-mono text-[11px] text-base-content/45">
              {solved.length}/{total} {tAction(stage, "exercises").toLowerCase()}
            </span>
          </div>

          <div class="relative mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            {next && (
              <a
                href={`/session/${next.slug}`}
                class="btn btn-primary btn-sm h-10 gap-2 rounded-xl px-4"
              >
                {tAction(stage, "next")}: {next.title}
                <ArrowRight class="h-3.5 w-3.5" />
              </a>
            )}
            <a href="/" class="btn btn-ghost btn-sm h-10 gap-2 rounded-xl px-3 text-base-content/55">
              <ArrowLeft class="h-3.5 w-3.5" />
              {tAction(stage, "backRoadmap")}
            </a>
            <button
              type="button"
              onClick={restart}
              class="btn btn-ghost btn-sm h-10 gap-2 rounded-xl px-3 text-base-content/40"
            >
              <RotateCcw class="h-3.5 w-3.5" />
              {tAction(stage, "review")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="mono-label">{tAction(stage, "exercise")}</span>
          <span class="font-mono text-[11px] font-medium text-base-content/65">
            {index + 1} / {total}
          </span>
          {state.completedExercises[exercise.id] && (
            <span class="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-medium text-accent">
              <Check class="h-2.5 w-2.5" /> {tAction(stage, "alreadySolved")}
            </span>
          )}
        </div>
        <div class="flex items-center gap-1">
          <span class="mr-1 hidden items-center gap-1.5 text-[9px] text-base-content/30 sm:flex">
            <Keyboard class="h-3 w-3" />
            {t(stage, "shortcuts")}: ← → · Enter · 1–4
          </span>
          <button
            type="button"
            onClick={restart}
            class="flex h-7 w-7 items-center justify-center rounded-full text-base-content/30 transition hover:bg-base-200 hover:text-base-content/60"
            aria-label={tAction(stage, "restartSession")}
            title={tAction(stage, "restartSession")}
          >
            <RotateCcw class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="h-1 flex-1 overflow-hidden rounded-full bg-base-content/[0.07]">
          <div
            class="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span class="w-8 text-right font-mono text-[10px] tabular-nums text-base-content/35">
          {progress}%
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-1.5" aria-label={tAction(stage, "exercise")}>
        {exercises.map((item, itemIndex) => {
          const isSolved = solved.includes(item.id);
          const isCurrent = itemIndex === index;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(itemIndex)}
              class={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10px] transition ${
                isCurrent
                  ? "bg-base-content text-base-100"
                  : isSolved
                    ? "bg-accent/15 text-accent hover:bg-accent/25"
                    : "bg-base-200 text-base-content/35 hover:bg-base-300 hover:text-base-content/60"
              }`}
              aria-label={`${tAction(stage, "exercise")} ${itemIndex + 1}${isSolved ? ` (${tAction(stage, "completed")})` : ""}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isSolved && !isCurrent ? <Check class="h-3 w-3" /> : itemIndex + 1}
            </button>
          );
        })}
      </div>

      <div class="rounded-[26px] bg-base-200 p-1.5">
        <div class="rounded-[20px] bg-base-100 p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-200 text-base-content/50">
              <TypeIcon type={exercise.type} />
            </span>
            <div class="space-y-1.5 pt-0.5">
              <p class="text-[11px] font-medium tracking-normal text-base-content/55">
                {typeLabel(exercise, stage)}
              </p>
              <h3 class="text-balance text-[15px] font-medium leading-relaxed text-base-content/85 sm:text-base">
                {exercise.prompt}
              </h3>
            </div>
          </div>

          {exercise.type === "choice" && (
            <div class="mt-5 space-y-1.5">
              {exercise.options.map((option, optionIndex) => {
                const isSelected = selected === optionIndex;
                const isRight = status === "correct" && optionIndex === exercise.answer;
                const isWrong = status === "incorrect" && isSelected;
                return (
                  <div
                    key={option}
                    class={`flex items-center gap-1 rounded-xl transition ${
                      isRight
                        ? "bg-accent/[0.09]"
                        : isWrong
                          ? "bg-error/[0.08]"
                          : isSelected
                            ? "bg-base-200"
                            : "hover:bg-base-200/60"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={status === "correct"}
                      onClick={() => {
                        setSelected(optionIndex);
                        if (status === "incorrect") {
                          setStatus("idle");
                          setAttempted(false);
                        }
                      }}
                      class="flex flex-1 items-center gap-3 px-3 py-3 text-left text-sm disabled:cursor-default"
                    >
                      <span
                        class={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] transition ${
                          isRight
                            ? "bg-accent text-accent-content"
                            : isWrong
                              ? "bg-error text-error-content"
                              : isSelected
                                ? "bg-base-content text-base-100"
                                : "bg-base-200 text-base-content/35"
                        }`}
                      >
                        {isRight ? (
                          <Check class="h-3 w-3" />
                        ) : isWrong ? (
                          <X class="h-3 w-3" />
                        ) : (
                          String.fromCharCode(65 + optionIndex)
                        )}
                      </span>
                      <span
                        class={`flex-1 ${
                          status === "correct" && !isRight
                            ? "text-base-content/35"
                            : "text-base-content/70"
                        }`}
                      >
                        {option}
                      </span>
                    </button>
                    <button
                      type="button"
                      data-speak={option}
                      class="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base-content/20 transition hover:bg-base-100 hover:text-base-content/60"
                      aria-label={`Escuchar ${option}`}
                    >
                      <Volume2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {exercise.type === "builder" && (
            <div class="mt-5 space-y-4">
              <div class="min-h-[64px] rounded-2xl bg-base-200/70 p-3">
                {picked.length === 0 ? (
                  <p class="px-1 py-2 text-xs text-base-content/30">
                    {tAction(stage, "tapWords")}
                  </p>
                ) : (
                  <div class="flex flex-wrap gap-1.5">
                    {picked.map((wordIndex, position) => (
                      <button
                        key={`${wordIndex}-${position}`}
                        type="button"
                        disabled={status === "correct"}
                        onClick={() =>
                          setPicked((current) =>
                            current.filter((_, indexValue) => indexValue !== position),
                          )
                        }
                        class="rounded-lg bg-base-100 px-2.5 py-1.5 text-xs font-medium text-base-content/75 transition hover:bg-base-300 disabled:opacity-60"
                      >
                        {exercise.words[wordIndex]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div class="flex flex-wrap gap-1.5">
                {(shuffledWords.length ? shuffledWords : exercise.words.map((_, i) => i)).map((wordIndex) => {
                  const word = exercise.words[wordIndex];
                  const used = picked.includes(wordIndex);
                  return (
                    <button
                      key={`${word}-${wordIndex}`}
                      type="button"
                      disabled={used || status === "correct"}
                      onClick={() => setPicked((current) => [...current, wordIndex])}
                      class={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        used
                          ? "bg-base-200/40 text-base-content/20"
                          : "bg-base-200 text-base-content/65 hover:bg-base-300 hover:text-base-content"
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {exercise.type === "write" && (
            <div class="mt-5 space-y-2">
              <textarea
                value={text}
                disabled={status === "correct"}
                onInput={(event) => setText((event.target as HTMLTextAreaElement).value)}
                rows={2}
                placeholder={tAction(stage, "typeAnswer")}
                class="w-full resize-none rounded-2xl bg-base-200 px-4 py-3.5 font-mono text-sm text-base-content placeholder:text-base-content/25 disabled:opacity-70"
                spellcheck={false}
              />
              {exercise.hint && (
                <p class="flex items-center gap-1.5 px-1 text-[12px] text-base-content/55">
                  <Lightbulb class="h-3 w-3 text-warning/70" />
                  {exercise.hint}
                </p>
              )}
            </div>
          )}

          {attempted && (
            <div
              class={`mt-5 space-y-2.5 rounded-2xl p-4 ${
                status === "correct" ? "bg-accent/[0.07]" : "bg-error/[0.06]"
              }`}
            >
              <div class="flex items-center justify-between gap-2">
                <p
                  class={`flex items-center gap-1.5 text-xs font-semibold ${
                    status === "correct" ? "text-accent" : "text-error"
                  }`}
                >
                  {status === "correct" ? (
                    <>
                      <Check class="h-3.5 w-3.5" /> {tAction(stage, "correct")}
                    </>
                  ) : (
                    <>
                      <X class="h-3.5 w-3.5" /> {tAction(stage, "notYet")}
                    </>
                  )}
                </p>
                <button
                  type="button"
                  data-speak={correctAnswerText}
                  class="speak-btn flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium text-base-content/40 transition hover:bg-base-100/60 hover:text-base-content/70"
                >
                  <Volume2 class="h-3 w-3" />
                  {tAction(stage, "answer")}
                </button>
              </div>
              <p class="text-[13px] leading-relaxed text-base-content/70">{exercise.explanation}</p>
              {status === "incorrect" && (
                <p class="pt-0.5 font-mono text-[12px] leading-relaxed text-base-content/65">
                  {tAction(stage, "correctAnswer")}: {correctAnswerText}
                </p>
              )}
            </div>
          )}
        </div>

        <div class="mt-1 flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
          <p class="text-[10px] text-base-content/30">
            {exercise.type === "builder"
              ? stage === "es"
                ? `${picked.length} palabra${picked.length === 1 ? "" : "s"} seleccionada${picked.length === 1 ? "" : "s"}`
                : `${picked.length} ${tAction(stage, "wordsSelected")}`
              : tAction(stage, "noPenalty")}
          </p>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              class="btn btn-ghost btn-sm h-9 gap-1.5 rounded-xl px-2.5 text-base-content/45 disabled:opacity-30"
              aria-label={tAction(stage, "previous")}
            >
              <ArrowLeft class="h-3.5 w-3.5" />
              <span class="hidden sm:inline">{tAction(stage, "previous")}</span>
            </button>
            {status === "incorrect" && (
              <button
                type="button"
                onClick={retry}
                class="btn btn-ghost btn-sm h-9 gap-1.5 rounded-xl px-3 text-base-content/55"
              >
                <RotateCcw class="h-3.5 w-3.5" />
                {tAction(stage, "retry")}
              </button>
            )}
            {status === "correct" ? (
              <button
                type="button"
                onClick={advance}
                class="btn btn-primary btn-sm h-9 gap-1.5 rounded-xl px-4"
              >
                {tAction(stage, solved.length >= total ? "seeResult" : "next")}
                <ArrowRight class="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={check}
                disabled={!canCheck}
                class="btn btn-primary btn-sm h-9 gap-1.5 rounded-xl px-4 disabled:opacity-30"
              >
                {tAction(stage, "check")}
                <Check class="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
