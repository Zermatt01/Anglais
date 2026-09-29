/**
 * Local-only tables (class L): never synchronized (docs/ARCHITECTURE.md §4.2).
 * The synchronization tables are filled from phase 2.
 */
import { z } from 'zod';
import { epochMsSchema, uuidSchema } from '../../domain/primitives.ts';

/**
 * `quarantine` (P1, version 2): records that could not be read, copied here
 * exactly as they were stored before anything replaces or deletes them
 * (NO-06). Exported, never synchronized, never read back by the app.
 */
export const quarantineEntrySchema = z.strictObject({
  id: uuidSchema,
  /** Table and key the record came from. */
  table: z.string().min(1).max(100),
  key: z.string().min(1).max(200),
  /** The record as it was stored. */
  record: z.unknown(),
  reason: z.string().max(2_000),
  quarantinedAt: epochMsSchema,
});
export type QuarantineEntry = z.infer<typeof quarantineEntrySchema>;

/** Longest text kept as a draft. */
export const MAX_DRAFT_TEXT = 20_000;

/** `drafts` (P1): text being typed, saved at each typing pause (UI-03). */
export const draftSchema = z.strictObject({
  /** Where the text is typed, for example `settings:profile-remarks`. */
  key: z.string().min(1).max(200),
  text: z.string().max(MAX_DRAFT_TEXT),
  updatedAt: epochMsSchema,
});
export type Draft = z.infer<typeof draftSchema>;

/**
 * `syncOutbox` (P2): records written locally and not yet sent. Written in the
 * same transaction as the record (`writeRecord`); one entry per record, the
 * latest write replacing the previous entry (D-063).
 */
export const syncOutboxEntrySchema = z.strictObject({
  /** Auto-incremented by Dexie: absent before insertion. */
  seq: z.int().positive().optional(),
  table: z.string().min(1).max(100),
  /** Primary key of the record. */
  docId: z.string().min(1).max(200),
  queuedAt: epochMsSchema,
});
export type SyncOutboxEntry = z.infer<typeof syncOutboxEntrySchema>;

/**
 * `syncMeta` (P2), one entry per key:
 * - `account`: the account the local data was last synchronized with;
 * - `cursor`: the last `server_seq` applied by a pull;
 * - `schemaSignature`: the schema versions of the app at the last pull;
 *   when it changes, everything is pulled again (D-063);
 * - `lastSyncAt`: end of the last complete synchronization.
 */
export const syncMetaSchema = z.strictObject({
  key: z.enum(['account', 'cursor', 'schemaSignature', 'lastSyncAt']),
  value: z.json(),
});
export type SyncMeta = z.infer<typeof syncMetaSchema>;

/**
 * `usageSnapshot` (P2): last known state of the "Consommation" screen, shown
 * with its date when the server cannot be reached (COST-08).
 */
export const usageSnapshotSchema = z.strictObject({
  id: z.literal('usage'),
  fetchedAt: epochMsSchema,
  monthlyBudgetUsd: z.number().nonnegative(),
  monthStart: z.iso.date(),
  resetsOn: z.iso.date(),
  monthUsd: z.number().nonnegative(),
  todayUsd: z.number().nonnegative(),
  timeZone: z.string().min(1).max(64),
  byTask: z
    .array(
      z.strictObject({
        task: z.string().min(1).max(64),
        calls: z.int().nonnegative(),
        costUsd: z.number().nonnegative(),
      }),
    )
    .max(100),
});
export type UsageSnapshot = z.infer<typeof usageSnapshotSchema>;
