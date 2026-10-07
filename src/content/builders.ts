/**
 * Helpers to write the core of a notion without repeating its identifier,
 * step and review marks. `exercisesOf('tense-past-simple', REVIEW).fill(3, {…})`
 * gives the exercise `tense-past-simple/s3/03`.
 */
import type { z } from 'zod';
import type {
  choiceWithReasonSchema,
  fillVerbSchema,
  placeWordSchema,
  transformSchema,
  translateSchema,
} from '../domain/curriculum/exercise.ts';
import type { NotionId } from '../domain/curriculum/notion-id.ts';
import type { ThemeItemInput } from '../domain/theme/item.ts';
import type { ReviewMarks } from './schema.ts';

type Fields<Schema extends z.ZodType> = Omit<z.input<Schema>, 'kind'>;

const pad = (number: number) => String(number).padStart(2, '0');

export function exercisesOf(notionId: NotionId, review: ReviewMarks) {
  const id = (step: number, number: number) => `${notionId}/s${String(step)}/${pad(number)}`;
  return {
    choice: (number: number, fields: Fields<typeof choiceWithReasonSchema>) => ({
      kind: 'choice-with-reason' as const,
      id: id(2, number),
      review,
      ...fields,
    }),
    fill: (number: number, fields: Fields<typeof fillVerbSchema>) => ({
      kind: 'fill-verb' as const,
      id: id(3, number),
      review,
      ...fields,
    }),
    transform: (number: number, fields: Fields<typeof transformSchema>) => ({
      kind: 'transform' as const,
      id: id(3, number),
      review,
      ...fields,
    }),
    place: (number: number, fields: Fields<typeof placeWordSchema>) => ({
      kind: 'place-word' as const,
      id: id(3, number),
      review,
      ...fields,
    }),
    translate: (number: number, fields: Fields<typeof translateSchema>) => ({
      kind: 'translate' as const,
      id: id(4, number),
      review,
      ...fields,
    }),
    placement: (
      number: number,
      fields: { sentence: string; options: string[]; answer: string; contextFr?: string },
    ) => ({ id: `${notionId}/p/${pad(number)}`, review, ...fields }),
  };
}

/** Thème sentences of a notion: `themeOf('tense-future', REVIEW).item(1, {…})` is `tense-future/t/01`. */
export function themeOf(notionId: NotionId, review: ReviewMarks) {
  return {
    item: (number: number, fields: ThemeItemInput) => ({
      id: `${notionId}/t/${pad(number)}`,
      review,
      ...fields,
    }),
  };
}
