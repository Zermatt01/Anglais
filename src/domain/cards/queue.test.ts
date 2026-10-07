import { describe, expect, it } from 'vitest';
import type { NotionId } from '../curriculum/notion-id.ts';
import type { CardContent } from './content.ts';
import { effectiveCardStatus, interleave, nextDue, reviewQueue, type QueueCard } from './queue.ts';

const NOW = Date.UTC(2026, 9, 7, 9, 0, 0);
const MINUTE = 60_000;

const content: CardContent = {
  type: 'notion',
  notionId: 'tense-past-simple',
  meaningFr: 'J’ai envoyé le rapport hier.',
  hint: null,
  answers: { canonical: 'I sent the report yesterday.', variants: [] },
};

let counter = 0;
function card(fields: Partial<QueueCard> = {}): QueueCard {
  counter += 1;
  return {
    id: `card-${String(counter).padStart(3, '0')}`,
    status: 'active',
    suspensionReason: null,
    notionId: 'tense-past-simple',
    due: NOW - MINUTE,
    phase: 'review',
    content,
    ...fields,
  };
}

const none = { newCards: 0, reviews: 0, mastered: 0 };
const limits = { newCardsPerDay: 10, reviewsPerDay: 60 };
const studied = (notionId: NotionId) => notionId === 'tense-past-simple';

describe('effectiveCardStatus (D-025)', () => {
  it('activates a card suspended for its notion once the notion is studied', () => {
    const suspended = card({ status: 'suspended', suspensionReason: 'unstudied-notion' });
    expect(effectiveCardStatus(suspended, studied)).toBe('active');
    expect(effectiveCardStatus({ ...suspended, notionId: 'tense-future' }, studied)).toBe(
      'suspended',
    );
  });

  it('never activates a card suspended for another reason', () => {
    expect(
      effectiveCardStatus(card({ status: 'suspended', suspensionReason: 'reported' }), studied),
    ).toBe('suspended');
    expect(
      effectiveCardStatus(card({ status: 'suspended', suspensionReason: 'unsolvable' }), studied),
    ).toBe('suspended');
  });
});

describe('reviewQueue (MOD-03)', () => {
  it('queues the due cards only, the oldest first', () => {
    const late = card({ due: NOW - 10 * MINUTE });
    const recent = card({ due: NOW - MINUTE });
    const future = card({ due: NOW + MINUTE });
    const queue = reviewQueue({
      cards: [recent, future, late],
      now: NOW,
      today: none,
      limits,
      isStudied: studied,
    });
    expect(queue.map((entry) => entry.id)).toEqual([late.id, recent.id]);
  });

  it('never queues a suspended or unsolvable card (NO-03)', () => {
    const suspended = card({ status: 'suspended', suspensionReason: 'reported' });
    const unsolvable = card({
      content: { ...content, answers: { canonical: ' ', variants: [] } },
    });
    expect(
      reviewQueue({
        cards: [suspended, unsolvable],
        now: NOW,
        today: none,
        limits,
        isStudied: studied,
      }),
    ).toEqual([]);
  });

  it('keeps within the daily caps of new cards, reviews and maintenance reviews', () => {
    const cards = [
      ...Array.from({ length: 4 }, () => card({ phase: 'new' })),
      ...Array.from({ length: 4 }, () => card({ phase: 'review' })),
      ...Array.from({ length: 5 }, () => card({ status: 'mastered' })),
    ];
    const queue = reviewQueue({
      cards,
      now: NOW,
      today: { newCards: 8, reviews: 57, mastered: 1 },
      limits,
      isStudied: studied,
    });
    const count = (predicate: (entry: QueueCard) => boolean) => queue.filter(predicate).length;
    expect(count((entry) => entry.status === 'mastered')).toBe(2);
    expect(count((entry) => entry.status !== 'mastered' && entry.phase === 'new')).toBe(2);
    expect(count((entry) => entry.status !== 'mastered' && entry.phase === 'review')).toBe(3);
  });

  it('reports the next due card when nothing is due', () => {
    const later = card({ due: NOW + 30 * MINUTE });
    const soon = card({ due: NOW + 5 * MINUTE });
    const hidden = card({ due: NOW + MINUTE, status: 'suspended', suspensionReason: 'reported' });
    expect(nextDue([later, soon, hidden], NOW, studied)).toBe(NOW + 5 * MINUTE);
    expect(nextDue([], NOW, studied)).toBeNull();
  });
});

describe('interleave (PED-08)', () => {
  it('avoids two cards of the same notion in a row when possible', () => {
    const a1 = { id: 'a1', notionId: 'tense-future' as const };
    const a2 = { id: 'a2', notionId: 'tense-future' as const };
    const b1 = { id: 'b1', notionId: 'tense-past-simple' as const };
    const free = { id: 'c', notionId: null };
    expect(interleave([a1, a2, b1]).map((entry) => entry.id)).toEqual(['a1', 'b1', 'a2']);
    expect(interleave([a1, a2]).map((entry) => entry.id)).toEqual(['a1', 'a2']);
    expect(interleave([a1, free, a2]).map((entry) => entry.id)).toEqual(['a1', 'c', 'a2']);
  });
});
