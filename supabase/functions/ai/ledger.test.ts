// @vitest-environment node
/**
 * The ledger against the real SQL functions (PGlite): argument names, and
 * reading of what the functions return.
 */
import type { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import { createMigratedDatabase, createUser, rpcAs } from '../../tests/database.ts';
import { createLedger, type AiCallLedger, type CallToReserve } from './ledger.ts';

let db: PGlite;
let ledger: AiCallLedger;

beforeAll(async () => {
  db = await createMigratedDatabase();
  ledger = createLedger(rpcAs(db, 'service_role', null));
});

function call(userId: string, fields: Partial<CallToReserve> = {}): CallToReserve {
  return {
    userId,
    requestId: crypto.randomUUID(),
    attempt: 1,
    task: 'connection-check',
    model: 'claude-haiku-4-5-20251001',
    promptVersion: 'connection-check@1',
    reservedCostUsd: 0.002,
    monthlyBudgetUsd: 10,
    rateLimitPerMinute: 6,
    ...fields,
  };
}

describe('createLedger', () => {
  it('reserves, completes and summarizes a call', async () => {
    const user = await createUser(db);
    const reservation = await ledger.reserve(call(user));
    if (reservation.outcome !== 'reserved') throw new Error(reservation.outcome);
    expect(reservation.monthUsedUsd).toBe(0);

    await ledger.complete(reservation.callId, {
      status: 'ok',
      usage: {
        inputTokens: 90,
        outputTokens: 6,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 0,
      },
      costUsd: 0.00012,
      latencyMs: 480,
      errorCode: null,
    });
    const { rows } = await db.query(
      'select status, input_tokens, cost_usd, latency_ms from public.ai_calls where user_id = $1',
      [user],
    );
    expect(rows).toEqual([
      { status: 'ok', input_tokens: 90, cost_usd: '0.000120', latency_ms: 480 },
    ]);

    expect(await ledger.usage(user, 'Europe/Paris')).toMatchObject({
      timeZone: 'Europe/Paris',
      monthUsd: 0.00012,
      todayUsd: 0.00012,
      byTask: [{ task: 'connection-check', calls: 1, costUsd: 0.00012 }],
    });
  });

  it('records a failed call without token counts', async () => {
    const user = await createUser(db);
    const reservation = await ledger.reserve(call(user));
    if (reservation.outcome !== 'reserved') throw new Error(reservation.outcome);
    await ledger.complete(reservation.callId, {
      status: 'error',
      usage: null,
      costUsd: 0.002,
      latencyMs: 90_000,
      errorCode: 'anthropic_timeout',
    });
    const { rows } = await db.query(
      'select status, input_tokens, error_code from public.ai_calls where user_id = $1',
      [user],
    );
    expect(rows).toEqual([
      { status: 'error', input_tokens: null, error_code: 'anthropic_timeout' },
    ]);
  });

  it('reads every refusal', async () => {
    const user = await createUser(db);
    const first = call(user, { rateLimitPerMinute: 1 });
    await ledger.reserve(first);
    expect(await ledger.reserve(first)).toEqual({ outcome: 'duplicate' });
    expect(await ledger.reserve(call(user, { rateLimitPerMinute: 1 }))).toEqual({
      outcome: 'rate_limited',
      monthUsedUsd: 0.002,
    });
    expect(await ledger.reserve(call(user, { reservedCostUsd: 20 }))).toEqual({
      outcome: 'budget_exceeded',
      monthUsedUsd: 0.002,
    });
  });
});
