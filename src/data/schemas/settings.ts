/** `settings` table (class D, P1): a single document with the learner's settings. */
import { z } from 'zod';
import { settingsValuesSchema } from '../../domain/settings.ts';
import { documentTimestamps } from './common.ts';

/** Fixed key: the same on every device, so that settings merge instead of duplicating. */
export const SETTINGS_ID = 'settings';

export const settingsDocumentSchema = settingsValuesSchema.extend({
  id: z.literal(SETTINGS_ID),
  ...documentTimestamps,
  schemaVersion: z.literal(1),
});
export type SettingsDocument = z.infer<typeof settingsDocumentSchema>;
