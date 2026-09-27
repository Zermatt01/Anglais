/**
 * Learner settings (MOD-12) and their defaults. The storage envelope (id,
 * timestamps, schema version) is added by the data layer.
 */
import { z } from 'zod';

/** Content domains of USR-05, used to choose examples and prompts. */
export const LEARNER_DOMAINS = [
  'finance',
  'data-ai',
  'teaching',
  'job-interviews',
  'workplace-communication',
  'daily-life',
] as const;
export const learnerDomainSchema = z.enum(LEARNER_DOMAINS);
export type LearnerDomain = z.infer<typeof learnerDomainSchema>;

export const englishVariantSchema = z.enum(['en-GB', 'en-US']);
export type EnglishVariant = z.infer<typeof englishVariantSchema>;

export const themePreferenceSchema = z.enum(['system', 'light', 'dark']);
export type ThemePreference = z.infer<typeof themePreferenceSchema>;

/** Longest free text the learner can write about themselves. */
export const MAX_PROFILE_REMARKS = 2_000;

export const settingsValuesSchema = z.strictObject({
  englishVariant: englishVariantSchema,
  speech: z.strictObject({
    /** Chosen synthesis voice, or `null` for the device default (phase 3). */
    voiceUri: z.string().max(500).nullable(),
    rate: z.number().min(0.5).max(1.5),
  }),
  dailyGoalMinutes: z.int().min(5).max(120),
  newCardsPerDay: z.int().min(0).max(100),
  reviewsPerDay: z.int().min(0).max(500),
  /** Self-correction step before the correction is shown (PED-05). */
  selfCorrection: z.boolean(),
  /** How many times a week the guided e-mail replaces the journal (MOD-02). */
  emailSessionsPerWeek: z.int().min(0).max(7),
  theme: themePreferenceSchema,
  learnerProfile: z.strictObject({
    domains: z
      .array(learnerDomainSchema)
      .max(LEARNER_DOMAINS.length)
      .refine((domains) => new Set(domains).size === domains.length, 'duplicate domain'),
    remarks: z.string().max(MAX_PROFILE_REMARKS),
  }),
});
export type SettingsValues = z.infer<typeof settingsValuesSchema>;

/**
 * Defaults: British English (the usual reference in Europe), a 20-minute daily
 * goal (PED-12), 10 new cards and 60 reviews a day (PEDAGOGY §6.1),
 * self-correction on (PED-05), one guided e-mail a week (MOD-02).
 */
export const DEFAULT_SETTINGS: SettingsValues = {
  englishVariant: 'en-GB',
  speech: { voiceUri: null, rate: 1 },
  dailyGoalMinutes: 20,
  newCardsPerDay: 10,
  reviewsPerDay: 60,
  selfCorrection: true,
  emailSessionsPerWeek: 1,
  theme: 'system',
  learnerProfile: { domains: [...LEARNER_DOMAINS], remarks: '' },
};
