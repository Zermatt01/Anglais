/**
 * Registry of every local table (docs/ARCHITECTURE.md §4.2): its sync class,
 * primary key, Zod schema, current schema version and document upgrades.
 * The export, the import and (in phase 2) the synchronization are driven by it.
 */
import type { z } from 'zod';
import { activitySchema } from './schemas/activity.ts';
import { cardDocumentSchema } from './schemas/cards.ts';
import { diagnosticRunDocumentSchema } from './schemas/diagnostic-runs.ts';
import { emailSessionDocumentSchema } from './schemas/email-sessions.ts';
import { errorDocumentSchema } from './schemas/errors.ts';
import { exerciseAttemptSchema } from './schemas/exercise-attempts.ts';
import { generatedExerciseDocumentSchema } from './schemas/generated-exercises.ts';
import { levelEstimateSchema } from './schemas/level-estimates.ts';
import { lexiconDocumentSchema } from './schemas/lexicon.ts';
import {
  draftSchema,
  quarantineEntrySchema,
  syncMetaSchema,
  syncOutboxEntrySchema,
  usageSnapshotSchema,
} from './schemas/local.ts';
import { notionProgressDocumentSchema } from './schemas/notion-progress.ts';
import { productionDocumentSchema } from './schemas/productions.ts';
import { pronunciationAttemptSchema } from './schemas/pronunciation-attempts.ts';
import { reportDocumentSchema } from './schemas/reports.ts';
import { reviewLogSchema } from './schemas/review-logs.ts';
import { ruleNoteDocumentSchema } from './schemas/rule-notes.ts';
import { settingsDocumentSchema } from './schemas/settings.ts';

/**
 * - `document` (D): merged "latest wins" on `updatedAt`;
 * - `event` (E): append-only, merged by union;
 * - `local` (L): never synchronized.
 */
export type SyncClass = 'document' | 'event' | 'local';

/** Pure function upgrading a stored record from version n to version n + 1. */
export type RecordUpgrade = (record: Record<string, unknown>) => Record<string, unknown>;

export interface TableDefinition<Schema extends z.ZodType = z.ZodType> {
  readonly syncClass: SyncClass;
  /** Key path of the primary key, as declared to Dexie. */
  readonly primaryKey: string;
  readonly schema: Schema;
  /**
   * Current `schemaVersion` of the records, or `null` for local tables that
   * carry none (they are rebuilt, never migrated).
   */
  readonly schemaVersion: number | null;
  /** `upgrades[n]` turns a version-n record into a version-(n + 1) record. */
  readonly upgrades: Readonly<Record<number, RecordUpgrade>>;
  /** Included in the JSON export (all user data; not the technical sync state). */
  readonly exported: boolean;
}

function documentTable<Schema extends z.ZodType>(
  primaryKey: string,
  schema: Schema,
): TableDefinition<Schema> {
  return {
    syncClass: 'document',
    primaryKey,
    schema,
    schemaVersion: 1,
    upgrades: {},
    exported: true,
  };
}

function eventTable<Schema extends z.ZodType>(schema: Schema): TableDefinition<Schema> {
  return {
    syncClass: 'event',
    primaryKey: 'id',
    schema,
    schemaVersion: 1,
    upgrades: {},
    exported: true,
  };
}

function localTable<Schema extends z.ZodType>(
  primaryKey: string,
  schema: Schema,
  exported: boolean,
): TableDefinition<Schema> {
  return { syncClass: 'local', primaryKey, schema, schemaVersion: null, upgrades: {}, exported };
}

export const TABLES = {
  settings: documentTable('id', settingsDocumentSchema),
  notionProgress: documentTable('notionId', notionProgressDocumentSchema),
  exerciseAttempts: eventTable(exerciseAttemptSchema),
  generatedExercises: documentTable('id', generatedExerciseDocumentSchema),
  cards: documentTable('id', cardDocumentSchema),
  reviewLogs: eventTable(reviewLogSchema),
  productions: documentTable('id', productionDocumentSchema),
  errors: documentTable('id', errorDocumentSchema),
  lexicon: documentTable('id', lexiconDocumentSchema),
  ruleNotes: documentTable('category', ruleNoteDocumentSchema),
  activity: eventTable(activitySchema),
  levelEstimates: eventTable(levelEstimateSchema),
  reports: documentTable('id', reportDocumentSchema),
  diagnosticRuns: documentTable('id', diagnosticRunDocumentSchema),
  pronunciationAttempts: eventTable(pronunciationAttemptSchema),
  emailSessions: documentTable('id', emailSessionDocumentSchema),
  // Drafts are the learner's own text: exported, although never synchronized.
  drafts: localTable('key', draftSchema, true),
  syncOutbox: localTable('seq', syncOutboxEntrySchema, false),
  syncMeta: localTable('key', syncMetaSchema, false),
  usageSnapshot: localTable('id', usageSnapshotSchema, false),
  // Unreadable records set aside before being replaced: exported so that they can be recovered.
  quarantine: localTable('id', quarantineEntrySchema, true),
} satisfies Record<string, TableDefinition>;

export type TableName = keyof typeof TABLES;
export type RecordOf<Name extends TableName> = z.infer<(typeof TABLES)[Name]['schema']>;

export function isTableName(name: string): name is TableName {
  return Object.hasOwn(TABLES, name);
}

export const TABLE_NAMES: readonly TableName[] = Object.keys(TABLES).filter(isTableName);

/** Whether the table is synchronized (documents and events, not local tables). */
export function isSyncedTable(name: TableName): boolean {
  return TABLES[name].syncClass !== 'local';
}

export const SYNCED_TABLE_NAMES: readonly TableName[] = TABLE_NAMES.filter(isSyncedTable);

/** Value of the primary key of a record, or `null` if it has none. */
export function primaryKeyOf(name: TableName, record: unknown): string | null {
  if (typeof record !== 'object' || record === null) return null;
  const key: unknown = Reflect.get(record, TABLES[name].primaryKey);
  return typeof key === 'string' ? key : null;
}
