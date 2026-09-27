/**
 * Fields shared by stored records (docs/ARCHITECTURE.md §4.1).
 *
 * - Documents (sync class D) are merged "latest wins": they carry creation,
 *   update and logical deletion times.
 * - Events (sync class E) are append-only: they carry their time only.
 *
 * Every synchronized record also carries `schemaVersion`, set by each table
 * schema, so that older records can be upgraded by pure functions.
 */
import { epochMsSchema, uuidSchema } from '../../domain/primitives.ts';

export const documentTimestamps = {
  createdAt: epochMsSchema,
  /** Strictly increasing for a given document (`nextUpdatedAt`). */
  updatedAt: epochMsSchema,
  /** Logical deletion (tombstone), needed by the synchronization. */
  deletedAt: epochMsSchema.nullable(),
};

export const eventFields = {
  id: uuidSchema,
  /** When the event happened. */
  at: epochMsSchema,
};
