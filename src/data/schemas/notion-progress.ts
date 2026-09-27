/** `notionProgress` table (class D, P3): the learner's state on each notion. */
import { z } from 'zod';
import { notionIdSchema } from '../../domain/curriculum/notion-id.ts';
import { notionStatusSchema, stepSchema } from '../../domain/curriculum/progress.ts';
import { epochMsSchema } from '../../domain/primitives.ts';
import { documentTimestamps } from './common.ts';

export const notionProgressDocumentSchema = z.strictObject({
  /** Key: one document per notion, the same on every device. */
  notionId: notionIdSchema,
  ...documentTimestamps,
  schemaVersion: z.literal(1),
  status: notionStatusSchema,
  step: stepSchema,
  /** Short recall of the previous step after repeated failures (PEDAGOGY §3.3). */
  recall: z.strictObject({ step: stepSchema, startedAt: epochMsSchema }).nullable(),
  stepEnteredAt: epochMsSchema,
  acquiredAt: epochMsSchema.nullable(),
  lastRegressionAt: epochMsSchema.nullable(),
});
export type NotionProgressDocument = z.infer<typeof notionProgressDocumentSchema>;
