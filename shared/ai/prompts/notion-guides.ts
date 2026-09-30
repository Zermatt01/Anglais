/**
 * What each notion covers, for the exercise generation prompt (D-079). Read by
 * the Edge Function only (D-017). The lessons themselves are in `src/content`.
 */
import type { GeneratableNotionId } from '../tasks.ts';

export const NOTION_GUIDES: Readonly<Record<GeneratableNotionId, string>> = {
  'tense-present-continuous':
    'Present continuous (am/is/are + -ing): actions in progress at the moment of speaking, temporary situations (this week, at the moment) and changing trends (prices are rising). Cues must make the present continuous the only correct form (right now, Look!, Listen!, this week). Do not test its future use (arrangements), which belongs to another notion.',
  'tense-present-simple':
    'Present simple: habits and routines, permanent situations, general truths, timetables and state verbs (know, belong, depend, prefer). Test the third-person -s, do/does/don’t/doesn’t in questions and negatives (base form after does), and the position of frequency adverbs (before the main verb, after be).',
  'tense-present-simple-vs-continuous':
    'Choice between the present simple (habit, permanent situation, general truth, state verbs such as know, belong, prefer) and the present continuous (in progress now, temporary situation). Only use cues that make one form wrong in every reading: temporary habits, schedules and “at the moment” with state-like verbs (live, work) can allow both forms.',
  'tense-past-simple':
    'Past simple of regular verbs and frequent irregular verbs (go, buy, send, pay, write, meet, leave, get…) for finished actions at a definite past time (yesterday, last week, in 2020, ago), past sequences and past habits; did/didn’t + base form in questions and negatives.',
  'tense-past-continuous':
    'Past continuous (was/were + -ing) for an action in progress at a past moment, the background interrupted by a past simple action (when), or two actions in progress at the same time (while). State verbs stay in the past simple. Past habits are expressed with the past simple or used to, not the past continuous.',
  'tense-present-perfect':
    'Present perfect (have/has + past participle) for life experience without a definite time (ever, never, before), present results of past actions, and periods not yet finished (this week, this year). Test irregular past participles (been, gone, seen, written, given…). American English often uses the past simple in these cases: accept it as a variant when the meaning is the same, and never present it as wrong.',
  'tense-just-already-yet-still':
    'just, already, yet and still with the present perfect: just (a moment ago) and already between have and the participle; yet at the end of negatives and questions (formal “haven’t yet + participle” is also correct); still before the main verb, after be, and before a negative auxiliary (still haven’t). American English also uses the past simple with just, already and yet (I just finished, Did you eat yet?): accept it.',
  'tense-for-since-ago':
    'for + a duration and since + a starting point with the present perfect (simple or continuous) for situations continuing up to now; ago with the past simple; How long…? The key trap for French speakers is “depuis” with the present tense: “I work here since 2020” is wrong, “I have worked here since 2020” is right. With a finished period in the past, for goes with the past simple.',
  'tense-present-perfect-vs-past-simple':
    'Choice between the present perfect (no definite time, link with now, since/for up to now, “It is the first time…”) and the past simple (definite past time, finished period, When…? What time…?). Only use contexts where one tense is wrong in every variety of English: a definite past time excludes the present perfect; a situation continuing up to now excludes the past simple. Avoid just, already, yet and ever, where American English accepts both.',
  'tense-future':
    'Future forms: will (decision at the moment of speaking, promise, offer, prediction), be going to (intention already decided, prediction from present evidence), present continuous (fixed arrangement), present simple (timetables), and the present after when, if, as soon as, before and until for a future meaning. Several forms are often correct: accept every correct form, and only present as wrong a form that is wrong in every reading (for example will in a time clause after when, or a malformed form).',
  'tense-present-perfect-continuous':
    'Present perfect continuous (have/has been + -ing) for an activity continuing up to now (for, since, how long) or a recent activity with visible results (You look tired. — I’ve been working all night.). The present perfect simple is used for quantities and results (how many, three reports) and for state verbs (know). With for or since, the simple form of action verbs such as work, live or wait is also correct: accept it.',
  'tense-past-perfect':
    'Past perfect (had + past participle) for an action before another past moment (when I arrived, by the time, before), in reported speech, and after “It was the first time”. When before or after already gives the order of the actions, the past simple is also correct: accept it.',
  'tense-review':
    'Mixed practice of all these tenses: present simple and continuous, past simple and continuous, present perfect simple and continuous, past perfect and the future forms. Each exercise must have one unambiguous cue that makes the expected tense the only correct one.',
};
