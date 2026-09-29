// @vitest-environment node
/**
 * The AI call log (supabase/migrations/…_ai_calls.sql): idempotence, rate
 * limit (COST-07), monthly cap with reservation (COST-06, D-016), outcome of
 * a call, usage summary (COST-08) and privileges.
 */
import type { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { asRole, asUser, createMigratedDatabase, createUser } from './database.ts';

let db: PGlite;

beforeAll(async () => {
  db = await createMigratedDatabase();
});

const reservationSchema = z.object({
  outcome: z.enum(['reserved', 'duplicate', 'rate_limited', 'budget_exceeded']),
  call_id: z.uuid().optional(),
  month_used_usd: z.number().optional(),
});

interface Reservation {
  readonly requestId?: string;
  readonly attempt?: number;
  readonly reservedUsd?: number;
  readonly budgetUsd?: number;
  readonly ratePerMinute?: number;
}

async function reserve(userId: string, options: Reservation = {}) {
  const result = await asRole(db, 'service_role', null, (tx) =>
    tx.query<{ result: unknown }>(
      `select public.ai_reserve_call($1, $2, $3, 'connection-check', 'claude-haiku-4-5-20251001',
         'connection-check@1', $4, $5, $6) as result`,
      [
        userId,
        options.requestId ?? crypto.randomUUID(),
        options.attempt ?? 1,
        options.reservedUsd ?? 0.01,
        options.budgetUsd ?? 10,
        options.ratePerMinute ?? 6,
      ],
    ),
  );
  return reservationSchema.parse(result.rows[0]?.result);
}

async function complete(callId: string, status: string, costUsd: number) {
  const result = await asRole(db, 'service_role', null, (tx) =>
    tx.query<{ done: boolean }>(
      'select public.ai_complete_call($1, $2, 100, 10, 0, 0, $3, 250, null) as done',
      [callId, status, costUsd],
    ),
  );
  return result.rows[0]?.done;
}

/** A finished call, logged directly with a chosen date. */
async function logCall(userId: string, fields: { at: string; costUsd: number; task?: string }) {
  await db.query(
    `insert into public.ai_calls (user_id, request_id, created_at, task, model, prompt_version,
       status, reserved_cost_usd, cost_usd)
     values ($1, $2, $3::timestamptz, $4, 'claude-sonnet-5', 'x@1', 'ok', $5, $5)`,
    [userId, crypto.randomUUID(), fields.at, fields.task ?? 'connection-check', fields.costUsd],
  );
}

async function rowsOf(userId: string) {
  const result = await db.query<{ status: string; attempt: number; cost_usd: string | null }>(
    'select status, attempt, cost_usd from public.ai_calls where user_id = $1 order by created_at, attempt',
    [userId],
  );
  return result.rows;
}

const usageSchema = z.object({
  time_zone: z.string(),
  month_start: z.string(),
  resets_on: z.string(),
  month_usd: z.number(),
  today_usd: z.number(),
  by_task: z.array(z.object({ task: z.string(), calls: z.number(), cost_usd: z.number() })),
});

async function usage(userId: string, timeZone: string) {
  const result = await asRole(db, 'service_role', null, (tx) =>
    tx.query<{ result: unknown }>('select public.ai_usage_summary($1, $2) as result', [
      userId,
      timeZone,
    ]),
  );
  return usageSchema.parse(result.rows[0]?.result);
}

describe('ai_reserve_call and ai_complete_call', () => {
  it('reserve the maximum cost, then replace it by the actual cost', async () => {
    const user = await createUser(db);
    const reservation = await reserve(user, { reservedUsd: 0.05 });
    expect(reservation).toMatchObject({ outcome: 'reserved', month_used_usd: 0 });
    expect(await rowsOf(user)).toEqual([{ status: 'reserved', attempt: 1, cost_usd: null }]);

    expect(await complete(reservation.call_id ?? '', 'ok', 0.0004)).toBe(true);
    expect(await rowsOf(user)).toEqual([{ status: 'ok', attempt: 1, cost_usd: '0.000400' }]);
    // A call is completed once only.
    expect(await complete(reservation.call_id ?? '', 'error', 0)).toBe(false);
  });

  it('refuse a final status that is not one', async () => {
    const user = await createUser(db);
    const { call_id } = await reserve(user);
    await expect(complete(call_id ?? '', 'reserved', 0)).rejects.toThrow(/not a final status/);
  });

  it('refuse a request identifier already received: a double tap costs nothing', async () => {
    const user = await createUser(db);
    const requestId = crypto.randomUUID();
    expect((await reserve(user, { requestId })).outcome).toBe('reserved');
    expect((await reserve(user, { requestId })).outcome).toBe('duplicate');
    expect(await rowsOf(user)).toHaveLength(1);
  });

  it('allow the single new attempt of the same request (D-016)', async () => {
    const user = await createUser(db);
    const requestId = crypto.randomUUID();
    await reserve(user, { requestId });
    expect((await reserve(user, { requestId, attempt: 2 })).outcome).toBe('reserved');
    await expect(reserve(user, { requestId, attempt: 3 })).rejects.toThrow();
  });

  it('refuse calls beyond the rate limit, without writing anything (COST-07, D-069)', async () => {
    const user = await createUser(db);
    for (let call = 0; call < 3; call += 1) {
      expect((await reserve(user, { ratePerMinute: 3 })).outcome).toBe('reserved');
    }
    // However many refusals, the log does not grow (review of phase 2).
    for (let refusal = 0; refusal < 20; refusal += 1) {
      expect((await reserve(user, { ratePerMinute: 3 })).outcome).toBe('rate_limited');
    }
    expect(await rowsOf(user)).toHaveLength(3);
    expect((await reserve(user, { ratePerMinute: 4 })).outcome).toBe('reserved');
  });

  it('let a refused request be sent again later with the same identifier', async () => {
    const user = await createUser(db);
    const requestId = crypto.randomUUID();
    expect((await reserve(user, { requestId, reservedUsd: 20, budgetUsd: 10 })).outcome).toBe(
      'budget_exceeded',
    );
    expect(await rowsOf(user)).toEqual([]);
    expect((await reserve(user, { requestId, reservedUsd: 0.01, budgetUsd: 10 })).outcome).toBe(
      'reserved',
    );
  });

  it('count only the calls of the last minute, and not the second attempts', async () => {
    const user = await createUser(db);
    await logCall(user, { at: new Date(Date.now() - 2 * 60_000).toISOString(), costUsd: 0.001 });
    const requestId = crypto.randomUUID();
    expect((await reserve(user, { requestId, ratePerMinute: 1 })).outcome).toBe('reserved');
    expect((await reserve(user, { requestId, attempt: 2, ratePerMinute: 1 })).outcome).toBe(
      'reserved',
    );
    expect((await reserve(user, { ratePerMinute: 1 })).outcome).toBe('rate_limited');
  });

  it('refuse a call whose maximum cost would exceed the monthly cap (COST-06)', async () => {
    const user = await createUser(db);
    await logCall(user, { at: new Date().toISOString(), costUsd: 9.98 });
    const refused = await reserve(user, { reservedUsd: 0.03, budgetUsd: 10 });
    expect(refused).toMatchObject({ outcome: 'budget_exceeded', month_used_usd: 9.98 });
    expect((await reserve(user, { reservedUsd: 0.02, budgetUsd: 10 })).outcome).toBe('reserved');
  });

  // PGlite runs one transaction at a time: this checks the accounting, while
  // the advisory lock of ai_reserve_call serializes real concurrent calls.
  it('count the reservations of calls still running', async () => {
    const user = await createUser(db);
    expect((await reserve(user, { reservedUsd: 6, budgetUsd: 10 })).outcome).toBe('reserved');
    expect((await reserve(user, { reservedUsd: 6, budgetUsd: 10 })).outcome).toBe(
      'budget_exceeded',
    );
    const results = await Promise.all([
      reserve(user, { reservedUsd: 3, budgetUsd: 10 }),
      reserve(user, { reservedUsd: 3, budgetUsd: 10 }),
    ]);
    expect(results.map((result) => result.outcome).sort()).toEqual(['budget_exceeded', 'reserved']);
  });

  it('start a new month with a fresh cap (UTC month)', async () => {
    const user = await createUser(db);
    const lastMonth = new Date();
    lastMonth.setUTCDate(1);
    lastMonth.setUTCHours(0, 0, 0, 0);
    lastMonth.setUTCMilliseconds(-1);
    await logCall(user, { at: lastMonth.toISOString(), costUsd: 9.99 });
    expect(await reserve(user, { reservedUsd: 1, budgetUsd: 10 })).toMatchObject({
      outcome: 'reserved',
      month_used_usd: 0,
    });
  });
});

describe('ai_usage_summary (COST-08)', () => {
  it('sums the month by task, reservations included, refusals as calls excluded', async () => {
    const user = await createUser(db);
    await logCall(user, { at: new Date().toISOString(), costUsd: 0.5, task: 'correct-production' });
    const { call_id } = await reserve(user, { reservedUsd: 0.01 });
    await complete(call_id ?? '', 'ok', 0.002);
    await reserve(user, { reservedUsd: 0.01 });
    await reserve(user, { reservedUsd: 100, budgetUsd: 10 });

    const summary = await usage(user, 'Europe/Paris');
    expect(summary.time_zone).toBe('Europe/Paris');
    expect(summary.month_usd).toBeCloseTo(0.512, 6);
    expect(summary.by_task).toEqual([
      { task: 'connection-check', calls: 2, cost_usd: 0.012 },
      { task: 'correct-production', calls: 1, cost_usd: 0.5 },
    ]);
    expect(summary.resets_on > summary.month_start).toBe(true);
    expect(summary.month_start).toMatch(/^\d{4}-\d{2}-01$/);
  });

  it('reads an unknown time zone as UTC', async () => {
    const user = await createUser(db);
    expect((await usage(user, 'Mars/Olympus_Mons')).time_zone).toBe('UTC');
  });

  it('counts "today" from midnight in the learner time zone', async () => {
    const user = await createUser(db);
    await logCall(user, { at: new Date(Date.now() - 3 * 86_400_000).toISOString(), costUsd: 1 });
    await logCall(user, { at: new Date().toISOString(), costUsd: 0.25 });
    expect((await usage(user, 'UTC')).today_usd).toBe(0.25);
  });
});

describe('privileges of the AI call log (SEC-02)', () => {
  it('let the learner read their own calls only', async () => {
    const alice = await createUser(db);
    const bob = await createUser(db);
    await logCall(alice, { at: new Date().toISOString(), costUsd: 0.1 });
    const seen = await asUser(db, bob, (tx) => tx.query('select * from public.ai_calls'));
    expect(seen.rows).toEqual([]);
    const own = await asUser(db, alice, (tx) => tx.query('select * from public.ai_calls'));
    expect(own.rows).toHaveLength(1);
  });

  it('never let the client write to the log or reserve a call', async () => {
    const user = await createUser(db);
    await expect(
      asUser(db, user, (tx) =>
        tx.query(
          `insert into public.ai_calls (user_id, request_id, task, model, prompt_version, status)
           values ($1, $2, 'connection-check', 'm', 'v', 'ok')`,
          [user, crypto.randomUUID()],
        ),
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(db, user, (tx) => tx.query(`update public.ai_calls set cost_usd = 0`)),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(db, user, (tx) =>
        tx.query(`select public.ai_reserve_call($1, $2, 1, 't', 'm', 'v', 0, 1000, 1000)`, [
          user,
          crypto.randomUUID(),
        ]),
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(db, user, (tx) => tx.query(`select public.ai_usage_summary($1, 'UTC')`, [user])),
    ).rejects.toThrow(/permission denied/);
  });
});
