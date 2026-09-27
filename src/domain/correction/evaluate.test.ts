import { describe, expect, it } from 'vitest';
import { evaluateAnswer } from './evaluate.ts';

const key = {
  accepted: ["I haven't received the results yet", 'I have not received the results yet'],
  knownErrors: ['I have not received yet the results', "I didn't receive the results yet"],
};

describe('evaluateAnswer', () => {
  it('accepts the canonical answer and its variants, whatever the case or punctuation', () => {
    expect(evaluateAnswer("I haven't received the results yet.", key)).toEqual({
      verdict: 'correct',
      matched: "I haven't received the results yet",
    });
    expect(evaluateAnswer('i HAVE NOT received the results yet', key).verdict).toBe('correct');
  });

  it('accepts a contracted or expanded form missing from the key', () => {
    const shortKey = { accepted: ['I have not received the results yet'] };
    expect(evaluateAnswer('I haven’t received the results yet', shortKey).verdict).toBe('correct');
  });

  it('accepts British and American spellings', () => {
    const spellingKey = { accepted: ['We need to prioritize the analysis'] };
    expect(evaluateAnswer('We need to prioritise the analysis', spellingKey).verdict).toBe(
      'correct',
    );
  });

  it('marks a known error as incorrect', () => {
    expect(evaluateAnswer('I have not received yet the results', key)).toEqual({
      verdict: 'incorrect',
      matched: 'I have not received yet the results',
    });
  });

  it('returns unknown, never incorrect, for an unexpected answer', () => {
    expect(evaluateAnswer("I still haven't got the results", key)).toEqual({
      verdict: 'unknown',
      matched: null,
    });
  });

  it('prefers correct when an answer matches both lists (content bug, NO-05)', () => {
    const buggyKey = { accepted: ['I agree'], knownErrors: ['I agree'] };
    expect(evaluateAnswer('I agree', buggyKey).verdict).toBe('correct');
  });

  it('returns unknown for an empty answer', () => {
    expect(evaluateAnswer('', key).verdict).toBe('unknown');
    expect(evaluateAnswer('  ... ', key).verdict).toBe('unknown');
  });

  it('returns unknown when the key has no accepted answer', () => {
    expect(evaluateAnswer('anything', { accepted: [] }).verdict).toBe('unknown');
  });
});
