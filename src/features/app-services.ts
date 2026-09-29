/**
 * Services shared by every screen (database, clock, repositories, and the
 * server when it is configured), provided once by the application shell.
 * Tests provide their own, on an in-memory database.
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
import {
  createUsageRepository,
  type UsageRepository,
} from '../data/repositories/usage-repository.ts';
import type { Clock } from '../domain/primitives.ts';
import type { AiClient } from '../services/ai-client/ai-client.ts';
import type { AccountService } from '../services/backend/account.ts';
import type { SyncController } from './sync/sync-controller.ts';

/** Account, synchronization and AI: only when the server is configured. */
export interface ServerServices {
  readonly account: AccountService;
  readonly sync: SyncController;
  readonly ai: AiClient;
}

export interface AppServices {
  readonly db: AppDatabase;
  readonly clock: Clock;
  readonly settings: SettingsRepository;
  readonly drafts: DraftRepository;
  readonly usage: UsageRepository;
  /** `null`: no server configured, everything stays on the device. */
  readonly server: ServerServices | null;
  /** Whether the device has network (navigator.onLine), replaced in tests. */
  readonly isOnline: () => boolean;
}

export function createAppServices(
  db: AppDatabase,
  clock: Clock,
  options: { readonly server?: ServerServices | null; readonly isOnline?: () => boolean } = {},
): AppServices {
  return {
    db,
    clock,
    settings: createSettingsRepository(db, clock),
    drafts: createDraftRepository(db, clock),
    usage: createUsageRepository(db),
    server: options.server ?? null,
    isOnline: options.isOnline ?? (() => navigator.onLine),
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
