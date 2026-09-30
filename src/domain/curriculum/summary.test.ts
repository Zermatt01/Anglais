import { describe, expect, it } from 'vitest';
import { notStartedProgress } from './engine.ts';
import type { NotionProgressValues } from './progress.ts';
import { notionCompletion, trackCompletion } from './summary.ts';

const at = (status: NotionProgressValues['status'], step: number): NotionProgressValues => ({
  ...notStartedProgress(0),
  status,
  step,
});

describe('notionCompletion', () => {
  it('counts the steps already passed', () => {
    expect(notionCompletion(null)).toBe(0);
    expect(notionCompletion(at('not_started', 1))).toBe(0);
    expect(notionCompletion(at('in_progress', 1))).toBe(0);
    expect(notionCompletion(at('in_progress', 3))).toBeCloseTo(0.4);
    expect(notionCompletion(at('to_consolidate', 4))).toBeCloseTo(0.6);
    expect(notionCompletion(at('acquired', 5))).toBe(1);
  });
});

describe('trackCompletion', () => {
  it('averages the notions, and is 0 for an empty track', () => {
    expect(trackCompletion([at('acquired', 5), null])).toBe(0.5);
    expect(trackCompletion([])).toBe(0);
  });
});
