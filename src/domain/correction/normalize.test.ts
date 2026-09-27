import { describe, expect, it } from 'vitest';
import { normalizeText, tokenize } from './normalize.ts';

describe('normalizeText', () => {
  it('ignores case, spacing and final punctuation', () => {
    expect(normalizeText('  Where do   you WORK? ')).toBe('where do you work');
    expect(normalizeText('I agree.')).toBe(normalizeText('i agree'));
  });

  it('ignores non-significant punctuation inside the sentence', () => {
    expect(normalizeText('However, rates rose; we waited: "no change"!')).toBe(
      'however rates rose we waited no change',
    );
    expect(normalizeText('(yes)')).toBe('yes');
  });

  it('unifies typographic apostrophes with the plain apostrophe', () => {
    expect(normalizeText('I don’t know')).toBe("i don't know");
    expect(normalizeText('I don‘t know')).toBe("i don't know");
    expect(normalizeText('I donʼt know')).toBe("i don't know");
    expect(normalizeText('I don`t know')).toBe("i don't know");
  });

  it('keeps apostrophes inside words and drops them at word edges', () => {
    expect(tokenize("the company's results")).toEqual(['the', "company's", 'results']);
    expect(tokenize("at five o'clock")).toEqual(['at', 'five', "o'clock"]);
    expect(tokenize("the students' results")).toEqual(['the', 'students', 'results']);
    expect(tokenize("'cause")).toEqual(['cause']);
  });

  it('reads hyphens and dashes as word separators', () => {
    expect(normalizeText('a three-year plan')).toBe('a three year plan');
    expect(normalizeText('a three–year plan')).toBe('a three year plan');
    expect(normalizeText('well-known — really')).toBe('well known really');
  });

  it('closes a few compounds whose hyphen is optional', () => {
    expect(normalizeText('Send an E-mail')).toBe('send an email');
    expect(normalizeText('two e-mails')).toBe('two emails');
    expect(normalizeText('on-line')).toBe('online');
    expect(normalizeText('co-operate')).toBe('cooperate');
  });

  it('removes thousands separators but keeps decimal points', () => {
    expect(normalizeText('I earn 6,000 francs')).toBe('i earn 6000 francs');
    expect(normalizeText('1,000,000 users')).toBe('1000000 users');
    expect(normalizeText('Rates rose by 6.5%.')).toBe('rates rose by 6.5 %');
    expect(normalizeText('6.5')).not.toBe(normalizeText('65'));
  });

  it('keeps currency signs as separate tokens', () => {
    expect(tokenize('$10 or £8 or 9€')).toEqual(['$', '10', 'or', '£', '8', 'or', '9', '€']);
  });

  it('keeps accented letters and applies Unicode compatibility normalization', () => {
    expect(normalizeText('Café')).toBe('café');
    expect(normalizeText('Café')).toBe('café');
    expect(normalizeText('ﬁnance')).toBe('finance');
  });

  it('returns an empty string when there is nothing to compare', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText(' ?! ... ')).toBe('');
  });
});
