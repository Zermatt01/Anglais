import { describe, expect, it } from 'vitest';
import { daySchema, epochMsSchema, nextUpdatedAt, visibleTextSchema } from './primitives.ts';

describe('nextUpdatedAt', () => {
  it('uses the current time for a new document', () => {
    expect(nextUpdatedAt(null, 1_000)).toBe(1_000);
  });

  it('uses the current time when it is later than the previous value', () => {
    expect(nextUpdatedAt(1_000, 5_000)).toBe(5_000);
  });

  it('stays strictly increasing when the clock does not move or goes backwards', () => {
    expect(nextUpdatedAt(1_000, 1_000)).toBe(1_001);
    expect(nextUpdatedAt(1_000, 400)).toBe(1_001);
  });
});

describe('primitive schemas', () => {
  it('validates epoch milliseconds', () => {
    expect(epochMsSchema.safeParse(0).success).toBe(true);
    expect(epochMsSchema.safeParse(1.5).success).toBe(false);
    expect(epochMsSchema.safeParse(-1).success).toBe(false);
  });

  it('validates local days', () => {
    expect(daySchema.safeParse('2026-09-27').success).toBe(true);
    expect(daySchema.safeParse('2026-9-27').success).toBe(false);
    expect(daySchema.safeParse('2026-02-30').success).toBe(false);
  });

  it('requires visible text without trimming it', () => {
    expect(visibleTextSchema.parse('  keep spaces ')).toBe('  keep spaces ');
    expect(visibleTextSchema.safeParse('   ').success).toBe(false);
    expect(visibleTextSchema.safeParse('').success).toBe(false);
  });
});
