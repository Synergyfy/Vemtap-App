import NetInfo from '@react-native-community/netinfo';
import { useOfflineQueueStore } from '@store/offlineQueueStore';
import { logger } from '@utils/logger';

type ReplayHandler = (mutation: {
  kind: string;
  payload: unknown;
}) => Promise<void>;

const handlers = new Map<string, ReplayHandler>();

/** Register a per-kind replay handler (call once per feature on mount). */
export function registerReplayHandler(kind: string, handler: ReplayHandler): void {
  handlers.set(kind, handler);
}

let replaying = false;

/** Drain the offline queue once connectivity returns. */
export async function replayQueuedMutations(): Promise<void> {
  if (replaying) {
    return;
  }
  replaying = true;
  const { queue, dequeue, markAttempt } = useOfflineQueueStore.getState();

  for (const item of queue) {
    const handler = handlers.get(item.kind);
    if (!handler) {
      logger.warn('app', `No replay handler for kind=${item.kind}`);
      continue;
    }
    try {
      markAttempt(item.id);
      await handler({ kind: item.kind, payload: item.payload });
      dequeue(item.id);
      logger.info('app', `Replayed offline mutation ${item.kind}`);
    } catch (error) {
      logger.error('app', `Failed to replay ${item.kind}`, error);
      // Leave in queue for next reconnect; drop after many attempts.
      if (item.attempts >= 5) {
        dequeue(item.id);
      }
      break;
    }
  }
  replaying = false;
}

/** Subscribe once at app start. */
export function startOfflineReplay(): () => void {
  return NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable !== false) {
      const { queue } = useOfflineQueueStore.getState();
      if (queue.length > 0) {
        replayQueuedMutations().catch(() => undefined);
      }
    }
  });
}
