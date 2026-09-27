import { describe, expect, it } from 'vitest';
import { canonicalSpelling } from './spelling.ts';

describe('canonicalSpelling', () => {
  it.each([
    ['organise', 'organize'],
    ['organised', 'organized'],
    ['organising', 'organizing'],
    ['organisation', 'organization'],
    ['organisations', 'organizations'],
    ['organisational', 'organizational'],
    ['prioritise', 'prioritize'],
    ['realised', 'realized'],
    ['apologise', 'apologize'],
    ['analyse', 'analyze'],
    ['analysed', 'analyzed'],
    ['analysing', 'analyzing'],
    ['colour', 'color'],
    ['colours', 'colors'],
    ['favourite', 'favorite'],
    ['behaviour', 'behavior'],
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
    ['licence', 'license'],
    ['practise', 'practice'],
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

  it('never merges two different short words', () => {
    // Pairs that differ by one letter but are different words.
    expect(canonicalSpelling('four')).toBe('four');
    expect(canonicalSpelling('our')).toBe('our');
    expect(canonicalSpelling('hour')).toBe('hour');
    expect(canonicalSpelling('your')).toBe('your');
    expect(canonicalSpelling('prise')).not.toBe(canonicalSpelling('prize'));
    expect(canonicalSpelling('rise')).toBe('rise');
    expect(canonicalSpelling('raise')).toBe('raise');
    expect(canonicalSpelling('arise')).toBe('arise');
    expect(canonicalSpelling('wise')).toBe('wise');
  });

  it('rewrites other -ise words identically on both sides, which is harmless', () => {
    expect(canonicalSpelling('promise')).toBe(canonicalSpelling('promise'));
    expect(canonicalSpelling('exercise')).toBe('exercize');
  });

  it('leaves unrelated words unchanged', () => {
    expect(canonicalSpelling('market')).toBe('market');
    expect(canonicalSpelling('analysis')).toBe('analysis');
    expect(canonicalSpelling('size')).toBe('size');
  });
});
