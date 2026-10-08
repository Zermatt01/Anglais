/**
 * Grading the answer to a card locally (CARD-05, COST-02): an answer that
 * matches the canonical answer or a variant is correct; anything else is
 * unknown, never wrong (NO-05). A card's anticipated errors are not stored:
 * the model checks an unknown answer on request, or the learner compares.
 *
 * For a sentence with a gap, the filler is put back in its sentence before the
 * comparison, like the exercises do (D-074).
 */
import { evaluateAnswer, type LocalEvaluation } from '../correction/evaluate.ts';
import { fillGap } from '../curriculum/exercise.ts';
import type { CardContent } from './content.ts';

type ReviewedCard = Exclude<CardContent, { type: 'pronunciation' }>;

/** The sentence with its gap, for a cloze or a collocation card. */
export function textWithGapOf(content: ReviewedCard): string | null {
  switch (content.type) {
    case 'cloze':
      return content.text;
    case 'collocation':
      return content.context;
    case 'error':
    case 'notion':
      return null;
  }
}

/** Accepted answers, canonical first, as the learner types them. */
export function acceptedCardAnswers(content: ReviewedCard): string[] {
  return [content.answers.canonical, ...content.answers.variants];
}

/** The canonical answer as a whole sentence, to show after the answer. */
export function expectedSentenceOf(content: ReviewedCard): string {
  const gapped = textWithGapOf(content);
  return gapped === null ? content.answers.canonical : fillGap(gapped, content.answers.canonical);
}

export function evaluateCardAnswer(content: ReviewedCard, answer: string): LocalEvaluation {
  if (!/\S/.test(answer)) return { verdict: 'unknown', matched: null };
  const gapped = textWithGapOf(content);
  const accepted = acceptedCardAnswers(content);
  if (gapped === null) return evaluateAnswer(answer, { accepted });
  return evaluateAnswer(fillGap(gapped, answer), {
    accepted: accepted.map((filler) => fillGap(gapped, filler)),
  });
}
