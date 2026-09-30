import { describe, expect, it } from 'vitest';
import { shuffled } from './shuffle.ts';

describe('shuffled', () => {
  it('keeps every item, and gives the same order for the same seed', () => {
    const items = ['a', 'b', 'c', 'd'];
    const once = shuffled(items, 'tense-future/s2/01');
    expect([...once].sort()).toEqual(items);
    expect(shuffled(items, 'tense-future/s2/01')).toEqual(once);
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });

  it('does not always leave the first item first', () => {
    const firsts = new Set(
      Array.from(
        { length: 40 },
        (_, index) => shuffled(['a', 'b', 'c'], `seed-${String(index)}`)[0],
      ),
    );
    expect(firsts.size).toBe(3);
  });
});
