/** `productions` table (class D, P4): texts written by the learner and their correction. */
import { z } from 'zod';
import { epochMsSchema, uuidSchema } from '../../domain/primitives.ts';
import { documentTimestamps } from './common.ts';

export const productionModuleSchema = z.enum([
  'theme',
  'journal',
  'email',
  'path-produce',
  'diagnostic',
  'oral',
  'interview',
]);

export const productionDocumentSchema = z.strictObject({
  id: uuidSchema,
  ...documentTimestamps,
  schemaVersion: z.literal(1),
  module: productionModuleSchema,
  /** Instruction shown to the learner, in French or in English (PED-02). */
  prompt: z.strictObject({ text: z.string().max(2_000), language: z.enum(['fr', 'en']) }),
  text: z.string().max(10_000),
  /** What the learner meant, in French, so that cards stay solvable (AI-08). */
  intentFr: z.string().max(2_000).nullable(),
  /**
   * Validated model output, kept so that it is never requested again. Its
   * format belongs to the AI contract (`shared/ai`, phases 2 and 4): until
   * then only JSON-serializable data is accepted, and it is validated again
   * against the versioned output schema when read.
   */
  correction: z
    .strictObject({
      promptVersion: z.string().min(1).max(100),
      model: z.string().min(1).max(100),
      receivedAt: epochMsSchema,
      output: z.json(),
    })
    .nullable(),
  selfCorrection: z.string().max(10_000).nullable(),
  status: z.enum(['draft', 'submitted', 'corrected', 'correction-failed']),
});
export type ProductionDocument = z.infer<typeof productionDocumentSchema>;
