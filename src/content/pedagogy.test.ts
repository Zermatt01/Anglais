/**
 * The curriculum in the code is identical to docs/PEDAGOGY.md §11, the single
 * source of truth (CUR-02), and its references come only from
 * docs/references/murphy-contents.md (CUR-14, D-038).
 */
import { describe, expect, it } from 'vitest';
import {
  NOTION_IDS,
  PHASE_3_NOTION_IDS,
  phaseOf,
  TRACK_IDS,
  TRACK_NOTION_PREFIXES,
  trackOf,
  type NotionId,
} from '../domain/curriculum/notion-id.ts';
import { BOOKS, type BookId } from './books.ts';
import { NOTION_REFERENCES, NOTION_TITLES, TRACK_TITLES } from './catalog.ts';
import { notionReferencesSchema } from './references.ts';
import pedagogyFile from '../../docs/PEDAGOGY.md?raw';
import murphyFile from '../../docs/references/murphy-contents.md?raw';

const pedagogy = pedagogyFile.replace(/\r\n/g, '\n');
const murphy = murphyFile.replace(/\r\n/g, '\n');

/** Text between two headings of a Markdown document. */
function section(text: string, start: string, end: string): string {
  const from = text.indexOf(start);
  const to = text.indexOf(end, from + start.length);
  if (from === -1 || to === -1) throw new Error(`Section not found: ${start}`);
  return text.slice(from, to);
}

function tableRows(text: string): string[][] {
  return text
    .split('\n')
    .filter((line) => line.startsWith('|') && !/^\|\s*-/.test(line))
    .map((line) =>
      line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim()),
    );
}

function unitsOf(cell: string): number[] {
  return cell === '—' ? [] : cell.split(',').map((unit) => Number(unit.trim()));
}

interface PedagogyNotion {
  readonly id: string;
  readonly title: string;
  readonly phase: number;
  readonly red: number[];
  readonly blue: number[];
}

const pedagogyTracks = tableRows(section(pedagogy, '### 11.1 Pistes', '### 11.2 Notions'))
  .slice(1)
  .map(([order = '', title = '', id = '', prefix = '']) => ({
    order: Number(order),
    title,
    id: id.replaceAll('`', ''),
    prefix: prefix.replaceAll('`', '').replace(/-$/, ''),
  }));

const pedagogyNotions: PedagogyNotion[] = tableRows(
  section(pedagogy, '### 11.2 Notions', '### 11.3'),
)
  .filter((row) => row[0] !== '#')
  .map(([, title = '', id = '', phase = '', red = '', blue = '']) => ({
    id: id.replaceAll('`', ''),
    title,
    phase: Number(phase.replace('P', '')),
    red: unitsOf(red),
    blue: unitsOf(blue),
  }));

/** Unit numbers listed in each book's section of murphy-contents.md. */
function murphyUnits(heading: string, nextHeading: string | null): Set<number> {
  const from = murphy.indexOf(heading);
  const to = nextHeading === null ? murphy.length : murphy.indexOf(nextHeading);
  const units = [...murphy.slice(from, to).matchAll(/^(\d+)\.\s/gm)].map((match) =>
    Number(match[1]),
  );
  return new Set(units);
}

const UNITS: Readonly<Record<BookId, Set<number>>> = {
  essential: murphyUnits('## Livre rouge', '## Livre bleu'),
  'grammar-in-use': murphyUnits('## Livre bleu', null),
};

describe('catalog and PEDAGOGY §11', () => {
  it('has the tracks of §11.1, in order, with their titles and prefixes', () => {
    expect(pedagogyTracks.map((track) => track.id)).toEqual([...TRACK_IDS]);
    for (const track of pedagogyTracks) {
      const id = TRACK_IDS[track.order - 1];
      expect(id).toBe(track.id);
      if (id === undefined) continue;
      expect(TRACK_TITLES[id]).toBe(track.title);
      expect(TRACK_NOTION_PREFIXES[id]).toBe(track.prefix);
    }
  });

  it('has the notions of §11.2, in order, with their track, phase and title', () => {
    expect(pedagogyNotions.map((notion) => notion.id)).toEqual([...NOTION_IDS]);
    for (const notion of pedagogyNotions) {
      const id = notion.id as NotionId;
      expect(phaseOf(id)).toBe(notion.phase);
      expect(NOTION_TITLES[id]).toBe(notion.title);
      expect(TRACK_IDS).toContain(trackOf(id));
    }
  });

  it('has the references of §11.2 for every notion delivered (D-038)', () => {
    for (const id of PHASE_3_NOTION_IDS) {
      const notion = pedagogyNotions.find((entry) => entry.id === id);
      const references = NOTION_REFERENCES[id] ?? [];
      expect(notionReferencesSchema.safeParse(references).success).toBe(true);
      const unitsFor = (book: BookId) =>
        references.find((reference) => reference.book === book)?.units ?? [];
      expect({ id, red: unitsFor('essential'), blue: unitsFor('grammar-in-use') }).toEqual({
        id,
        red: notion?.red,
        blue: notion?.blue,
      });
    }
  });

  it('only has references for notions in the code, never beyond them', () => {
    for (const id of Object.keys(NOTION_REFERENCES)) {
      expect(PHASE_3_NOTION_IDS).toContain(id);
    }
  });
});

describe('references and murphy-contents.md (CUR-14)', () => {
  it('cites only units that exist in the right book', () => {
    for (const references of Object.values(NOTION_REFERENCES)) {
      for (const { book, units } of references) {
        for (const unit of units)
          expect(UNITS[book].has(unit), `${book} ${String(unit)}`).toBe(true);
      }
    }
  });

  it('knows each book by the label and unit count of the file header', () => {
    const header = (label: string) =>
      new RegExp(
        `\\*\\*${label}\\*\\* : ([^,]+), Raymond Murphy, ([^(]+) \\([^)]*\\), (\\d+) unités`,
      ).exec(murphy);
    for (const [id, book] of Object.entries(BOOKS) as [BookId, (typeof BOOKS)[BookId]][]) {
      const label = book.label.charAt(0).toUpperCase() + book.label.slice(1);
      const match = header(label);
      expect(match?.[1]).toBe(book.title);
      expect(match?.[2]?.trim()).toBe(book.edition);
      expect(Number(match?.[3])).toBe(book.unitCount);
      expect(UNITS[id].size).toBe(book.unitCount);
    }
  });
});
