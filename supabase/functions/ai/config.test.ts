// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { DEFAULT_MONTHLY_BUDGET_USD, DEFAULT_RATE_LIMIT_PER_MINUTE, readConfig } from './config.ts';

const VALID = {
  ANTHROPIC_API_KEY: 'test-key',
  AI_ALLOWED_EMAILS: ' Learner@Example.test , other@example.test ',
  AI_ALLOWED_ORIGINS: 'https://app.example.test, http://localhost:5173/',
  SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co/',
};

describe('readConfig', () => {
  it('reads the lists, in lower case for e-mails and as origins for URLs', () => {
    const result = readConfig(VALID);
    if (!result.ok) throw new Error(result.invalid.join());
    expect([...result.config.allowedEmails]).toEqual([
      'learner@example.test',
      'other@example.test',
    ]);
    expect([...result.config.allowedOrigins]).toEqual([
      'https://app.example.test',
      'http://localhost:5173',
    ]);
    expect(result.config.supabaseUrl).toBe('https://abcdefghijklmnopqrst.supabase.co');
  });

  it('uses a 10 USD cap and 6 calls a minute by default (COST-06, COST-07)', () => {
    const result = readConfig({
      ...VALID,
      AI_MONTHLY_BUDGET_USD: '',
      AI_RATE_LIMIT_PER_MINUTE: ' ',
    });
    expect(result).toMatchObject({
      ok: true,
      config: {
        monthlyBudgetUsd: DEFAULT_MONTHLY_BUDGET_USD,
        rateLimitPerMinute: DEFAULT_RATE_LIMIT_PER_MINUTE,
      },
    });
    expect(DEFAULT_MONTHLY_BUDGET_USD).toBe(10);
  });

  it('accepts another cap and rate', () => {
    expect(
      readConfig({ ...VALID, AI_MONTHLY_BUDGET_USD: '2.5', AI_RATE_LIMIT_PER_MINUTE: '3' }),
    ).toMatchObject({ ok: true, config: { monthlyBudgetUsd: 2.5, rateLimitPerMinute: 3 } });
  });

  it('names the missing or invalid variables, never their values', () => {
    const result = readConfig({
      ...VALID,
      ANTHROPIC_API_KEY: undefined,
      AI_ALLOWED_EMAILS: 'not-an-email',
      AI_MONTHLY_BUDGET_USD: '-1',
    });
    expect(result).toEqual({
      ok: false,
      invalid: ['AI_ALLOWED_EMAILS', 'AI_MONTHLY_BUDGET_USD', 'ANTHROPIC_API_KEY'],
    });
    expect(JSON.stringify(result)).not.toContain('not-an-email');
  });

  it('refuses an empty allow-list: nobody could use the AI', () => {
    expect(readConfig({ ...VALID, AI_ALLOWED_EMAILS: ' , ' })).toEqual({
      ok: false,
      invalid: ['AI_ALLOWED_EMAILS'],
    });
  });
});
