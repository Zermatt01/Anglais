/** `cards` table (class D, P1/P4): review cards and their spaced repetition state. */
import { z } from 'zod';
import {
  cardContentSchema,
  cardOriginSchema,
  cardStatusSchema,
  notionOfCard,
  suspensionReasonSchema,
} from '../../domain/cards/content.ts';
import { notionIdSchema } from '../../domain/curriculum/notion-id.ts';
import { epochMsSchema, uuidSchema } from '../../domain/primitives.ts';
import { srsStateSchema } from '../../domain/srs/state.ts';
import { documentTimestamps } from './common.ts';

export const cardDocumentSchema = z
  .strictObject({
    id: uuidSchema,
    ...documentTimestamps,
    schemaVersion: z.literal(1),
    content: cardContentSchema,
    /** Copy of the content's notion, for the `notionId` index. */
    notionId: notionIdSchema.nullable(),
    sourceErrorId: uuidSchema.nullable(),
    status: cardStatusSchema,
    suspensionReason: suspensionReasonSchema.nullable(),
    srs: srsStateSchema,
    /** Copy of `srs.due`, for the `[status+due]` index. */
    due: epochMsSchema,
    origin: cardOriginSchema,
  })
  .superRefine((card, context) => {
    if (card.notionId !== notionOfCard(card.content)) {
      context.addIssue({ code: 'custom', path: ['notionId'], message: 'must copy the content' });
    }
    if (card.due !== card.srs.due) {
      context.addIssue({ code: 'custom', path: ['due'], message: 'must copy srs.due' });
    }
    if ((card.status === 'suspended') !== (card.suspensionReason !== null)) {
      context.addIssue({
        code: 'custom',
        path: ['suspensionReason'],
        message: 'a reason is required for, and only for, a suspended card',
      });
    }
  });
export type CardDocument = z.infer<typeof cardDocumentSchema>;
