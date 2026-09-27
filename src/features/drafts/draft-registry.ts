/**
 * Registry of the drafts being typed, so that they can all be saved at once
 * before the application reloads for an update (D-018, NO-06).
 */

type Flush = () => Promise<void>;

const flushes = new Set<Flush>();

/** Registers a draft's flush function; returns the function that unregisters it. */
export function registerDraftFlush(flush: Flush): () => void {
  flushes.add(flush);
  return () => {
    flushes.delete(flush);
  };
}

/** Saves every pending draft now. Never rejects: a failed save must not block anything. */
export async function flushAllDrafts(): Promise<void> {
  await Promise.allSettled([...flushes].map((flush) => flush()));
}
