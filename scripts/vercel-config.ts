/**
 * Reads vercel.json (hosting configuration, ARC-04). The security headers it
 * declares for every path are also served by `vite preview`, so that the
 * end-to-end tests run under the production Content-Security-Policy.
 */
import { readFileSync } from 'node:fs';
import { z } from 'zod';

const headerRuleSchema = z.object({
  source: z.string(),
  headers: z.array(z.object({ key: z.string(), value: z.string() })).min(1),
});

const vercelConfigSchema = z.object({
  rewrites: z.array(z.object({ source: z.string(), destination: z.string() })),
  headers: z.array(headerRuleSchema),
});
export type VercelConfig = z.infer<typeof vercelConfigSchema>;

/** Source of the rule that applies to every path. */
export const ALL_PATHS = '/(.*)';

export function readVercelConfig(
  file: URL = new URL('../vercel.json', import.meta.url),
): VercelConfig {
  return vercelConfigSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
}

/** Headers sent with every response. */
export function headersForAllPaths(config: VercelConfig): Record<string, string> {
  const rule = config.headers.find((entry) => entry.source === ALL_PATHS);
  return Object.fromEntries((rule?.headers ?? []).map(({ key, value }) => [key, value]));
}

/** Content-Security-Policy directives and their sources. */
export function parseContentSecurityPolicy(policy: string): Map<string, string[]> {
  return new Map(
    policy
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .filter((parts) => parts[0] !== undefined && parts[0] !== '')
      .map(([name = '', ...sources]) => [name, sources]),
  );
}

/**
 * Origin of a Supabase project (`https://<ref>.supabase.co`), the only
 * address besides the app that the CSP lets it contact (D-065).
 */
export const SUPABASE_ORIGIN = /^https:\/\/[a-z0-9]{20}\.supabase\.co$/;

/** Sources of `connect-src`. */
export function connectSources(config: VercelConfig): string[] {
  const policy = headersForAllPaths(config)['Content-Security-Policy'] ?? '';
  return parseContentSecurityPolicy(policy).get('connect-src') ?? [];
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/**
 * Checked when the app is built (vite.config.ts): the Supabase address the
 * build will call must be allowed by `connect-src`, or every request to the
 * server would be blocked in production. A local server (e2e tests) is
 * reached on the app's own origin. Returns what to fix, or `null`.
 */
export function supabaseOriginProblem(config: VercelConfig, supabaseUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(supabaseUrl);
  } catch {
    return `VITE_SUPABASE_URL is not a URL: ${supabaseUrl}`;
  }
  if (LOCAL_HOSTS.has(url.hostname)) return null;
  if (connectSources(config).includes(url.origin)) return null;
  return (
    `The Content-Security-Policy of vercel.json does not allow ${url.origin}. ` +
    `Run: npm run configure:csp -- ${url.origin} (docs/DEPLOYMENT.md), then commit vercel.json.`
  );
}

/** Sets the Supabase origin of `connect-src`, replacing any previous one. */
export function withSupabaseOrigin(policy: string, origin: string): string {
  if (!SUPABASE_ORIGIN.test(origin)) {
    throw new Error(`Expected a project address such as https://<ref>.supabase.co, got ${origin}`);
  }
  return policy
    .split(';')
    .map((directive) => {
      const [name = '', ...sources] = directive.trim().split(/\s+/);
      if (name !== 'connect-src') return directive.trim();
      const kept = sources.filter((source) => !SUPABASE_ORIGIN.test(source));
      return ['connect-src', ...kept, origin].join(' ');
    })
    .filter((directive) => directive.length > 0)
    .join('; ');
}
