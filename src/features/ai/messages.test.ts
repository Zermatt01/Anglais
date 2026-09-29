import { describe, expect, it } from 'vitest';
import { AI_ERROR_CODES } from '../../../shared/ai/protocol.ts';
import { formatCap, formatDay, formatUsd } from './format.ts';
import { aiErrorMessage } from './messages.ts';

describe('formatUsd and formatCap', () => {
  it('write amounts in French, never rounding a small cost to zero', () => {
    expect(formatUsd(9.87)).toBe('9,87 USD');
    expect(formatUsd(0)).toBe('0,00 USD');
    expect(formatUsd(0.0004)).toBe('0,0004 USD');
    expect(formatUsd(0.00013)).toBe('0,0001 USD');
    expect(formatCap(10)).toBe('10 USD');
    expect(formatCap(2.5)).toBe('2,5 USD');
  });
});

describe('formatDay', () => {
  it('writes the first of the month as "1er"', () => {
    expect(formatDay('2026-10-01')).toBe('1er octobre');
    expect(formatDay('2027-01-15')).toBe('15 janvier');
  });
});

describe('aiErrorMessage', () => {
  it('gives the message of docs/ARCHITECTURE.md §8 when the cap is reached (COST-06)', () => {
    expect(
      aiErrorMessage({
        code: 'budget_exceeded',
        budget: { usedUsd: 9.87, limitUsd: 10, resetsOn: '2026-10-01' },
      }),
    ).toBe(
      'Plafond mensuel de 10 USD atteint (9,87 USD utilisés). Les fonctions IA reprendront le 1er octobre. Tout le reste de l’app fonctionne.',
    );
  });

  it.each([...AI_ERROR_CODES, 'offline', 'signed_out', 'unreachable'] as const)(
    'has a message for %s',
    (code) => {
      expect(aiErrorMessage({ code }).length).toBeGreaterThan(20);
    },
  );
});
