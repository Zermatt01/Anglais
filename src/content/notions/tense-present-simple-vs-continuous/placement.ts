import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-present-simple-vs-continuous', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'I usually ___ to work, but today I’m driving.',
    options: ['cycle', 'am cycling', 'cycling'],
    answer: 'cycle',
  }),
  placement(2, {
    sentence: 'Please be quiet: the baby ___.',
    options: ['is sleeping', 'sleeps', 'sleep'],
    answer: 'is sleeping',
  }),
  placement(3, {
    sentence: 'Sorry, I ___ what you mean.',
    options: ['don’t know', 'am not knowing', 'doesn’t know'],
    answer: 'don’t know',
  }),
  placement(4, {
    sentence: 'What ___? — I’m an accountant.',
    options: ['do you do', 'are you doing', 'you do'],
    answer: 'do you do',
  }),
];
