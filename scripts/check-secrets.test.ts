// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// End-to-end check of the CLI against a real throwaway Git repository.
const CLI = fileURLToPath(new URL('./check-secrets.ts', import.meta.url));
const FAKE_KEY = ['sk', 'ant', 'api03', 'Z'.repeat(30)].join('-');
const TIMEOUT_MS = 30_000;

let repo = '';

function runGit(...args: string[]): void {
  execFileSync('git', args, { cwd: repo, stdio: 'ignore' });
}

function runScan(): { status: number | null; output: string } {
  const result = spawnSync(process.execPath, [CLI], { cwd: repo, encoding: 'utf8' });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), 'secret-scan-'));
  runGit('init', '--quiet');
});

afterEach(() => {
  rmSync(repo, { recursive: true, force: true });
});

describe('check-secrets CLI', () => {
  it(
    'passes on a clean repository',
    () => {
      writeFileSync(join(repo, 'README.md'), '# Clean\n');
      runGit('add', 'README.md');
      expect(runScan()).toMatchObject({ status: 0 });
    },
    TIMEOUT_MS,
  );

  it(
    'catches a key that is staged but no longer on disk',
    () => {
      writeFileSync(join(repo, 'config.txt'), `key=${FAKE_KEY}\n`);
      runGit('add', 'config.txt');
      writeFileSync(join(repo, 'config.txt'), 'key=\n');

      const { status, output } = runScan();

      expect(status).toBe(1);
      expect(output).toContain('config.txt:1  [anthropic-api-key] (staged content)');
    },
    TIMEOUT_MS,
  );

  it(
    'catches a key in an untracked, non-ignored file',
    () => {
      writeFileSync(join(repo, 'notes.txt'), `key=${FAKE_KEY}\n`);

      const { status, output } = runScan();

      expect(status).toBe(1);
      expect(output).toContain('notes.txt:1  [anthropic-api-key] (working tree)');
    },
    TIMEOUT_MS,
  );
});
