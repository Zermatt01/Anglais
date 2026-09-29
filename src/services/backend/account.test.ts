import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { accountErrorOf } from './account.ts';

describe('accountErrorOf', () => {
  it.each([
    [new AuthRetryableFetchError('Failed to fetch', 0), 'offline'],
    [new AuthApiError('Too many requests', 429, 'over_email_send_rate_limit'), 'rate_limited'],
    [new AuthApiError('Token has expired or is invalid', 403, 'otp_expired'), 'invalid_code'],
    [new AuthApiError('Token has expired or is invalid', 403, undefined), 'invalid_code'],
    [new AuthApiError('Signups not allowed for otp', 422, 'otp_disabled'), 'unknown_account'],
    [new AuthApiError('Signups not allowed', 422, 'signup_disabled'), 'unknown_account'],
    [new AuthApiError('Server error', 500, 'unexpected_failure'), 'unexpected'],
    [new Error('anything else'), 'unexpected'],
  ] as const)('reads %o as %s', (error, expected) => {
    expect(accountErrorOf(error)).toBe(expected);
  });
});
