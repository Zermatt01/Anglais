import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useState } from 'react';
import type { LoadedSettings, SettingsPatch } from '../../data/repositories/settings-repository.ts';
import { useAppServices } from '../app-services.ts';

/** Current settings, kept up to date; `undefined` while loading. */
export function useSettings(): LoadedSettings | undefined {
  const { settings } = useAppServices();
  return useLiveQuery(() => settings.load(), [settings]);
}

/** Saves settings changes and exposes the last failure, if any. */
export function useUpdateSettings(): {
  update: (patch: SettingsPatch) => Promise<boolean>;
  failed: boolean;
} {
  const { settings } = useAppServices();
  const [failed, setFailed] = useState(false);
  const update = useCallback(
    async (patch: SettingsPatch) => {
      try {
        await settings.update(patch);
        setFailed(false);
        return true;
      } catch {
        setFailed(true);
        return false;
      }
    },
    [settings],
  );
  return { update, failed };
}
