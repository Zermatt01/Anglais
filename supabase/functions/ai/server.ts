/**
 * Wires the Edge Function to its real dependencies: configuration from the
 * environment, JWT verification, the call log through the secret key, and the
 * Anthropic client, whose key exists only here (SEC-01).
 */
import { createAdminClient } from '@supabase/server/core';
import { createAuthenticator } from './auth.ts';
import { readConfig } from './config.ts';
import { handleRequest, type LogEntry } from './handler.ts';
import { createLedger, type RpcCaller } from './ledger.ts';
import { createAnthropicClient, createModelCaller } from './model.ts';

function log(entry: LogEntry): void {
  console.log(JSON.stringify(entry));
}

/** Answer of a function that cannot run: no CORS headers, since no origin is known. */
function misconfigured(): Response {
  return Response.json({ ok: false, error: { code: 'server_error' } }, { status: 500 });
}

export function createAiFunction(
  env: Readonly<Record<string, string | undefined>>,
): (request: Request) => Promise<Response> {
  const read = readConfig(env);
  if (!read.ok) {
    // Names only, never values.
    console.error(JSON.stringify({ event: 'misconfigured', invalid: read.invalid }));
    return () => Promise.resolve(misconfigured());
  }
  const { config } = read;

  let rpc: RpcCaller;
  try {
    const admin = createAdminClient();
    rpc = async (fn, args) => {
      // Untyped database: the ledger validates every result with Zod.
      const response: { data: unknown; error: { code: string } | null } = await admin.rpc(fn, args);
      if (response.error !== null) {
        throw new Error(`Database function ${fn} failed (${response.error.code})`);
      }
      return response.data;
    };
  } catch {
    console.error(JSON.stringify({ event: 'misconfigured', invalid: ['SUPABASE_SECRET_KEYS'] }));
    return () => Promise.resolve(misconfigured());
  }

  const deps = {
    config,
    authenticate: createAuthenticator(config.supabaseUrl),
    ledger: createLedger(rpc),
    model: createModelCaller(createAnthropicClient(config.anthropicApiKey)),
    now: () => Date.now(),
    log,
  };
  return (request) => handleRequest(request, deps);
}
