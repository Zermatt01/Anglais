// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { findViolations } from './secret-scan.ts';

// Fake secrets are assembled at runtime so that this file never contains a
// literal that the repository scan would flag.
const fakeAnthropicKey = ['sk', 'ant', 'api03', 'A'.repeat(24)].join('-');
const fakeSupabaseSecret = ['sb', 'secret', 'b'.repeat(24)].join('_');
const fakePemHeader = ['-----BEGIN RSA', 'PRIVATE KEY-----'].join(' ');
const exposedViteVariable = ['VITE', 'ANTHROPIC', 'KEY'].join('_');

describe('findViolations', () => {
  it('accepts ordinary files', () => {
    const files = [
      { path: 'src/App.tsx', content: 'export function App() {\n  return null;\n}\n' },
      { path: 'docs/ARCHITECTURE.md', content: 'The key never leaves the Edge Function.\n' },
    ];
    expect(findViolations(files)).toEqual([]);
  });

  it('flags an Anthropic key anywhere, with its line number', () => {
    const files = [{ path: 'notes.txt', content: `first line\nkey=${fakeAnthropicKey}\n` }];
    expect(findViolations(files)).toEqual([
      { path: 'notes.txt', line: 2, rule: 'anthropic-api-key' },
    ]);
  });

  it('flags Supabase secret keys and PEM private keys', () => {
    const files = [
      { path: 'supabase/config.toml', content: fakeSupabaseSecret },
      { path: 'certs/key.pem', content: fakePemHeader },
    ];
    expect(findViolations(files).map((violation) => violation.rule)).toEqual([
      'supabase-secret-key',
      'private-key',
    ]);
  });

  it('flags Anthropic variables exposed through Vite env', () => {
    const files = [{ path: '.github/workflows/ci.yml', content: `${exposedViteVariable}: x` }];
    expect(findViolations(files)).toEqual([
      { path: '.github/workflows/ci.yml', line: 1, rule: 'anthropic-var-exposed-by-vite' },
    ]);
  });

  it('flags direct Anthropic access in client code only', () => {
    const dynamicImport = "await import('@anthropic-ai/sdk');";
    const rawUrl = "fetch('https://api.anthropic.com/v1/messages');";
    const files = [
      { path: 'src/features/ai.ts', content: `${dynamicImport}\n${rawUrl}` },
      { path: 'supabase/functions/ai/index.ts', content: dynamicImport },
    ];
    expect(findViolations(files)).toEqual([
      { path: 'src/features/ai.ts', line: 1, rule: 'anthropic-access-from-client' },
      { path: 'src/features/ai.ts', line: 2, rule: 'anthropic-access-from-client' },
    ]);
  });
});
