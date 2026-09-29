// Dependency rules between the layers of src/ (docs/ARCHITECTURE.md §3):
//
//   features ──► ui
//      ├──────► domain ◄── data ◄── services
//      └──────► content (data validated by domain schemas)
//   app (shell) may import every layer.
//
// Outside src/: shared/ (the AI contract) and supabase/ (the Edge Function)
// import no layer of src/, and src/ imports neither the Edge Function nor the
// prompts of shared/ai (D-017).
//
// The local rule `layers/layer-imports` resolves every import path before
// deciding which layer it enters, so no spelling of a path escapes it
// ("../.././features/x", "../../domain/../data/x", "/src/data/x"). It checks
// static imports, `export … from`, dynamic `import()` (a computed path is
// refused), type-level `typeof import()` and `import x = require()`. Layer directory names are
// reserved: no subfolder may reuse them.
//
// This file is TypeScript so that tests can import it with types; Node loads it
// natively (type stripping) from eslint.config.js.
import path from 'node:path';
import type { ESLint, Linter, Rule } from 'eslint';
import { z } from 'zod';

const layerOptionsSchema = z.object({
  /** Name of the layer, for the messages. */
  layer: z.string(),
  /** Top-level directories of src/ that this layer must not import from. */
  layers: z.array(z.string()).default([]),
  /** Packages this layer must not import: exact names, or prefixes ending in `*`. */
  packages: z.array(z.string()).default([]),
});
type LayerOptions = z.infer<typeof layerOptionsSchema>;

/** The package pattern `source` falls under, if any. */
function forbiddenPackage(source: string, patterns: readonly string[]): string | null {
  for (const pattern of patterns) {
    if (pattern.endsWith('*')) {
      if (source.startsWith(pattern.slice(0, -1))) return pattern;
    } else if (source === pattern || source.startsWith(`${pattern}/`)) {
      return pattern;
    }
  }
  return null;
}

/** String value of a literal node (or of a template literal without expressions). */
function literalValue(node: unknown): string | null {
  if (typeof node !== 'object' || node === null || !('type' in node)) return null;
  if (node.type === 'Literal' && 'value' in node && typeof node.value === 'string') {
    return node.value;
  }
  if (
    node.type === 'TemplateLiteral' &&
    'expressions' in node &&
    Array.isArray(node.expressions) &&
    node.expressions.length === 0 &&
    'quasis' in node &&
    Array.isArray(node.quasis)
  ) {
    const quasi: unknown = node.quasis.at(0);
    if (typeof quasi === 'object' && quasi !== null && 'value' in quasi) {
      const { value } = quasi;
      if (typeof value === 'object' && value !== null && 'cooked' in value) {
        return typeof value.cooked === 'string' ? value.cooked : null;
      }
    }
  }
  return null;
}

const layerImportsRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce the dependency rules between the layers of src/.' },
    schema: [
      {
        type: 'object',
        properties: {
          layer: { type: 'string' },
          layers: { type: 'array', items: { type: 'string' } },
          packages: { type: 'array', items: { type: 'string' } },
        },
        required: ['layer'],
        additionalProperties: false,
      },
    ],
    messages: {
      layer: 'The {{layer}} layer must not import from {{target}} (docs/ARCHITECTURE.md §3).',
      package: 'The {{layer}} layer must not depend on {{name}} (docs/ARCHITECTURE.md §3).',
      computed:
        'Dynamic imports must use a literal path, so that the layer rules can check them (docs/ARCHITECTURE.md §3).',
    },
  },
  create(context) {
    const options: LayerOptions = layerOptionsSchema.parse(context.options[0]);
    const sourceRoot = path.resolve(context.cwd, 'src');

    function check(node: Rule.Node, source: string): void {
      if (source.startsWith('.') || source.startsWith('/')) {
        // "/src/…" is resolved from the project root, as Vite does.
        const target = source.startsWith('/')
          ? path.join(context.cwd, source)
          : path.resolve(path.dirname(context.filename), source);
        const relative = path.relative(sourceRoot, target);
        if (relative.startsWith('..') || path.isAbsolute(relative)) return;
        const [layer = ''] = relative.split(path.sep);
        if (options.layers.includes(layer)) {
          context.report({
            node,
            messageId: 'layer',
            data: { layer: options.layer, target: layer },
          });
        }
        return;
      }
      const name = forbiddenPackage(source, options.packages);
      if (name !== null) {
        context.report({ node, messageId: 'package', data: { layer: options.layer, name } });
      }
    }

    function checkLiteral(node: Rule.Node, source: unknown): void {
      const value = literalValue(source);
      if (value === null) context.report({ node, messageId: 'computed' });
      else check(node, value);
    }

    return {
      ImportDeclaration: (node) => {
        checkLiteral(node, node.source);
      },
      ExportNamedDeclaration: (node) => {
        if (node.source) checkLiteral(node, node.source);
      },
      ExportAllDeclaration: (node) => {
        checkLiteral(node, node.source);
      },
      ImportExpression: (node) => {
        checkLiteral(node, node.source);
      },
      // `typeof import('…')` in a type (typescript-eslint node).
      TSImportType: (node: Rule.Node) => {
        const argument: unknown = Reflect.get(node, 'argument');
        const literal: unknown =
          typeof argument === 'object' && argument !== null && 'literal' in argument
            ? argument.literal
            : argument;
        checkLiteral(node, literal);
      },
      // `import foo = require('…')` and `import type foo = require('…')`
      // (typescript-eslint node). `import foo = A.B` names no module: ignored.
      TSImportEqualsDeclaration: (node: Rule.Node) => {
        const reference: unknown = Reflect.get(node, 'moduleReference');
        if (
          typeof reference === 'object' &&
          reference !== null &&
          'type' in reference &&
          reference.type === 'TSExternalModuleReference' &&
          'expression' in reference
        ) {
          checkLiteral(node, reference.expression);
        }
      },
    };
  },
};

const layersPlugin: ESLint.Plugin = { rules: { 'layer-imports': layerImportsRule } };

function layerImports(options: z.input<typeof layerOptionsSchema>): Linter.RuleEntry {
  return ['error', options];
}

/** Security rule: the Anthropic API key lives only in the Supabase Edge Function. */
const ANTHROPIC = '@anthropic-ai/*';

const REACT = ['react', 'react-dom', 'react-router', 'dexie-react-hooks', 'virtual:*'];

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

const DOMAIN_LAYERS = ['app', 'features', 'ui', 'data', 'services', 'content'];
/** Every layer of src/: code outside src/ must import none of them. */
const SOURCE_LAYERS = [...DOMAIN_LAYERS, 'domain'];
const DOMAIN_PACKAGES = [ANTHROPIC, ...REACT, 'dexie', 'workbox-window'];

export const layerConfigs: Linter.Config[] = [
  {
    // Default for src/: only the spaced repetition adapter may use ts-fsrs (ARC-06),
    // only the data layer may use Dexie, nothing may use the Anthropic SDK.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { layers: layersPlugin },
    rules: {
      'layers/layer-imports': layerImports({
        layer: 'src',
        packages: [ANTHROPIC, 'ts-fsrs', 'dexie'],
      }),
      // Second barrier for the API key rule, independent of the local rule.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [ANTHROPIC],
              message:
                'AI calls go through the Supabase Edge Function proxy, never from the client.',
            },
            {
              group: ['**/supabase/**'],
              message: 'The client never imports the Edge Function code (docs/ARCHITECTURE.md §3).',
            },
            {
              group: ['**/shared/ai/prompts', '**/shared/ai/prompts/**'],
              message: 'Prompts are assembled by the Edge Function only (D-017).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'layers/layer-imports': layerImports({
        layer: 'domain',
        layers: DOMAIN_LAYERS,
        packages: [...DOMAIN_PACKAGES, 'ts-fsrs'],
      }),
      ...domainPurity,
    },
  },
  {
    files: ['src/domain/srs/**/*.{ts,tsx}'],
    rules: {
      'layers/layer-imports': layerImports({
        layer: 'domain',
        layers: DOMAIN_LAYERS,
        packages: DOMAIN_PACKAGES,
      }),
    },
  },
  {
    files: ['src/data/**/*.{ts,tsx}'],
    rules: {
      'layers/layer-imports': layerImports({
        layer: 'data',
        layers: ['app', 'features', 'ui', 'services', 'content'],
        packages: [ANTHROPIC, ...REACT, 'ts-fsrs', 'workbox-window'],
      }),
    },
  },
  {
    files: ['src/services/**/*.{ts,tsx}'],
    rules: {
      'layers/layer-imports': layerImports({
        layer: 'services',
        layers: ['app', 'features', 'ui', 'content'],
        packages: [ANTHROPIC, ...REACT, 'ts-fsrs', 'dexie'],
      }),
    },
  },
  {
    files: ['src/content/**/*.{ts,tsx}'],
    rules: {
      'layers/layer-imports': layerImports({
        layer: 'content',
        layers: ['app', 'features', 'ui', 'data', 'services'],
        packages: [ANTHROPIC, ...REACT, 'ts-fsrs', 'dexie'],
      }),
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'layers/layer-imports': layerImports({
        layer: 'ui',
        layers: ['app', 'features', 'data', 'services', 'content'],
        packages: [ANTHROPIC, 'ts-fsrs', 'dexie', 'dexie-react-hooks'],
      }),
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'layers/layer-imports': layerImports({
        layer: 'features',
        layers: ['app'],
        packages: [ANTHROPIC, 'ts-fsrs', 'dexie'],
      }),
    },
  },
  {
    // The AI contract, imported by the client and by the Edge Function: pure,
    // and free of the SDK, which would end up in the client bundle.
    files: ['shared/**/*.ts'],
    plugins: { layers: layersPlugin },
    rules: {
      'layers/layer-imports': layerImports({
        layer: 'shared',
        layers: SOURCE_LAYERS,
        packages: [ANTHROPIC, ...REACT, 'dexie', 'ts-fsrs', '@supabase/*'],
      }),
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/supabase/**'],
              message: 'shared/ must not depend on the Edge Function.',
            },
          ],
        },
      ],
      ...domainPurity,
    },
  },
  {
    // The Edge Function (Deno) never depends on the client application.
    files: ['supabase/**/*.ts'],
    plugins: { layers: layersPlugin },
    rules: {
      'layers/layer-imports': layerImports({
        layer: 'supabase',
        layers: SOURCE_LAYERS,
        packages: [...REACT, 'dexie', 'ts-fsrs'],
      }),
    },
  },
];
