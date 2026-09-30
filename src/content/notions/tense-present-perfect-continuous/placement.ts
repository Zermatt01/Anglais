import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-present-perfect-continuous', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'I ___ for you for half an hour!',
    options: ['have been waiting', 'has been waiting', 'have been wait'],
    answer: 'have been waiting',
  }),
  placement(2, {
    sentence: 'She ___ him since 2015.',
    options: ['has known', 'has been knowing', 'is knowing'],
    answer: 'has known',
  }),
  placement(3, {
    sentence: 'How long ___ here?',
    options: ['have you been living', 'are you been living', 'you have been living'],
    answer: 'have you been living',
  }),
  placement(4, {
    sentence: 'You’re covered in paint! What ___?',
    options: ['have you been doing', 'have you been do', 'you have been doing'],
    answer: 'have you been doing',
  }),
];
