import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-past-continuous', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'I ___ TV when the power went off.',
    options: ['was watching', 'were watching', 'watch'],
    answer: 'was watching',
  }),
  placement(2, {
    sentence: 'While we ___ the contract, the client called.',
    options: ['were reading', 'was reading', 'are reading'],
    answer: 'were reading',
  }),
  placement(3, {
    sentence: 'She was cooking when the doorbell ___.',
    options: ['rang', 'ringed', 'rings'],
    answer: 'rang',
  }),
  placement(4, {
    sentence: 'What ___ at 7 p.m. yesterday?',
    options: ['were you doing', 'did you doing', 'you were doing'],
    answer: 'were you doing',
  }),
];
