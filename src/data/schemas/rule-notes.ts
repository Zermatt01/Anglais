/**
 * `ruleNotes` table (class D, P4): the learner's own note per error category.
 * The rule book itself is computed from `errors`.
 */
import { z } from 'zod';
import { errorCategorySchema } from '../../domain/taxonomy.ts';
import { documentTimestamps } from './common.ts';

export const ruleNoteDocumentSchema = z.strictObject({
  /** Key: one note per category, the same on every device. */
  category: errorCategorySchema,
  ...documentTimestamps,
  schemaVersion: z.literal(1),
  note: z.string().max(5_000),
});
export type RuleNoteDocument = z.infer<typeof ruleNoteDocumentSchema>;
