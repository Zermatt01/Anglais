import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-present-perfect', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'I ___ to Canada three times.',
    options: ['have been', 'have went', 'have be'],
    answer: 'have been',
  }),
  placement(2, {
    sentence: 'She ___ her phone, so she can’t call you.',
    options: ['has lost', 'have lost', 'has losed'],
    answer: 'has lost',
  }),
  placement(3, {
    sentence: '___ you ever eaten Japanese food?',
    options: ['Have', 'Did', 'Has'],
    answer: 'Have',
  }),
  placement(4, {
    sentence: 'I ___ that film, so let’s choose another one.',
    options: ['have seen', 'have saw', 'has seen'],
    answer: 'have seen',
  }),
];
