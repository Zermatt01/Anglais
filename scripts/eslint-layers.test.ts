// @vitest-environment node
/**
 * Checks the layer rules of eslint.layers.ts (docs/ARCHITECTURE.md §3): probe
 * code is linted as if it lived in each layer. Type-aware linting needs files
 * that exist on disk, so the rules are run here with the TypeScript parser only;
 * a separate test checks that the real configuration applies the same rules.
 */
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { layerConfigs } from '../eslint.layers.ts';

const LAYER_RULE = 'layers/layer-imports';

const CHECKED_RULES = [
  LAYER_RULE,
  'no-restricted-imports',
  'no-restricted-globals',
  'no-restricted-properties',
  'no-restricted-syntax',
] as const;

const layersOnly = new ESLint({
  cwd: process.cwd(),
  overrideConfigFile: true,
  overrideConfig: [
    { files: ['**/*.{ts,tsx}'], languageOptions: { parser: tseslint.parser } },
    ...layerConfigs,
  ],
});

const realConfiguration = new ESLint({ cwd: process.cwd() });

const effectiveConfig = z.object({ rules: z.record(z.string(), z.unknown()) });

/** Rules reported for `code` linted at `filePath`; fails on a parsing error. */
async function violations(filePath: string, code: string): Promise<string[]> {
  const [result] = await layersOnly.lintText(code, { filePath });
  const messages = result?.messages ?? [];
  const fatal = messages.find((message) => message.fatal === true);
  if (fatal) throw new Error(fatal.message);
  return messages.map((message) => message.ruleId ?? '');
}

const importOf = (source: string) => `import * as probe from '${source}';\nexport { probe };\n`;

describe('layer rules (docs/ARCHITECTURE.md §3)', () => {
  it.each([
    'src/domain/cards/probe.ts',
    'src/domain/srs/probe.ts',
    'src/data/probe.ts',
    'src/services/storage/probe.ts',
    'src/content/probe.ts',
    'src/ui/probe.tsx',
    'src/features/home/probe.tsx',
    'src/app/probe.tsx',
  ])('are applied unchanged by the real configuration to %s', async (filePath) => {
    const real = effectiveConfig.parse(await realConfiguration.calculateConfigForFile(filePath));
    const expected = effectiveConfig.parse(await layersOnly.calculateConfigForFile(filePath));
    expect(real.rules[LAYER_RULE]).toBeDefined();
    for (const rule of CHECKED_RULES) {
      expect(real.rules[rule]).toEqual(expected.rules[rule]);
    }
  });

  it.each([
    ['src/domain/cards/probe.ts', '../../data/database.ts'],
    ['src/domain/cards/probe.ts', '../../features/probe.tsx'],
    ['src/domain/probe.ts', '../ui/probe.tsx'],
    ['src/domain/probe.ts', '../content/probe.ts'],
    ['src/domain/probe.ts', '../services/probe.ts'],
    ['src/domain/probe.ts', 'react'],
    ['src/domain/probe.ts', 'react/jsx-runtime'],
    ['src/domain/probe.ts', 'dexie'],
    ['src/domain/cards/probe.ts', 'ts-fsrs'],
    ['src/data/probe.ts', '../features/probe.tsx'],
    ['src/data/probe.ts', 'react'],
    ['src/services/storage/probe.ts', '../../ui/probe.tsx'],
    ['src/content/probe.ts', '../data/database.ts'],
    ['src/ui/probe.tsx', '../data/database.ts'],
    ['src/ui/probe.tsx', 'dexie-react-hooks'],
    ['src/features/home/probe.tsx', '../../app/probe.tsx'],
    ['src/features/home/probe.tsx', 'dexie'],
    ['src/features/home/probe.tsx', 'ts-fsrs'],
    // Paths spelt differently still resolve to the forbidden layer (review of phase 1).
    ['src/domain/cards/probe.ts', '../.././features/home/HomePage.tsx'],
    ['src/domain/cards/probe.ts', '../../domain/../data/database.ts'],
    ['src/domain/cards/probe.ts', './../../data/database.ts'],
    ['src/domain/probe.ts', '/src/data/database.ts'],
  ])('refuse in %s an import of %s', async (filePath, source) => {
    expect(await violations(filePath, importOf(source))).toEqual([LAYER_RULE]);
  });

  it.each(['src/app/probe.tsx', 'src/domain/probe.ts', 'src/domain/srs/probe.ts'])(
    'refuse the Anthropic SDK in %s, with two independent rules',
    async (filePath) => {
      expect((await violations(filePath, importOf('@anthropic-ai/sdk'))).sort()).toEqual([
        LAYER_RULE,
        'no-restricted-imports',
      ]);
    },
  );

  it.each([
    ['re-exports', "export * from '../../data/database.ts';"],
    ['named re-exports', "export { createDatabase } from '../../data/database.ts';"],
    [
      'type imports',
      "import type { AppDatabase } from '../../data/database.ts';\nexport type T = AppDatabase;",
    ],
    ['dynamic imports', "export const load = () => import('../../features/home/HomePage.tsx');"],
    ['dynamic imports of packages', "export const load = () => import('react');"],
    [
      'dynamic imports in a template',
      'export const load = () => import(`../../data/database.ts`);',
    ],
    ['type-level imports', "export type T = typeof import('../../data/database.ts');"],
    // Counter-review of phase 1.
    [
      'type import-require',
      "import type database = require('../../data/database.ts');\nexport type T = typeof database;",
    ],
    [
      'import-require',
      "import database = require('../../features/home/HomePage.tsx');\nexport const x = database;",
    ],
  ])('check %s too (review of phase 1)', async (_kind, code) => {
    expect(await violations('src/domain/cards/probe.ts', code)).toEqual([LAYER_RULE]);
  });

  it('refuse a dynamic import whose path is computed', async () => {
    const code = "const name = 'x';\nexport const load = () => import(`../${name}.ts`);";
    expect(await violations('src/domain/probe.ts', code)).toEqual([LAYER_RULE]);
  });

  it.each([
    ['src/domain/srs/probe.ts', 'ts-fsrs'],
    ['src/domain/cards/probe.ts', '../srs/state.ts'],
    ['src/domain/cards/probe.ts', './content.ts'],
    ['src/domain/cards/probe.ts', 'zod'],
    ['src/data/probe.ts', '../domain/primitives.ts'],
    ['src/data/probe.ts', 'dexie'],
    ['src/services/storage/probe.ts', '../../data/database.ts'],
    ['src/content/probe.ts', '../domain/primitives.ts'],
    ['src/ui/probe.tsx', '../domain/taxonomy.ts'],
    ['src/features/home/probe.tsx', '../../data/database.ts'],
    ['src/features/home/probe.tsx', 'dexie-react-hooks'],
    ['src/app/probe.tsx', '../features/home/probe.tsx'],
    ['src/app/probe.tsx', '/src/data/database.ts'],
  ])('allow in %s an import of %s', async (filePath, source) => {
    expect(await violations(filePath, importOf(source))).toEqual([]);
  });

  it('allow import-require within the rules', async () => {
    const code =
      "import type database = require('../../data/database.ts');\nexport type T = typeof database;";
    expect(await violations('src/features/home/probe.ts', code)).toEqual([]);
  });

  it('allow dynamic imports within the rules', async () => {
    const code = "export const load = () => import('../features/home/HomePage.tsx');";
    expect(await violations('src/app/probe.tsx', code)).toEqual([]);
  });

  it('keep the domain free of implicit clocks, randomness, network and storage', async () => {
    const code = [
      'export const a = Date.now();',
      'export const b = new Date();',
      'export const c = Math.random();',
      "export const d = fetch('/x');",
      "export const e = localStorage.getItem('x');",
      'export const f = new Date(0);',
      'export const g = Date.UTC(2026, 0, 1);',
    ].join('\n');
    expect(await violations('src/domain/probe.ts', code)).toEqual([
      'no-restricted-properties',
      'no-restricted-syntax',
      'no-restricted-properties',
      'no-restricted-globals',
      'no-restricted-globals',
    ]);
  });

  it('do not restrict the clock outside the domain', async () => {
    expect(await violations('src/data/probe.ts', 'export const a = Date.now();')).toEqual([]);
  });
});
