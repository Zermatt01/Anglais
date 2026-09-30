import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { placement } = exercisesOf('tense-present-continuous', REVIEW);

export const PLACEMENT: NotionContentInput['placement'] = [
  placement(1, {
    sentence: 'Can I call you back? I ___ lunch right now.',
    options: ['am having', 'have', 'having'],
    answer: 'am having',
  }),
  placement(2, {
    sentence: 'Good news: our sales ___ this quarter.',
    options: ['are growing', 'is growing', 'growing', 'grows'],
    answer: 'are growing',
  }),
  placement(3, {
    sentence: 'Why ___ the report now? It’s due next month.',
    options: ['are you writing', 'do you writing', 'you are writing'],
    answer: 'are you writing',
  }),
  placement(4, {
    sentence: 'The lift ___ today, so please take the stairs.',
    options: ['isn’t working', 'doesn’t working', 'not working'],
    answer: 'isn’t working',
  }),
];
