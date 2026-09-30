import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-for-since-ago', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'I’ve lived here ___ 2018.',
    options: ['since', 'for', 'ago'],
    answer: 'since',
  }),
  placement(2, {
    sentence: 'She’s been on holiday ___ two weeks.',
    options: ['for', 'since', 'ago'],
    answer: 'for',
  }),
  placement(3, {
    sentence: 'They got married three years ___.',
    options: ['ago', 'for', 'during'],
    answer: 'ago',
  }),
  placement(4, {
    sentence: 'I ___ her since we were at school.',
    options: ['have known', 'know', 'am knowing'],
    answer: 'have known',
  }),
];
