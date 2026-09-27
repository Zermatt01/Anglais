/**
 * Notion identifiers (docs/PEDAGOGY.md §11, the single source of truth).
 *
 * Until the curriculum registry exists (phase 3), an identifier is only checked
 * for its form: kebab-case, starting with the prefix of one of the nine tracks
 * (PEDAGOGY §11.1). Phase 3 replaces this with the closed list of notions.
 */
import { z } from 'zod';

/** Notion prefix of each track, in track order (PEDAGOGY §11.1). */
export const TRACK_NOTION_PREFIXES = [
  'tense',
  'verbs',
  'questions',
  'patterns',
  'nouns',
  'adj',
  'prep',
  'clauses',
  'vocab',
] as const;

const NOTION_ID_PATTERN = new RegExp(
  `^(?:${TRACK_NOTION_PREFIXES.join('|')})-[a-z0-9]+(?:-[a-z0-9]+)*$`,
);

export const notionIdSchema = z.string().regex(NOTION_ID_PATTERN, 'unknown notion identifier');
export type NotionId = z.infer<typeof notionIdSchema>;
