import { describe, expect, it } from 'vitest';
import { readServerConfig } from './config.ts';

const URL_OF_PROJECT = 'https://abcdefghijklmnopqrst.supabase.co';
const KEY = 'sb_publishable_Ab12_cd-34';

describe('readServerConfig', () => {
  it('reads the project address and the publishable key', () => {
    expect(
      readServerConfig({
        VITE_SUPABASE_URL: `${URL_OF_PROJECT}/`,
        VITE_SUPABASE_PUBLISHABLE_KEY: KEY,
      }),
    ).toEqual({
      url: URL_OF_PROJECT,
      publishableKey: KEY,
      aiFunctionUrl: `${URL_OF_PROJECT}/functions/v1/ai`,
    });
  });

  it('leaves the app on the device only when a variable is missing', () => {
    expect(readServerConfig({})).toBeNull();
    expect(readServerConfig({ VITE_SUPABASE_URL: URL_OF_PROJECT })).toBeNull();
    expect(readServerConfig({ VITE_SUPABASE_PUBLISHABLE_KEY: KEY })).toBeNull();
  });

  it('refuses a secret key: it must never reach the client (SEC-01)', () => {
    expect(
      readServerConfig({
        VITE_SUPABASE_URL: URL_OF_PROJECT,
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_x',
      }),
    ).toBeNull();
  });

  it('accepts plain HTTP for a local server only', () => {
    expect(
      readServerConfig({
        VITE_SUPABASE_URL: 'http://localhost:4193/__supabase',
        VITE_SUPABASE_PUBLISHABLE_KEY: KEY,
      })?.aiFunctionUrl,
    ).toBe('http://localhost:4193/__supabase/functions/v1/ai');
    expect(
      readServerConfig({
        VITE_SUPABASE_URL: 'http://abcdefghijklmnopqrst.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: KEY,
      }),
    ).toBeNull();
  });
});
