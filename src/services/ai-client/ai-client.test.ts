import { describe, expect, it } from 'vitest';
import { createAiClient, type AiClientOptions } from './ai-client.ts';

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
  model: 'claude-haiku-4-5-20251001',
  promptVersion: 'connection-check@1',
  costUsd: 0.00013,
  output: { status: 'ok' },
};

describe('run', () => {
  it('sends the task, its input and the request identifier, never a prompt (D-017)', async () => {
    const { ai, sent } = client(SUCCESS);
    expect(await ai.run('connection-check', {}, REQUEST_ID)).toEqual({
      ok: true,
      output: { status: 'ok' },
      costUsd: 0.00013,
      model: 'claude-haiku-4-5-20251001',
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
