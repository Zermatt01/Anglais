/**
 * What the device exchanges with the server's SQL functions sync_push and
 * sync_pull (supabase/migrations/…_sync.sql), and the transport that carries
 * it. The transport is injected: Supabase in the application
 * (src/services/backend), a test double in the tests.
 */
import { z } from 'zod';

export interface PushedDocument {
  readonly collection: string;
  readonly id: string;
  readonly doc: Readonly<Record<string, unknown>>;
  readonly schema_version: number;
  readonly updated_at: number;
  readonly deleted: boolean;
}

export interface PushedEvent {
  readonly collection: string;
  readonly id: string;
  readonly doc: Readonly<Record<string, unknown>>;
  readonly schema_version: number;
  readonly occurred_at: number;
}

/** Largest batch accepted by sync_push, for each kind. */
export const MAX_PUSH_BATCH = 500;
/** Largest batch returned by sync_pull. */
export const MAX_PULL_BATCH = 1_000;

// Postgres bigint may reach the client as a number or as a string.
const integerSchema = z.coerce.number().int().nonnegative();

/** A change read from the server (sync_pull, or the stale versions of sync_push). */
export const remoteRowSchema = z.strictObject({
  kind: z.enum(['document', 'event']),
  collection: z.string().min(1).max(64),
  id: z.string().min(1).max(200),
  doc: z.record(z.string(), z.unknown()),
  schema_version: integerSchema,
  updated_at: integerSchema,
  deleted: z.boolean(),
  server_seq: integerSchema,
});
export type RemoteRow = z.infer<typeof remoteRowSchema>;

export const pushResultSchema = z.strictObject({ stale: z.array(remoteRowSchema) });
export type PushResult = z.infer<typeof pushResultSchema>;

export const pullResultSchema = z.array(remoteRowSchema);

export interface SyncTransport {
  push(documents: readonly PushedDocument[], events: readonly PushedEvent[]): Promise<PushResult>;
  pull(cursor: number, limit: number): Promise<RemoteRow[]>;
}
