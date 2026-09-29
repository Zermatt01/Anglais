// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { MODELS } from './models.ts';
import {
  costOfUsage,
  estimateInputTokens,
  INPUT_OVERHEAD_TOKENS,
  maxCostOfCall,
  MODEL_PRICES,
} from './pricing.ts';

const noTokens = {
  inputTokens: 0,
  outputTokens: 0,
  cacheCreationInputTokens: 0,
  cacheReadInputTokens: 0,
};

describe('model prices (D-009)', () => {
  it('match the prices checked in the documentation', () => {
    expect(MODEL_PRICES[MODELS.fast]).toEqual({ inputPerMillion: 1, outputPerMillion: 5 });
    expect(MODEL_PRICES[MODELS.capable]).toEqual({ inputPerMillion: 2, outputPerMillion: 10 });
  });
});

describe('costOfUsage', () => {
  it('prices input and output tokens', () => {
    // 1 000 × 2 + 500 × 10 = 7 000 millionths of a dollar.
    expect(
      costOfUsage(MODELS.capable, { ...noTokens, inputTokens: 1_000, outputTokens: 500 }),
    ).toBe(0.007);
  });

  it('prices cache writes at 1.25 and cache reads at 0.1 times the input price', () => {
    // Order of magnitude of docs/ARCHITECTURE.md §10.2: 3 500-token cached prefix,
    // 300 variable tokens, 700 output tokens.
    const write = costOfUsage(MODELS.capable, {
      inputTokens: 300,
      outputTokens: 700,
      cacheCreationInputTokens: 3_500,
      cacheReadInputTokens: 0,
    });
    const read = costOfUsage(MODELS.capable, {
      inputTokens: 300,
      outputTokens: 700,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 3_500,
    });
    expect(write).toBe(0.01635); // 600 + 8 750 + 7 000
    expect(read).toBe(0.0083); // 600 + 700 + 7 000
  });

  it('rounds up to the millionth of a dollar, without floating-point noise', () => {
    // 3 cache-read tokens of Haiku: 0.3 millionth, rounded up to 1.
    expect(costOfUsage(MODELS.fast, { ...noTokens, cacheReadInputTokens: 3 })).toBe(0.000001);
    // 0.1 × 30 = 3.0000000000000004 in floating point: still 3 millionths.
    expect(costOfUsage(MODELS.fast, { ...noTokens, cacheReadInputTokens: 30 })).toBe(0.000003);
    expect(costOfUsage(MODELS.fast, noTokens)).toBe(0);
  });
});

describe('maxCostOfCall (budget reservation, D-016)', () => {
  it('assumes the whole output ceiling is used', () => {
    expect(
      maxCostOfCall(MODELS.fast, { inputTokens: 1_000, maxTokens: 64, cachePrefix: false }),
    ).toBe(0.00132); // 1 000 × 1 + 64 × 5
  });

  it('prices every input token as a cache write when the prefix is cached', () => {
    expect(
      maxCostOfCall(MODELS.capable, { inputTokens: 4_000, maxTokens: 2_000, cachePrefix: true }),
    ).toBe(0.03); // 4 000 × 2 × 1.25 + 2 000 × 10
  });

  it('is never below the cost of a call that stays within the estimate', () => {
    const usage = {
      inputTokens: 200,
      outputTokens: 64,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
    };
    expect(
      maxCostOfCall(MODELS.fast, { inputTokens: 200, maxTokens: 64, cachePrefix: false }),
    ).toBeGreaterThanOrEqual(costOfUsage(MODELS.fast, usage));
  });
});

describe('estimateInputTokens', () => {
  it('counts one token for every two characters, plus a generous overhead', () => {
    expect(estimateInputTokens('')).toBe(INPUT_OVERHEAD_TOKENS);
    expect(estimateInputTokens('abc')).toBe(INPUT_OVERHEAD_TOKENS + 2);
  });

  it('stays above the real count of ordinary prose (about four characters per token)', () => {
    const prose = 'I have been working on the quarterly report since Monday. '.repeat(20);
    expect(estimateInputTokens(prose)).toBeGreaterThan(prose.length / 4);
  });
});
