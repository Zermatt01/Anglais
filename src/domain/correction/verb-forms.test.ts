import { describe, expect, it } from 'vitest';
import { isVerbForm, type VerbFormRole } from './verb-forms.ts';
import { IRREGULAR_VERBS, REGULAR_VERBS } from './word-families.ts';

describe('verb forms by role (D-088)', () => {
  it.each([
    ['work', 'base'],
    ['works', 'third'],
    ['worked', 'past'],
    ['worked', 'participle'],
    ['working', 'ing'],
    ['went', 'past'],
    ['gone', 'participle'],
    ['came', 'past'],
    ['come', 'participle'],
    ['beat', 'past'],
    ['beaten', 'participle'],
    ['cut', 'past'],
    ['cut', 'participle'],
    ['meant', 'past'],
    ['got', 'participle'],
    ['gotten', 'participle'],
    ['been', 'participle'],
    ['was', 'past'],
    ['had', 'participle'],
    ['practise', 'base'],
    ['practises', 'third'],
  ] as const)('reads "%s" as a form of role %s', (word, role) => {
    expect(isVerbForm(word, role)).toBe(true);
  });

  it.each([
    ['came', 'participle'],
    ['beaten', 'past'],
    ['gone', 'past'],
    ['went', 'participle'],
    ['meant', 'third'],
    ['is', 'third'],
    ['work', 'past'],
    ['need', 'past'],
    ['thing', 'ing'],
    ['something', 'ing'],
    ['morning', 'ing'],
    ['red', 'past'],
    ['blorked', 'past'],
    ['report', 'third'],
  ] as const)('never reads "%s" as a form of role %s', (word, role) => {
    expect(isVerbForm(word, role)).toBe(false);
  });

  it('never reads as -ing forms those that are mostly adjectives after "be" (D-090)', () => {
    for (const word of ['missing', 'misleading', 'promising', 'upsetting', 'worrying']) {
      expect(isVerbForm(word, 'ing'), word).toBe(false);
    }
  });

  it('reads the base, the past and the -ing form of every family', () => {
    const adjectives = new Set(['miss', 'mislead', 'promise', 'upset', 'worry']);
    for (const family of [...IRREGULAR_VERBS, ...REGULAR_VERBS]) {
      const [base = '', ...others] = family.split(' ');
      expect(isVerbForm(base, 'base'), family).toBe(true);
      const roles: readonly VerbFormRole[] = adjectives.has(base) ? ['past'] : ['past', 'ing'];
      for (const role of roles) {
        expect(
          [base, ...others].some((form) => isVerbForm(form, role)),
          `${family}: ${role}`,
        ).toBe(true);
      }
    }
  });
});
