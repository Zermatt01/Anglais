import { afterEach, describe, expect, it, vi } from 'vitest';
import { PLATFORM_TIMEOUT_MS, REQUEST_DEADLINE_MS } from '../../../shared/ai/protocol.ts';
import {
  createAiClient,
  RUN_TIMEOUT_MS,
  SESSION_TIMEOUT_MS,
  USAGE_TIMEOUT_MS,
  type AiClientOptions,
} from './ai-client.ts';

const FUNCTION_URL = 'https://abcdefghijklmnopqrst.supabase.co/functions/v1/ai';
const REQUEST_ID = '0b6f2c1e-3c3a-4a8e-9f61-2d4c5b6a7e80';

interface Sent {
  readonly url: string;
  readonly init: RequestInit | undefined;
}

function client(answer: unknown, options: Partial<AiClientOptions> = {}) {
  const sent: Sent[] = [];
  const ai = createAiClient({
    functionUrl: FUNCTION_URL,
    publishableKey: 'sb_publishable_test',
    accessToken: () => Promise.resolve('session-token'),
    isOnline: () => true,
    fetch: (input, init) => {
      sent.push({ url: input instanceof Request ? input.url : input.toString(), init });
      return answer instanceof Error
        ? Promise.reject(answer)
        : Promise.resolve(Response.json(answer));
    },
    ...options,
  });
  return { ai, sent };
}

const SUCCESS = {
  ok: true,
  requestId: REQUEST_ID,
  task: 'connection-check',
  model: 'claude-haiku-5-5',
  promptVersion: 'connection-check@1',
  costUsd: 0.00013,
  output: { status: 'ok' },
};

describe('run', () => {
  it('still reads an answer of the previous fast model, while the Edge Function is updated (D-097)', async () => {
    const { ai } = client({ ...SUCCESS, model: 'claude-haiku-4-5-20251001' });
    expect(await ai.run('connection-check', {}, REQUEST_ID)).toMatchObject({
      ok: true,
      model: 'claude-haiku-4-5-20251001',
    });
    const { ai: unknown } = client({ ...SUCCESS, model: 'claude-haiku-3' });
    expect(await unknown.run('connection-check', {}, REQUEST_ID)).toMatchObject({ ok: false });
  });

  it('sends the task, its input and the request identifier, never a prompt (D-017)', async () => {
    const { ai, sent } = client(SUCCESS);
    expect(await ai.run('connection-check', {}, REQUEST_ID)).toEqual({
      ok: true,
      output: { status: 'ok' },
      costUsd: 0.00013,
      model: 'claude-haiku-5-5',
      promptVersion: 'connection-check@1',
    });
    const [request] = sent;
    expect(request?.url).toBe(FUNCTION_URL);
    expect(request?.init?.method).toBe('POST');
    expect(typeof request?.init?.body).toBe('string');
    expect(JSON.parse(typeof request?.init?.body === 'string' ? request.init.body : '')).toEqual({
      task: 'connection-check',
      input: {},
      requestId: REQUEST_ID,
    });
    const headers = new Headers(request?.init?.headers);
    expect(headers.get('authorization')).toBe('Bearer session-token');
    expect(headers.get('apikey')).toBe('sb_publishable_test');
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('passes on the errors of the server, with what the message needs', async () => {
    const budget = { usedUsd: 9.87, limitUsd: 10, resetsOn: '2026-10-01' };
    const { ai } = client({ ok: false, error: { code: 'budget_exceeded', budget } });
    expect(await ai.run('connection-check', {}, REQUEST_ID)).toEqual({
      ok: false,
      error: { code: 'budget_exceeded', budget },
    });
  });

  it('sends nothing without network or without a session', async () => {
    const offline = client(SUCCESS, { isOnline: () => false });
    expect(await offline.ai.run('connection-check', {}, REQUEST_ID)).toEqual({
      ok: false,
      error: { code: 'offline' },
    });
    expect(offline.sent).toEqual([]);

    const signedOut = client(SUCCESS, { accessToken: () => Promise.resolve(null) });
    expect(await signedOut.ai.run('connection-check', {}, REQUEST_ID)).toEqual({
      ok: false,
      error: { code: 'signed_out' },
    });
    expect(signedOut.sent).toEqual([]);
  });

  it.each([
    ['a network failure', new TypeError('Failed to fetch')],
    ['an unexpected answer', { hello: 'world' }],
    ['the answer to another request', { ...SUCCESS, requestId: crypto.randomUUID() }],
  ])('reports %s as an unreachable server', async (_label, answer) => {
    expect(await client(answer).ai.run('connection-check', {}, REQUEST_ID)).toEqual({
      ok: false,
      error: { code: 'unreachable' },
    });
  });

  it('validates the output of the task again', async () => {
    const { ai } = client({ ...SUCCESS, output: { status: 'maybe' } });
    expect(await ai.run('connection-check', {}, REQUEST_ID)).toEqual({
      ok: false,
      error: { code: 'invalid_output' },
    });
  });
});

describe('bounded waits (D-091)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  /** A request that never gets an answer, like a connection lost on a phone. */
  function silentFetch(signals: AbortSignal[]): NonNullable<AiClientOptions['fetch']> {
    return (_input, init) => {
      if (init?.signal) signals.push(init.signal);
      return new Promise<Response>(() => undefined);
    };
  }

  it('waits for the answer longer than the platform does, never longer than needed', () => {
    expect(REQUEST_DEADLINE_MS).toBeLessThan(PLATFORM_TIMEOUT_MS);
    expect(RUN_TIMEOUT_MS).toBeGreaterThan(PLATFORM_TIMEOUT_MS);
    expect(RUN_TIMEOUT_MS).toBeLessThanOrEqual(PLATFORM_TIMEOUT_MS + 15_000);
  });

  it('gives up on an answer that does not come, and aborts the request', async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    const { ai } = client(SUCCESS, { fetch: silentFetch(signals) });
    const result = ai.run('connection-check', {}, REQUEST_ID);
    await vi.advanceTimersByTimeAsync(RUN_TIMEOUT_MS - 1);
    expect(signals[0]?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toEqual({ ok: false, error: { code: 'timeout' } });
    expect(signals[0]?.aborted).toBe(true);
  });

  it('gives up on a session that does not come, without sending anything', async () => {
    vi.useFakeTimers();
    const { ai, sent } = client(SUCCESS, {
      accessToken: () => new Promise<string>(() => undefined),
    });
    const result = ai.run('connection-check', {}, REQUEST_ID);
    await vi.advanceTimersByTimeAsync(SESSION_TIMEOUT_MS);
    expect(await result).toEqual({ ok: false, error: { code: 'timeout' } });
    expect(sent).toEqual([]);
  });

  it('reads the timeout of the platform (504) as a timeout', async () => {
    const { ai } = client(SUCCESS, {
      fetch: () => Promise.resolve(new Response('upstream request timeout', { status: 504 })),
    });
    expect(await ai.run('connection-check', {}, REQUEST_ID)).toEqual({
      ok: false,
      error: { code: 'timeout' },
    });
  });

  it('reports a session that fails as an unreachable server', async () => {
    const { ai, sent } = client(SUCCESS, {
      accessToken: () => Promise.reject(new Error('refresh failed')),
    });
    expect(await ai.run('connection-check', {}, REQUEST_ID)).toEqual({
      ok: false,
      error: { code: 'unreachable' },
    });
    expect(sent).toEqual([]);
  });

  it('gives up on the spending sooner', async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    const { ai } = client(SUCCESS, { fetch: silentFetch(signals) });
    const result = ai.usage('Europe/Paris');
    await vi.advanceTimersByTimeAsync(USAGE_TIMEOUT_MS);
    expect(await result).toEqual({ ok: false, error: { code: 'timeout' } });
    expect(signals[0]?.aborted).toBe(true);
  });
});

describe('usage', () => {
  it('asks for the spending in the learner time zone', async () => {
    const usage = {
      ok: true,
      monthlyBudgetUsd: 10,
      monthStart: '2026-09-01',
      resetsOn: '2026-10-01',
      monthUsd: 1.5,
      todayUsd: 0.2,
      timeZone: 'Europe/Paris',
      byTask: [],
    };
    const { ai, sent } = client(usage);
    expect(await ai.usage('Europe/Paris')).toEqual({ ok: true, usage });
    expect(sent[0]?.url).toBe(`${FUNCTION_URL}?timeZone=Europe%2FParis`);
    expect(sent[0]?.init?.method).toBe('GET');
  });
});
