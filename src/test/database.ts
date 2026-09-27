/** Test helpers for the Dexie database (fake-indexeddb, see setup.ts). */
import { createDatabase, type AppDatabase, type DatabaseVersion } from '../data/database.ts';
import type { Clock } from '../domain/primitives.ts';

let counter = 0;

/** A fresh, opened database with a unique name, isolated from other tests. */
export async function createTestDatabase(
  versions?: readonly DatabaseVersion[],
): Promise<AppDatabase> {
  counter += 1;
  const db = createDatabase(`test-${String(counter)}-${crypto.randomUUID()}`, versions);
  await db.dexie.open();
  return db;
}

/** A clock that only moves when told to. */
export function createTestClock(start = Date.UTC(2026, 8, 27, 8, 0, 0)): Clock & {
  advance(milliseconds: number): void;
  set(time: number): void;
} {
  let current = start;
  return {
    now: () => current,
    advance(milliseconds) {
      current += milliseconds;
    },
    set(time) {
      current = time;
    },
  };
}
