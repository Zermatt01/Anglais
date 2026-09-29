/**
 * `npm run configure:csp -- https://<ref>.supabase.co`: lets the app contact
 * its Supabase project, by adding the project's address to the
 * Content-Security-Policy of vercel.json (D-065). Commit the result.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { withSupabaseOrigin } from './vercel-config.ts';

const [origin = ''] = process.argv.slice(2);
const file = new URL('../vercel.json', import.meta.url);
const text = readFileSync(file, 'utf8');
const policy = /("key": "Content-Security-Policy",\s*"value": ")([^"]*)(")/;
const match = policy.exec(text);
if (match === null) {
  console.error('vercel.json has no Content-Security-Policy to update.');
  process.exit(1);
}
try {
  const updated = withSupabaseOrigin(match[2] ?? '', origin.replace(/\/+$/, ''));
  writeFileSync(file, text.replace(policy, `$1${updated}$3`));
  console.log(`connect-src now allows ${origin}. Commit vercel.json, then push.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
