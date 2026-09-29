/**
 * Entry point of the Edge Function "ai" (Deno, Supabase Edge Runtime).
 * Deployed with `supabase functions deploy ai --use-api` (docs/DEPLOYMENT.md).
 */
import process from 'node:process';
import { createAiFunction } from './server.ts';

export default { fetch: createAiFunction(process.env) };
