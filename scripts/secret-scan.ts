/**
 * Pure rules for the repository secret scan (`npm run check:secrets`).
 *
 * Guards two non-negotiable rules (docs/SPEC.md, NO-02 and SEC-03):
 * - no API key or secret is ever committed;
 * - client code never talks to Anthropic directly (the key lives only in the
 *   Supabase Edge Function). ESLint blocks static imports; this scan also
 *   catches dynamic imports, raw URLs and Vite-exposed variables.
 *
 * This is a fast local and CI gate; CI additionally runs gitleaks over the
 * whole Git history (docs/DECISIONS.md, D-033).
 * Patterns are written so that this file never matches itself.
 */

/** Where the scanned content comes from: the Git index (what will be committed) or the disk. */
export type FileSource = 'index' | 'worktree';

export interface ScannedFile {
  /** Repository-relative path with forward slashes, as printed by `git ls-files`. */
  path: string;
  /** Text content, or null for binary or oversized files (only path rules apply). */
  content: string | null;
  source: FileSource;
}

export interface Violation {
  path: string;
  /** 1-based line number (1 for path-based rules). */
  line: number;
  rule: string;
  source: FileSource;
}

interface ContentRule {
  id: string;
  /** Must use the `g` flag: every match on a line is checked. */
  pattern: RegExp;
  appliesTo?: (path: string) => boolean;
  /** Extra check that filters out non-secret look-alikes (plain words, identifiers). */
  isSecret?: (match: RegExpMatchArray) => boolean;
}

interface PathRule {
  id: string;
  matches: (path: string) => boolean;
}

/** Real keys mix letters and digits; plain words and kebab-case identifiers do not. */
const looksRandom = (value: string | undefined): boolean =>
  value !== undefined && /\d/.test(value) && /[A-Za-z]/.test(value);

const isClientCode = (path: string): boolean => path.startsWith('src/');
const baseName = (path: string): string => path.slice(path.lastIndexOf('/') + 1);

export const CONTENT_RULES: readonly ContentRule[] = [
  { id: 'anthropic-api-key', pattern: /sk-ant-[A-Za-z0-9_-]{16,}/g },
  {
    id: 'openai-api-key',
    pattern: /\bsk-(?!ant-)(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,}/g,
    isSecret: (match) => looksRandom(match[0]),
  },
  { id: 'github-token', pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_\w{22,})/g },
  { id: 'aws-access-key-id', pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { id: 'google-api-key', pattern: /\bAIza[0-9A-Za-z_-]{35}/g },
  { id: 'stripe-secret-key', pattern: /\b[rs]k_(?:live|test)_[0-9A-Za-z]{16,}/g },
  { id: 'slack-token', pattern: /\bxox[abposr]-[0-9A-Za-z-]{10,}/g },
  { id: 'supabase-secret-key', pattern: /sb_secret_[A-Za-z0-9_-]{16,}/g },
  // Any JWT, including Supabase legacy anon and service_role keys: tokens belong
  // in environment variables, never in the repository.
  { id: 'jwt', pattern: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g },
  { id: 'private-key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  {
    // `apiKey = "…"`, `SECRET: …`, `password=…` with a random-looking value.
    id: 'generic-secret-assignment',
    pattern:
      /[\w-]*(?:api[_-]?key|secret|token|passw(?:or)?d|private[_-]?key)[\w-]*["']?\s*[:=]\s*["']?([\w+/=.-]{24,})/gi,
    isSecret: (match) => looksRandom(match[1]),
  },
  // Any VITE_* variable is inlined into the public bundle.
  { id: 'anthropic-var-exposed-by-vite', pattern: /VITE_\w*ANTHROPIC/g },
  {
    id: 'anthropic-access-from-client',
    pattern: /@anthropic-ai\/|api\.anthropic\.com/g,
    appliesTo: isClientCode,
  },
];

export const PATH_RULES: readonly PathRule[] = [
  {
    // `.env`, `.env.local`, `.env.production`…; only the documented template may be tracked.
    id: 'env-file',
    matches: (path) => /^\.env(?:\..+)?$/.test(baseName(path)) && baseName(path) !== '.env.example',
  },
  {
    id: 'private-key-file',
    matches: (path) =>
      /\.(?:pem|key|p12|pfx)$/i.test(path) || /^id_(?:rsa|dsa|ecdsa|ed25519)$/.test(baseName(path)),
  },
];

function lineViolations(file: ScannedFile, text: string, line: number): Violation[] {
  const violations: Violation[] = [];
  for (const rule of CONTENT_RULES) {
    if (rule.appliesTo && !rule.appliesTo(file.path)) continue;
    for (const match of text.matchAll(rule.pattern)) {
      if (!rule.isSecret || rule.isSecret(match)) {
        violations.push({ path: file.path, line, rule: rule.id, source: file.source });
        break; // One report per rule and line is enough.
      }
    }
  }
  return violations;
}

export function findViolations(files: readonly ScannedFile[]): Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    for (const rule of PATH_RULES) {
      if (rule.matches(file.path)) {
        violations.push({ path: file.path, line: 1, rule: rule.id, source: file.source });
      }
    }
    if (file.content === null) continue;
    file.content.split('\n').forEach((text, index) => {
      violations.push(...lineViolations(file, text, index + 1));
    });
  }
  return violations;
}
