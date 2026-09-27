/**
 * CLI for the repository secret scan. Run with `npm run check:secrets`
 * (Node executes this TypeScript file directly through type stripping).
 * Exits with code 1 and lists `path:line [rule]` when something is found.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { findViolations, type ScannedFile } from './secret-scan.ts';

const MAX_FILE_BYTES = 1_000_000;

/** Tracked files plus untracked, non-ignored ones: catches a secret before it is committed. */
function listRepositoryFiles(): string[] {
  const gitArgs = ['ls-files', '--cached', '--others', '--exclude-standard', '-z'];
  const output = execFileSync('git', gitArgs, { encoding: 'utf8' });
  return output.split('\0').filter((path) => path.length > 0);
}

function readTextFile(path: string): ScannedFile | null {
  let buffer: Buffer;
  try {
    buffer = readFileSync(path);
  } catch {
    // Deleted in the working tree but still in the index.
    return null;
  }
  const isBinary = buffer.includes(0);
  if (isBinary || buffer.length > MAX_FILE_BYTES) return null;
  return { path, content: buffer.toString('utf8') };
}

const files = listRepositoryFiles()
  .map(readTextFile)
  .filter((file): file is ScannedFile => file !== null);
const violations = findViolations(files);

if (violations.length > 0) {
  console.error('Secret scan failed:');
  for (const violation of violations) {
    console.error(`  ${violation.path}:${String(violation.line)}  [${violation.rule}]`);
  }
  process.exit(1);
}
console.log(`Secret scan passed (${String(files.length)} files checked).`);
