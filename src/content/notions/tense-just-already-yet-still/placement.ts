import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-just-already-yet-still', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'I haven’t finished the report ___.',
    options: ['yet', 'already', 'just'],
    answer: 'yet',
  }),
  placement(2, {
    sentence: 'She’s ___ left: you can still catch her in the car park.',
    options: ['just', 'yet', 'still'],
    answer: 'just',
  }),
  placement(3, {
    sentence: 'We ___ haven’t received the payment.',
    options: ['still', 'already', 'ever'],
    answer: 'still',
  }),
  placement(4, {
    sentence: 'Have you ___ booked the hotel? That was quick!',
    options: ['already', 'yet', 'still'],
    answer: 'already',
  }),
];
