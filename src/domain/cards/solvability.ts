/**
 * Card solvability rule (CARD-01, NO-03).
 *
 * A card is solvable when someone who has completely forgotten its context can
 * find the answer without guessing: the meaning is given in French, the answer
 * exists, the hint does not give it away, and the card's structure is coherent.
 * Every card creation goes through this function, and no unsolvable card is
 * ever presented (see `isCardPresentable`).
 *
 * The rule is deliberately conservative: when in doubt, a card is rejected. A
 * rejected card is never lost; it is stored suspended with the reason
 * `unsolvable` when it comes from an import, or not created at all otherwise.
 */
import { areEquivalent, containsPhrase } from '../correction/forms.ts';
import { evaluateAnswer } from '../correction/evaluate.ts';
import { countGaps, type CardAnswers, type CardContent, type CardStatus } from './content.ts';

export type SolvabilityIssue =
  /** No meaning in French: the learner would not know what to say (LES-02). */
  | 'missing-meaning'
  /** The "French" meaning is in fact one of the English answers. */
  | 'meaning-is-answer'
  | 'missing-answer'
  | 'blank-variant'
  /** An error card must carry a targeted hint (CARD-02). */
  | 'missing-hint'
  | 'hint-reveals-answer'
  | 'missing-previous-attempt'
  /** The previous attempt is itself an accepted answer: it was not an error (NO-05). */
  | 'previous-attempt-is-accepted'
  | 'highlight-out-of-range'
  /** A cloze sentence or collocation context must contain exactly one gap. */
  | 'gap-count'
  | 'answer-contains-gap'
  | 'missing-text';

export interface SolvabilityReport {
  readonly solvable: boolean;
  readonly issues: readonly SolvabilityIssue[];
}

const isBlank = (text: string): boolean => !/\S/.test(text);

function acceptedAnswers(answers: CardAnswers): string[] {
  return [answers.canonical, ...answers.variants];
}

function answerIssues(answers: CardAnswers): SolvabilityIssue[] {
  const issues: SolvabilityIssue[] = [];
  if (isBlank(answers.canonical)) issues.push('missing-answer');
  if (answers.variants.some(isBlank)) issues.push('blank-variant');
  if (acceptedAnswers(answers).some((answer) => countGaps(answer) > 0)) {
    issues.push('answer-contains-gap');
  }
  return issues;
}

function meaningIssues(meaningFr: string, answers: CardAnswers): SolvabilityIssue[] {
  if (isBlank(meaningFr)) return ['missing-meaning'];
  const accepted = acceptedAnswers(answers).filter((answer) => !isBlank(answer));
  return accepted.some((answer) => areEquivalent(meaningFr, answer)) ? ['meaning-is-answer'] : [];
}

function hintIssues(hint: string | null, answers: CardAnswers): SolvabilityIssue[] {
  if (hint === null) return [];
  const accepted = acceptedAnswers(answers).filter((answer) => !isBlank(answer));
  return accepted.some((answer) => containsPhrase(hint, answer)) ? ['hint-reveals-answer'] : [];
}

function gapIssues(textWithGap: string): SolvabilityIssue[] {
  return countGaps(textWithGap) === 1 ? [] : ['gap-count'];
}

function issuesOf(content: CardContent): SolvabilityIssue[] {
  switch (content.type) {
    case 'error': {
      const issues = [
        ...answerIssues(content.answers),
        ...meaningIssues(content.meaningFr, content.answers),
      ];
      if (isBlank(content.hint)) issues.push('missing-hint');
      else issues.push(...hintIssues(content.hint, content.answers));

      if (isBlank(content.previousAttempt)) {
        issues.push('missing-previous-attempt');
      } else if (
        evaluateAnswer(content.previousAttempt, { accepted: acceptedAnswers(content.answers) })
          .verdict === 'correct'
      ) {
        issues.push('previous-attempt-is-accepted');
      }
      if (content.highlights.some((range) => range.end > content.previousAttempt.length)) {
        issues.push('highlight-out-of-range');
      }
      return issues;
    }
    case 'cloze':
      return [
        ...answerIssues(content.answers),
        ...meaningIssues(content.meaningFr, content.answers),
        ...hintIssues(content.hint, content.answers),
        ...gapIssues(content.text),
      ];
    case 'collocation':
      return [
        ...answerIssues(content.answers),
        ...meaningIssues(content.meaningFr, content.answers),
        ...hintIssues(content.hint, content.answers),
        ...gapIssues(content.context),
      ];
    case 'notion':
      return [
        ...answerIssues(content.answers),
        ...meaningIssues(content.meaningFr, content.answers),
        ...hintIssues(content.hint, content.answers),
      ];
    case 'pronunciation':
      return isBlank(content.text) ? ['missing-text'] : [];
  }
}

/** Checks that a card can be solved without its original context (CARD-01). */
export function isCardSolvable(content: CardContent): SolvabilityReport {
  const issues = [...new Set(issuesOf(content))];
  return { solvable: issues.length === 0, issues };
}

/**
 * Only solvable cards that are not suspended may ever be shown (NO-03, CARD-07).
 * Mastered cards stay presentable for their maintenance reviews (CARD-06).
 */
export function isCardPresentable(card: {
  readonly status: CardStatus;
  readonly content: CardContent;
}): boolean {
  return card.status !== 'suspended' && isCardSolvable(card.content).solvable;
}
