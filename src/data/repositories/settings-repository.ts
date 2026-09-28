/**
 * Settings repository (MOD-12).
 *
 * Reading never writes: while the learner has changed nothing, the defaults
 * are used without being stored. Otherwise a fresh device would store defaults
 * with a recent `updatedAt`, which would overwrite the real settings of
 * another device at the first synchronization (phase 2).
 */
import { z } from 'zod';
import { nextUpdatedAt, type Clock } from '../../domain/primitives.ts';
import {
  applySettingsPatch,
  DEFAULT_SETTINGS,
  settingsValuesSchema,
  type SettingsPatch,
  type SettingsValues,
} from '../../domain/settings.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord, writeRecord } from '../records.ts';
import { SETTINGS_ID, type SettingsDocument } from '../schemas/settings.ts';

/** Whether settings were found: `invalid` means stored but unreadable (defaults used). */
export type StoredSettingsState = 'absent' | 'valid' | 'invalid';

export interface LoadedSettings {
  readonly values: SettingsValues;
  readonly stored: StoredSettingsState;
}

export interface SettingsRepository {
  load(): Promise<LoadedSettings>;
  /** Applies a partial change to the stored settings and returns the new settings. */
  update(patch: SettingsPatch): Promise<SettingsValues>;
}

/** Keeps the settings values of a document, without its storage envelope. */
const valuesOfDocument = z.object(settingsValuesSchema.shape);

function updatedAtOf(raw: unknown): number | null {
  if (typeof raw !== 'object' || raw === null || !('updatedAt' in raw)) return null;
  return typeof raw.updatedAt === 'number' ? raw.updatedAt : null;
}

export function createSettingsRepository(db: AppDatabase, clock: Clock): SettingsRepository {
  const table = db.table('settings');

  function loadFrom(raw: unknown): { loaded: LoadedSettings; document?: SettingsDocument } {
    if (raw === undefined) return { loaded: { values: DEFAULT_SETTINGS, stored: 'absent' } };
    const parsed = parseRecord('settings', raw);
    if (!parsed.ok) return { loaded: { values: DEFAULT_SETTINGS, stored: 'invalid' } };
    if (parsed.value.deletedAt !== null) {
      return { loaded: { values: DEFAULT_SETTINGS, stored: 'absent' }, document: parsed.value };
    }
    return {
      loaded: { values: valuesOfDocument.parse(parsed.value), stored: 'valid' },
      document: parsed.value,
    };
  }

  return {
    async load() {
      return loadFrom(await table.get(SETTINGS_ID)).loaded;
    },

    async update(patch) {
      return db.dexie.transaction('rw', table, async () => {
        const raw = await table.get(SETTINGS_ID);
        const { loaded, document } = loadFrom(raw);
        // Merged inside the transaction, on the stored values (applySettingsPatch).
        const values = settingsValuesSchema.parse(applySettingsPatch(loaded.values, patch));
        const now = clock.now();
        await writeRecord(db, 'settings', {
          ...values,
          id: SETTINGS_ID,
          createdAt: document?.createdAt ?? now,
          updatedAt: nextUpdatedAt(updatedAtOf(raw), now),
          deletedAt: null,
          schemaVersion: 1,
        });
        return values;
      });
    },
  };
}
