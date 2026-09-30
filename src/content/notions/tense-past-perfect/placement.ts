import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-past-perfect', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'When I got home, my flatmate had already ___ to bed.',
    options: ['gone', 'went', 'go'],
    answer: 'gone',
  }),
  placement(2, {
    sentence: 'She was nervous because she ___ never flown before.',
    options: ['had', 'has', 'did'],
    answer: 'had',
  }),
  placement(3, {
    sentence: 'I ___ the email, so I didn’t know about the meeting.',
    options: ['hadn’t read', 'hadn’t readed', 'not had read'],
    answer: 'hadn’t read',
  }),
  placement(4, {
    sentence: 'By the time we arrived, the concert ___.',
    options: ['had started', 'has started', 'had start'],
    answer: 'had started',
  }),
];
