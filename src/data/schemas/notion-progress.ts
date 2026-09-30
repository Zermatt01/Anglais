/** `notionProgress` table (class D, P3): the learner's state on each notion. */
import { z } from 'zod';
import { notionIdSchema } from '../../domain/curriculum/notion-id.ts';
import { notionProgressValuesSchema } from '../../domain/curriculum/progress.ts';
import { documentTimestamps } from './common.ts';

export const notionProgressDocumentSchema = notionProgressValuesSchema.extend({
  /** Key: one document per notion, the same on every device (D-044). */
  notionId: notionIdSchema,
  ...documentTimestamps,
  schemaVersion: z.literal(1),
});
export type NotionProgressDocument = z.infer<typeof notionProgressDocumentSchema>;
