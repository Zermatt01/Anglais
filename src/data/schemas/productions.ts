/**
 * `productions` table (class D, P4): texts written by the learner and their
 * correction (PED-05, AI-08). A production is stored before the model is
 * called (docs/ARCHITECTURE.md §8): nothing typed is lost if the call fails.
 */
import { z } from 'zod';
import { notionIdSchema } from '../../domain/curriculum/notion-id.ts';
import { epochMsSchema, uuidSchema } from '../../domain/primitives.ts';
import { answerResultSchema, graderSchema } from '../../domain/taxonomy.ts';
import { documentTimestamps } from './common.ts';

export const productionModuleSchema = z.enum([
  'theme',
  'journal',
  'email',
  'path-produce',
  /** A translation of step 4, or of an immediate practice, sent to the model (D-076). */
  'path-translate',
  'diagnostic',
  'oral',
  'interview',
]);
export type ProductionModule = z.infer<typeof productionModuleSchema>;

export const productionDocumentSchema = z.strictObject({
  id: uuidSchema,
  ...documentTimestamps,
  schemaVersion: z.literal(1),
  module: productionModuleSchema,
  /** Instruction shown to the learner, in French or in English (PED-02). */
  prompt: z.strictObject({ text: z.string().max(2_000), language: z.enum(['fr', 'en']) }),
  /** What the production answers. */
  context: z.strictObject({
    /** Notion of the path, of the Thème sentence, or of the exercise. */
    notionId: notionIdSchema.nullable(),
    /** Thème sentence, journal question or exercise answered. */
    itemId: z.string().min(1).max(200).nullable(),
    /** Tier of the Thème instruction (PED-02). */
    tier: z.int().min(1).max(3).nullable(),
    /** A Thème sentence of a notion not studied yet, shown with its hint (D-023). */
    unstudied: z.boolean(),
    hintUsed: z.boolean(),
  }),
  text: z.string().max(10_000),
  /** What the learner meant, in French, so that cards stay solvable (AI-08). */
  intentFr: z.string().max(2_000).nullable(),
  /**
   * Model output, kept so that it is never requested again (COST-09). It is
   * stored as received and validated again, against the output schema of its
   * prompt version, each time it is read.
   */
  correction: z
    .strictObject({
      promptVersion: z.string().min(1).max(100),
      model: z.string().min(1).max(100),
      receivedAt: epochMsSchema,
      costUsd: z.number().nonnegative(),
      output: z.json(),
    })
    .nullable(),
  /** Result of a translation or a Thème sentence, and who graded it. */
  result: answerResultSchema.nullable(),
  grader: graderSchema.nullable(),
  /** The learner's own corrections of the highlighted segments (PED-05, D-026). */
  selfCorrections: z
    .array(z.strictObject({ errorIndex: z.int().nonnegative(), text: z.string().max(1_000) }))
    .max(100)
    .nullable(),
  /** Time spent writing, from the instruction to the submission. */
  durationMs: z.int().nonnegative().nullable(),
  /**
   * - `submitted`: stored, correction asked or to ask;
   * - `corrected`: graded, by the model or locally;
   * - `correction-failed`: the model's answer did not come; "Réessayer".
   */
  status: z.enum(['draft', 'submitted', 'corrected', 'correction-failed']),
});
export type ProductionDocument = z.infer<typeof productionDocumentSchema>;
