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
