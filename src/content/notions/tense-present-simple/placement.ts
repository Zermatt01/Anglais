import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-present-simple', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'My sister ___ in a hospital.',
    options: ['works', 'work', 'working'],
    answer: 'works',
  }),
  placement(2, {
    sentence: '___ you usually take the bus to work?',
    options: ['Do', 'Does', 'Are'],
    answer: 'Do',
  }),
  placement(3, {
    sentence: 'He ___ coffee in the afternoon.',
    options: ['doesn’t drink', 'don’t drink', 'doesn’t drinks'],
    answer: 'doesn’t drink',
  }),
  placement(4, {
    sentence: 'This car ___ to my company.',
    options: ['belongs', 'is belonging', 'belong'],
    answer: 'belongs',
  }),
];
