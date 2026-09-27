/** `levelEstimates` table (class E, P5): successive estimates of the level per skill (LVL). */
import { z } from 'zod';
import { eventFields } from './common.ts';

/** CEFR level as a number: A1 = 1 … C2 = 6, by half levels (docs/PEDAGOGY.md §9.3). */
const levelSchema = z.number().min(1).max(6).multipleOf(0.5);

export const levelEstimateSchema = z.strictObject({
  ...eventFields,
  schemaVersion: z.literal(1),
  skill: z.enum(['writing', 'speaking', 'lexicon', 'grammar']),
  value: levelSchema,
  /** Level shown to the learner, which moves by half a level at most (LVL-03). */
  displayed: levelSchema,
  source: z.enum(['local', 'ai', 'diagnostic']),
  justification: z.string().max(2_000).nullable(),
});
export type LevelEstimate = z.infer<typeof levelEstimateSchema>;
