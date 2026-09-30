/**
 * The path engine: how a notion moves through its five steps (CUR-03, CUR-04,
 * CUR-08, docs/PEDAGOGY.md §3). Pure functions: the caller passes the current
 * progress, the answers and the time, and stores what they return.
 *
 * - Steps 2 to 4: passed with at least 8 good answers among the last 10 of the
 *   step (a hinted answer counts half). At least 4 failures among the last 6
 *   start a short recall of the previous step, never below step 2; at step 2,
 *   the lesson is suggested instead.
 * - Recall: series of 5 answers of the previous step; 4 successes send the
 *   learner back to the original step, with its counter reset. Otherwise a new
 *   series starts (D-075).
 * - Step 5: two consecutive productions using the notion without a medium or
 *   major error on it make the notion acquired (graded by the AI, phase 4).
 * - Placement: a notion whose questions are all right starts at step 4, as
 *   "to consolidate" (D-022, D-075).
 *
 * Only answers given in the path count (context `path`); the counter of a step
 * is the set of its answers given since `stepEnteredAt`.
 */
import type { AnswerResult } from '../taxonomy.ts';
import type { NotionProgressValues, Step } from './progress.ts';

/** Steps 2 to 4 → next step: at least `minScore` over the last `window` answers. */
export const PASS_RULE = { window: 10, minScore: 8 } as const;
/** Repeated failures: at least `minFailures` among the last `window` answers. */
export const FALLBACK_RULE = { window: 6, minFailures: 4 } as const;
/** Recall of the previous step: `minSuccesses` in a series of `series` answers. */
export const RECALL_RULE = { series: 5, minSuccesses: 4 } as const;
/** Placement: every question of a notion right, with at least `minQuestions`. */
export const PLACEMENT_RULE = { minQuestions: 3 } as const;

/** What the engine needs to know of an answer given in the path. */
export interface PathAnswer {
  readonly at: number;
  readonly step: Step;
  readonly result: AnswerResult;
  readonly hintUsed: boolean;
}

export type ProgressEvent =
  /** Steps 2 to 4: the criterion is met; `to` is the new step. */
  | { readonly type: 'step-passed'; readonly from: Step; readonly to: Step }
  /** Repeated failures: a short recall of `step` starts. */
  | { readonly type: 'recall-started'; readonly step: Step }
  /** Recall passed: back to the original step, counter reset. */
  | { readonly type: 'recall-passed'; readonly step: Step }
  /** Recall series missed: a new series of the same step starts. */
  | { readonly type: 'recall-continued'; readonly step: Step }
  /** Repeated failures at step 2: the lesson is suggested, nothing is imposed. */
  | { readonly type: 'lesson-suggested' }
  | { readonly type: 'acquired' }
  | { readonly type: 'placed' }
  | { readonly type: 'started' };

export interface Transition {
  readonly progress: NotionProgressValues;
  readonly event: ProgressEvent;
  /** Whether `progress` differs from the stored progress and must be written. */
  readonly changed: boolean;
}

/** Progress of a notion never opened: absent from the database. */
export function notStartedProgress(now: number): NotionProgressValues {
  return {
    status: 'not_started',
    step: 1,
    recall: null,
    stepEnteredAt: now,
    acquiredAt: null,
    lastRegressionAt: null,
  };
}

function isNotStarted(progress: NotionProgressValues | null): boolean {
  return progress === null || progress.status === 'not_started';
}

/** Step whose exercises are done now: the recalled step during a recall. */
export function activeStep(progress: NotionProgressValues | null): Step {
  if (progress === null) return 1;
  return progress.recall?.step ?? progress.step;
}

/** Value of an answer for the step criterion: 1, 0.5 after a hint, 0 if wrong. */
export function answerScore(answer: PathAnswer): number {
  if (answer.result === 'incorrect') return 0;
  return answer.hintUsed ? 0.5 : 1;
}

/** Opening a notion in the path: not started → in progress, step 1. */
export function startNotion(progress: NotionProgressValues | null, now: number): Transition | null {
  if (!isNotStarted(progress)) return null;
  return {
    progress: { ...notStartedProgress(now), status: 'in_progress', step: 1 },
    event: { type: 'started' },
    changed: true,
  };
}

/** "J'ai compris, je passe à la reconnaissance": step 1 → step 2 (no test). */
export function finishLesson(
  progress: NotionProgressValues | null,
  now: number,
): Transition | null {
  if (!isNotStarted(progress) && !(progress?.status === 'in_progress' && progress.step === 1)) {
    return null;
  }
  return {
    progress: { ...notStartedProgress(now), status: 'in_progress', step: 2 },
    event: { type: 'step-passed', from: 1, to: 2 },
    changed: true,
  };
}

/** Answers of the current step's counter, oldest first. */
export function answersOfCurrentStep(
  progress: NotionProgressValues,
  answers: readonly PathAnswer[],
): PathAnswer[] {
  return sortByTime(
    answers.filter(
      (answer) => answer.step === progress.step && answer.at >= progress.stepEnteredAt,
    ),
  );
}

/** Answers of the current recall series, oldest first. */
export function answersOfRecallSeries(
  progress: NotionProgressValues,
  answers: readonly PathAnswer[],
): PathAnswer[] {
  const { recall } = progress;
  if (recall === null) return [];
  return sortByTime(
    answers.filter((answer) => answer.step === recall.step && answer.at > recall.startedAt),
  );
}

function sortByTime(answers: PathAnswer[]): PathAnswer[] {
  return answers.sort((a, b) => a.at - b.at);
}

function lastScore(answers: readonly PathAnswer[], window: number): number {
  return answers.slice(-window).reduce((sum, answer) => sum + answerScore(answer), 0);
}

function lastFailures(answers: readonly PathAnswer[], window: number): number {
  return answers.slice(-window).filter((answer) => answer.result === 'incorrect').length;
}

/**
 * After an answer given in the path (steps 2 to 4, or a recall). `answers`
 * are all the path answers of the notion, the new one included.
 */
export function afterPathAnswer(
  progress: NotionProgressValues,
  answers: readonly PathAnswer[],
  now: number,
): Transition | null {
  const active = progress.status === 'in_progress' || progress.status === 'to_consolidate';
  if (!active || progress.step < 2 || progress.step > 4) return null;

  const { recall } = progress;
  if (recall !== null) {
    const series = answersOfRecallSeries(progress, answers);
    if (series.length < RECALL_RULE.series) return null;
    const successes = series
      .slice(-RECALL_RULE.series)
      .filter((answer) => answer.result !== 'incorrect').length;
    if (successes >= RECALL_RULE.minSuccesses) {
      return {
        progress: { ...progress, recall: null, stepEnteredAt: now },
        event: { type: 'recall-passed', step: progress.step },
        changed: true,
      };
    }
    return {
      progress: { ...progress, recall: { step: recall.step, startedAt: now } },
      event: { type: 'recall-continued', step: recall.step },
      changed: true,
    };
  }

  const current = answersOfCurrentStep(progress, answers);
  if (
    current.length >= PASS_RULE.window &&
    lastScore(current, PASS_RULE.window) >= PASS_RULE.minScore
  ) {
    const to = progress.step + 1;
    return {
      progress: { ...progress, step: to, stepEnteredAt: now },
      event: { type: 'step-passed', from: progress.step, to },
      changed: true,
    };
  }
  if (
    current.length >= FALLBACK_RULE.window &&
    lastFailures(current, FALLBACK_RULE.window) >= FALLBACK_RULE.minFailures
  ) {
    if (progress.step === 2) {
      return { progress, event: { type: 'lesson-suggested' }, changed: false };
    }
    const step = progress.step - 1;
    return {
      progress: { ...progress, recall: { step, startedAt: now } },
      event: { type: 'recall-started', step },
      changed: true,
    };
  }
  return null;
}

/** A production of step 5, as graded by the correction (phase 4). */
export interface ProductionCheck {
  /** The production actually uses the notion. */
  readonly usesNotion: boolean;
  /** It has a medium or major error on the notion ("not natural" never counts). */
  readonly hasNotionError: boolean;
}

/** Step 5 → acquired: the last two productions both use the notion without error. */
export function isStep5Complete(productions: readonly ProductionCheck[]): boolean {
  const lastTwo = productions.slice(-2);
  return (
    lastTwo.length === 2 &&
    lastTwo.every((production) => production.usesNotion && !production.hasNotionError)
  );
}

/** After a graded production of step 5 (phase 4). */
export function afterProduction(
  progress: NotionProgressValues,
  productions: readonly ProductionCheck[],
  now: number,
): Transition | null {
  const active = progress.status === 'in_progress' || progress.status === 'to_consolidate';
  if (!active || progress.step !== 5 || !isStep5Complete(productions)) return null;
  return {
    progress: { ...progress, status: 'acquired', recall: null, acquiredAt: now },
    event: { type: 'acquired' },
    changed: true,
  };
}

/** Placement of one notion: passed when every question is right (CUR-08). */
export function isPlacementPassed(results: readonly boolean[]): boolean {
  return results.length >= PLACEMENT_RULE.minQuestions && results.every(Boolean);
}

/** A passed placement makes a notion not started yet "to consolidate", at step 4. */
export function applyPlacement(
  progress: NotionProgressValues | null,
  passed: boolean,
  now: number,
): Transition | null {
  if (!passed || !isNotStarted(progress)) return null;
  return {
    progress: { ...notStartedProgress(now), status: 'to_consolidate', step: 4 },
    event: { type: 'placed' },
    changed: true,
  };
}

/** Where an exercise was last seen, for the choice of the next one. */
export interface SeenExercise {
  readonly exerciseId: string;
  readonly at: number;
}

function lastSeenTimes(seen: readonly SeenExercise[]): Map<string, number> {
  const times = new Map<string, number>();
  for (const { exerciseId, at } of seen) {
    times.set(exerciseId, Math.max(at, times.get(exerciseId) ?? Number.NEGATIVE_INFINITY));
  }
  return times;
}

/**
 * Next exercise of a pool (in its order: increasing difficulty): the first one
 * never seen, otherwise the one seen longest ago, avoiding `avoid` (the one
 * just done) when another is available. `null` for an empty pool.
 */
export function pickNextExercise(
  poolIds: readonly string[],
  seen: readonly SeenExercise[],
  avoid: string | null = null,
): string | null {
  const times = lastSeenTimes(seen);
  const unseen = poolIds.find((id) => !times.has(id));
  if (unseen !== undefined) return unseen;
  const candidates = poolIds.length > 1 ? poolIds.filter((id) => id !== avoid) : poolIds;
  let best: string | null = null;
  for (const id of candidates) {
    if (best === null || (times.get(id) ?? 0) < (times.get(best) ?? 0)) best = id;
  }
  return best;
}

/** Every exercise of the pool has been done at least once: more may be generated (COST-09). */
export function isPoolExhausted(
  poolIds: readonly string[],
  seen: readonly SeenExercise[],
): boolean {
  const times = lastSeenTimes(seen);
  return poolIds.every((id) => times.has(id));
}

/** Where the learner stands on the current step's criterion, for display. */
export interface StepStanding {
  /** Answers counted (at most the window). */
  readonly counted: number;
  readonly window: number;
  /** Score over the counted answers. */
  readonly score: number;
  readonly needed: number;
}

export function stepStanding(
  progress: NotionProgressValues,
  answers: readonly PathAnswer[],
): StepStanding {
  if (progress.recall !== null) {
    const series = answersOfRecallSeries(progress, answers).slice(-RECALL_RULE.series);
    return {
      counted: series.length,
      window: RECALL_RULE.series,
      score: series.filter((answer) => answer.result !== 'incorrect').length,
      needed: RECALL_RULE.minSuccesses,
    };
  }
  const last = answersOfCurrentStep(progress, answers).slice(-PASS_RULE.window);
  return {
    counted: last.length,
    window: PASS_RULE.window,
    score: lastScore(last, PASS_RULE.window),
    needed: PASS_RULE.minScore,
  };
}
