// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { actualCopy, COPY_DIR, expectedCopy, SOURCE_DIR } from './shared-copy.ts';

describe(`the copy of ${SOURCE_DIR} used by the Edge Function (D-061)`, () => {
  it(`is up to date in ${COPY_DIR} (run \`npm run sync:shared\` otherwise)`, () => {
    const expected = expectedCopy(process.cwd());
    expect(expected.size).toBeGreaterThan(0);
    expect(Object.fromEntries(actualCopy(process.cwd()))).toEqual(Object.fromEntries(expected));
  });

  it('leaves the tests out and marks every file as generated', () => {
    for (const [file, content] of expectedCopy(process.cwd())) {
      expect(file).not.toMatch(/\.test\.ts$/);
      expect(content.split('\n')[0]).toContain('do not edit');
    }
  });
});
