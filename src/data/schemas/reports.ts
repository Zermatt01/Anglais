/** `reports` table (class D, P5): "Signaler" on a correction, an error, a card or an exercise. */
import { z } from 'zod';
import { uuidSchema } from '../../domain/primitives.ts';
import { documentTimestamps } from './common.ts';

export const reportDocumentSchema = z.strictObject({
  id: uuidSchema,
  ...documentTimestamps,
  schemaVersion: z.literal(1),
  targetType: z.enum(['correction', 'error', 'card', 'exercise']),
  targetId: z.string().min(1).max(200),
  reason: z.enum(['false-positive', 'wrong-correction', 'wrong-category', 'unsolvable', 'other']),
  comment: z.string().max(2_000),
  status: z.enum(['open', 'resolved']),
});
export type ReportDocument = z.infer<typeof reportDocumentSchema>;
