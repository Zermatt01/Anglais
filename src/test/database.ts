/** Test helpers for the Dexie database (fake-indexeddb, see setup.ts). */
import { createDatabase, type AppDatabase, type DatabaseVersion } from '../data/database.ts';
import { phaseOf, type NotionId } from '../domain/curriculum/notion-id.ts';
import type { Clock } from '../domain/primitives.ts';

/** The notions whose lessons exist: those of phase 3, as in the content today. */
export function hasPhase3Lesson(notionId: NotionId): boolean {
  return phaseOf(notionId) === 3;
}

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
