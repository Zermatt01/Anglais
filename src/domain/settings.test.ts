import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, settingsValuesSchema } from './settings.ts';

describe('settings', () => {
  it('has valid defaults matching PEDAGOGY', () => {
    expect(settingsValuesSchema.parse(DEFAULT_SETTINGS)).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS).toMatchObject({
      dailyGoalMinutes: 20,
      newCardsPerDay: 10,
      reviewsPerDay: 60,
      selfCorrection: true,
      emailSessionsPerWeek: 1,
    });
  });

  it('rejects duplicate domains and out-of-range values', () => {
    const withDuplicates = {
      ...DEFAULT_SETTINGS,
      learnerProfile: { domains: ['finance', 'finance'], remarks: '' },
    };
    expect(settingsValuesSchema.safeParse(withDuplicates).success).toBe(false);
    expect(
      settingsValuesSchema.safeParse({ ...DEFAULT_SETTINGS, newCardsPerDay: -1 }).success,
    ).toBe(false);
  });

  it('rejects unknown fields', () => {
    expect(settingsValuesSchema.safeParse({ ...DEFAULT_SETTINGS, extra: true }).success).toBe(
      false,
    );
  });
});
