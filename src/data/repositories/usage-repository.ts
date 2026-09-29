/**
 * Last known state of the "Consommation" screen (COST-08), kept on the device
 * so that it can be shown, with its date, without network.
 */
import type { AppDatabase } from '../database.ts';
import { parseRecord, writeRecord } from '../records.ts';
import type { UsageSnapshot } from '../schemas/local.ts';

export type UsageFigures = Omit<UsageSnapshot, 'id' | 'fetchedAt'>;

export interface UsageRepository {
  load(): Promise<UsageSnapshot | null>;
  save(figures: UsageFigures, fetchedAt: number): Promise<void>;
}

export function createUsageRepository(db: AppDatabase): UsageRepository {
  return {
    async load() {
      const raw: unknown = await db.table('usageSnapshot').get('usage');
      if (raw === undefined) return null;
      const parsed = parseRecord('usageSnapshot', raw);
      return parsed.ok ? parsed.value : null;
    },

    save(figures, fetchedAt) {
      return writeRecord(db, 'usageSnapshot', { ...figures, id: 'usage', fetchedAt }, fetchedAt);
    },
  };
}
