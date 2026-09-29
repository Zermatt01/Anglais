/**
 * Validated reads and writes (ARC-05, docs/ARCHITECTURE.md §4.2 and §7).
 *
 * Every stored record is parsed with its table schema when read. An older
 * record is first upgraded by the table's pure upgrade functions. A record that
 * cannot be read is isolated and reported, never propagated silently, and never
 * overwritten by a read.
 */
import { prettifyError, type z } from 'zod';
import type { AppDatabase } from './database.ts';
import { enqueueChange } from './sync/outbox.ts';
import {
  isSyncedTable,
  primaryKeyOf,
  TABLES,
  type RecordOf,
  type TableDefinition,
  type TableName,
} from './tables.ts';

export type ParsedRecord<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly reason: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Upgrades a raw record to the definition's current schema version, then validates it. */
export function parseWithDefinition<Schema extends z.ZodType>(
  definition: TableDefinition<Schema>,
  raw: unknown,
): ParsedRecord<z.infer<Schema>> {
  let record = raw;

  if (definition.schemaVersion !== null) {
    if (!isPlainObject(raw)) return { ok: false, reason: 'not an object' };
    const version = raw.schemaVersion;
    if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
      return { ok: false, reason: 'missing or invalid schemaVersion' };
    }
    if (version > definition.schemaVersion) {
      return { ok: false, reason: `written by a newer version of the app (v${String(version)})` };
    }
    let upgraded: Record<string, unknown> = raw;
    for (let from = version; from < definition.schemaVersion; from += 1) {
      const upgrade = definition.upgrades[from];
      if (upgrade === undefined) {
        return { ok: false, reason: `no upgrade from schema version ${String(from)}` };
      }
      upgraded = upgrade(upgraded);
    }
    record = upgraded;
  }

  const result = definition.schema.safeParse(record);
  if (!result.success) return { ok: false, reason: prettifyError(result.error) };
  return { ok: true, value: result.data };
}

/** Upgrades and validates a raw record of a registered table. */
export function parseRecord<Name extends TableName>(
  name: Name,
  raw: unknown,
): ParsedRecord<RecordOf<Name>> {
  const parsed = parseWithDefinition<z.ZodType>(TABLES[name], raw);
  if (!parsed.ok) return parsed;
  // Safe: the value was just validated by TABLES[name].schema, whose output type
  // is RecordOf<Name>; TypeScript cannot follow a generic key into the registry.
  return { ok: true, value: parsed.value as RecordOf<Name> };
}

/** Reads and validates one record, or returns `undefined` when there is none. */
export async function readRecord<Name extends TableName>(
  db: AppDatabase,
  name: Name,
  key: string,
): Promise<ParsedRecord<RecordOf<Name>> | undefined> {
  const raw = await db.table(name).get(key);
  return raw === undefined ? undefined : parseRecord(name, raw);
}

/**
 * Validates then writes a record. An invalid record here is a programming
 * error: it throws instead of storing bad data.
 *
 * A synchronized record is written together with its outbox entry, in one
 * transaction (docs/ARCHITECTURE.md §7): an enclosing transaction must
 * therefore cover `syncOutbox` too.
 */
export async function writeRecord<Name extends TableName>(
  db: AppDatabase,
  name: Name,
  record: RecordOf<Name>,
  now: number,
): Promise<void> {
  const result = TABLES[name].schema.safeParse(record);
  if (!result.success) {
    throw new Error(`Refusing to write an invalid ${name} record:\n${prettifyError(result.error)}`);
  }
  const table = db.table(name);
  if (!isSyncedTable(name)) {
    await table.put(record);
    return;
  }
  const key = primaryKeyOf(name, record);
  if (key === null) throw new Error(`Refusing to write a ${name} record without a key`);
  await db.dexie.transaction('rw', [table, db.table('syncOutbox')], async () => {
    await table.put(record);
    await enqueueChange(db, name, key, now);
  });
}

/**
 * Before a write replaces or deletes the record at `key`, copies it into the
 * `quarantine` table if it cannot be read (NO-06): nothing unreadable is ever
 * lost, and the copy stays in the export. Returns whether a copy was made.
 * Must run inside a transaction covering both `name` and `quarantine`.
 */
export async function setAsideIfUnreadable(
  db: AppDatabase,
  name: TableName,
  key: string,
  now: number,
): Promise<boolean> {
  const raw: unknown = await db.table(name).get(key);
  if (raw === undefined) return false;
  const parsed = parseRecord(name, raw);
  if (parsed.ok) return false;
  await writeRecord(
    db,
    'quarantine',
    {
      id: crypto.randomUUID(),
      table: name,
      key,
      record: raw,
      reason: parsed.reason,
      quarantinedAt: now,
    },
    now,
  );
  return true;
}
