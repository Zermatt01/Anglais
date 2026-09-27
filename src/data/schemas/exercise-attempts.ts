/** `exerciseAttempts` table (class E, P3): every answer given to an exercise. */
import { z } from 'zod';
import { notionIdSchema } from '../../domain/curriculum/notion-id.ts';
import { stepSchema } from '../../domain/curriculum/progress.ts';
import { answerResultSchema, graderSchema } from '../../domain/taxonomy.ts';
import { eventFields } from './common.ts';

export const exerciseAttemptSchema = z.strictObject({
  ...eventFields,
  schemaVersion: z.literal(1),
  /** Stable exercise identifier, `<notion-id>/s<step>/<nn>` for core exercises. */
  exerciseId: z.string().min(1).max(200),
  source: z.enum(['core', 'generated']),
  notionId: notionIdSchema,
  step: stepSchema,
  answer: z.string().max(2_000),
  result: answerResultSchema,
  grader: graderSchema,
  hintUsed: z.boolean(),
  context: z.enum(['path', 'immediate-practice', 'placement', 'diagnostic', 'theme']),
  durationMs: z.int().nonnegative().nullable(),
});
export type ExerciseAttempt = z.infer<typeof exerciseAttemptSchema>;
