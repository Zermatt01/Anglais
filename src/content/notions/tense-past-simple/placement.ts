import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-past-simple', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'I ___ my keys at the office yesterday.',
    options: ['left', 'leaved', 'have left'],
    answer: 'left',
  }),
  placement(2, {
    sentence: '___ you call the bank last Monday?',
    options: ['Did', 'Have', 'Do'],
    answer: 'Did',
  }),
  placement(3, {
    sentence: 'She ___ the job because the salary was too low.',
    options: ['didn’t take', 'didn’t took', 'not took'],
    answer: 'didn’t take',
  }),
  placement(4, {
    sentence: 'We ___ 5,000 euros for the new software last month.',
    options: ['paid', 'payed', 'have paid'],
    answer: 'paid',
  }),
];
