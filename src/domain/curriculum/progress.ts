/**
 * Progress of the learner on a notion (CUR-12, docs/PEDAGOGY.md §3). The
 * storage envelope (key, timestamps, schema version) is added by the data
 * layer; the transitions are pure functions of `engine.ts`.
 */
import { z } from 'zod';
import { epochMsSchema } from '../primitives.ts';

export const notionStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'to_consolidate',
  'acquired',
]);
export type NotionStatus = z.infer<typeof notionStatusSchema>;

/** The five steps: understand, recognize, practise, translate, produce (CUR-03). */
export const stepSchema = z.int().min(1).max(5);
export type Step = z.infer<typeof stepSchema>;

export const notionProgressValuesSchema = z.strictObject({
  status: notionStatusSchema,
  step: stepSchema,
  /**
   * Short recall of the previous step after repeated failures (PEDAGOGY §3.3):
   * the recalled step, and when the current series of recall answers started.
   */
  recall: z.strictObject({ step: stepSchema, startedAt: epochMsSchema }).nullable(),
  /** Only the answers given since then count for the current step (its counter). */
  stepEnteredAt: epochMsSchema,
  acquiredAt: epochMsSchema.nullable(),
  /** Last time a lacuna sent the notion back to step 3 (PEDAGOGY §4.2, phase 4). */
  lastRegressionAt: epochMsSchema.nullable(),
});
export type NotionProgressValues = z.infer<typeof notionProgressValuesSchema>;
