import { describe, expect, it } from 'vitest';
import type { CardContent } from './content.ts';
import { isCardPresentable, isCardSolvable } from './solvability.ts';

type ContentOf<T extends CardContent['type']> = Extract<CardContent, { type: T }>;

function errorCard(overrides: Partial<ContentOf<'error'>> = {}): ContentOf<'error'> {
  return {
    type: 'error',
    meaningFr: "Je n'ai pas encore reçu les résultats.",
    hint: 'Action pas encore faite : present perfect, négation, et le mot « encore » en fin de phrase.',
    previousAttempt: 'I have not received yet the results.',
    highlights: [{ start: 20, end: 23 }],
    category: 'temps_verbaux',
    notionId: 'tense-just-already-yet-still',
    answers: {
      canonical: "I haven't received the results yet.",
      variants: ['I have not received the results yet.'],
    },
    ...overrides,
  };
}

function clozeCard(overrides: Partial<ContentOf<'cloze'>> = {}): ContentOf<'cloze'> {
  return {
    type: 'cloze',
    meaningFr: "J'ai terminé le rapport hier.",
    text: 'I ___ the report yesterday.',
    infinitive: 'finish',
    hint: 'Moment précis et terminé dans le passé.',
    notionId: 'tense-present-perfect-vs-past-simple',
    answers: { canonical: 'finished', variants: [] },
    ...overrides,
  };
}

function collocationCard(
  overrides: Partial<ContentOf<'collocation'>> = {},
): ContentOf<'collocation'> {
  return {
    type: 'collocation',
    meaningFr: 'prendre une décision',
    context: 'After the meeting, the board had to ___ quickly.',
    hint: null,
    notionId: 'patterns-make-do',
    answers: { canonical: 'make a decision', variants: ['take a decision'] },
    ...overrides,
  };
}

function notionCard(overrides: Partial<ContentOf<'notion'>> = {}): ContentOf<'notion'> {
  return {
    type: 'notion',
    notionId: 'tense-for-since-ago',
    meaningFr: 'Je travaille ici depuis trois ans.',
    hint: 'Durée qui continue jusqu’à maintenant.',
    answers: {
      canonical: 'I have worked here for three years.',
      variants: ['I have been working here for three years.'],
    },
    ...overrides,
  };
}

describe('isCardSolvable', () => {
  it('accepts a complete card of each type', () => {
    expect(isCardSolvable(errorCard())).toEqual({ solvable: true, issues: [] });
    expect(isCardSolvable(clozeCard())).toEqual({ solvable: true, issues: [] });
    expect(isCardSolvable(collocationCard())).toEqual({ solvable: true, issues: [] });
    expect(isCardSolvable(notionCard())).toEqual({ solvable: true, issues: [] });
    expect(isCardSolvable({ type: 'pronunciation', text: 'three', soundCategory: 'th' })).toEqual({
      solvable: true,
      issues: [],
    });
  });

  it('rejects an error card that only shows the wrong English sentence (LES-02)', () => {
    const report = isCardSolvable(errorCard({ meaningFr: '   ' }));
    expect(report.solvable).toBe(false);
    expect(report.issues).toContain('missing-meaning');
  });

  it('rejects a card whose French meaning is in fact the English answer', () => {
    expect(
      isCardSolvable(notionCard({ meaningFr: 'I have worked here for 3 years' })).issues,
    ).toEqual(['meaning-is-answer']);
  });

  it('rejects a card without an answer or with a blank variant', () => {
    expect(
      isCardSolvable(notionCard({ answers: { canonical: '', variants: [] } })).issues,
    ).toContain('missing-answer');
    expect(
      isCardSolvable(notionCard({ answers: { canonical: 'I have worked here', variants: [' '] } }))
        .issues,
    ).toContain('blank-variant');
  });

  it('requires a hint on an error card (CARD-02)', () => {
    expect(isCardSolvable(errorCard({ hint: '' })).issues).toEqual(['missing-hint']);
  });

  it('rejects a hint that gives the answer away, even through a contraction', () => {
    expect(isCardSolvable(clozeCard({ hint: 'La réponse est « finished ».' })).issues).toEqual([
      'hint-reveals-answer',
    ]);
    expect(
      isCardSolvable(errorCard({ hint: 'Écris : I have not received the results yet' })).issues,
    ).toEqual(['hint-reveals-answer']);
  });

  it('accepts a hint that only shares part of a word with the answer', () => {
    expect(isCardSolvable(clozeCard({ hint: 'Pense à finir au passé.' })).solvable).toBe(true);
  });

  it('rejects an error card whose previous attempt is missing', () => {
    expect(isCardSolvable(errorCard({ previousAttempt: '', highlights: [] })).issues).toEqual([
      'missing-previous-attempt',
    ]);
  });

  it('rejects an error card whose previous attempt was in fact correct (NO-05)', () => {
    const report = isCardSolvable(
      errorCard({ previousAttempt: 'I have not received the results yet', highlights: [] }),
    );
    expect(report.issues).toEqual(['previous-attempt-is-accepted']);
  });

  it('rejects a highlight outside the previous attempt', () => {
    expect(isCardSolvable(errorCard({ highlights: [{ start: 30, end: 80 }] })).issues).toEqual([
      'highlight-out-of-range',
    ]);
  });

  it('requires exactly one gap in a cloze sentence and in a collocation context', () => {
    expect(isCardSolvable(clozeCard({ text: 'I finished the report yesterday.' })).issues).toEqual([
      'gap-count',
    ]);
    expect(isCardSolvable(clozeCard({ text: 'I ___ the ___ yesterday.' })).issues).toEqual([
      'gap-count',
    ]);
    expect(isCardSolvable(collocationCard({ context: 'No gap here.' })).issues).toEqual([
      'gap-count',
    ]);
  });

  it('rejects an answer that still contains a gap', () => {
    expect(
      isCardSolvable(clozeCard({ answers: { canonical: 'finished ___', variants: [] } })).issues,
    ).toContain('answer-contains-gap');
  });

  it('rejects a pronunciation card without text', () => {
    expect(isCardSolvable({ type: 'pronunciation', text: ' ', soundCategory: 'schwa' })).toEqual({
      solvable: false,
      issues: ['missing-text'],
    });
  });

  it('reports each issue once, and several issues together', () => {
    const report = isCardSolvable(
      errorCard({ meaningFr: '', hint: '', previousAttempt: '', highlights: [] }),
    );
    expect(report.issues).toEqual(['missing-meaning', 'missing-hint', 'missing-previous-attempt']);
  });
});

describe('isCardPresentable', () => {
  it('presents active and mastered solvable cards', () => {
    expect(isCardPresentable({ status: 'active', content: notionCard() })).toBe(true);
    expect(isCardPresentable({ status: 'mastered', content: notionCard() })).toBe(true);
  });

  it('never presents a suspended card', () => {
    expect(isCardPresentable({ status: 'suspended', content: notionCard() })).toBe(false);
  });

  it('never presents an unsolvable card, whatever its status (NO-03)', () => {
    expect(isCardPresentable({ status: 'active', content: notionCard({ meaningFr: '' }) })).toBe(
      false,
    );
  });
});
