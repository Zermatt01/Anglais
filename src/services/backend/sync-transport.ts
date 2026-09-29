/**
 * The synchronization transport (src/data/sync/protocol.ts) over the SQL
 * functions sync_push and sync_pull, called as the signed-in user: Row Level
 * Security limits them to the learner's own rows.
 */
import {
  pullResultSchema,
  pushResultSchema,
  type SyncTransport,
} from '../../data/sync/protocol.ts';
import type { RpcCaller } from './client.ts';

export function createSyncTransport(rpc: RpcCaller): SyncTransport {
  return {
    async push(documents, events) {
      return pushResultSchema.parse(
        await rpc('sync_push', { p_documents: documents, p_events: events }),
      );
    },
    async pull(cursor, limit) {
      return pullResultSchema.parse(await rpc('sync_pull', { p_cursor: cursor, p_limit: limit }));
    },
  };
}
