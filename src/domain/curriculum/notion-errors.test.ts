import { describe, expect, it } from 'vitest';
import { isConsistentClassification, isNotionCategory } from './notion-errors.ts';

describe('isNotionCategory (D-093)', () => {
  it('puts the grammar of a tense, its questions and its own calques on the notion', () => {
    for (const category of [
      'temps_verbaux',
      'accord_sujet_verbe',
      'auxiliaires_questions_negations',
      'calques_du_francais',
    ] as const) {
      expect(isNotionCategory('tense-present-simple', category), category).toBe(true);
    }
  });

  it('keeps word order, prepositions and words off the notion, and every track not delivered', () => {
    for (const category of [
      'ordre_des_mots',
      'prepositions',
      'choix_lexical_collocations',
      'orthographe',
      'ponctuation',
    ] as const) {
      expect(isNotionCategory('tense-present-simple', category), category).toBe(false);
    }
    expect(isNotionCategory('nouns-articles', 'articles')).toBe(false);
  });
});

describe('isConsistentClassification (D-093)', () => {
  it('accepts a frequency adverb out of place off the notion, and a calque of the notion on it', () => {
    expect(
      isConsistentClassification('tense-present-simple', {
        category: 'ordre_des_mots',
        offNotion: true,
      }),
    ).toBe(true);
    expect(
      isConsistentClassification('tense-just-already-yet-still', {
        category: 'calques_du_francais',
        offNotion: false,
      }),
    ).toBe(true);
  });

  it('refuses the grammar of the tense off the notion, and word order on it', () => {
    expect(
      isConsistentClassification('tense-present-simple', {
        category: 'accord_sujet_verbe',
        offNotion: true,
      }),
    ).toBe(false);
    expect(
      isConsistentClassification('tense-present-simple', {
        category: 'ordre_des_mots',
        offNotion: false,
      }),
    ).toBe(false);
  });
});
