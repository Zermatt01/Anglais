/**
 * `errors` table (class D, P4): errors found in productions. A document, not
 * an event, because a report or a confirmation changes it.
 */
import { z } from 'zod';
import { notionIdSchema } from '../../domain/curriculum/notion-id.ts';
import { epochMsSchema, uuidSchema } from '../../domain/primitives.ts';
import { confidenceSchema, errorCategorySchema, severitySchema } from '../../domain/taxonomy.ts';
import { documentTimestamps } from './common.ts';

export const errorDocumentSchema = z.strictObject({
  id: uuidSchema,
  ...documentTimestamps,
  schemaVersion: z.literal(1),
  productionId: uuidSchema,
  at: epochMsSchema,
  category: errorCategorySchema,
  notionId: notionIdSchema.nullable(),
  segment: z.strictObject({
    text: z.string().max(1_000),
    /** Position in the production, or `null` when the segment was not found (AI-07). */
    range: z
      .strictObject({ start: z.int().nonnegative(), end: z.int().nonnegative() })
      .refine((range) => range.end > range.start, 'a range must not be empty')
      .nullable(),
  }),
  correction: z.string().max(1_000),
  rule: z.string().max(1_000),
  severity: severitySchema,
  confidence: confidenceSchema,
  /** Slip or gap (docs/PEDAGOGY.md §4), or a notion not studied yet (D-025). */
  diagnosis: z.enum(['lapsus', 'lacune', 'unstudied']).nullable(),
  confirmedByUser: z.boolean(),
  reported: z.boolean(),
});
export type ErrorDocument = z.infer<typeof errorDocumentSchema>;
