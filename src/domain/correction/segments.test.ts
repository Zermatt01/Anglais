import { describe, expect, it } from 'vitest';
import { locateSegment } from './segments.ts';

describe('locateSegment', () => {
  const text = 'I work here since 2020 and I work hard.';

  it('finds a unique segment', () => {
    expect(locateSegment(text, 'since 2020')).toEqual({ start: 12, end: 22 });
  });

  it('keeps the occurrence closest to the proposed start', () => {
    expect(locateSegment(text, 'I work', 0)).toEqual({ start: 0, end: 6 });
    expect(locateSegment(text, 'I work', 25)).toEqual({ start: 27, end: 33 });
  });

  it('matches typographic and plain apostrophes and quotes', () => {
    const typographic = 'It’s a “good” idea';
    expect(locateSegment(typographic, "It's")).toEqual({ start: 0, end: 4 });
    expect(locateSegment(typographic, '"good"')).toEqual({ start: 7, end: 13 });
    expect(locateSegment("It's fine", 'It’s')).toEqual({ start: 0, end: 4 });
  });

  it('returns null when the segment is absent or empty', () => {
    expect(locateSegment(text, 'since 2019')).toBeNull();
    expect(locateSegment(text, '')).toBeNull();
  });

  it('is case-sensitive, as the model must quote the text exactly', () => {
    expect(locateSegment(text, 'i work')).toBeNull();
  });
});
