// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseCatFileBatch, parseLsFilesStage } from './git-objects.ts';

describe('parseLsFilesStage', () => {
  it('parses NUL-separated records, including paths with spaces and tabs', () => {
    const output = ['100644 aaa111 0\tsrc/App.tsx', '100644 bbb222 0\tdocs/a b\tc.md', ''].join(
      '\0',
    );
    expect(parseLsFilesStage(output)).toEqual([
      { mode: '100644', objectId: 'aaa111', path: 'src/App.tsx' },
      { mode: '100644', objectId: 'bbb222', path: 'docs/a b\tc.md' },
    ]);
  });

  it('rejects malformed records', () => {
    expect(() => parseLsFilesStage('garbage\0')).toThrow(/Unexpected/);
  });
});

describe('parseCatFileBatch', () => {
  it('extracts blobs whose content contains newlines and NUL bytes', () => {
    const first = Buffer.from('line 1\nline 2\n');
    const second = Buffer.from([0x61, 0x00, 0x62]);
    const output = Buffer.concat([
      Buffer.from(`aaa111 blob ${String(first.length)}\n`),
      first,
      Buffer.from('\n'),
      Buffer.from('zzz999 missing\n'),
      Buffer.from(`bbb222 blob ${String(second.length)}\n`),
      second,
      Buffer.from('\n'),
    ]);

    const objects = parseCatFileBatch(output);

    expect(objects.get('aaa111')?.toString()).toBe('line 1\nline 2\n');
    expect(objects.get('bbb222')).toEqual(second);
    expect(objects.has('zzz999')).toBe(false);
  });

  it('rejects a truncated header', () => {
    expect(() => parseCatFileBatch(Buffer.from('aaa111 blob 3'))).toThrow(/Truncated/);
  });
});
