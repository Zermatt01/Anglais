// @vitest-environment node
/**
 * The Edge Function runs with the packages pinned in its deno.json, and its
 * tests run in Node with node_modules: both must be the same versions.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const denoConfigSchema = z.object({ imports: z.record(z.string(), z.string()) });
const packageSchema = z.object({ version: z.string() });

function installedVersion(name: string): string {
  const file = new URL(`../../../node_modules/${name}/package.json`, import.meta.url);
  return packageSchema.parse(JSON.parse(readFileSync(file, 'utf8'))).version;
}

describe('supabase/functions/ai/deno.json', () => {
  const { imports } = denoConfigSchema.parse(
    JSON.parse(readFileSync(new URL('./deno.json', import.meta.url), 'utf8')),
  );

  it.each(Object.entries(imports))(
    'pins %s to the version tested in Node',
    (_specifier, target) => {
      const match = /^npm:\/?((?:@[^/@]+\/)?[^/@]+)@(\d+\.\d+\.\d+)\/?$/.exec(target);
      expect(match, `${target} must pin an exact npm version`).not.toBeNull();
      const [, name = '', version = ''] = match ?? [];
      expect(installedVersion(name)).toBe(version);
    },
  );
});
