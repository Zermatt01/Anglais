/**
 * Records set aside in `quarantine` (NO-06, D-057, D-069): unreadable records,
 * and local versions that a received version replaced. They are kept and
 * exported; the learner can remove them from the device once an export holds
 * them (D-070), never before.
 */
import type { AppDatabase } from '../database.ts';
import { parseRecord } from '../records.ts';

/** Reasons, as written by the code that sets a record aside. */
export const SET_ASIDE_REASON = {
  /** A local version replaced by a received one (apply.ts). */
  conflict: 'conflict: ',
  /** A record received from the server that cannot be read (apply.ts). */
  received: 'received from the server: ',
} as const;

export type SetAsideKind = 'conflict' | 'received-unreadable' | 'unreadable';

export interface SetAsideEntry {
  readonly id: string;
  /** Table the record came from. */
  readonly table: string;
  readonly kind: SetAsideKind;
  readonly setAsideAt: number;
}

export interface QuarantineRepository {
  /** Entries, the most recent first. */
  list(): Promise<SetAsideEntry[]>;
  /**
   * Removes the entries set aside at or before `exportedAt`, the time of an
   * export that holds them; later ones stay. Returns how many were removed.
   */
  removeExportedUpTo(exportedAt: number): Promise<number>;
}

function kindOf(reason: string): SetAsideKind {
  if (reason.startsWith(SET_ASIDE_REASON.conflict)) return 'conflict';
  if (reason.startsWith(SET_ASIDE_REASON.received)) return 'received-unreadable';
  return 'unreadable';
}

export function createQuarantineRepository(db: AppDatabase): QuarantineRepository {
  const table = db.table('quarantine');
  return {
    async list() {
      const entries: SetAsideEntry[] = [];
      for (const raw of await table.toArray()) {
        const parsed = parseRecord('quarantine', raw);
        if (!parsed.ok) continue;
        const { id, table: from, reason, quarantinedAt } = parsed.value;
        entries.push({ id, table: from, kind: kindOf(reason), setAsideAt: quarantinedAt });
      }
      return entries.sort((a, b) => b.setAsideAt - a.setAsideAt);
    },

    removeExportedUpTo(exportedAt) {
      return db.dexie.transaction('rw', [table], () =>
        table
          .toCollection()
          .filter((raw) => {
            const parsed = parseRecord('quarantine', raw);
            return parsed.ok && parsed.value.quarantinedAt <= exportedAt;
          })
          .delete(),
      );
    },
  };
}
