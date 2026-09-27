// Dependency rules between the layers of src/ (docs/ARCHITECTURE.md §3):
//
//   features ──► ui
//      ├──────► domain ◄── data ◄── services
//      └──────► content (data validated by domain schemas)
//   app (shell) may import every layer.
//
// Relative imports are matched on their path: an import that climbs out of a
// layer (`../`) and enters a forbidden layer directory is refused. Layer
// directory names are therefore reserved: no subfolder may reuse them.
//
// ESLint replaces a rule's options instead of merging them, so every block
// repeats the Anthropic restriction through `restrictedImports`.
//
// This file is TypeScript so that tests can import it with types; Node loads it
// natively (type stripping) from eslint.config.js.
import type { Linter } from 'eslint';

type RestrictedPattern =
  | { readonly group: readonly string[]; readonly message: string }
  | { readonly regex: string; readonly message: string };

/** Security rule: the Anthropic API key lives only in the Supabase Edge Function. */
const noAnthropicSdk: RestrictedPattern = {
  group: ['@anthropic-ai/*'],
  message: 'AI calls go through the Supabase Edge Function proxy, never from the client.',
};

const REACT = ['react', 'react-dom', 'react-router', 'dexie-react-hooks', 'virtual:*'];

interface Forbidden {
  readonly layers?: readonly string[];
  readonly packages?: readonly string[];
}

function restrictedImports(
  layer: string,
  { layers = [], packages = [] }: Forbidden,
): Linter.RuleEntry {
  const patterns: RestrictedPattern[] = [noAnthropicSdk];
  if (layers.length > 0) {
    patterns.push({
      regex: `^(?:\\.\\./)+(?:${layers.join('|')})(?:/|$)`,
      message: `The ${layer} layer must not import from ${layers.join(', ')} (docs/ARCHITECTURE.md §3).`,
    });
  }
  if (packages.length > 0) {
    patterns.push({
      group: packages,
      message: `The ${layer} layer must not depend on this package (docs/ARCHITECTURE.md §3).`,
    });
  }
  return ['error', { patterns }];
}

const IMPLICIT_CLOCK = 'Pure domain logic receives the current time as a parameter.';

/** Rules that keep src/domain pure: no network, storage, browser or implicit clock. */
const domainPurity: Linter.RulesRecord = {
  'no-restricted-globals': [
    'error',
    ...[
      'fetch',
      'XMLHttpRequest',
      'indexedDB',
      'localStorage',
      'sessionStorage',
      'window',
      'document',
      'navigator',
    ].map((name) => ({
      name,
      message: 'src/domain is pure: no network, storage or browser access.',
    })),
  ],
  'no-restricted-properties': [
    'error',
    { object: 'Date', property: 'now', message: IMPLICIT_CLOCK },
    { object: 'Math', property: 'random', message: 'Pure domain logic must be deterministic.' },
  ],
  'no-restricted-syntax': [
    'error',
    {
      selector: "NewExpression[callee.name='Date'][arguments.length=0]",
      message: IMPLICIT_CLOCK,
    },
  ],
};

const DOMAIN_FORBIDDEN = {
  layers: ['app', 'features', 'ui', 'data', 'services', 'content'],
  packages: [...REACT, 'dexie', 'workbox-window'],
} satisfies Forbidden;

export const layerConfigs: Linter.Config[] = [
  {
    // Default for src/: only the spaced repetition adapter may use ts-fsrs (ARC-06),
    // only the data layer may use Dexie.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports('src', { packages: ['ts-fsrs', 'dexie'] }),
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports('domain', {
        ...DOMAIN_FORBIDDEN,
        packages: [...DOMAIN_FORBIDDEN.packages, 'ts-fsrs'],
      }),
      ...domainPurity,
    },
  },
  {
    files: ['src/domain/srs/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrictedImports('domain', DOMAIN_FORBIDDEN) },
  },
  {
    files: ['src/data/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports('data', {
        layers: ['app', 'features', 'ui', 'services', 'content'],
        packages: [...REACT, 'ts-fsrs', 'workbox-window'],
      }),
    },
  },
  {
    files: ['src/services/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports('services', {
        layers: ['app', 'features', 'ui', 'content'],
        packages: [...REACT, 'ts-fsrs', 'dexie'],
      }),
    },
  },
  {
    files: ['src/content/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports('content', {
        layers: ['app', 'features', 'ui', 'data', 'services'],
        packages: [...REACT, 'ts-fsrs', 'dexie'],
      }),
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports('ui', {
        layers: ['app', 'features', 'data', 'services', 'content'],
        packages: ['ts-fsrs', 'dexie', 'dexie-react-hooks'],
      }),
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports('features', {
        layers: ['app'],
        packages: ['ts-fsrs', 'dexie'],
      }),
    },
  },
];
