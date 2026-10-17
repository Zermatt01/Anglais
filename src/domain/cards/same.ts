/**
 * Two cards that ask the same thing (D-092): a sentence failed twice, or
 * kept for review and then failed, makes one card, never two.
 */
import { areEquivalent } from '../correction/forms.ts';
import type { CardContent } from './content.ts';

interface Question {
  readonly kind: 'sentence' | 'cloze' | 'collocation';
  readonly prompt: string;
  /** The canonical answer and its variants. */
  readonly answers: readonly string[];
}

/** What a card asks and expects; `null` for a card said aloud. */
function questionOf(content: CardContent): Question | null {
  const answers =
    content.type === 'pronunciation'
      ? []
      : [content.answers.canonical, ...content.answers.variants];
  switch (content.type) {
    // Both ask to express a French sentence in English.
    case 'error':
    case 'notion':
      return { kind: 'sentence', prompt: content.meaningFr.trim(), answers };
    case 'cloze':
      return {
        kind: 'cloze',
        prompt: `${content.meaningFr.trim()}\n${content.text.trim()}`,
        answers,
      };
    case 'collocation':
      return {
        kind: 'collocation',
        prompt: `${content.meaningFr.trim()}\n${content.context.trim()}`,
        answers,
      };
    case 'pronunciation':
      return null;
  }
}

/**
 * Same kind of question, same prompt, and an answer that both accept: the
 * canonical answer or a variant of one is an answer of the other (D-096).
 */
export function asksTheSame(a: CardContent, b: CardContent): boolean {
  const first = questionOf(a);
  const second = questionOf(b);
  if (first === null || second === null) return false;
  return (
    first.kind === second.kind &&
    first.prompt === second.prompt &&
    first.answers.some((answer) => second.answers.some((other) => areEquivalent(answer, other)))
  );
}
