// Generated from shared/ai/prompts/check-card-answer.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * `check-card-answer`: the fast model checks an answer to a review card that
 * matches none of its expected answers (CARD-05), on the learner's request
 * only (COST-01). The learner then confirms or adjusts the grade.
 *
 * The prompt is short: far below Haiku 4.5's minimum cacheable prefix (D-011).
 */
import type { AiTaskInput } from '../tasks.ts';
import type { TaskPrompt } from './prompt.ts';

type Input = AiTaskInput<'check-card-answer'>;

const SYSTEM = `You check the answer of a French-speaking learner to an English review card. The card gives a meaning in French, sometimes with an English sentence that contains a gap (___); the learner had to produce the English. Expected answers are listed, but any other correct English answer with the same meaning is just as correct.

Verdict:
- "correct": the answer expresses the meaning in correct English, even if it differs from the expected answers. Contractions, British and American spellings and usages are all correct.
- "acceptable": the meaning is right, with only a minor slip (a typing error, a missing capital or comma) or a correct but less natural phrasing.
- "incorrect": the meaning is wrong or incomplete, or the answer contains a grammar or vocabulary error that a teacher would correct.

When the card has a gap, the answer is what fills the gap. Something is wrong only if it is wrong in every plausible reading of the card. Never call a correct answer incorrect: in doubt between "correct" and "acceptable", choose "correct"; in doubt between "acceptable" and "incorrect", choose "acceptable".

reasonFr: one short French sentence for the learner, addressed with "tu", with the typographic apostrophe ’ and English words between single underscores (le mot _yet_). For "incorrect", say what is wrong, without giving a lecture.`;

const CARD_TYPES: Readonly<Record<Input['cardType'], string>> = {
  error: 'a sentence the learner once got wrong, to say again correctly',
  cloze: 'a sentence with a gap to fill',
  collocation: 'a collocation to find from its meaning and a context',
  notion: 'a sentence to express with a grammar notion',
};

export const CHECK_CARD_ANSWER_PROMPT: TaskPrompt<Input> = {
  version: 'check-card-answer@1',
  system: SYSTEM,
  userMessage: ({
    cardType,
    meaningFr,
    textWithGap,
    infinitive,
    expected,
    answer,
    englishVariant,
  }) =>
    [
      `Card: ${CARD_TYPES[cardType]}. Learner's variant: ${englishVariant}.`,
      `Meaning in French: ${JSON.stringify(meaningFr)}`,
      ...(textWithGap === null ? [] : [`Sentence with the gap: ${JSON.stringify(textWithGap)}`]),
      ...(infinitive === null ? [] : [`Verb to use: ${JSON.stringify(infinitive)}`]),
      `Expected answers: ${JSON.stringify(expected)}`,
      `Learner's answer: ${JSON.stringify(answer)}`,
    ].join('\n'),
};
