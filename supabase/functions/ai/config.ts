/**
 * Configuration of the Edge Function, read from its secrets and environment
 * variables (docs/DEPLOYMENT.md). Invalid or missing values stop every call
 * with `server_error`: the function never runs half-configured.
 */
import { z } from 'zod';

export interface FunctionConfig {
  readonly anthropicApiKey: string;
  /** Accounts allowed to use the AI, in lower case (D-013). */
  readonly allowedEmails: ReadonlySet<string>;
  /** Origins allowed to call the function from a browser (CORS). */
  readonly allowedOrigins: ReadonlySet<string>;
  /** Monthly cap in USD (COST-06). */
  readonly monthlyBudgetUsd: number;
  /** Calls per minute (COST-07). */
  readonly rateLimitPerMinute: number;
  /** Project URL, used to check the issuer of the JWT. */
  readonly supabaseUrl: string;
}

export const DEFAULT_MONTHLY_BUDGET_USD = 10;
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 6;

const list = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().trim().min(1),
  AI_ALLOWED_EMAILS: z
    .string()
    .transform((value) => list(value).map((email) => email.toLowerCase()))
    .pipe(z.array(z.email()).min(1)),
  AI_ALLOWED_ORIGINS: z
    .string()
    .transform(list)
    .pipe(z.array(z.url({ protocol: /^https?$/ })).min(1))
    .transform((origins) => origins.map((origin) => new URL(origin).origin)),
  AI_MONTHLY_BUDGET_USD: z.coerce
    .number()
    .positive()
    .max(1_000)
    .default(DEFAULT_MONTHLY_BUDGET_USD),
  AI_RATE_LIMIT_PER_MINUTE: z.coerce
    .number()
    .int()
    .positive()
    .max(60)
    .default(DEFAULT_RATE_LIMIT_PER_MINUTE),
  SUPABASE_URL: z.url({ protocol: /^https?$/ }),
});

export type ConfigResult =
  | { readonly ok: true; readonly config: FunctionConfig }
  /** Names of the variables to fix; never their values. */
  | { readonly ok: false; readonly invalid: readonly string[] };

/** Reads the configuration; an empty variable counts as unset. */
export function readConfig(env: Readonly<Record<string, string | undefined>>): ConfigResult {
  const present = Object.fromEntries(
    Object.entries(env).filter(([, value]) => value !== undefined && value.trim() !== ''),
  );
  const parsed = envSchema.safeParse(present);
  if (!parsed.success) {
    const invalid = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))];
    return { ok: false, invalid: invalid.sort() };
  }
  const values = parsed.data;
  return {
    ok: true,
    config: {
      anthropicApiKey: values.ANTHROPIC_API_KEY,
      allowedEmails: new Set(values.AI_ALLOWED_EMAILS),
      allowedOrigins: new Set(values.AI_ALLOWED_ORIGINS),
      monthlyBudgetUsd: values.AI_MONTHLY_BUDGET_USD,
      rateLimitPerMinute: values.AI_RATE_LIMIT_PER_MINUTE,
      supabaseUrl: values.SUPABASE_URL.replace(/\/+$/, ''),
    },
  };
}
