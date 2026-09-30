import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-review', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'I ___ in Paris since 2019.',
    options: ['have lived', 'live', 'lived'],
    answer: 'have lived',
  }),
  placement(2, {
    sentence: 'I ___ her two years ago.',
    options: ['met', 'have met', 'meet'],
    answer: 'met',
  }),
  placement(3, {
    sentence: 'When I called, she ___ dinner.',
    options: ['was having', 'is having', 'has had'],
    answer: 'was having',
  }),
  placement(4, {
    sentence: 'I’ll call you when I ___ home.',
    options: ['get', 'will get', 'got'],
    answer: 'get',
  }),
];
