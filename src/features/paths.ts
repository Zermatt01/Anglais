/** Paths of the screens. They are in French, like the interface. */
import { TRACK_IDS, type NotionId, type TrackId } from '../domain/curriculum/notion-id.ts';

export const PATHS = {
  home: '/',
  settings: '/reglages',
  usage: '/consommation',
  path: '/parcours',
} as const;

/** French slugs of the tracks in addresses. */
const TRACK_SLUGS: Readonly<Record<TrackId, string>> = {
  tenses: 'temps-verbaux',
  verbs: 'passif-modaux',
  questions: 'questions',
  patterns: 'ing-ou-to',
  nouns: 'noms-determinants',
  adjectives: 'adjectifs-adverbes',
  prepositions: 'prepositions',
  clauses: 'phrases-complexes',
  vocabulary: 'vocabulaire',
};

export function trackOfSlug(slug: string): TrackId | null {
  return TRACK_IDS.find((trackId) => TRACK_SLUGS[trackId] === slug) ?? null;
}

export const pathTo = {
  notion: (notionId: NotionId) => `${PATHS.path}/${notionId}`,
  lesson: (notionId: NotionId) => `${PATHS.path}/${notionId}/lecon`,
  practice: (notionId: NotionId) => `${PATHS.path}/${notionId}/exercices`,
  produce: (notionId: NotionId) => `${PATHS.path}/${notionId}/production`,
  placement: (trackId: TrackId) => `${PATHS.path}/positionnement/${TRACK_SLUGS[trackId]}`,
};
