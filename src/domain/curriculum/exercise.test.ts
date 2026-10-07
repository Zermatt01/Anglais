import { describe, expect, it } from 'vitest';
import {
  acceptedAnswersOf,
  checkExercise,
  evaluateTypedAnswer,
  exerciseSchema,
  fillGap,
  isChoiceCorrect,
  type ExerciseInput,
  type ExerciseOf,
} from './exercise.ts';

function parse<Kind extends ExerciseInput['kind']>(
  input: Extract<ExerciseInput, { kind: Kind }>,
): ExerciseOf<Kind> {
  return exerciseSchema.parse(input) as ExerciseOf<Kind>;
}

const choice = (overrides: Partial<Extract<ExerciseInput, { kind: 'choice-with-reason' }>> = {}) =>
  parse<'choice-with-reason'>({
    kind: 'choice-with-reason',
    sentence: 'Quiet, please: the manager ___ to a client right now.',
    options: ['is talking', 'talks'],
    answer: 'is talking',
    reasons: ['Action en cours au moment où l’on parle', 'Habitude ou vérité générale'],
    reason: 'Action en cours au moment où l’on parle',
    explanation: '_Right now_ : l’action se déroule maintenant.',
    ...overrides,
  });

const fillVerb = (overrides: Partial<Extract<ExerciseInput, { kind: 'fill-verb' }>> = {}) =>
  parse<'fill-verb'>({
    kind: 'fill-verb',
    sentence: 'She ___ the report, you can read it now.',
    verb: 'finish',
    meaningFr: 'Elle vient de terminer le rapport, tu peux le lire maintenant.',
    accepted: ['has just finished'],
    knownErrors: ['just finished has', 'has finish'],
    explanation: '_Just_ se place entre _has_ et le participe passé.',
    ...overrides,
  });

const translate = (overrides: Partial<Extract<ExerciseInput, { kind: 'translate' }>> = {}) =>
  parse<'translate'>({
    kind: 'translate',
    sentenceFr: 'Je n’ai pas encore reçu les résultats.',
    hint: 'Action attendue, pas encore faite : « encore » se met en fin de phrase.',
    difficulty: 1,
    accepted: ["I haven't received the results yet.", 'I have not received the results yet.'],
    knownErrors: ['I have not received yet the results.'],
    explanation: '_Yet_ se place en fin de phrase négative.',
    ...overrides,
  });

describe('exerciseSchema', () => {
  it('defaults the anticipated errors to none', () => {
    const exercise = parse<'fill-verb'>({
      kind: 'fill-verb',
      sentence: 'They ___ in Zurich.',
      verb: 'live',
      meaningFr: 'Ils vivent à Zurich.',
      accepted: ['live'],
      explanation: 'Présent simple.',
    });
    expect(exercise.knownErrors).toEqual([]);
  });

  it('refuses an exercise without an accepted answer, or with a blank one', () => {
    expect(exerciseSchema.safeParse({ ...fillVerb(), accepted: [] }).success).toBe(false);
    expect(exerciseSchema.safeParse({ ...fillVerb(), accepted: ['  '] }).success).toBe(false);
  });

  it('refuses an unknown kind or an unexpected field', () => {
    expect(exerciseSchema.safeParse({ ...fillVerb(), kind: 'free-text' }).success).toBe(false);
    expect(exerciseSchema.safeParse({ ...fillVerb(), prompt: 'x' }).success).toBe(false);
  });

  it('bounds the difficulty of a translation from 1 to 3', () => {
    expect(exerciseSchema.safeParse({ ...translate(), difficulty: 4 }).success).toBe(false);
  });
});

describe('checkExercise', () => {
  it('accepts well-formed exercises of every kind', () => {
    expect(checkExercise(choice())).toEqual([]);
    expect(checkExercise(fillVerb())).toEqual([]);
    expect(checkExercise(translate())).toEqual([]);
    expect(
      checkExercise(
        parse<'transform'>({
          kind: 'transform',
          source: 'She has finished the report.',
          instructionFr: 'Mets la phrase à la forme négative.',
          accepted: ["She hasn't finished the report.", 'She has not finished the report.'],
          explanation: 'Négation : _has not_ (_hasn’t_).',
        }),
      ),
    ).toEqual([]);
    expect(
      checkExercise(
        parse<'place-word'>({
          kind: 'place-word',
          sentence: 'I have sent the invoice.',
          word: 'already',
          meaningFr: 'J’ai déjà envoyé la facture.',
          accepted: ['I have already sent the invoice.'],
          explanation: '_Already_ se place entre _have_ et le participe passé.',
        }),
      ),
    ).toEqual([]);
  });

  it('requires exactly one gap in a sentence to complete', () => {
    expect(checkExercise(fillVerb({ sentence: 'She finished the report.' }))).toContain(
      'gap-count',
    );
    expect(checkExercise(choice({ sentence: 'The ___ is ___ now.' }))).toContain('gap-count');
  });

  it('requires the answer among the options and the reason among the reasons', () => {
    expect(checkExercise(choice({ answer: 'talk' }))).toContain('answer-not-in-options');
    expect(checkExercise(choice({ reason: 'Autre raison' }))).toContain('reason-not-in-reasons');
  });

  it('requires a reviewed reason set when sets are given, in any order (D-081)', () => {
    const now = 'Action en cours au moment où l’on parle';
    const habit = 'Habitude ou vérité générale';
    const past = 'Action terminée dans le passé';
    const reasonSets = [[now, habit, past]] as const;
    const three = choice({ reasons: [past, now, habit] });
    expect(checkExercise(three, { reasonSets })).toEqual([]);
    // Without sets (the reviewed core), the reasons are free.
    expect(checkExercise(choice())).toEqual([]);
    // A missing or added reason, another right reason, or no set at all: refused.
    expect(checkExercise(choice(), { reasonSets })).toEqual(['reason-set-not-reviewed']);
    expect(
      checkExercise(choice({ reasons: [now, habit, past, 'Activité en cours'] }), { reasonSets }),
    ).toEqual(['reason-set-not-reviewed']);
    expect(
      checkExercise(choice({ reasons: [now, habit, past], reason: habit }), { reasonSets }),
    ).toEqual(['reason-set-not-reviewed']);
    expect(checkExercise(three, { reasonSets: [] })).toEqual(['reason-set-not-reviewed']);
    // Typed exercises have no reasons: the sets do not apply.
    expect(checkExercise(fillVerb(), { reasonSets: [] })).toEqual([]);
  });

  it('refuses two options that are the same answer (contraction included)', () => {
    expect(
      checkExercise(
        choice({ sentence: 'She ___ just left.', options: ['has', "'s"], answer: 'has' }),
      ),
    ).toContain('duplicate-option');
  });

  it('refuses an anticipated error that is in fact accepted (NO-05)', () => {
    expect(checkExercise(fillVerb({ knownErrors: ["'s just finished"] }))).toEqual([
      'known-error-accepted',
    ]);
    expect(
      checkExercise(translate({ knownErrors: ['I have not received the results yet'] })),
    ).toEqual(['known-error-accepted']);
  });

  it('refuses a hint that gives the answer away', () => {
    expect(
      checkExercise(translate({ hint: 'Écris : I have not received the results yet.' })),
    ).toEqual(['hint-reveals-answer']);
  });

  it('refuses a French meaning that is in fact the English answer', () => {
    expect(checkExercise(translate({ sentenceFr: "I haven't received the results yet" }))).toEqual([
      'meaning-is-answer',
    ]);
  });

  it('refuses a transformation that asks for nothing', () => {
    const exercise = parse<'transform'>({
      kind: 'transform',
      source: "She hasn't finished.",
      instructionFr: 'Mets la phrase à la forme négative.',
      accepted: ['She has not finished.'],
      explanation: 'Déjà négative.',
    });
    expect(checkExercise(exercise)).toEqual(['source-is-answer']);
  });

  it('refuses a word to place that is already placed, or missing from an answer', () => {
    const exercise = parse<'place-word'>({
      kind: 'place-word',
      sentence: 'I have already sent the invoice.',
      word: 'already',
      meaningFr: 'J’ai déjà envoyé la facture.',
      accepted: ['I have sent the invoice.'],
      explanation: 'x',
    });
    expect(checkExercise(exercise)).toEqual(['word-already-placed', 'word-missing-from-answer']);
  });

  it('requires both spellings of a grammar-dependent spelling (D-057)', () => {
    const british = translate({
      sentenceFr: 'Elle s’entraîne tous les jours.',
      hint: 'Habitude : présent simple.',
      accepted: ['She practises every day.'],
      knownErrors: [],
    });
    expect(checkExercise(british)).toEqual(['context-dependent-spelling']);
    const both = translate({
      sentenceFr: 'Elle s’entraîne tous les jours.',
      hint: 'Habitude : présent simple.',
      accepted: ['She practises every day.', 'She practices every day.'],
      knownErrors: [],
    });
    expect(checkExercise(both)).toEqual([]);
  });
});

describe('evaluateTypedAnswer', () => {
  it('puts a gap filler back in its sentence, so contractions match', () => {
    expect(evaluateTypedAnswer(fillVerb(), 'has just finished').verdict).toBe('correct');
    expect(evaluateTypedAnswer(fillVerb(), "'s just finished").verdict).toBe('correct');
    expect(evaluateTypedAnswer(fillVerb(), 'HAS JUST FINISHED.').verdict).toBe('correct');
  });

  it('marks only an anticipated error as incorrect, anything else as unknown', () => {
    expect(evaluateTypedAnswer(fillVerb(), 'has finish').verdict).toBe('incorrect');
    expect(evaluateTypedAnswer(fillVerb(), 'finished just now').verdict).toBe('unknown');
    expect(evaluateTypedAnswer(fillVerb(), '   ').verdict).toBe('unknown');
  });

  it('compares a whole sentence for other kinds', () => {
    expect(evaluateTypedAnswer(translate(), 'I have not received the results yet').verdict).toBe(
      'correct',
    );
    expect(evaluateTypedAnswer(translate(), 'I have not received yet the results.').verdict).toBe(
      'incorrect',
    );
  });

  it('lists accepted answers as whole sentences', () => {
    expect(acceptedAnswersOf(fillVerb())).toEqual([
      'She has just finished the report, you can read it now.',
    ]);
  });
});

describe('isChoiceCorrect', () => {
  it('needs both the form and the reason', () => {
    const exercise = choice();
    expect(isChoiceCorrect(exercise, 'is talking', exercise.reason)).toBe(true);
    expect(isChoiceCorrect(exercise, 'talks', exercise.reason)).toBe(false);
    expect(isChoiceCorrect(exercise, 'is talking', 'Habitude ou vérité générale')).toBe(false);
  });
});

describe('fillGap', () => {
  it('fills the gap, attaching a contraction to the word before it', () => {
    expect(fillGap('She ___ left.', ' has ')).toBe('She has left.');
    expect(fillGap('She ___ left.', "'s")).toBe("She's left.");
    expect(fillGap('She ___ left.', '’s')).toBe('She’s left.');
  });

  it('never reads a dollar sign as a replacement pattern', () => {
    expect(fillGap('Rates rose by ___.', "$&$'")).toBe("Rates rose by $&$'.");
  });
});
