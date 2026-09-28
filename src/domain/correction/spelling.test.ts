import { describe, expect, it } from 'vitest';
import { CONTEXT_DEPENDENT_SPELLINGS, canonicalSpelling } from './spelling.ts';

describe('canonicalSpelling', () => {
  it.each([
    ['organise', 'organize'],
    ['organised', 'organized'],
    ['organises', 'organizes'],
    ['organising', 'organizing'],
    ['organiser', 'organizer'],
    ['organisation', 'organization'],
    ['organisations', 'organizations'],
    ['organisational', 'organizational'],
    ['prioritise', 'prioritize'],
    ['realised', 'realized'],
    ['recognise', 'recognize'],
    ['apologise', 'apologize'],
    ['criticised', 'criticized'],
    ['optimisation', 'optimization'],
    ['analyse', 'analyze'],
    ['analysed', 'analyzed'],
    ['analysing', 'analyzing'],
    ['colour', 'color'],
    ['colours', 'colors'],
    ['favourite', 'favorite'],
    ['behaviour', 'behavior'],
    ['behavioural', 'behavioral'],
    ['neighbourhood', 'neighborhood'],
    ['labourer', 'laborer'],
    ['honourable', 'honorable'],
    ['centre', 'center'],
    ['metres', 'meters'],
    ['travelled', 'traveled'],
    ['cancelling', 'canceling'],
    ['modelling', 'modeling'],
    ['enrolment', 'enrollment'],
    ['fulfil', 'fulfill'],
    ['defence', 'defense'],
    ['practised', 'practiced'],
    ['programme', 'program'],
    ['catalogue', 'catalog'],
    ['judgement', 'judgment'],
    ['grey', 'gray'],
    ['learnt', 'learned'],
    ['spelt', 'spelled'],
    ['towards', 'toward'],
  ])('maps %s to %s', (british, canonical) => {
    expect(canonicalSpelling(british)).toBe(canonical);
    expect(canonicalSpelling(canonical)).toBe(canonical);
  });

  it.each([
    // Spelt "-ise" in both varieties: the "-ize" form is a misspelling.
    ['exercise', 'exercize'],
    ['surprise', 'surprize'],
    ['advertise', 'advertize'],
    ['advise', 'advize'],
    ['compromise', 'compromize'],
    ['promise', 'promize'],
    ['supervise', 'supervize'],
    ['revise', 'revize'],
    // Different words.
    ['prise', 'prize'],
    ['four', 'for'],
    ['our', 'or'],
    // British English drops the "u" here too: these are misspellings.
    ['humourous', 'humorous'],
    ['vigourous', 'vigorous'],
    ['honourary', 'honorary'],
  ])('never merges %s with %s', (word, other) => {
    expect(canonicalSpelling(word)).not.toBe(canonicalSpelling(other));
  });

  it('never merges spellings that depend on the grammatical role', () => {
    for (const [british, american] of CONTEXT_DEPENDENT_SPELLINGS) {
      expect(canonicalSpelling(british)).not.toBe(canonicalSpelling(american));
    }
    // "analyses" is also the plural of "analysis".
    expect(canonicalSpelling('analyses')).toBe('analyses');
  });

  it('leaves unrelated words unchanged', () => {
    for (const word of ['market', 'analysis', 'size', 'rise', 'raise', 'wise', 'exercise']) {
      expect(canonicalSpelling(word)).toBe(word);
    }
  });
});
