/**
 * Local-only tables (class L): never synchronized (docs/ARCHITECTURE.md §4.2).
 * The synchronization tables are filled from phase 2.
 */
import { z } from 'zod';
import { epochMsSchema } from '../../domain/primitives.ts';

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

/** `syncOutbox` (P2): local writes waiting to be sent. */
export const syncOutboxEntrySchema = z.strictObject({
  /** Auto-incremented by Dexie: absent before insertion. */
  seq: z.int().positive().optional(),
  table: z.string().min(1).max(100),
  docId: z.string().min(1).max(200),
  queuedAt: epochMsSchema,
});
export type SyncOutboxEntry = z.infer<typeof syncOutboxEntrySchema>;

/** `syncMeta` (P2): read cursor, device identifier, last synchronization. */
export const syncMetaSchema = z.strictObject({
  key: z.enum(['cursor', 'deviceId', 'lastSyncAt']),
  value: z.json(),
});
export type SyncMeta = z.infer<typeof syncMetaSchema>;

/** `usageSnapshot` (P2): last known state of the "Consommation" screen, for offline display. */
export const usageSnapshotSchema = z.strictObject({
  id: z.literal('usage'),
  fetchedAt: epochMsSchema,
  todayUsd: z.number().nonnegative(),
  monthUsd: z.number().nonnegative(),
  monthlyBudgetUsd: z.number().nonnegative(),
  byTask: z.record(z.string().max(100), z.number().nonnegative()),
});
export type UsageSnapshot = z.infer<typeof usageSnapshotSchema>;
