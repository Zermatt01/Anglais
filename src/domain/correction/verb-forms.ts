/**
 * Closed lists of verb forms by role (D-058, D-088): base, third person, past,
 * past participle and -ing form, read from the verbs of `word-families.ts`.
 * A verb missing from the families has no form here.
 *
 * Used to recognize the construction of a tense in words of the learner's text
 * (`production/notion-use.ts`), never to accept or correct an answer. The role
 * of a form is read from its place in its family, and, for regular verbs, from
 * its ending among the attested forms: no form is ever made by a rule.
 */
import { IRREGULAR_VERBS, REGULAR_VERBS } from './word-families.ts';

export const VERB_FORM_ROLES = ['base', 'third', 'past', 'participle', 'ing'] as const;
export type VerbFormRole = (typeof VERB_FORM_ROLES)[number];

/** Irregular verbs written with four forms whose participle is the base ("come came come"). */
const PARTICIPLE_IS_BASE: ReadonlySet<string> = new Set(['come', 'become', 'overcome', 'run']);
/** Irregular verbs written with four forms whose past is the base ("beat beat beaten"). */
const PAST_IS_BASE: ReadonlySet<string> = new Set(['beat']);
/** Irregular verbs written without their third person ("mean meant meaning"). */
const THIRD_LEFT_OUT: ReadonlySet<string> = new Set(['mean']);
/**
 * -ing forms of the families that are mostly adjectives after "be" ("the file
 * is missing", "the results are promising"): never read as -ing forms, so that
 * they never prove a continuous tense (D-090).
 */
const ADJECTIVES_IN_ING: ReadonlySet<string> = new Set([
  'missing',
  'misleading',
  'promising',
  'upsetting',
  'worrying',
]);
/** Attested forms that the families leave out: the British participle "got". */
const EXTRA_FORMS: readonly (readonly [VerbFormRole, string])[] = [['participle', 'got']];

type Roles = Record<VerbFormRole, string[]>;

const emptyRoles = (): Roles => ({ base: [], third: [], past: [], participle: [], ing: [] });

function irregularRoles(forms: readonly string[]): Roles {
  const roles = emptyRoles();
  const [base = '', second = '', third = '', fourth = '', fifth = ''] = forms;
  if (base === 'be') {
    // "am", "is" and "are" are only read as words of a pattern: "is" is also the
    // auxiliary of the present continuous, never a proof of a present simple.
    return { base: ['be'], third: [], past: ['was', 'were'], participle: ['been'], ing: ['being'] };
  }
  roles.base.push(base);
  if (forms.length === 3) {
    // "cut cuts cutting": past and participle are the base; "mean meant meaning".
    const pastForm = THIRD_LEFT_OUT.has(base) ? second : base;
    if (!THIRD_LEFT_OUT.has(base)) roles.third.push(second);
    roles.past.push(pastForm);
    roles.participle.push(pastForm);
    roles.ing.push(third);
  } else if (forms.length === 4) {
    roles.third.push(second);
    roles.past.push(PAST_IS_BASE.has(base) ? base : third);
    roles.participle.push(PARTICIPLE_IS_BASE.has(base) ? base : third);
    roles.ing.push(fourth);
  } else {
    roles.third.push(second);
    roles.past.push(third);
    roles.participle.push(fourth);
    roles.ing.push(fifth);
  }
  return roles;
}

/** A regular verb: its base first, then its attested forms, in both spellings when there are two. */
function regularRoles(forms: readonly string[]): Roles {
  const roles = emptyRoles();
  const [base = '', ...others] = forms;
  roles.base.push(base);
  for (const form of others) {
    if (form.endsWith('ing')) roles.ing.push(form);
    else if (form.endsWith('ed')) {
      roles.past.push(form);
      roles.participle.push(form);
    } else if (form.endsWith('s')) roles.third.push(form);
    else roles.base.push(form);
  }
  return roles;
}

const FORMS_BY_ROLE: Readonly<Record<VerbFormRole, ReadonlySet<string>>> = (() => {
  const sets: Record<VerbFormRole, Set<string>> = {
    base: new Set(),
    third: new Set(),
    past: new Set(),
    participle: new Set(),
    ing: new Set(),
  };
  const families = [
    ...IRREGULAR_VERBS.map((family) => irregularRoles(family.split(' '))),
    ...REGULAR_VERBS.map((family) => regularRoles(family.split(' '))),
  ];
  for (const roles of families) {
    for (const role of VERB_FORM_ROLES) for (const form of roles[role]) sets[role].add(form);
  }
  for (const [role, form] of EXTRA_FORMS) sets[role].add(form);
  for (const form of ADJECTIVES_IN_ING) sets.ing.delete(form);
  return sets;
})();

/** Whether `word` (a canonical token) is an attested verb form of this role. */
export function isVerbForm(word: string, role: VerbFormRole): boolean {
  return FORMS_BY_ROLE[role].has(word);
}
