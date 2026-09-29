/**
 * Address of the Supabase project and its publishable key, read at build time
 * (docs/DEPLOYMENT.md). Without them the app works entirely on the device:
 * no account, no synchronization, no AI.
 */
import { z } from 'zod';

export interface ServerConfig {
  /** Project URL, such as `https://<ref>.supabase.co`. */
  readonly url: string;
  /** Publishable key (`sb_publishable_…`), public by design (D-060). */
  readonly publishableKey: string;
  /** Address of the Edge Function "ai". */
  readonly aiFunctionUrl: string;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

const urlSchema = z
  .url()
  .refine((value) => {
    const url = new URL(value);
    // Plain HTTP only for a local development server (and the e2e tests).
    return url.protocol === 'https:' || (url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname));
  })
  .transform((value) => value.replace(/\/+$/, ''));

const keySchema = z.string().regex(/^sb_publishable_[A-Za-z0-9_-]+$/);

export function readServerConfig(env: {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}): ServerConfig | null {
  const url = urlSchema.safeParse(env.VITE_SUPABASE_URL?.trim());
  const key = keySchema.safeParse(env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim());
  if (!url.success || !key.success) return null;
  return {
    url: url.data,
    publishableKey: key.data,
    aiFunctionUrl: `${url.data}/functions/v1/ai`,
  };
}
