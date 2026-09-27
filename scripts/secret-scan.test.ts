// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { findViolations, type FileSource, type ScannedFile } from './secret-scan.ts';

// Fake secrets are assembled at runtime so that this file never contains a
// literal that the repository scan (or gitleaks) would flag.
const FAKE_SECRETS: Record<string, string> = {
  'anthropic-api-key': ['sk', 'ant', 'api03', 'A'.repeat(24)].join('-'),
  'openai-api-key': ['sk', 'proj', 'a1B2'.repeat(6)].join('-'),
  'github-token': ['ghp', 'a1'.repeat(18)].join('_'),
  'aws-access-key-id': ['AKIA', 'ABCDEFGH23456789'].join(''),
  'google-api-key': ['AIza', 'x1'.repeat(17), 'y'].join(''),
  'stripe-secret-key': ['sk', 'live', 'a1'.repeat(10)].join('_'),
  'slack-token': ['xoxb', '1234567890', 'abcdefghij'].join('-'),
  'supabase-secret-key': ['sb', 'secret', 'b'.repeat(24)].join('_'),
  jwt: ['eyJ' + 'hbGciOiJIUzI1', 'eyJ' + 'yb2xlIjoic2Vy', 'c2lnbmF0dXJl'].join('.'),
  'private-key': ['-----BEGIN RSA', 'PRIVATE KEY-----'].join(' '),
  'generic-secret-assignment': ['apiKey', '=', `"${'q1W2e3R4'.repeat(3)}"`].join(' '),
  'anthropic-var-exposed-by-vite': ['VITE', 'ANTHROPIC', 'KEY'].join('_'),
};

function file(path: string, content: string | null, source: FileSource = 'index'): ScannedFile {
  return { path, content, source };
}

describe('findViolations', () => {
  it('accepts ordinary files', () => {
    const files = [
      file('src/App.tsx', 'export function App() {\n  return null;\n}\n'),
      file('docs/ARCHITECTURE.md', 'The key never leaves the Edge Function.\n'),
      file('.github/workflows/ci.yml', 'GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n'),
    ];
    expect(findViolations(files)).toEqual([]);
  });

  it.each(Object.entries(FAKE_SECRETS))(
    'flags %s anywhere, with its line number',
    (rule, secret) => {
      const files = [file('notes/config.txt', `first line\nvalue: ${secret}\n`)];
      expect(findViolations(files)).toContainEqual({
        path: 'notes/config.txt',
        line: 2,
        rule,
        source: 'index',
      });
    },
  );

  it('ignores look-alikes that are plain words or identifiers', () => {
    const files = [
      file('src/labels.ts', 'const token: "placeholder-value-for-the-documentation";'),
      file('docs/tools.md', 'We use scikit-learn and sk-learn-style-pipelines-everywhere here.'),
    ];
    expect(findViolations(files)).toEqual([]);
  });

  it('flags direct Anthropic access in client code only', () => {
    const dynamicImport = "await import('@anthropic-ai/sdk');";
    const rawUrl = "fetch('https://api.anthropic.com/v1/messages');";
    const files = [
      file('src/features/ai.ts', `${dynamicImport}\n${rawUrl}`),
      file('supabase/functions/ai/index.ts', dynamicImport),
    ];
    expect(findViolations(files)).toEqual([
      {
        path: 'src/features/ai.ts',
        line: 1,
        rule: 'anthropic-access-from-client',
        source: 'index',
      },
      {
        path: 'src/features/ai.ts',
        line: 2,
        rule: 'anthropic-access-from-client',
        source: 'index',
      },
    ]);
  });

  it('flags tracked env and private key files by path, even when content is unreadable', () => {
    const files = [
      file('.env.local', null),
      file('config/.env', 'EMPTY=1'),
      file('certs/server.pem', null),
      file('.env.example', 'VITE_SUPABASE_URL='),
    ];
    expect(findViolations(files).map((violation) => [violation.path, violation.rule])).toEqual([
      ['.env.local', 'env-file'],
      ['config/.env', 'env-file'],
      ['certs/server.pem', 'private-key-file'],
    ]);
  });

  it('reports where the content comes from', () => {
    const secret = FAKE_SECRETS['anthropic-api-key'] ?? '';
    const files = [file('a.txt', secret, 'index'), file('b.txt', secret, 'worktree')];
    expect(findViolations(files).map((violation) => violation.source)).toEqual([
      'index',
      'worktree',
    ]);
  });
});
