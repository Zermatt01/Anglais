/**
 * Pure rules for the repository secret scan (`npm run check:secrets`).
 *
 * Guards two non-negotiable rules (docs/SPEC.md, NO-02 and SEC-01):
 * - no API key or secret is ever committed;
 * - client code never talks to Anthropic directly (the key lives only in the
 *   Supabase Edge Function). ESLint blocks static imports; this scan also
 *   catches dynamic imports, raw URLs and Vite-exposed variables.
 *
 * Patterns are written so that this file never matches itself.
 */

export interface ScannedFile {
  /** Repository-relative path with forward slashes, as printed by `git ls-files`. */
  path: string;
  content: string;
}

export interface Violation {
  path: string;
  /** 1-based line number. */
  line: number;
  rule: string;
}

interface Rule {
  id: string;
  pattern: RegExp;
  appliesTo: (path: string) => boolean;
}

const everywhere = (): boolean => true;
const clientCode = (path: string): boolean => path.startsWith('src/');

export const RULES: readonly Rule[] = [
  { id: 'anthropic-api-key', pattern: /sk-ant-[A-Za-z0-9_-]{16,}/, appliesTo: everywhere },
  { id: 'supabase-secret-key', pattern: /sb_secret_[A-Za-z0-9_-]{16,}/, appliesTo: everywhere },
  { id: 'private-key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, appliesTo: everywhere },
  // Any VITE_* variable is inlined into the public bundle.
  { id: 'anthropic-var-exposed-by-vite', pattern: /VITE_\w*ANTHROPIC/, appliesTo: everywhere },
  {
    id: 'anthropic-access-from-client',
    pattern: /@anthropic-ai\/|api\.anthropic\.com/,
    appliesTo: clientCode,
  },
];

export function findViolations(files: readonly ScannedFile[]): Violation[] {
  const violations: Violation[] = [];
  for (const file of files) {
    const rules = RULES.filter((rule) => rule.appliesTo(file.path));
    if (rules.length === 0) continue;
    file.content.split('\n').forEach((text, index) => {
      for (const rule of rules) {
        if (rule.pattern.test(text)) {
          violations.push({ path: file.path, line: index + 1, rule: rule.id });
        }
      }
    });
  }
  return violations;
}
