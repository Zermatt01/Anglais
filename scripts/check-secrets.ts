/**
 * CLI for the repository secret scan. Run with `npm run check:secrets`
 * (Node executes this TypeScript file directly through type stripping).
 *
 * Scans, from the current directory's Git repository:
 * 1. the staged content of every tracked file (exactly what will be committed,
 *    even if the file on disk was edited or deleted since `git add`);
 * 2. the working copy when it differs from the index;
 * 3. untracked files that are not ignored.
 *
 * Exits with code 1 and lists `path:line [rule] (source)` when something is found.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { GITLINK_MODE, parseCatFileBatch, parseLsFilesStage } from './git-objects.ts';
import { findViolations, type FileSource, type ScannedFile } from './secret-scan.ts';

const MAX_FILE_BYTES = 1_000_000;
const SOURCE_LABELS: Record<FileSource, string> = {
  index: 'staged content',
  worktree: 'working tree',
};

function git(args: string[], input?: string): Buffer {
  return execFileSync('git', args, { input, maxBuffer: 512 * 1024 * 1024 });
}

function readFromDisk(path: string): Buffer | null {
  try {
    return readFileSync(path);
  } catch {
    // Deleted in the working tree but still staged: the index copy is scanned.
    return null;
  }
}

function toScannedFile(path: string, bytes: Buffer, source: FileSource): ScannedFile {
  const isScannable = bytes.length <= MAX_FILE_BYTES && !bytes.includes(0);
  return { path, content: isScannable ? bytes.toString('utf8') : null, source };
}

function collectFiles(): ScannedFile[] {
  const entries = parseLsFilesStage(git(['ls-files', '--stage', '-z']).toString('utf8')).filter(
    (entry) => entry.mode !== GITLINK_MODE,
  );
  const stagedBlobs =
    entries.length > 0
      ? parseCatFileBatch(
          git(['cat-file', '--batch'], `${entries.map((e) => e.objectId).join('\n')}\n`),
        )
      : new Map<string, Buffer>();

  const files: ScannedFile[] = [];
  for (const entry of entries) {
    const staged = stagedBlobs.get(entry.objectId);
    if (staged) files.push(toScannedFile(entry.path, staged, 'index'));
    const onDisk = readFromDisk(entry.path);
    if (onDisk && !(staged && onDisk.equals(staged))) {
      files.push(toScannedFile(entry.path, onDisk, 'worktree'));
    }
  }

  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z'])
    .toString('utf8')
    .split('\0')
    .filter((path) => path.length > 0);
  for (const path of untracked) {
    const onDisk = readFromDisk(path);
    if (onDisk) files.push(toScannedFile(path, onDisk, 'worktree'));
  }
  return files;
}

const files = collectFiles();
const violations = findViolations(files);

if (violations.length > 0) {
  console.error('Secret scan failed:');
  for (const violation of violations) {
    const location = `${violation.path}:${String(violation.line)}`;
    console.error(`  ${location}  [${violation.rule}] (${SOURCE_LABELS[violation.source]})`);
  }
  process.exit(1);
}
console.log(`Secret scan passed (${String(files.length)} file versions checked).`);
