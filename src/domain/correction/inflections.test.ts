import { describe, expect, it } from 'vitest';
import { containsInflectedPhrase, sameWordFamily } from './inflections.ts';

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
    ["manager's", 'manager'],
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
  ])('keeps %s and %s apart', (a, b) => {
    expect(sameWordFamily(a, b)).toBe(false);
  });

  it('still compares a non-inflected word with itself', () => {
    expect(sameWordFamily('news', 'news')).toBe(true);
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

  it('does not match part of a word', () => {
    expect(containsInflectedPhrase('Pense au temps de la phrase', 'the')).toBe(false);
    expect(containsInflectedPhrase("Qu'on utilise avec un jour", 'on')).toBe(false);
  });

  it('never contains an empty phrase', () => {
    expect(containsInflectedPhrase('anything', '')).toBe(false);
    expect(containsInflectedPhrase('anything', ' ?! ')).toBe(false);
  });
});
