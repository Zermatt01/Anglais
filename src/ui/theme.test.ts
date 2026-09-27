/**
 * Contrast of the colour tokens of theme.css, in both schemes (UI-04, WCAG 2.2):
 * 4.5:1 for text, 3:1 for graphical elements (correction marks, focus ring,
 * form control borders).
 */
import { describe, expect, it } from 'vitest';
import css from './theme.css?raw';

/** Light and dark values of every `--token: light-dark(#light, #dark)` declaration. */
const tokens = new Map(
  [...css.matchAll(/--([\w-]+):\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/gi)].map(
    (match) => [match[1] ?? '', { light: match[2] ?? '', dark: match[3] ?? '' }],
  ),
);

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => {
    const value = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const [red = 0, green = 0, blue = 0] = channels;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

function colour(token: string, scheme: 'light' | 'dark'): string {
  const value = tokens.get(token)?.[scheme];
  if (value === undefined) throw new Error(`Unknown colour token --${token}`);
  return value;
}

const TEXT_PAIRS: readonly (readonly [string, string])[] = [
  ['ink', 'paper'],
  ['ink', 'paper-raised'],
  ['ink-muted', 'paper'],
  ['ink-muted', 'paper-raised'],
  ['action', 'paper'],
  ['action', 'paper-raised'],
  ['action-strong', 'action-soft'],
  ['on-action', 'action'],
  ['on-action', 'action-strong'],
  ['success', 'paper-raised'],
  ['danger', 'paper-raised'],
  ['danger', 'paper'],
];

const GRAPHIC_PAIRS: readonly (readonly [string, string])[] = [
  ['mark-minor', 'paper-raised'],
  ['mark-medium', 'paper-raised'],
  ['mark-major', 'paper-raised'],
  ['mark-unnatural', 'paper-raised'],
  ['action', 'paper'],
  ['ink-muted', 'paper-raised'],
];

describe('theme colours (UI-04)', () => {
  it('define every colour token for both schemes, in a format this test checks', () => {
    expect(tokens.size).toBeGreaterThan(0);
    expect(tokens.size).toBe(css.match(/--[\w-]+:\s*light-dark\(/g)?.length);
  });

  for (const scheme of ['light', 'dark'] as const) {
    it.each(TEXT_PAIRS)(`${scheme}: text --%s on --%s reaches 4.5:1`, (text, background) => {
      expect(contrast(colour(text, scheme), colour(background, scheme))).toBeGreaterThanOrEqual(
        4.5,
      );
    });

    it.each(GRAPHIC_PAIRS)(`${scheme}: mark --%s on --%s reaches 3:1`, (mark, background) => {
      expect(contrast(colour(mark, scheme), colour(background, scheme))).toBeGreaterThanOrEqual(3);
    });
  }

  it('computes contrast like WCAG', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });
});
