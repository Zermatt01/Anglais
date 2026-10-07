/**
 * Reviewed texts outside the notions: the questions of the journal (MOD-07)
 * and the texts of the error categories (TAX-02).
 */
import { describe, expect, it } from 'vitest';
import { countGaps } from '../domain/cards/content.ts';
import { ERROR_CATEGORIES } from '../domain/taxonomy.ts';
import { JOURNAL_QUESTIONS } from './journal.ts';
import { journalQuestionSchema } from './schema.ts';
import { CATEGORY_TEXTS } from './taxonomy.ts';

const balanced = (text: string) => (text.match(/_/g) ?? []).length % 2 === 0;

describe('journal questions (MOD-07)', () => {
  it('has at least twenty questions, numbered, valid and reviewed twice', () => {
    expect(JOURNAL_QUESTIONS.length).toBeGreaterThanOrEqual(20);
    JOURNAL_QUESTIONS.forEach((question, index) => {
      expect(journalQuestionSchema.parse(question)).toEqual(question);
      expect(question.id).toBe(`journal/q${String(index + 1).padStart(2, '0')}`);
      expect(question.review.second ?? '', question.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(balanced(question.fr), question.id).toBe(true);
    });
  });

  it('never asks the same question twice', () => {
    const questions = JOURNAL_QUESTIONS.map((question) => question.en);
    expect(new Set(questions).size).toBe(questions.length);
  });
});

describe('texts of the error categories (TAX-02)', () => {
  it.each(ERROR_CATEGORIES)('%s has a label, a definition and a hint', (category) => {
    const { label, definition, hint } = CATEGORY_TEXTS[category];
    for (const text of [label, definition, hint]) {
      expect(text.trim().length).toBeGreaterThan(0);
      expect(balanced(text), text).toBe(true);
      expect(countGaps(text)).toBe(0);
    }
  });

  it('gives hints that name no English word, so that they never reveal an answer (CARD-01)', () => {
    for (const category of ERROR_CATEGORIES) {
      expect(CATEGORY_TEXTS[category].hint, category).not.toContain('_');
    }
  });
});
