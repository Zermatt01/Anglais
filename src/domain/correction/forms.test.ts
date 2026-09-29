import { describe, expect, it } from 'vitest';
import { answerForms, areEquivalent, readingsOf } from './forms.ts';

describe('areEquivalent', () => {
  it.each([
    ["I haven't finished yet", 'I have not finished yet'],
    ["I'm working on it", 'I am working on it'],
    ["He's already left", 'He has already left'],
    ["It's raining", 'It is raining'],
    ["I'd rather stay", 'I would rather stay'],
    ["I'd already left", 'I had already left'],
    ["We can't come", 'We cannot come'],
    ["We can't come", 'We can not come'],
    ['We cannot come', 'We can not come'],
    ["They won't sign", 'They will not sign'],
    ["Let's start", 'Let us start'],
    ['I’ve got two meetings', "I've got 2 meetings"],
    ['I have worked here for three years.', 'i have worked here for 3 years'],
    ['We analysed the data', 'We analyzed the data'],
    ['The colour of the logo', 'The color of the logo'],
    ['I learnt English at school', 'I learned English at school'],
    ["My manager's in the office", 'My manager is in the office'],
    ["Anna's not here yet", 'Anna is not here yet'],
    ["The report's already been sent", 'The report has already been sent'],
    ['I sent you an e-mail', 'I sent you an email'],
  ])('%s = %s', (a, b) => {
    expect(areEquivalent(a, b)).toBe(true);
    expect(areEquivalent(b, a)).toBe(true);
  });

  it.each([
    ['I have seen him yesterday', 'I saw him yesterday'],
    ['She work in a bank', 'She works in a bank'],
    ["The company's results", 'The company is results'],
    ['I work here since 2020', 'I have worked here since 2020'],
    ['Its a good idea', "It's a good idea"],
    ['for three years', 'for four years'],
    ['He is gone', 'He has gone'],
    // Misspellings are not regional variants (review of phase 1).
    ['I exercize daily', 'I exercise daily'],
    ['What a nice surprize', 'What a nice surprise'],
    // The plural noun "analyses" is not the verb "analyzes".
    ['The analyzes are complete', 'The analyses are complete'],
    ['She has a medical practise', 'She has a medical practice'],
    // A possessive followed by a noun never becomes a verb.
    ["The manager's meeting", 'The manager is meeting'],
    // "one" is also a pronoun.
    ['I prefer the blue one', 'I prefer the blue 1'],
    // A hyphen may change the word (D-058): the noun "follow-up", the verb "follow up".
    ['I will follow-up with the client', 'I will follow up with the client'],
    ['We signed a two-year contract', 'We signed a two year contract'],
  ])('%s ≠ %s', (a, b) => {
    expect(areEquivalent(a, b)).toBe(false);
  });

  it("matches an ambiguous 's through the right reading only", () => {
    // "He's gone" may be "He is gone" or "He has gone": both are accepted readings.
    expect(areEquivalent("He's gone", 'He has gone')).toBe(true);
    expect(areEquivalent("He's gone", 'He is gone')).toBe(true);
  });
});

describe('readingsOf', () => {
  it('bounds the number of readings of a heavily contracted answer', () => {
    const answer = Array.from({ length: 10 }, () => "he's").join(' ');
    expect(readingsOf(answer).length).toBeLessThanOrEqual(64);
    expect(answerForms(answer).size).toBeGreaterThan(1);
  });

  it('gives one empty reading for an empty text', () => {
    expect(readingsOf('')).toEqual([[]]);
  });
});
