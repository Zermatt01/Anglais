import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-future', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'I’ll send you the report when I ___ it.',
    options: ['finish', 'will finish', 'finished'],
    answer: 'finish',
  }),
  placement(2, {
    sentence: 'Look at the queue! We ___ miss the train.',
    options: ['are going to', 'going to', 'are go to'],
    answer: 'are going to',
  }),
  placement(3, {
    sentence: 'I ___ my manager at 3 p.m. today; it’s all arranged.',
    options: ['am seeing', 'seeing', 'am see'],
    answer: 'am seeing',
  }),
  placement(4, {
    sentence: 'If the price ___, we won’t buy it.',
    options: ['rises', 'will rises', 'rise'],
    answer: 'rises',
  }),
];
