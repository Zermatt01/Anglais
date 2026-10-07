/**
 * The cards of "Reprises" (MOD-03, docs/PEDAGOGY.md §6.1): the due cards,
 * within the daily caps of new cards and reviews, plus a few maintenance
 * reviews of mastered cards; mixed so that two cards of the same notion do not
 * follow each other when it can be avoided (interleaving, PED-08).
 *
 * Only presentable cards are ever queued (NO-03, CARD-07). A card suspended
 * because its notion was not studied yet counts as active as soon as the
 * notion is studied (D-025): it needs no write to come back.
 */
import type { NotionId } from '../curriculum/notion-id.ts';
import type { SrsPhase } from '../srs/state.ts';
import type { CardContent, CardStatus, SuspensionReason } from './content.ts';
import { isCardSolvable } from './solvability.ts';

/** Maintenance reviews of mastered cards, at most, per day (PEDAGOGY §6.1). */
export const MASTERED_PER_DAY = 3;

export interface QueueCard {
  readonly id: string;
  readonly status: CardStatus;
  readonly suspensionReason: SuspensionReason | null;
  readonly notionId: NotionId | null;
  readonly due: number;
  readonly phase: SrsPhase;
  readonly content: CardContent;
}

/** Reviews already done today, by kind of card. */
export interface ReviewsToday {
  readonly newCards: number;
  readonly reviews: number;
  readonly mastered: number;
}

export interface QueueLimits {
  readonly newCardsPerDay: number;
  readonly reviewsPerDay: number;
}

/** Status of a card as the queue sees it (D-025). */
export function effectiveCardStatus(
  card: Pick<QueueCard, 'status' | 'suspensionReason' | 'notionId'>,
  isStudied: (notionId: NotionId) => boolean,
): CardStatus {
  if (
    card.status === 'suspended' &&
    card.suspensionReason === 'unstudied-notion' &&
    card.notionId !== null &&
    isStudied(card.notionId)
  ) {
    return 'active';
  }
  return card.status;
}

type Kind = 'new' | 'review' | 'mastered';

function kindOf(card: QueueCard, status: CardStatus): Kind {
  if (status === 'mastered') return 'mastered';
  return card.phase === 'new' ? 'new' : 'review';
}

/** Reorders cards so that two cards of the same notion are not adjacent when avoidable. */
export function interleave<Card extends { readonly notionId: NotionId | null }>(
  cards: readonly Card[],
): Card[] {
  const rest = [...cards];
  const ordered: Card[] = [];
  while (rest.length > 0) {
    const previous = ordered.at(-1)?.notionId ?? null;
    const index = rest.findIndex((card) => card.notionId === null || card.notionId !== previous);
    const [next] = rest.splice(index === -1 || previous === null ? 0 : index, 1);
    if (next !== undefined) ordered.push(next);
  }
  return ordered;
}

/** Cards to review now, oldest due first, then interleaved. */
export function reviewQueue({
  cards,
  now,
  today,
  limits,
  isStudied,
}: {
  readonly cards: readonly QueueCard[];
  readonly now: number;
  readonly today: ReviewsToday;
  readonly limits: QueueLimits;
  readonly isStudied: (notionId: NotionId) => boolean;
}): QueueCard[] {
  const room: Record<Kind, number> = {
    new: Math.max(0, limits.newCardsPerDay - today.newCards),
    review: Math.max(0, limits.reviewsPerDay - today.reviews),
    mastered: Math.max(0, MASTERED_PER_DAY - today.mastered),
  };
  const due = cards
    .filter((card) => card.due <= now)
    .sort((a, b) => a.due - b.due || a.id.localeCompare(b.id));
  const queued: QueueCard[] = [];
  for (const card of due) {
    const status = effectiveCardStatus(card, isStudied);
    if (status === 'suspended' || !isCardSolvable(card.content).solvable) continue;
    const kind = kindOf(card, status);
    if (room[kind] === 0) continue;
    room[kind] -= 1;
    queued.push(card);
  }
  return interleave(queued);
}

/** The next due time among the presentable cards that are not due yet, if any. */
export function nextDue(
  cards: readonly QueueCard[],
  now: number,
  isStudied: (notionId: NotionId) => boolean,
): number | null {
  let next: number | null = null;
  for (const card of cards) {
    if (card.due <= now) continue;
    if (effectiveCardStatus(card, isStudied) === 'suspended') continue;
    if (!isCardSolvable(card.content).solvable) continue;
    if (next === null || card.due < next) next = card.due;
  }
  return next;
}
