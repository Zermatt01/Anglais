/**
 * Services shared by every screen (database, clock, repositories), provided
 * once by the application shell. Tests provide their own, on an in-memory
 * database.
 */
import { createContext, useContext } from 'react';
import type { AppDatabase } from '../data/database.ts';
import {
  createDraftRepository,
  type DraftRepository,
} from '../data/repositories/draft-repository.ts';
import {
  createSettingsRepository,
  type SettingsRepository,
} from '../data/repositories/settings-repository.ts';
import type { Clock } from '../domain/primitives.ts';

export interface AppServices {
  readonly db: AppDatabase;
  readonly clock: Clock;
  readonly settings: SettingsRepository;
  readonly drafts: DraftRepository;
}

export function createAppServices(db: AppDatabase, clock: Clock): AppServices {
  return {
    db,
    clock,
    settings: createSettingsRepository(db, clock),
    drafts: createDraftRepository(db, clock),
  };
}

export const AppServicesContext = createContext<AppServices | null>(null);

export function useAppServices(): AppServices {
  const services = useContext(AppServicesContext);
  if (services === null) {
    throw new Error('useAppServices must be used inside AppServicesContext');
  }
  return services;
}
