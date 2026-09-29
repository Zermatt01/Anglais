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
 *   did not win.
 */
export type RemoteSource = 'pull' | 'stale';

/** The local version of a document, as the synchronization compares it. */
export interface LocalVersion {
  readonly updatedAt: number;
  /** Written locally and not sent yet (in the outbox). */
  readonly pending: boolean;
  /** Identical to the received version. */
  readonly sameContent: boolean;
  /**
   * For a version returned by a push: the local version is still exactly the
   * one that was pushed. Compared on the content, not on `updatedAt`
   * (review of phase 2, D-069).
   */
  readonly unchangedSincePush: boolean;
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
  if (source === 'stale') return local.unchangedSincePush ? 'replace' : 'keep';
  return local.pending ? 'keep' : 'replace';
}

/**
 * Whether replacing `local` by a received version would discard a version
 * that no other copy holds (NO-06, D-069): a local change not sent yet (or
 * sent, but that lost on the server), or a concurrent version with the same
 * `updatedAt`. It is then set aside before being replaced. Replacing a sent
 * version by a later one is the normal course of the synchronization.
 */
export function discardsLocalVersion(local: LocalVersion | undefined, remoteUpdatedAt: number) {
  return (
    local !== undefined &&
    !local.sameContent &&
    (local.pending || remoteUpdatedAt === local.updatedAt)
  );
}
