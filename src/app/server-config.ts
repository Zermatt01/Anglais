import { readServerConfig } from '../services/backend/config.ts';

/** Whether this build has a Supabase project to talk to (docs/DEPLOYMENT.md). */
export function hasServerConfig(): boolean {
  return readServerConfig(import.meta.env) !== null;
}
