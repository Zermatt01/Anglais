/**
 * A fake Supabase project for the end-to-end tests: authentication with a
 * code, the SQL functions of the synchronization and the Edge Function "ai",
 * answered by Playwright on the app's own origin (playwright.config.ts). Any
 * other request under /__supabase fails the test.
 */
import type { Page, Request } from '@playwright/test';

export const LEARNER_EMAIL = 'learner@example.test';
const USER_ID = '6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f';

/** An unsigned token with the shape of a JWT, built at run time. */
function fakeAccessToken(): string {
  const part = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  return [
    part({ alg: 'HS256', typ: 'JWT' }),
    part({ sub: USER_ID, email: LEARNER_EMAIL, role: 'authenticated', exp: expiresAt }),
    'signature',
  ].join('.');
}

function session() {
  const expiresIn = 3600;
  return {
    access_token: fakeAccessToken(),
    token_type: 'bearer',
    expires_in: expiresIn,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    refresh_token: 'refresh-token',
    user: {
      id: USER_ID,
      aud: 'authenticated',
      role: 'authenticated',
      email: LEARNER_EMAIL,
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {},
      created_at: '2026-09-29T08:00:00Z',
    },
  };
}

export interface MockOptions {
  /** Rows answered by the first sync_pull (then nothing). */
  readonly pulled?: readonly Record<string, unknown>[];
  /** Answer of GET /functions/v1/ai. */
  readonly usage?: Record<string, unknown>;
  /** Answer of POST /functions/v1/ai. */
  readonly ai?: (body: unknown) => Record<string, unknown>;
}

export interface SupabaseMock {
  readonly codeRequests: unknown[];
  readonly pushes: { p_documents: Record<string, unknown>[]; p_events: unknown[] }[];
  readonly aiCalls: unknown[];
  readonly usageReads: number[];
  readonly unexpected: string[];
  readonly headers: Record<string, string>[];
}

function json(body: unknown) {
  return { status: 200, contentType: 'application/json', body: JSON.stringify(body) };
}

export async function mockSupabase(page: Page, options: MockOptions = {}): Promise<SupabaseMock> {
  const mock: SupabaseMock = {
    codeRequests: [],
    pushes: [],
    aiCalls: [],
    usageReads: [],
    unexpected: [],
    headers: [],
  };
  let pulled = false;
  const record = (request: Request) => {
    mock.headers.push(request.headers());
  };

  // Registered first: runs only when no other route matches.
  await page.route('**/__supabase/**', async (route) => {
    mock.unexpected.push(`${route.request().method()} ${route.request().url()}`);
    await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
  await page.route('**/__supabase/auth/v1/otp', async (route) => {
    mock.codeRequests.push(route.request().postDataJSON());
    await route.fulfill(json({}));
  });
  await page.route('**/__supabase/auth/v1/verify', async (route) => {
    await route.fulfill(json(session()));
  });
  await page.route('**/__supabase/auth/v1/logout**', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
  await page.route('**/__supabase/rest/v1/rpc/sync_push', async (route) => {
    record(route.request());
    mock.pushes.push(route.request().postDataJSON() as SupabaseMock['pushes'][number]);
    await route.fulfill(json({ stale: [] }));
  });
  await page.route('**/__supabase/rest/v1/rpc/sync_pull', async (route) => {
    record(route.request());
    const rows = pulled ? [] : (options.pulled ?? []);
    pulled = true;
    await route.fulfill(json(rows));
  });
  await page.route('**/__supabase/functions/v1/ai**', async (route) => {
    const request = route.request();
    record(request);
    if (request.method() === 'GET') {
      mock.usageReads.push(Date.now());
      await route.fulfill(json(options.usage ?? {}));
      return;
    }
    const body: unknown = request.postDataJSON();
    mock.aiCalls.push(body);
    await route.fulfill(json(options.ai?.(body) ?? {}));
  });
  return mock;
}

/** Signs in through the settings screen with any six-digit code. */
export async function signIn(page: Page): Promise<void> {
  await page.goto('/reglages');
  await page.getByRole('textbox', { name: 'Adresse e-mail' }).fill(LEARNER_EMAIL);
  await page.getByRole('button', { name: 'Recevoir un code' }).click();
  await page.getByRole('textbox', { name: 'Code reçu par e-mail' }).fill('123456');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.getByText(/Connecté avec/).waitFor();
}
