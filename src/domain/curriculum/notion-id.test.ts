import { describe, expect, it } from 'vitest';
import {
  NOTION_IDS,
  notionIdSchema,
  notionsOfTrack,
  PHASE_3_NOTION_IDS,
  phaseOf,
  TRACK_IDS,
  TRACK_NOTION_PREFIXES,
  trackOf,
} from './notion-id.ts';

describe('notion catalog', () => {
  it('lists 50 distinct notions, 13 of them in phase 3 (CUR-10)', () => {
    expect(NOTION_IDS).toHaveLength(50);
    expect(new Set(NOTION_IDS).size).toBe(50);
    expect(PHASE_3_NOTION_IDS).toHaveLength(13);
    expect(PHASE_3_NOTION_IDS.every((id) => trackOf(id) === 'tenses')).toBe(true);
  });

  it('keeps each track together, in track order', () => {
    const tracks = NOTION_IDS.map(trackOf);
    const firstIndex = TRACK_IDS.map((track) => tracks.indexOf(track));
    expect(firstIndex).toEqual([...firstIndex].sort((a, b) => a - b));
    for (const track of TRACK_IDS) {
      const indexes = NOTION_IDS.flatMap((id, index) => (trackOf(id) === track ? [index] : []));
      const first = indexes[0] ?? 0;
      const last = indexes.at(-1) ?? -1;
      expect(last - first + 1).toBe(indexes.length);
    }
  });

  it('gives every notion the prefix of its track', () => {
    for (const id of NOTION_IDS) {
      expect(id.startsWith(`${TRACK_NOTION_PREFIXES[trackOf(id)]}-`)).toBe(true);
    }
  });

  it('knows the phase and the notions of each track', () => {
    expect(phaseOf('tense-just-already-yet-still')).toBe(3);
    expect(phaseOf('tense-have-got')).toBe(8);
    expect(phaseOf('vocab-false-friends')).toBe(8);
    expect(notionsOfTrack('tenses')).toHaveLength(16);
    expect(notionsOfTrack('vocabulary')).toEqual([
      'vocab-rise-raise',
      'vocab-lend-borrow',
      'vocab-false-friends',
    ]);
  });
});

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
    // Well formed, but not in the closed list.
    'tense-future-perfect',
    'vocab-make-do',
  ])('rejects %j', (id) => {
    expect(notionIdSchema.safeParse(id).success).toBe(false);
  });
});
