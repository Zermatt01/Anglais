/**
 * `activity` table (class E, P4): time spent per module. The streak, the
 * weekly joker and the minutes of the week are computed from it, never stored.
 */
import { z } from 'zod';
import { daySchema } from '../../domain/primitives.ts';
import { eventFields } from './common.ts';

export const activitySchema = z.strictObject({
  ...eventFields,
  schemaVersion: z.literal(1),
  /** Local day of the device when the activity happened. */
  day: daySchema,
  module: z.enum(['review', 'path', 'theme', 'journal', 'email', 'oral', 'diagnostic']),
  seconds: z.int().min(0).max(86_400),
});
export type Activity = z.infer<typeof activitySchema>;
