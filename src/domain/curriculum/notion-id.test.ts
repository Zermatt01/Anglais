import { describe, expect, it } from 'vitest';
import { notionIdSchema } from './notion-id.ts';

describe('notionIdSchema', () => {
  it.each([
    'tense-present-continuous',
    'tense-just-already-yet-still',
    'tense-present-perfect-vs-past-simple',
    'verbs-say-tell',
    'questions-there-is-it',
    'patterns-ing-or-to',
    'nouns-countable-uncountable',
    'adj-word-order',
    'prep-phrasal-verbs-basics',
    'clauses-wish',
    'vocab-false-friends',
  ])('accepts %s (PEDAGOGY §11.2)', (id) => {
    expect(notionIdSchema.safeParse(id).success).toBe(true);
  });

  it.each([
    '',
    'tense',
    'tense-',
    'Tense-past-simple',
    'tense_past_simple',
    'traps-articles',
    'tense-past--simple',
    'tense-past-simple ',
  ])('rejects %j', (id) => {
    expect(notionIdSchema.safeParse(id).success).toBe(false);
  });
});
