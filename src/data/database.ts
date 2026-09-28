/**
 * The Dexie database, source of truth on the device (ARC-02).
 *
 * Versions are additive only (D-019, NO-06): a new version may add tables and
 * indexes, never remove a table or change a primary key. `database.test.ts`
 * enforces it. Records are typed `unknown` when read, so that every read goes
 * through `parseRecord` (docs/ARCHITECTURE.md §4.2).
 */
import { Dexie, type IndexableType, type Table } from 'dexie';
import type { TableName } from './tables.ts';

export const DATABASE_NAME = 'anglais';

export interface DatabaseVersion {
  readonly version: number;
  /** Dexie store declarations: primary key first, then indexes. */
  readonly stores: Readonly<Record<string, string>>;
}

/** Tables of the first version (phase 1). */
const VERSION_1_STORES: Readonly<Record<string, string>> = {
  settings: 'id',
  notionProgress: 'notionId',
  exerciseAttempts: 'id, [notionId+step], at',
  generatedExercises: 'id, [notionId+step]',
  cards: 'id, [status+due], notionId, sourceErrorId',
  reviewLogs: 'id, cardId, at',
  productions: 'id, module, createdAt',
  errors: 'id, productionId, [category+at], [notionId+at]',
  lexicon: 'id, &key',
  ruleNotes: 'category',
  activity: 'id, day',
  levelEstimates: 'id, [skill+at]',
  reports: 'id, [targetType+targetId]',
  diagnosticRuns: 'id',
  pronunciationAttempts: 'id, at',
  emailSessions: 'id, updatedAt',
  drafts: 'key',
  syncOutbox: '++seq, [table+docId]',
  syncMeta: 'key',
  usageSnapshot: 'id',
};

export const DATABASE_VERSIONS: readonly DatabaseVersion[] = [
  { version: 1, stores: VERSION_1_STORES },
  // Review of phase 1: unreadable records are set aside before being replaced.
  { version: 2, stores: { ...VERSION_1_STORES, quarantine: 'id, [table+key]' } },
];

interface StoreDeclaration {
  /** Key path of the primary key, without Dexie's `++` (auto-increment) prefix. */
  readonly primaryKey: string;
  /** Primary key as declared, prefix included. */
  readonly primaryDeclaration: string;
  readonly indexes: readonly string[];
}

/** Parses a Dexie store declaration such as `'++seq, [table+docId]'`. */
export function parseStoreDeclaration(declaration: string): StoreDeclaration {
  const [primaryDeclaration = '', ...indexes] = declaration.split(',').map((part) => part.trim());
  return { primaryKey: primaryDeclaration.replace(/^\+\+/, ''), primaryDeclaration, indexes };
}

/**
 * Lists every change that would make an upgrade lose data or fail on existing
 * data: versions out of order, a removed table, a changed primary key, a
 * removed index. An empty list means the versions are additive (D-019).
 */
export function findNonAdditiveChanges(versions: readonly DatabaseVersion[]): string[] {
  const problems: string[] = [];
  for (let index = 1; index < versions.length; index += 1) {
    const previous = versions[index - 1];
    const next = versions[index];
    if (previous === undefined || next === undefined) continue;
    if (next.version <= previous.version) {
      problems.push(`version ${String(next.version)} does not follow ${String(previous.version)}`);
    }
    for (const [table, declaration] of Object.entries(previous.stores)) {
      const nextDeclaration = next.stores[table];
      if (nextDeclaration === undefined) {
        problems.push(`version ${String(next.version)} removes table ${table}`);
        continue;
      }
      const before = parseStoreDeclaration(declaration);
      const after = parseStoreDeclaration(nextDeclaration);
      if (before.primaryDeclaration !== after.primaryDeclaration) {
        problems.push(`version ${String(next.version)} changes the primary key of ${table}`);
      }
      for (const removed of before.indexes.filter((name) => !after.indexes.includes(name))) {
        problems.push(`version ${String(next.version)} removes index ${removed} of ${table}`);
      }
    }
  }
  return problems;
}

/** Latest version number, the one the application opens. */
export function latestVersion(versions: readonly DatabaseVersion[] = DATABASE_VERSIONS): number {
  return Math.max(...versions.map((entry) => entry.version));
}

export interface AppDatabase {
  readonly dexie: Dexie;
  table(name: TableName): Table<unknown, IndexableType>;
}

/** Declares every version on a new (not yet opened) Dexie instance. */
export function createDatabase(
  name: string = DATABASE_NAME,
  versions: readonly DatabaseVersion[] = DATABASE_VERSIONS,
): AppDatabase {
  const dexie = new Dexie(name);
  for (const { version, stores } of versions) {
    dexie.version(version).stores(stores);
  }
  return {
    dexie,
    table: (tableName) => dexie.table<unknown>(tableName),
  };
}
