/**
 * Constructions that prove the use of a notion at step 5 (PEDAGOGY §3.3,
 * D-088), read by `domain/production/notion-use.ts` (pattern syntax there).
 * A production is good only if the app recognizes one of them, outside any
 * counted error, in the words the model points to. They are closed lists:
 * a use they miss stays unproven, and counts neither for nor against the step.
 *
 * Contrasts and the review ask for several tenses, each shown by its own use.
 */
import type { NotionId } from '../domain/curriculum/notion-id.ts';
import type { NotionUse } from '../domain/production/notion-use.ts';

const PRESENT_SIMPLE = ['{base}', '{third}', 'do|does {base}'];
const PRESENT_CONTINUOUS = ['am|is|are {ing}'];
const PAST_SIMPLE = ['{past}', 'did {base}'];
const PAST_CONTINUOUS = ['was|were {ing}'];
const PRESENT_PERFECT = ['have|has {participle}'];
const PRESENT_PERFECT_CONTINUOUS = ['have|has been {ing}'];
const PAST_PERFECT = ['had {participle}'];
/** Words that place a present in the future: an arrangement, a timetable. */
const LATER =
  'tomorrow|tonight|next|soon|later|monday|tuesday|wednesday|thursday|friday|saturday|sunday';
const FUTURE = [
  'will|shall {base}',
  'will|shall be {ing}',
  'will|shall have {participle}',
  'am|is|are going to {base}',
  `am|is|are {ing} … ${LATER}`,
  `${LATER} … am|is|are {ing}`,
  `{third} … ${LATER}`,
  `{base} … ${LATER}`,
];
const FOR_SINCE_AGO = [
  'have|has|had {participle} … for|since',
  'have|has|had been {ing} … for|since',
  'have|has|had been {participle} … for|since',
  'for|since … have|has|had {participle}',
  'for|since … have|has|had been {ing}',
  'how long … have|has|had {participle}',
  'how long … have|has|had been {ing}',
  '{past} … for',
  '{past} … ago',
  'ago … {past}',
];
const JUST_ALREADY_YET_STILL = [
  'have|has|had just|already {participle}',
  'have|has|had {participle} … already|yet',
  'just|already {past}',
  'did {base} … yet',
  'still',
];

const single = (patterns: readonly string[]): NotionUse => ({ groups: [patterns], required: 1 });

export const NOTION_USES: Readonly<Partial<Record<NotionId, NotionUse>>> = {
  'tense-present-simple': single(PRESENT_SIMPLE),
  'tense-present-continuous': single(PRESENT_CONTINUOUS),
  'tense-present-simple-vs-continuous': {
    groups: [PRESENT_SIMPLE, PRESENT_CONTINUOUS],
    required: 2,
  },
  'tense-past-simple': single(PAST_SIMPLE),
  'tense-past-continuous': single(PAST_CONTINUOUS),
  'tense-present-perfect': single(PRESENT_PERFECT),
  'tense-present-perfect-vs-past-simple': { groups: [PRESENT_PERFECT, PAST_SIMPLE], required: 2 },
  'tense-just-already-yet-still': single(JUST_ALREADY_YET_STILL),
  'tense-for-since-ago': single(FOR_SINCE_AGO),
  'tense-present-perfect-continuous': single(PRESENT_PERFECT_CONTINUOUS),
  'tense-past-perfect': single(PAST_PERFECT),
  'tense-future': single(FUTURE),
  // The three time frames the prompts of the review ask for, each with its own tense.
  'tense-review': {
    groups: [
      PRESENT_SIMPLE,
      PRESENT_CONTINUOUS,
      PAST_SIMPLE,
      PAST_CONTINUOUS,
      PRESENT_PERFECT,
      PRESENT_PERFECT_CONTINUOUS,
      PAST_PERFECT,
      FUTURE,
    ],
    required: 3,
  },
};
