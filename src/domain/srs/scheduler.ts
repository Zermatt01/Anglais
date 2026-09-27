/**
 * Spaced repetition scheduler (ARC-06): the only module that imports ts-fsrs.
 *
 * The rest of the application sees the internal `SpacedRepetitionScheduler`
 * interface and plain serialized states (`SrsState`), so the library can be
 * upgraded or replaced without touching the callers. API checked against
 * ts-fsrs 5.4 (FSRS-6): `fsrs(params).next(card, now, grade)` returns
 * `{ card, log }`.
 */
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type CardInput,
  type Grade,
} from 'ts-fsrs';
import type { ReviewGrade, SrsPhase, SrsReviewLog, SrsState } from './state.ts';

export interface ScheduledReview {
  readonly state: SrsState;
  readonly log: SrsReviewLog;
}

export interface SpacedRepetitionScheduler {
  /** State of a card that has never been reviewed, due immediately. */
  initialState(now: number): SrsState;
  /** New state of a card after a review graded at `now`. */
  review(state: SrsState, grade: ReviewGrade, now: number): ScheduledReview;
}

/** A (re)learning step: minutes, hours or days, for example `10m`. */
export type SrsStep = `${number}${'m' | 'h' | 'd'}`;

export interface SrsParameters {
  /** Target probability of remembering a card when it is due. */
  readonly requestRetention: number;
  readonly maximumIntervalDays: number;
  readonly enableFuzz: boolean;
  readonly learningSteps: readonly SrsStep[];
  readonly relearningSteps: readonly SrsStep[];
}

/**
 * Default parameters. Fuzz spreads due dates so that cards created together do
 * not all come back on the same day; ts-fsrs seeds it from the review time and
 * the card state, so scheduling stays deterministic for given inputs.
 */
export const SRS_PARAMETERS: SrsParameters = {
  requestRetention: 0.9,
  maximumIntervalDays: 36_500,
  enableFuzz: true,
  learningSteps: ['1m', '10m'],
  relearningSteps: ['10m'],
};

const GRADE_TO_RATING: Readonly<Record<ReviewGrade, Grade>> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

const RATING_TO_GRADE: Readonly<Record<Grade, ReviewGrade>> = {
  [Rating.Again]: 'again',
  [Rating.Hard]: 'hard',
  [Rating.Good]: 'good',
  [Rating.Easy]: 'easy',
};

const STATE_TO_PHASE: Readonly<Record<State, SrsPhase>> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
};

const PHASE_TO_STATE: Readonly<Record<SrsPhase, State>> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

function fromCard(card: Card): SrsState {
  return {
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    phase: STATE_TO_PHASE[card.state],
    lastReview: card.last_review?.getTime() ?? null,
  };
}

function toCard(state: SrsState): CardInput {
  return {
    due: state.due,
    stability: state.stability,
    difficulty: state.difficulty,
    // Deprecated in ts-fsrs 5 and recomputed from `last_review` on each review.
    elapsed_days: 0,
    scheduled_days: state.scheduledDays,
    learning_steps: state.learningSteps,
    reps: state.reps,
    lapses: state.lapses,
    state: PHASE_TO_STATE[state.phase],
    last_review: state.lastReview,
  };
}

/** Scheduler backed by ts-fsrs with the application's parameters. */
export function createFsrsScheduler(
  parameters: SrsParameters = SRS_PARAMETERS,
): SpacedRepetitionScheduler {
  const engine = fsrs(
    generatorParameters({
      request_retention: parameters.requestRetention,
      maximum_interval: parameters.maximumIntervalDays,
      enable_fuzz: parameters.enableFuzz,
      learning_steps: parameters.learningSteps,
      relearning_steps: parameters.relearningSteps,
    }),
  );

  return {
    initialState(now) {
      return fromCard(createEmptyCard(now));
    },
    review(state, grade, now) {
      const { card, log } = engine.next(toCard(state), now, GRADE_TO_RATING[grade]);
      const rating = log.rating;
      if (rating === Rating.Manual) {
        throw new Error('ts-fsrs returned a manual rating for a graded review');
      }
      return {
        state: fromCard(card),
        log: {
          grade: RATING_TO_GRADE[rating],
          phase: STATE_TO_PHASE[log.state],
          due: log.due.getTime(),
          stability: log.stability,
          difficulty: log.difficulty,
          scheduledDays: log.scheduled_days,
          learningSteps: log.learning_steps,
          reviewedAt: log.review.getTime(),
        },
      };
    },
  };
}
