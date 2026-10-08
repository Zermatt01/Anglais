// @vitest-environment node
/**
 * Contract of the phase-4 tasks (D-083): the correction of a production and
 * the check of a card answer. Their examples are valid outputs, copied
 * exactly from their texts, and the schemas stay within the limits of
 * structured outputs.
 */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { CONTRACT_ERROR_CATEGORIES, CONTRACT_NOTION_IDS } from './curriculum.ts';
import { estimateInputTokens } from './pricing.ts';
import { CORRECTION_EXAMPLES, type CorrectionExample } from './prompts/correction-examples.ts';
import { PROMPTS } from './prompts/index.ts';
import {
  CHECK_CARD_ANSWER_MAX_INPUT_TOKENS,
  CORRECT_PRODUCTION_MAX_INPUT_TOKENS,
  LEARNER_DOMAIN_IDS,
  MAX_CARD_ANSWER,
  MAX_CARD_ANSWERS,
  MAX_CARD_TEXT,
  MAX_INSTRUCTION_TEXT,
  MAX_PRODUCTION_TEXT,
  MAX_PROFILE_REMARKS_SENT,
  MAX_REFERENCE_ANSWER,
  MAX_REFERENCE_ANSWERS,
  MAX_WEAK_ITEMS,
  TASK_CONTRACTS,
  type AiTaskInput,
} from './tasks.ts';

/**
 * Structured outputs accept at most 16 parameters with a union type (a
 * nullable field counts) and 24 optional parameters (documentation checked on
 * 2026-10-07).
 */
function schemaComplexity(schema: unknown): { unions: number; optional: number } {
  let unions = 0;
  let optional = 0;
  const visit = (node: unknown): void => {
    if (typeof node !== 'object' || node === null) return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    const anyOf: unknown = Reflect.get(node, 'anyOf');
    const type: unknown = Reflect.get(node, 'type');
    if (Array.isArray(anyOf) || Array.isArray(type)) unions += 1;
    const properties: unknown = Reflect.get(node, 'properties');
    const required: unknown = Reflect.get(node, 'required');
    if (typeof properties === 'object' && properties !== null) {
      const requiredKeys = new Set(Array.isArray(required) ? required : []);
      for (const key of Object.keys(properties)) if (!requiredKeys.has(key)) optional += 1;
    }
    for (const value of Object.values(node)) visit(value);
  };
  visit(schema);
  return { unions, optional };
}

const prompt = PROMPTS['correct-production'];
const contract = TASK_CONTRACTS['correct-production'];

const INPUT: AiTaskInput<'correct-production'> = {
  module: 'journal',
  instruction: { text: 'What did you do yesterday?', language: 'en' },
  reference: null,
  targetNotionId: null,
  learner: {
    englishVariant: 'en-GB',
    domains: ['finance'],
    level: null,
    weakCategories: ['temps_verbaux'],
    weakNotions: ['tense-for-since-ago'],
    remarks: '',
  },
  text: 'Yesterday I have met a client.',
};

describe('correct-production', () => {
  it('keeps its output schema within the limits of structured outputs', () => {
    const { unions, optional } = schemaComplexity(z.toJSONSchema(contract.output));
    expect(unions).toBeGreaterThan(0);
    expect(unions).toBeLessThanOrEqual(16);
    expect(optional).toBe(0);
  });

  it('gives complete and contrasted examples (AI-04)', () => {
    const categoriesOf = (example: CorrectionExample) =>
      new Set(example.output.errors.map((error) => error.category));
    expect(CORRECTION_EXAMPLES.some((example) => categoriesOf(example).size >= 3)).toBe(true);
    expect(
      CORRECTION_EXAMPLES.some(
        ({ output }) =>
          output.errors.length === 0 &&
          output.unnatural.length === 0 &&
          output.sentences.length === 0,
      ),
    ).toBe(true);
    expect(CORRECTION_EXAMPLES.some(({ output }) => output.unnatural.length > 0)).toBe(true);
  });

  it.each(CORRECTION_EXAMPLES.map((example) => [example.title, example] as const))(
    'example "%s" is a valid output, copied exactly from its text',
    (_title, example) => {
      expect(contract.output.safeParse(example.output).success).toBe(true);
      const { module, instruction, reference, targetNotionId, text } = example;
      expect(
        contract.input.safeParse({ ...INPUT, module, instruction, reference, targetNotionId, text })
          .success,
      ).toBe(true);
      for (const error of example.output.errors) {
        expect(text.slice(error.start, error.start + error.segment.length)).toBe(error.segment);
        expect(error.correction).not.toBe(error.segment);
        expect(error.hintFr.toLowerCase()).not.toContain(error.correction.toLowerCase());
        expect(
          example.output.sentences.some((sentence) => sentence.original.includes(error.segment)),
        ).toBe(true);
      }
      for (const sentence of example.output.sentences) {
        expect(text).toContain(sentence.original);
        expect(sentence.corrected).not.toBe(sentence.original);
      }
      for (const phrase of example.output.unnatural) expect(text).toContain(phrase.original);
      const { accuracy, naturalness, complexity } = example.output.evaluation;
      for (const score of [accuracy, naturalness, complexity]) {
        expect(Number.isInteger(score) && score >= 1 && score <= 5).toBe(true);
      }
      expect(example.output.targetNotionUses === null).toBe(targetNotionId === null);
      for (const words of example.output.targetNotionUses ?? []) expect(text).toContain(words);
    },
  );

  it('lists every category and every notion of the closed lists in the stable prefix (AI-03)', () => {
    for (const category of CONTRACT_ERROR_CATEGORIES) {
      expect(prompt.system).toContain(`- ${category}:`);
    }
    for (const notionId of CONTRACT_NOTION_IDS) expect(prompt.system).toContain(`- ${notionId}:`);
  });

  it('puts the learner, the instruction and the text after the stable prefix (AI-02, COST-03)', () => {
    const message = prompt.userMessage({
      ...INPUT,
      reference: {
        meaningFr: 'J’ai rencontré un client hier.',
        answers: ['I met a client yesterday.'],
      },
      targetNotionId: 'tense-past-simple',
      learner: { ...INPUT.learner, remarks: 'I teach economics.' },
    });
    expect(message).toContain('Module: journal.');
    expect(message).toContain('What did you do yesterday?');
    expect(message).toContain('"I met a client yesterday."');
    expect(message).toContain('Target notion: tense-past-simple.');
    expect(message).toContain('British English (en-GB)');
    expect(message).toContain('frequent error categories: temps_verbaux');
    expect(message).toContain('fragile notions: tense-for-since-ago');
    expect(message).toContain('"I teach economics."');
    expect(message).toContain('<<<\nYesterday I have met a client.\n>>>');
    expect(prompt.system).not.toContain('Yesterday I have met a client.');
    expect(prompt.userMessage(INPUT)).toContain('Reference: none.');
  });

  it('shows a cost bound that covers the largest correction the Edge Function may estimate', () => {
    const longest: AiTaskInput<'correct-production'> = {
      module: 'path-translate',
      instruction: { text: 'x'.repeat(MAX_INSTRUCTION_TEXT), language: 'fr' },
      reference: {
        meaningFr: 'x'.repeat(MAX_INSTRUCTION_TEXT),
        answers: Array.from({ length: MAX_REFERENCE_ANSWERS }, () =>
          'x'.repeat(MAX_REFERENCE_ANSWER),
        ),
      },
      targetNotionId: 'tense-present-perfect-vs-past-simple',
      learner: {
        englishVariant: 'en-US',
        domains: [...LEARNER_DOMAIN_IDS],
        level: 'B1',
        weakCategories: CONTRACT_ERROR_CATEGORIES.slice(0, MAX_WEAK_ITEMS),
        weakNotions: CONTRACT_NOTION_IDS.slice(0, MAX_WEAK_ITEMS),
        remarks: 'x'.repeat(MAX_PROFILE_REMARKS_SENT),
      },
      text: 'x'.repeat(MAX_PRODUCTION_TEXT),
    };
    expect(contract.input.safeParse(longest).success).toBe(true);
    expect(estimateInputTokens(prompt.system + prompt.userMessage(longest))).toBeLessThanOrEqual(
      CORRECT_PRODUCTION_MAX_INPUT_TOKENS,
    );
  });

  it.each([
    ['a notion outside the closed list', { targetNotionId: 'tense-imaginary' }],
    ['an empty text', { text: '   ' }],
    ['a text that is too long', { text: 'x'.repeat(MAX_PRODUCTION_TEXT + 1) }],
    ['a module that is not corrected yet', { module: 'email' }],
  ])('refuses %s', (_label, change) => {
    expect(contract.input.safeParse({ ...INPUT, ...change }).success).toBe(false);
  });

  it('refuses an output that cites a notion outside the closed list', () => {
    const output = CORRECTION_EXAMPLES[0]?.output;
    const error = output?.errors[0];
    expect(output).toBeDefined();
    expect(
      contract.output.safeParse({ ...output, errors: [{ ...error, notionId: 'tense-imaginary' }] })
        .success,
    ).toBe(false);
  });
});

describe('check-card-answer', () => {
  const cardPrompt = PROMPTS['check-card-answer'];
  const cardInput: AiTaskInput<'check-card-answer'> = {
    cardType: 'cloze',
    meaningFr: 'Je n’ai pas encore fini.',
    textWithGap: "I haven't finished ___.",
    infinitive: null,
    expected: ['yet'],
    answer: 'so far',
    englishVariant: 'en-GB',
  };

  it('gives the card, the expected answers and the answer after the stable prefix', () => {
    const message = cardPrompt.userMessage(cardInput);
    expect(message).toContain('"I haven\'t finished ___."');
    expect(message).toContain('Expected answers: ["yet"]');
    expect(message).toContain('Learner\'s answer: "so far"');
    expect(message).not.toContain('Verb to use');
    expect(cardPrompt.system).not.toContain('so far');
  });

  it('shows a cost bound that covers the largest check the Edge Function may estimate', () => {
    const longest: AiTaskInput<'check-card-answer'> = {
      cardType: 'cloze',
      meaningFr: 'x'.repeat(MAX_CARD_TEXT),
      textWithGap: 'x'.repeat(MAX_CARD_TEXT),
      infinitive: 'x'.repeat(MAX_CARD_TEXT),
      expected: Array.from({ length: MAX_CARD_ANSWERS }, () => 'x'.repeat(MAX_CARD_TEXT)),
      answer: 'x'.repeat(MAX_CARD_ANSWER),
      englishVariant: 'en-GB',
    };
    expect(TASK_CONTRACTS['check-card-answer'].input.safeParse(longest).success).toBe(true);
    expect(
      estimateInputTokens(cardPrompt.system + cardPrompt.userMessage(longest)),
    ).toBeLessThanOrEqual(CHECK_CARD_ANSWER_MAX_INPUT_TOKENS);
  });

  it('refuses a card without an expected answer', () => {
    expect(
      TASK_CONTRACTS['check-card-answer'].input.safeParse({ ...cardInput, expected: [] }).success,
    ).toBe(false);
  });

  it('reads a verdict', () => {
    const output = TASK_CONTRACTS['check-card-answer'].output;
    expect(output.safeParse({ verdict: 'acceptable', reasonFr: 'Petite faute.' }).success).toBe(
      true,
    );
    expect(output.safeParse({ verdict: 'perfect', reasonFr: 'x' }).success).toBe(false);
  });
});
