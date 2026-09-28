import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useState } from 'react';
import type { LoadedSettings } from '../../data/repositories/settings-repository.ts';
import {
  applySettingsPatch,
  type SettingsPatch,
  type SettingsValues,
} from '../../domain/settings.ts';
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

/**
 * Settings as shown on screen: a choice appears at once, without waiting for
 * the database round trip, and is rolled back if it could not be saved. Every
 * new stored version (this device, an import) replaces what is shown.
 */
export function useShownSettings(stored: SettingsValues): {
  shown: SettingsValues;
  change: (patch: SettingsPatch) => void;
  update: (patch: SettingsPatch) => Promise<boolean>;
  failed: boolean;
} {
  const { update, failed } = useUpdateSettings();
  const [shown, setShown] = useState(stored);
  const [source, setSource] = useState(stored);
  if (stored !== source) {
    setSource(stored);
    setShown(stored);
  }

  const change = useCallback(
    (patch: SettingsPatch) => {
      setShown((current) => applySettingsPatch(current, patch));
      void update(patch).then((saved) => {
        if (!saved) setShown(stored);
      });
    },
    [stored, update],
  );

  return { shown, change, update, failed };
}
