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
