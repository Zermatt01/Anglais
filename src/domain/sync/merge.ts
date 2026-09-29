/**
 * Merge rules shared by the JSON import (phase 1) and the synchronization
 * (phase 2), docs/ARCHITECTURE.md §7 and D-015:
 * - documents: "latest wins" on `updatedAt`, with a deterministic tie-break;
 * - events: union of identifiers, an existing event is never overwritten.
 * Neither rule ever deletes anything: a deletion travels as a tombstone
 * (`deletedAt`), which is itself a newer version of the document.
 */

export type DocumentMergeDecision = 'insert' | 'replace' | 'keep';

export interface VersionedDocument {
  readonly updatedAt: number;
  readonly document: unknown;
}

/**
 * JSON serialization with object keys sorted at every level, so that two equal
 * documents always give the same text, whatever their key order.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, nested: unknown) => {
    if (nested === null || typeof nested !== 'object' || Array.isArray(nested)) return nested;
    return Object.fromEntries(
      Object.entries(nested).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
  });
}

/** What to do with an incoming version of a document, given the local one. */
export function decideDocumentMerge(
  local: VersionedDocument | undefined,
  incoming: VersionedDocument,
): DocumentMergeDecision {
  if (local === undefined) return 'insert';
  if (incoming.updatedAt !== local.updatedAt) {
    return incoming.updatedAt > local.updatedAt ? 'replace' : 'keep';
  }
  // Same timestamp, possibly different content (two devices): any rule works
  // as long as every device applies the same one.
  return stableStringify(incoming.document) > stableStringify(local.document) ? 'replace' : 'keep';
}

/** What to do with an incoming event: insert it unless it is already there. */
export function decideEventMerge(existsLocally: boolean): 'insert' | 'keep' {
  return existsLocally ? 'keep' : 'insert';
}

/**
 * Where a version received from the server comes from (D-063):
 * - `pull`: a change read after the cursor;
 * - `stale`: the stored version returned by a push, because the pushed one
 *   did not win. `pushedUpdatedAt` is the `updatedAt` of the pushed version.
 */
export type RemoteSource =
  { readonly kind: 'pull' } | { readonly kind: 'stale'; readonly pushedUpdatedAt: number };

/** The local version of a document, as the synchronization compares it. */
export interface LocalVersion {
  readonly updatedAt: number;
  /** Written locally and not sent yet (in the outbox). */
  readonly pending: boolean;
  /** Identical to the received version. */
  readonly sameContent: boolean;
}

/**
 * Synchronization of a document: what to do with a version received from the
 * server (`local` is `undefined` if absent or unreadable). The most recent
 * version wins; at equal `updatedAt`, the server is the only arbiter
 * (D-015, D-063), and the device adopts the version the server kept:
 * - a pulled version, unless the local one waits to be sent (its push will
 *   be settled by the server);
 * - a version returned by a push, unless the local one changed since it was
 *   pushed.
 */
export function decideRemoteVersion(
  local: LocalVersion | undefined,
  remoteUpdatedAt: number,
  source: RemoteSource,
): DocumentMergeDecision {
  if (local === undefined) return 'insert';
  if (remoteUpdatedAt !== local.updatedAt) {
    return remoteUpdatedAt > local.updatedAt ? 'replace' : 'keep';
  }
  if (local.sameContent) return 'keep';
  if (source.kind === 'stale') {
    return local.updatedAt === source.pushedUpdatedAt ? 'replace' : 'keep';
  }
  return local.pending ? 'keep' : 'replace';
}
