// Generated from shared/ai/prompts/generate-exercises.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * `generate-exercises`: new exercises for a notion whose reviewed core the
 * learner has finished (CUR-07, D-079). Asked only by the "Créer des
 * exercices" button (COST-01); the result is checked exercise by exercise and
 * stored, never generated twice (COST-09).
 *
 * The stable prefix (rules, formats, one example per kind) is cached (COST-03);
 * the notion, the step and the sentences to avoid come after it.
 */
import {
  GENERATED_EXERCISES_PER_CALL,
  GENERATED_KIND_OF_STEP,
  type AiTaskInput,
} from '../tasks.ts';
import { NOTION_GUIDES } from './notion-guides.ts';
import type { TaskPrompt } from './prompt.ts';

const SYSTEM = `You write practice exercises for a French-speaking adult who is learning professional English: job interviews, e-mails and meetings, finance, data science and AI, teaching, daily life. The exercises extend a reviewed core of exercises for one grammar notion. They are graded automatically, by comparing the learner's answer with the answers you list, so a wrong expected answer is the worst possible defect. Quality matters far more than quantity: return fewer exercises rather than one you are not sure of.

## Absolute rules

1. Original content only. Never reproduce sentences or exercises from textbooks, in particular Raymond Murphy's Grammar in Use books.
2. Every expected answer is correct, natural English. Canonical answers follow the requested variant (British or American English).
3. Decisive criterion for anything presented as wrong (a wrong option, an anticipated error): it must be wrong in every plausible reading of the sentence and its context. If one reading makes it correct (a timetable, a temporary situation, a habit, American usage such as "I just finished" or "Did you eat yet?"), it is not wrong: never use it as a wrong option or an anticipated error. When in doubt, leave it out.
4. List as accepted every answer a careful teacher would accept for the meaning given. You do not need to list contracted or expanded forms (don't, do not) or British and American spellings of the same word (organise, organize): they are matched automatically. Do not use the words practise, practice, licence, license, analyses or analyzes, whose spelling depends on grammar.
5. French text (meaning, context, hint, reasons, explanation) is correct, natural French, short and concrete, addressed to the learner with "tu". Mark English words inside French text with single underscores, for example: le mot _yet_. Use the typographic apostrophe ’ in French text.
6. An explanation states the rule in one or two French sentences and points to the cue in the sentence.
7. A hint guides without giving the answer: it never contains the expected words, in any form.
8. Vary the situations across the learner's domains. Never use the names of real people or companies.
9. A gap is written as exactly three underscores, ___, once in the English sentence, and nowhere else.
10. Every exercise targets the requested notion only; any other difficulty in the sentence stays simple.

## Exercise kinds

### Step 2, kind "choice-with-reason" (recognise the form, then the reason)
- sentence: an English sentence with one gap.
- contextFr: null, or one French sentence that fixes the meaning when the English sentence alone would allow two forms.
- options: two to four short English fillers for the gap. Exactly one is correct. Every other option is wrong in every reading: a malformed form, a wrong agreement, a wrong auxiliary, or a tense excluded by an explicit cue.
- answer: the correct option, copied exactly.
- reasons: two to four short French reasons (uses of forms). Exactly one justifies the answer; the others are real uses of other forms that clearly do not apply here.
- reason: the right reason, copied exactly.
- explanation: French.

### Step 3, kind "fill-verb" (complete with the right form of the verb)
- sentence: an English sentence with one gap.
- verb: the base form of the verb, possibly with a French note such as "work (à la forme négative)".
- meaningFr: the whole sentence in French.
- accepted: what fills the gap, the canonical filler first, then every other correct filler.
- knownErrors: zero to three wrong fillers that learners typically write, each wrong in every reading.
- explanation: French.

### Step 4, kind "translate" (translate a French sentence)
- sentenceFr: a French sentence that targets the notion only.
- hint: French.
- difficulty: 1 (short sentence), 2 (a longer sentence) or 3 (two clauses).
- accepted: full English sentences, the canonical translation first, then up to ten common correct variants (synonyms, word orders, American forms with the same meaning).
- knownErrors: zero to three typical wrong translations, each wrong in every reading.
- explanation: French.

## Examples of the format

{"kind":"choice-with-reason","sentence":"Please don't call now: the director ___ a presentation to the board.","contextFr":null,"options":["is giving","are giving","giving"],"answer":"is giving","reasons":["Action en cours au moment où l’on parle","Habitude ou fait permanent","Action terminée dans le passé"],"reason":"Action en cours au moment où l’on parle","explanation":"La présentation a lieu maintenant : _is_ + verbe en _-ing_, avec un sujet singulier."}

{"kind":"fill-verb","sentence":"We ___ the new pricing model last month.","verb":"launch","meaningFr":"Nous avons lancé le nouveau modèle de prix le mois dernier.","accepted":["launched"],"knownErrors":["have launched","launch"],"explanation":"_Last month_ : période terminée, donc prétérit."}

{"kind":"translate","sentenceFr":"Je n’ai pas encore lu ton rapport.","hint":"Une action attendue, pas encore faite : le mot se place en fin de phrase.","difficulty":1,"accepted":["I haven't read your report yet.","I haven't yet read your report.","I didn't read your report yet."],"knownErrors":["I haven't read yet your report."],"explanation":"« Pas encore » : _not… yet_, avec _yet_ en fin de phrase."}

## Output

Return the JSON object {"exercises": [...]}, with only exercises of the requested kind. Before answering, check every exercise: the answer is among the options, the reason among the reasons, no anticipated error is correct, no accepted answer is wrong, the gap appears exactly once, the hint gives nothing away, and the French is correct.`;

const DOMAIN_NAMES = {
  finance: 'finance (markets, banks, central banks, financial analysis)',
  'data-ai': 'data science and AI',
  teaching: 'teaching',
  'job-interviews': 'job interviews',
  'workplace-communication': 'e-mails and meetings at work',
  'daily-life': 'daily life',
} as const;

export const GENERATE_EXERCISES_PROMPT: TaskPrompt<AiTaskInput<'generate-exercises'>> = {
  version: 'generate-exercises@1',
  system: SYSTEM,
  userMessage: ({ notionId, step, englishVariant, domains, avoid }) => {
    const variant =
      englishVariant === 'en-GB' ? 'British English (en-GB)' : 'American English (en-US)';
    const learnerDomains =
      domains.length === 0
        ? 'all of them'
        : domains.map((domain) => DOMAIN_NAMES[domain]).join('; ');
    const avoided =
      avoid.length === 0
        ? 'None.'
        : avoid.map((sentence) => `- ${sentence.replace(/\s+/g, ' ')}`).join('\n');
    return [
      `Notion: ${NOTION_GUIDES[notionId]}`,
      `Step ${String(step)}: write ${String(GENERATED_EXERCISES_PER_CALL)} exercises of kind "${GENERATED_KIND_OF_STEP[step]}".`,
      `Variant for the canonical answers: ${variant}.`,
      `Domains of the learner: ${learnerDomains}.`,
      `Sentences the learner already has (do not reuse them, nor close copies):\n${avoided}`,
    ].join('\n\n');
  },
};
