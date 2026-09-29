import { describe, expect, it } from 'vitest';
import { containsInflectedPhrase, sameWordFamily } from './inflections.ts';
import { canonicalSpelling } from './spelling.ts';
import { WORD_FAMILIES } from './word-families.ts';

describe('WORD_FAMILIES', () => {
  it('lists distinct lowercase forms, at least two per family', () => {
    for (const forms of WORD_FAMILIES) {
      expect(forms.length).toBeGreaterThanOrEqual(2);
      expect(new Set(forms).size).toBe(forms.length);
      for (const form of forms) expect(form).toMatch(/^[a-z]+$/);
    }
  });

  it('uses the canonical spelling of every form (answers are compared after it)', () => {
    for (const forms of WORD_FAMILIES) {
      for (const form of forms) expect(canonicalSpelling(form)).toBe(form);
    }
  });

  it('lists each family once', () => {
    const keys = WORD_FAMILIES.map((forms) => forms.join(' '));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('sameWordFamily', () => {
  it.each([
    ['meeting', 'meetings'],
    ['result', 'results'],
    ['company', 'companies'],
    ['watch', 'watches'],
    ['finish', 'finished'],
    ['raise', 'raised'],
    ['study', 'studied'],
    ['plan', 'planned'],
    ['work', 'working'],
    ['make', 'making'],
    ['run', 'running'],
    ['go', 'went'],
    ['go', 'gone'],
    ['went', 'gone'],
    ['make', 'made'],
    ['have', 'has'],
    ['lend', 'lent'],
    ['meet', 'meeting'],
    ['person', 'people'],
    ['good', 'better'],
    ['unite', 'united'],
    ["manager's", 'manager'],
    ["manager's", 'managers'],
  ])('relates %s and %s', (a, b) => {
    expect(sameWordFamily(a, b)).toBe(true);
    expect(sameWordFamily(b, a)).toBe(true);
  });

  it.each([
    ['on', 'one'],
    ['yet', 'yes'],
    ['for', 'four'],
    ['thing', 'the'],
    ['business', 'busines'],
    ['analysis', 'analysi'],
    ['sing', 'song'],
    ['report', 'reporter'],
    // Endings that only look like inflections (counter-review of phase 1).
    ['news', 'new'],
    ['economics', 'economic'],
    ['physics', 'physic'],
    ['series', 'sery'],
    ['species', 'specie'],
    ['means', 'mean'],
    ['evening', 'even'],
    ['morning', 'morn'],
    ['sometimes', 'sometime'],
    // No generic ending rule (D-058): distinct words stay apart.
    ['united', 'unit'],
    ['unite', 'units'],
    ['planet', 'plan'],
    ['during', 'dure'],
    ['caring', 'car'],
    // Related only through a third word: "found" is in both families.
    ['find', 'founded'],
    // Words missing from the list are only compared with themselves.
    ['frobnicate', 'frobnicated'],
    ['onboard', 'onboarded'],
  ])('keeps %s and %s apart', (a, b) => {
    expect(sameWordFamily(a, b)).toBe(false);
    expect(sameWordFamily(b, a)).toBe(false);
  });

  it('still compares a word missing from the list with itself', () => {
    expect(sameWordFamily('news', 'news')).toBe(true);
    expect(sameWordFamily('onboarded', 'onboarded')).toBe(true);
  });
});

describe('containsInflectedPhrase', () => {
  it('finds an answer given in another form', () => {
    expect(containsInflectedPhrase('We discuss meetings every Monday.', 'meeting')).toBe(true);
    expect(containsInflectedPhrase('Elle a déjà « finished » ?', 'finish')).toBe(true);
    expect(containsInflectedPhrase('Think of "go".', 'went')).toBe(true);
    expect(containsInflectedPhrase('She has not received them', "haven't received")).toBe(true);
  });

  it('finds an exact answer through contractions', () => {
    expect(containsInflectedPhrase("Use 'haven't' here", 'have not')).toBe(true);
    expect(containsInflectedPhrase('Pense à « yet » en fin de phrase', 'yet')).toBe(true);
  });

  it('needs every word of a longer answer, in order', () => {
    expect(containsInflectedPhrase('Pas « went » ici.', 'have gone')).toBe(false);
    expect(containsInflectedPhrase('received … not', 'not received')).toBe(false);
  });

  it('does not take a word ending in -s for a plural (counter-review of phase 1)', () => {
    expect(containsInflectedPhrase('New information reported on television', 'news')).toBe(false);
    expect(containsInflectedPhrase('The news is on television', 'news')).toBe(true);
  });

  it('does not take a longer word for a form of a shorter one (D-058)', () => {
    expect(containsInflectedPhrase('The United Nations', 'unit')).toBe(false);
    expect(containsInflectedPhrase('Our business unit', 'united')).toBe(false);
  });

  it('reads the parts of a hyphenated word, on the prudent side', () => {
    expect(containsInflectedPhrase('Send a follow-up e-mail', 'follow up')).toBe(true);
    expect(containsInflectedPhrase('Pense à « follow up »', 'follow-up')).toBe(true);
  });

  it('does not match part of a word', () => {
    expect(containsInflectedPhrase('Pense au temps de la phrase', 'the')).toBe(false);
    expect(containsInflectedPhrase("Qu'on utilise avec un jour", 'on')).toBe(false);
  });

  it('never contains an empty phrase', () => {
    expect(containsInflectedPhrase('anything', '')).toBe(false);
    expect(containsInflectedPhrase('anything', ' ?! ')).toBe(false);
  });
});
