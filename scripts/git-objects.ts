/**
 * Pure parsers for the Git plumbing output used by the secret scan, so that
 * staged content (what will actually be committed) can be scanned even when
 * the working tree differs from the index.
 */

export interface IndexEntry {
  mode: string;
  objectId: string;
  path: string;
}

/** Gitlinks (submodules) point to commits, not blobs: there is nothing to scan. */
export const GITLINK_MODE = '160000';

/**
 * Parses `git ls-files --stage -z`, whose records are
 * `<mode> <object id> <stage>\t<path>` separated by NUL bytes.
 */
export function parseLsFilesStage(output: string): IndexEntry[] {
  return output
    .split('\0')
    .filter((record) => record.length > 0)
    .map((record) => {
      const tabIndex = record.indexOf('\t');
      const [mode, objectId] = record.slice(0, tabIndex).split(' ');
      if (tabIndex < 0 || mode === undefined || objectId === undefined) {
        throw new Error(`Unexpected git ls-files record: ${record}`);
      }
      return { mode, objectId, path: record.slice(tabIndex + 1) };
    });
}

/**
 * Parses `git cat-file --batch` output into a map from object id to content.
 * Each object is `<id> <type> <size>\n<content>\n`; unknown ids are reported
 * as `<id> missing\n` and are simply absent from the result.
 */
export function parseCatFileBatch(output: Buffer): Map<string, Buffer> {
  const objects = new Map<string, Buffer>();
  let offset = 0;
  while (offset < output.length) {
    const headerEnd = output.indexOf(0x0a, offset);
    if (headerEnd < 0) throw new Error('Truncated git cat-file header');
    const [objectId, type, size] = output.subarray(offset, headerEnd).toString('utf8').split(' ');
    offset = headerEnd + 1;
    if (objectId === undefined || type === 'missing') continue;
    const byteLength = Number(size);
    if (!Number.isInteger(byteLength) || byteLength < 0) {
      throw new Error(`Unexpected git cat-file header for ${objectId}`);
    }
    objects.set(objectId, output.subarray(offset, offset + byteLength));
    // Skip the content and the newline that terminates it.
    offset += byteLength + 1;
  }
  return objects;
}
