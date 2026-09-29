/**
 * Builds the server services when the Supabase project is configured
 * (docs/DEPLOYMENT.md); otherwise the app works on the device only.
 */
import type { AppDatabase } from '../data/database.ts';
import type { Clock } from '../domain/primitives.ts';
import type { ServerServices } from '../features/app-services.ts';
import { createSyncController } from '../features/sync/sync-controller.ts';
import { createAiClient } from '../services/ai-client/ai-client.ts';
import { createAccountService } from '../services/backend/account.ts';
import { createSupabaseClient, rpcCallerOf } from '../services/backend/client.ts';
import { readServerConfig } from '../services/backend/config.ts';
import { createSyncTransport } from '../services/backend/sync-transport.ts';

export function createServerServices(db: AppDatabase, clock: Clock): ServerServices | null {
  const config = readServerConfig(import.meta.env);
  if (config === null) return null;
  const client = createSupabaseClient(config);
  const account = createAccountService(client);
  return {
    account,
    sync: createSyncController({
      db,
      clock,
      account,
      transport: createSyncTransport(rpcCallerOf(client)),
    }),
    ai: createAiClient({
      functionUrl: config.aiFunctionUrl,
      publishableKey: config.publishableKey,
      accessToken: () => account.accessToken(),
    }),
  };
}
