import { describe, expect, it } from 'vitest';
import { formatReferences, notionReferencesSchema, type NotionReference } from './references.ts';

const red = (...units: number[]): NotionReference => ({ book: 'essential', units });
const blue = (...units: number[]): NotionReference => ({ book: 'grammar-in-use', units });

describe('formatReferences', () => {
  it('shows one unit, two units, and a range of three units or more', () => {
    expect(formatReferences([red(16)])).toBe('Pour aller plus loin : livre rouge, unité 16');
    expect(formatReferences([red(15, 17)])).toBe(
      'Pour aller plus loin : livre rouge, unités 15 et 17',
    );
    expect(formatReferences([red(3, 4)])).toBe('Pour aller plus loin : livre rouge, unités 3 et 4');
    expect(formatReferences([red(5, 6, 7)])).toBe(
      'Pour aller plus loin : livre rouge, unités 5 à 7',
    );
  });

  it('puts the red book first, and separates the books with a semicolon', () => {
    expect(formatReferences([blue(19, 20, 21, 22, 23, 25), red(26, 27, 28, 29)])).toBe(
      'Pour aller plus loin : livre rouge, unités 26 à 29 ; livre bleu, unités 19 à 23 et 25',
    );
  });

  it('lists several groups with commas, the last one with "et"', () => {
    expect(formatReferences([red(10, 11, 12, 24)])).toBe(
      'Pour aller plus loin : livre rouge, unités 10 à 12 et 24',
    );
    expect(formatReferences([red(1, 5, 9)])).toBe(
      'Pour aller plus loin : livre rouge, unités 1, 5 et 9',
    );
  });

  it('shows nothing without references', () => {
    expect(formatReferences([])).toBeNull();
  });
});

describe('notionReferencesSchema', () => {
  it('accepts at most one sorted reference per book, within the book', () => {
    expect(notionReferencesSchema.safeParse([red(16, 94), blue(111)]).success).toBe(true);
    expect(notionReferencesSchema.safeParse([red(16), red(94)]).success).toBe(false);
    expect(notionReferencesSchema.safeParse([red(94, 16)]).success).toBe(false);
    expect(notionReferencesSchema.safeParse([red(16, 16)]).success).toBe(false);
    expect(notionReferencesSchema.safeParse([red(115)]).success).toBe(false);
    expect(notionReferencesSchema.safeParse([blue(146)]).success).toBe(false);
    expect(notionReferencesSchema.safeParse([red()]).success).toBe(false);
  });
});
