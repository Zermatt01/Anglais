/** `emailSessions` table (class D, P7): guided e-mail, resumable (MOD-08). */
import { z } from 'zod';
import { uuidSchema } from '../../domain/primitives.ts';
import { documentTimestamps } from './common.ts';

export const emailSessionDocumentSchema = z.strictObject({
  id: uuidSchema,
  ...documentTimestamps,
  schemaVersion: z.literal(1),
  scenario: z.enum([
    'application',
    'follow-up',
    'recruiter-reply',
    'thank-you',
    'deadline-extension',
    'professor-request',
    'meeting-summary',
    'unhappy-client',
    'recommendation',
  ]),
  step: z.enum(['plan', 'draft', 'revision', 'model', 'done']),
  plan: z.string().max(5_000),
  subject: z.string().max(300),
  draft: z.string().max(10_000),
  productionId: uuidSchema.nullable(),
});
export type EmailSessionDocument = z.infer<typeof emailSessionDocumentSchema>;
