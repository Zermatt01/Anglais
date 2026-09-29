/**
 * The Supabase client of the app, and a way to call its SQL functions.
 * Only the publishable key is used: every table is protected by Row Level
 * Security (SEC-02).
 */
import { createClient } from '@supabase/supabase-js';
import type { ServerConfig } from './config.ts';

export type AppSupabaseClient = ReturnType<typeof createSupabaseClient>;

export function createSupabaseClient(config: ServerConfig) {
  return createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Sign-in uses a code typed in the app, never a link (D-013).
      detectSessionInUrl: false,
    },
  });
}

/** Calls a SQL function; throws on an error. */
export type RpcCaller = (fn: string, args: Readonly<Record<string, unknown>>) => Promise<unknown>;

export class RpcError extends Error {
  override readonly name = 'RpcError';
  readonly fn: string;
  readonly code: string;

  constructor(fn: string, code: string) {
    super(`Database function ${fn} failed (${code})`);
    this.fn = fn;
    this.code = code;
  }
}

export function rpcCallerOf(client: AppSupabaseClient): RpcCaller {
  return async (fn, args) => {
    // Untyped database: every result is validated with Zod by the caller.
    const response: { data: unknown; error: { code: string } | null } = await client.rpc(fn, args);
    if (response.error !== null) throw new RpcError(fn, response.error.code);
    return response.data;
  };
}
