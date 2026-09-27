/** `lexicon` table (class D, P4): "Mon lexique", lexical chunks without duplicates (MOD-09). */
import { z } from 'zod';
import { normalizeText } from '../../domain/correction/normalize.ts';
import { uuidSchema } from '../../domain/primitives.ts';
import { documentTimestamps } from './common.ts';

export const lexiconDocumentSchema = z
  .strictObject({
    id: uuidSchema,
    ...documentTimestamps,
    schemaVersion: z.literal(1),
    /** Normalized expression, unique in the table: this is what prevents duplicates. */
    key: z.string().min(1).max(300),
    expression: z.string().max(300),
    meaningFr: z.string().max(500),
    example: z.string().max(1_000),
    source: z.enum(['correction', 'expression-of-the-day', 'manual', 'import']),
    cardId: uuidSchema.nullable(),
  })
  .refine((entry) => entry.key === normalizeText(entry.expression), {
    path: ['key'],
    message: 'must be the normalized expression',
  });
export type LexiconDocument = z.infer<typeof lexiconDocumentSchema>;
