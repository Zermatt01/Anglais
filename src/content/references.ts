/**
 * "Pour aller plus loin" references to the Murphy books (CUR-14,
 * docs/ARCHITECTURE.md §5). They come only from
 * docs/references/murphy-contents.md, never from memory: `pedagogy.test.ts`
 * checks every unit against it and against PEDAGOGY §11.
 */
import { z } from 'zod';
import { BOOK_IDS, BOOKS, bookIdSchema, type BookId } from './books.ts';

export const notionReferenceSchema = z
  .strictObject({
    book: bookIdSchema,
    /** Unit numbers, sorted, without duplicates, within the book. */
    units: z.array(z.int().positive()).min(1),
  })
  .refine((reference) => reference.units.every((unit) => unit <= BOOKS[reference.book].unitCount), {
    message: 'unit beyond the last unit of the book',
  })
  .refine(
    (reference) =>
      reference.units.every(
        (unit, index) => index === 0 || unit > (reference.units[index - 1] ?? 0),
      ),
    { message: 'units must be sorted, without duplicates' },
  );
export type NotionReference = z.infer<typeof notionReferenceSchema>;

/** At most one reference per book. */
export const notionReferencesSchema = z
  .array(notionReferenceSchema)
  .max(BOOK_IDS.length)
  .refine((references) => new Set(references.map(({ book }) => book)).size === references.length, {
    message: 'at most one reference per book',
  });

/** Groups consecutive units: three or more form a range ("26 à 29"). */
function unitGroups(units: readonly number[]): string[] {
  const groups: string[] = [];
  let start = 0;
  while (start < units.length) {
    let end = start;
    while (end + 1 < units.length && (units[end + 1] ?? 0) === (units[end] ?? 0) + 1) end += 1;
    const first = units[start] ?? 0;
    const last = units[end] ?? 0;
    if (end - start >= 2) {
      groups.push(`${String(first)} à ${String(last)}`);
    } else {
      for (let index = start; index <= end; index += 1) groups.push(String(units[index] ?? 0));
    }
    start = end + 1;
  }
  return groups;
}

/** "15", "15 et 17", "10 à 12 et 24", "1, 5 et 9". */
function joinFrench(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} et ${items.at(-1) ?? ''}`;
}

function formatReference(book: BookId, units: readonly number[]): string {
  const noun = units.length === 1 ? 'unité' : 'unités';
  return `${BOOKS[book].label}, ${noun} ${joinFrench(unitGroups(units))}`;
}

/**
 * The line shown under a lesson, red book first, or `null` without references:
 * "Pour aller plus loin : livre rouge, unités 26 à 29 ; livre bleu, unités 19 à 23 et 25".
 */
export function formatReferences(references: readonly NotionReference[]): string | null {
  const ordered = BOOK_IDS.flatMap((book) =>
    references.filter((reference) => reference.book === book),
  );
  if (ordered.length === 0) return null;
  return `Pour aller plus loin : ${ordered.map(({ book, units }) => formatReference(book, units)).join(' ; ')}`;
}
