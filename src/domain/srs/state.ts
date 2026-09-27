/**
 * Serialized spaced repetition state, stored with each card and each review
 * log (docs/ARCHITECTURE.md §4.2). Times are epoch milliseconds, so that the
 * state is plain JSON, independent of the library's `Date`-based types.
 */
import { z } from 'zod';
import { epochMsSchema } from '../primitives.ts';

export const srsPhaseSchema = z.enum(['new', 'learning', 'review', 'relearning']);
export type SrsPhase = z.infer<typeof srsPhaseSchema>;

export const reviewGradeSchema = z.enum(['again', 'hard', 'good', 'easy']);
export type ReviewGrade = z.infer<typeof reviewGradeSchema>;

export const srsStateSchema = z.strictObject({
  due: epochMsSchema,
  /** Days for retrievability to fall from 100 % to 90 %. */
  stability: z.number().nonnegative(),
  difficulty: z.number().nonnegative(),
  scheduledDays: z.number().nonnegative(),
  learningSteps: z.int().nonnegative(),
  reps: z.int().nonnegative(),
  lapses: z.int().nonnegative(),
  phase: srsPhaseSchema,
  lastReview: epochMsSchema.nullable(),
});
export type SrsState = z.infer<typeof srsStateSchema>;

export const srsReviewLogSchema = z.strictObject({
  grade: reviewGradeSchema,
  /** Phase of the card before this review. */
  phase: srsPhaseSchema,
  due: epochMsSchema,
  stability: z.number().nonnegative(),
  difficulty: z.number().nonnegative(),
  scheduledDays: z.number().nonnegative(),
  learningSteps: z.int().nonnegative(),
  reviewedAt: epochMsSchema,
});
export type SrsReviewLog = z.infer<typeof srsReviewLogSchema>;
