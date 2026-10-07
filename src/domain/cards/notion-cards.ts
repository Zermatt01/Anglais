/**
 * Cards of an acquired notion (CUR-09, CARD-03): the notion enters spaced
 * repetition with a few French sentences to express with it, taken from the
 * reviewed translations of its core (step 4). Their answers are the
 * exercise's accepted answers; their hint is the exercise's reviewed hint.
 */
import type { NotionId } from '../curriculum/notion-id.ts';
import type { NotionCardContent } from './content.ts';
import { isCardSolvable } from './solvability.ts';

/** Cards created when a notion becomes acquired. */
export const NOTION_CARDS_PER_NOTION = 3;

const MAX_CARD_VARIANTS = 30;

export interface TranslationSource {
  readonly sentenceFr: string;
  readonly hint: string;
  readonly difficulty: number;
  /** Canonical answer first. */
  readonly accepted: readonly string[];
}

/**
 * The cards of an acquired notion: its hardest translations first (they are
 * the closest to real use), in the core's order within a difficulty.
 */
export function notionCardContents(
  notionId: NotionId,
  sources: readonly TranslationSource[],
): NotionCardContent[] {
  const ordered = sources
    .map((source, order) => ({ source, order }))
    .sort((a, b) => b.source.difficulty - a.source.difficulty || a.order - b.order);
  const cards: NotionCardContent[] = [];
  for (const { source } of ordered) {
    const [canonical, ...variants] = source.accepted;
    if (canonical === undefined) continue;
    const content: NotionCardContent = {
      type: 'notion',
      notionId,
      meaningFr: source.sentenceFr,
      hint: source.hint,
      answers: { canonical, variants: variants.slice(0, MAX_CARD_VARIANTS) },
    };
    if (!isCardSolvable(content).solvable) continue;
    cards.push(content);
    if (cards.length === NOTION_CARDS_PER_NOTION) break;
  }
  return cards;
}
