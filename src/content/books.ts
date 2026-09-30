/**
 * Reference books (USR-07, DECISIONS D-038, D-039). Only their label and unit
 * numbers are ever shown: no title of unit, no text from the books (CUR-15).
 * `pedagogy.test.ts` checks these values against the header of
 * docs/references/murphy-contents.md.
 */
import { z } from 'zod';

export const BOOK_IDS = ['essential', 'grammar-in-use'] as const;
export const bookIdSchema = z.enum(BOOK_IDS);
export type BookId = z.infer<typeof bookIdSchema>;

export interface Book {
  readonly title: string;
  readonly edition: string;
  /** Label shown in the app: the colour of the learner's copy (D-039). */
  readonly label: string;
  readonly unitCount: number;
}

export const BOOKS: Readonly<Record<BookId, Book>> = {
  essential: {
    title: 'Essential Grammar in Use',
    edition: '2e édition',
    label: 'livre rouge',
    unitCount: 114,
  },
  'grammar-in-use': {
    title: 'English Grammar in Use',
    edition: '5e édition',
    label: 'livre bleu',
    unitCount: 145,
  },
};
