/** `reviewLogs` table (class E, P1/P4): every card review. */
import { z } from 'zod';
import { uuidSchema } from '../../domain/primitives.ts';
import { reviewGradeSchema, srsReviewLogSchema } from '../../domain/srs/state.ts';
import { answerResultSchema, graderSchema } from '../../domain/taxonomy.ts';
import { eventFields } from './common.ts';

export const reviewLogSchema = z.strictObject({
  ...eventFields,
  schemaVersion: z.literal(1),
  cardId: uuidSchema,
  answer: z.string().max(2_000),
  result: answerResultSchema,
  grader: graderSchema,
  /** Grade proposed from the result (PEDAGOGY §6.1). */
  grade: reviewGradeSchema,
  /** Grade chosen by the learner when they adjusted it (CARD-05). */
  adjustedGrade: reviewGradeSchema.nullable(),
  srsLog: srsReviewLogSchema,
  durationMs: z.int().nonnegative().nullable(),
});
export type ReviewLog = z.infer<typeof reviewLogSchema>;
