/**
 * Progress of the learner on a notion (CUR-12, docs/PEDAGOGY.md §3). The
 * transition rules arrive with the path engine in phase 3.
 */
import { z } from 'zod';

export const notionStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'to_consolidate',
  'acquired',
]);
export type NotionStatus = z.infer<typeof notionStatusSchema>;

/** The five steps: understand, recognize, practise, translate, produce (CUR-03). */
export const stepSchema = z.int().min(1).max(5);
export type Step = z.infer<typeof stepSchema>;
