/**
 * `pronunciationAttempts` table (class E, P6): shadowing results. Weak sounds
 * are computed from it, never stored.
 */
import { z } from 'zod';
import { soundCategorySchema } from '../../domain/taxonomy.ts';
import { eventFields } from './common.ts';

export const pronunciationAttemptSchema = z.strictObject({
  ...eventFields,
  schemaVersion: z.literal(1),
  expectedText: z.string().max(1_000),
  recognizedText: z.string().max(1_000),
  missedWords: z
    .array(
      z.strictObject({
        word: z.string().min(1).max(100),
        soundCategories: z.array(soundCategorySchema).max(8),
      }),
    )
    .max(200),
});
export type PronunciationAttempt = z.infer<typeof pronunciationAttemptSchema>;
