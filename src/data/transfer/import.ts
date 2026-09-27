/**
 * JSON import (MOD-12, docs/ARCHITECTURE.md §7): the file is merged with the
 * local data by the synchronization rules, and never deletes anything.
 *
 * - Documents and drafts: "latest wins" on `updatedAt` (D-015).
 * - Events: inserted when absent, never overwritten.
 * - Records of the file that cannot be read are counted and left out.
 * - A local record that cannot be read is never overwritten (NO-06).
 * - Cards that are not solvable are imported suspended, never shown (NO-03).
 * - A lexicon entry whose expression already exists under another identifier
 *   is left out, since expressions are unique (MOD-09).
 *
 * `previewImport` computes what would happen, without writing; `applyImport`
 * computes it again inside one read-write transaction, then writes: either
 * the whole import succeeds, or nothing changes.
 */
import { z } from 'zod';
import { isCardSolvable } from '../../domain/cards/solvability.ts';
import { nextUpdatedAt } from '../../domain/primitives.ts';
import { decideDocumentMerge, decideEventMerge } from '../../domain/sync/merge.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord } from '../records.ts';
import { isTableName, TABLES, type TableName } from '../tables.ts';
import type { ExportEnvelope } from './envelope.ts';
import { EXPORTED_TABLES } from './export.ts';

export interface TableImportSummary {
  readonly table: TableName;
  /** New records. */
  readonly inserted: number;
  /** Local records replaced by a more recent version. */
  readonly replaced: number;
  /** Records already present locally, in the same or a more recent version. */
  readonly kept: number;
  /** Records of the file that cannot be read. */
  readonly invalid: number;
  /**
   * Records left out to protect local data: the local version cannot be read,
   * or (lexicon) the expression already exists under another identifier.
   */
  readonly skipped: number;
}

export interface ImportPlan {
  readonly tables: readonly TableImportSummary[];
  /** Tables of the file that are not imported (unknown, or technical state). */
  readonly ignoredTables: readonly string[];
  /** Cards imported suspended because they are not solvable. */
  readonly suspendedCards: number;
}

type Fields = Readonly<Record<string, unknown>>;

const fieldsSchema = z.record(z.string(), z.unknown());

interface Write {
  readonly table: TableName;
  readonly record: Fields;
}

/** State of the local copy of a record. */
type LocalRecord =
  | { readonly state: 'absent' }
  | { readonly state: 'unreadable' }
  | { readonly state: 'readable'; readonly fields: Fields };

function keyOf(table: TableName, record: Fields): string | null {
  const key = record[TABLES[table].primaryKey];
  return typeof key === 'string' ? key : null;
}

function updatedAtOf(record: Fields): number {
  return typeof record.updatedAt === 'number' ? record.updatedAt : 0;
}

function readLocal(table: TableName, raw: unknown): LocalRecord {
  if (raw === undefined) return { state: 'absent' };
  const parsed = parseRecord(table, raw);
  return parsed.ok
    ? { state: 'readable', fields: fieldsSchema.parse(parsed.value) }
    : { state: 'unreadable' };
}

/** Identifier of the local lexicon entry with this expression, if any. */
async function lexiconOwner(db: AppDatabase, expressionKey: string): Promise<string | null> {
  const raw = await db.table('lexicon').where('key').equals(expressionKey).first();
  if (raw === undefined) return null;
  const local = fieldsSchema.safeParse(raw);
  return local.success ? keyOf('lexicon', local.data) : null;
}

/** Suspends an unsolvable card instead of losing it (MOD-14). */
function suspendIfUnsolvable(record: Fields, now: number): { record: Fields; suspended: boolean } {
  const parsed = parseRecord('cards', record);
  if (!parsed.ok) return { record, suspended: false };
  const card = parsed.value;
  if (card.status === 'suspended' || isCardSolvable(card.content).solvable) {
    return { record, suspended: false };
  }
  return {
    record: fieldsSchema.parse({
      ...card,
      status: 'suspended',
      suspensionReason: 'unsolvable',
      updatedAt: nextUpdatedAt(card.updatedAt, now),
    }),
    suspended: true,
  };
}

async function planTable(
  db: AppDatabase,
  table: TableName,
  rows: readonly unknown[],
  now: number,
): Promise<{ summary: TableImportSummary; writes: Write[]; suspendedCards: number }> {
  let kept = 0;
  let invalid = 0;
  let skipped = 0;
  let suspendedCards = 0;
  // Version to write per key: a key repeated in the file is merged with itself.
  const planned = new Map<string, Fields>();
  const existedLocally = new Set<string>();
  const plannedLexiconKeys = new Map<string, string>();

  for (const raw of rows) {
    const parsed = parseRecord(table, raw);
    const incoming = parsed.ok ? fieldsSchema.parse(parsed.value) : null;
    const key = incoming === null ? null : keyOf(table, incoming);
    if (incoming === null || key === null) {
      invalid += 1;
      continue;
    }

    const plannedVersion = planned.get(key);
    const local: LocalRecord =
      plannedVersion === undefined
        ? readLocal(table, await db.table(table).get(key))
        : { state: 'readable', fields: plannedVersion };
    if (local.state === 'unreadable') {
      skipped += 1;
      continue;
    }
    if (local.state === 'readable' && plannedVersion === undefined) existedLocally.add(key);

    const localFields = local.state === 'readable' ? local.fields : undefined;
    const decision =
      TABLES[table].syncClass === 'event'
        ? decideEventMerge(localFields !== undefined)
        : decideDocumentMerge(
            localFields === undefined
              ? undefined
              : { updatedAt: updatedAtOf(localFields), document: localFields },
            { updatedAt: updatedAtOf(incoming), document: incoming },
          );
    if (decision === 'keep') {
      kept += 1;
      continue;
    }

    if (table === 'lexicon' && typeof incoming.key === 'string') {
      const owner = plannedLexiconKeys.get(incoming.key) ?? (await lexiconOwner(db, incoming.key));
      if (owner !== null && owner !== key) {
        skipped += 1;
        continue;
      }
      plannedLexiconKeys.set(incoming.key, key);
    }

    let record = incoming;
    if (table === 'cards') {
      const result = suspendIfUnsolvable(incoming, now);
      record = result.record;
      if (result.suspended && plannedVersion === undefined) suspendedCards += 1;
    }
    planned.set(key, record);
  }

  const keys = [...planned.keys()];
  const replaced = keys.filter((key) => existedLocally.has(key)).length;
  return {
    summary: { table, inserted: keys.length - replaced, replaced, kept, invalid, skipped },
    writes: [...planned.values()].map((record) => ({ table, record })),
    suspendedCards,
  };
}

async function computeImport(
  db: AppDatabase,
  envelope: ExportEnvelope,
  now: number,
): Promise<{ plan: ImportPlan; writes: Write[] }> {
  const summaries: TableImportSummary[] = [];
  const writes: Write[] = [];
  let suspendedCards = 0;

  for (const table of EXPORTED_TABLES) {
    const rows = envelope.tables[table];
    if (rows === undefined) continue;
    const result = await planTable(db, table, rows, now);
    summaries.push(result.summary);
    writes.push(...result.writes);
    suspendedCards += result.suspendedCards;
  }

  const ignoredTables = Object.keys(envelope.tables).filter(
    (name) => !isTableName(name) || !TABLES[name].exported,
  );
  return { plan: { tables: summaries, ignoredTables, suspendedCards }, writes };
}

function importedTables(db: AppDatabase) {
  return EXPORTED_TABLES.map((name) => db.table(name));
}

/** What the import would do, without writing anything. */
export async function previewImport(
  db: AppDatabase,
  envelope: ExportEnvelope,
  now: number,
): Promise<ImportPlan> {
  return db.dexie.transaction('r', importedTables(db), async () => {
    return (await computeImport(db, envelope, now)).plan;
  });
}

/** Merges the file into the local data, all or nothing. */
export async function applyImport(
  db: AppDatabase,
  envelope: ExportEnvelope,
  now: number,
): Promise<ImportPlan> {
  return db.dexie.transaction('rw', importedTables(db), async () => {
    const { plan, writes } = await computeImport(db, envelope, now);
    for (const { table, record } of writes) {
      await db.table(table).put(record);
    }
    return plan;
  });
}

/** Number of records the import would write. */
export function countChanges(plan: ImportPlan): number {
  return plan.tables.reduce((total, table) => total + table.inserted + table.replaced, 0);
}
