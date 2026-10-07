/**
 * Levels of the Common European Framework of Reference (docs/PEDAGOGY.md §9.3).
 * The estimate of the learner's level comes in phase 5 (LVL); until then, a
 * correction only records the level its text shows.
 */
import { z } from 'zod';

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const cefrLevelSchema = z.enum(CEFR_LEVELS);
export type CefrLevel = z.infer<typeof cefrLevelSchema>;
