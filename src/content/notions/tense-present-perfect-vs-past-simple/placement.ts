import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-present-perfect-vs-past-simple', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'I ___ my passport last week.',
    options: ['lost', 'have lost', 'losed'],
    answer: 'lost',
  }),
  placement(2, {
    sentence: 'We ___ each other for ten years.',
    options: ['have known', 'know', 'are knowing'],
    answer: 'have known',
  }),
  placement(3, {
    sentence: 'When ___ the company?',
    options: ['did you join', 'have you joined', 'you joined'],
    answer: 'did you join',
  }),
  placement(4, {
    sentence: 'This is the first time I ___ this dish.',
    options: ['have tried', 'try', 'has tried'],
    answer: 'have tried',
  }),
];
