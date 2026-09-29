// Generated from shared/ai/pricing.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * Prices and cost of an AI call (COST-05, docs/ARCHITECTURE.md §10.1).
 *
 * Prices are in USD per million tokens, checked in Anthropic's documentation
 * on 2026-09-29 (D-009). Update them here if Anthropic changes them.
 *
 * Amounts are computed in millionths of a dollar and rounded up: the budget
 * (COST-06) may be overestimated by a millionth, never underestimated.
 */
import type { ModelId } from './models.ts';

export interface ModelPrice {
  readonly inputPerMillion: number;
  readonly outputPerMillion: number;
}

export const MODEL_PRICES: Readonly<Record<ModelId, ModelPrice>> = {
  'claude-haiku-4-5-20251001': { inputPerMillion: 1, outputPerMillion: 5 },
  'claude-sonnet-5': { inputPerMillion: 2, outputPerMillion: 10 },
};

/** Writing the prompt cache (5-minute TTL) costs 1.25 times the input price. */
export const CACHE_WRITE_MULTIPLIER = 1.25;
/** Reading the prompt cache costs a tenth of the input price. */
export const CACHE_READ_MULTIPLIER = 0.1;

/** Token counts reported by the API for one call. */
export interface TokenUsage {
  /** Input tokens neither written to nor read from the cache. */
  readonly inputTokens: number;
  /** Output tokens, thinking included. */
  readonly outputTokens: number;
  readonly cacheCreationInputTokens: number;
  readonly cacheReadInputTokens: number;
}

/** Rounds a number of millionths of a dollar up, and converts it to dollars. */
function toUsd(microUsd: number): number {
  // The epsilon absorbs floating-point noise (0.1 × 3 = 0.30000000000000004).
  const rounded = Math.ceil(microUsd - 1e-9);
  return rounded > 0 ? rounded / 1_000_000 : 0;
}

/** Actual cost of a call, in USD (docs/ARCHITECTURE.md §10.1). */
export function costOfUsage(model: ModelId, usage: TokenUsage): number {
  const { inputPerMillion, outputPerMillion } = MODEL_PRICES[model];
  // A price per million tokens is also a price in millionths of a dollar per token.
  return toUsd(
    usage.inputTokens * inputPerMillion +
      usage.cacheCreationInputTokens * inputPerMillion * CACHE_WRITE_MULTIPLIER +
      usage.cacheReadInputTokens * inputPerMillion * CACHE_READ_MULTIPLIER +
      usage.outputTokens * outputPerMillion,
  );
}

/**
 * Highest possible cost of a call, reserved before it is made (D-016): every
 * input token priced as a cache write when the prefix is cached, and the
 * whole output ceiling used.
 */
export function maxCostOfCall(
  model: ModelId,
  call: { readonly inputTokens: number; readonly maxTokens: number; readonly cachePrefix: boolean },
): number {
  const { inputPerMillion, outputPerMillion } = MODEL_PRICES[model];
  const inputMultiplier = call.cachePrefix ? CACHE_WRITE_MULTIPLIER : 1;
  return toUsd(
    call.inputTokens * inputPerMillion * inputMultiplier + call.maxTokens * outputPerMillion,
  );
}

/**
 * Tokens added by the API around the prompt (message framing, and the system
 * instructions that describe the output schema). Deliberately generous.
 */
export const INPUT_OVERHEAD_TOKENS = 1_000;

/**
 * Upper estimate of the input tokens of a prompt, for the budget reservation
 * only: English and French prose average three to four characters per token,
 * and this counts one token for every two characters.
 */
export function estimateInputTokens(promptText: string): number {
  return Math.ceil(promptText.length / 2) + INPUT_OVERHEAD_TOKENS;
}
