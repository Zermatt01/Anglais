import { describe, expect, it } from 'vitest';
import { createTestDatabase } from '../../test/database.ts';
import { T0 } from '../../test/fixtures.ts';
import { writeRecord } from '../records.ts';
import { createQuarantineRepository, SET_ASIDE_REASON } from './quarantine-repository.ts';

function entry(reason: string, quarantinedAt: number) {
  return {
    id: crypto.randomUUID(),
    table: 'settings',
    key: 'settings',
    record: { theme: 'purple' },
    reason,
    quarantinedAt,
  };
}

async function setup() {
  const db = await createTestDatabase();
  const entries = [
    entry(`${SET_ASIDE_REASON.conflict}local version replaced`, T0),
    entry(`${SET_ASIDE_REASON.received}theme: invalid`, T0 + 1_000),
    entry('theme: invalid', T0 + 2_000),
  ];
  for (const value of entries) await writeRecord(db, 'quarantine', value, T0);
  return { db, repository: createQuarantineRepository(db), entries };
}

describe('quarantine repository', () => {
  it('lists the entries, the most recent first, with their kind', async () => {
    const { repository } = await setup();
    expect((await repository.list()).map(({ kind, setAsideAt }) => ({ kind, setAsideAt }))).toEqual(
      [
        { kind: 'unreadable', setAsideAt: T0 + 2_000 },
        { kind: 'received-unreadable', setAsideAt: T0 + 1_000 },
        { kind: 'conflict', setAsideAt: T0 },
      ],
    );
  });

  it('removes only what an export made at a given time holds', async () => {
    const { db, repository, entries } = await setup();
    expect(await repository.removeExportedUpTo(T0 + 1_000)).toBe(2);
    expect(await db.table('quarantine').toCollection().primaryKeys()).toEqual([entries[2]?.id]);
    expect(await repository.removeExportedUpTo(T0 - 1)).toBe(0);
  });
});
