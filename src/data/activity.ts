/**
 * Time spent per module (`activity`, class E): one event per stored answer,
 * review or production, written in the same transaction (docs/ARCHITECTURE.md
 * §4.2). The minutes of the day, and later the streak (phase 5), are computed
 * from it, never stored.
 */
import type { AppDatabase } from './database.ts';
import { localDay } from './days.ts';
import { parseRecord, writeRecord } from './records.ts';
import type { Activity } from './schemas/activity.ts';

/** One item counts for this many seconds at most: an idle screen is not activity. */
export const MAX_ITEM_SECONDS = 600;

export function secondsOf(durationMs: number | null): number {
  if (durationMs === null || !Number.isFinite(durationMs)) return 0;
  return Math.min(MAX_ITEM_SECONDS, Math.max(0, Math.round(durationMs / 1000)));
}

/** Records activity; must run in a transaction covering `activity` and `syncOutbox`. */
export async function recordActivity(
  db: AppDatabase,
  module: Activity['module'],
  durationMs: number | null,
  now: number,
): Promise<void> {
  const seconds = secondsOf(durationMs);
  if (seconds === 0) return;
  await writeRecord(
    db,
    'activity',
    { id: crypto.randomUUID(), at: now, schemaVersion: 1, day: localDay(now), module, seconds },
    now,
  );
}

/** Seconds of activity recorded for a local day. */
export async function secondsOfDay(db: AppDatabase, day: string): Promise<number> {
  const raws: unknown[] = await db.table('activity').where('day').equals(day).toArray();
  let seconds = 0;
  for (const raw of raws) {
    const parsed = parseRecord('activity', raw);
    if (parsed.ok) seconds += parsed.value.seconds;
  }
  return seconds;
}
