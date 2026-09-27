/** `diagnosticRuns` table (class D, P5): initial diagnostic, resumable (MOD-01). */
import { z } from 'zod';
import { uuidSchema } from '../../domain/primitives.ts';
import { documentTimestamps } from './common.ts';

export const diagnosticRunDocumentSchema = z.strictObject({
  id: uuidSchema,
  ...documentTimestamps,
  schemaVersion: z.literal(1),
  step: z.enum(['placement', 'translation', 'free-text', 'oral', 'done']),
  /** Answers and result; their precise format is defined with the diagnostic (phase 5). */
  answers: z.json(),
  result: z.json(),
});
export type DiagnosticRunDocument = z.infer<typeof diagnosticRunDocumentSchema>;
