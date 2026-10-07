// Generated from shared/ai/models.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * The only place where a model is chosen for a task (ARC-09), with its output
 * ceiling (COST-04), its thinking setting (D-012) and prompt caching (D-011).
 * Initial values: docs/ARCHITECTURE.md §10.2.
 */
import type { AiTaskName } from './tasks.ts';

export const MODELS = {
  /** Simple checks. Dated snapshot, so that the benchmark is reproducible (D-009). */
  fast: 'claude-haiku-4-5-20251001',
  /** Detailed correction, diagnosis and generation. */
  capable: 'claude-sonnet-5',
} as const;
export type ModelId = (typeof MODELS)[keyof typeof MODELS];

export const MODEL_IDS: readonly ModelId[] = Object.values(MODELS);

/**
 * - `off`: no thinking, sent explicitly (`{ type: 'disabled' }`): Sonnet 5
 *   thinks by default, and thinking tokens count in `max_tokens` (D-012);
 * - `{ effort }`: adaptive thinking at this effort. Sonnet 5 only: Haiku 4.5
 *   rejects the effort parameter.
 */
export type ThinkingSetting = 'off' | { readonly effort: 'low' | 'medium' | 'high' };

export interface TaskSettings {
  readonly model: ModelId;
  /** Output ceiling, thinking included (COST-04). */
  readonly maxTokens: number;
  readonly thinking: ThinkingSetting;
  /**
   * Whether the stable system prefix carries `cache_control` (D-011). Never
   * for Haiku 4.5, whose minimum cacheable prefix (4 096 tokens) is longer
   * than its prompts.
   */
  readonly cachePrefix: boolean;
}

export const TASK_SETTINGS = {
  // The expected output is `{"status":"ok"}`: a few tokens.
  'connection-check': { model: MODELS.fast, maxTokens: 64, thinking: 'off', cachePrefix: false },
  // Six exercises of about 200 tokens each, plus a short reasoning at low
  // effort (D-012, D-079). To be calibrated with real calls (phase 5).
  'generate-exercises': {
    model: MODELS.capable,
    maxTokens: 4_000,
    thinking: { effort: 'low' },
    cachePrefix: true,
  },
  // A journal entry with several errors needs about 1 500 tokens of output;
  // the rest leaves room for a short reasoning at low effort, which makes
  // false positives rarer (NO-05, D-012, D-083). To be calibrated with the
  // benchmark (phase 5).
  'correct-production': {
    model: MODELS.capable,
    maxTokens: 4_000,
    thinking: { effort: 'low' },
    cachePrefix: true,
  },
  // A verdict and one French sentence (CARD-05). Its prompt is far shorter
  // than Haiku's minimum cacheable prefix (D-011).
  'check-card-answer': {
    model: MODELS.fast,
    maxTokens: 300,
    thinking: 'off',
    cachePrefix: false,
  },
} as const satisfies Record<AiTaskName, TaskSettings>;
