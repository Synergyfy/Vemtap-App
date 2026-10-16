import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createIdempotencyKey } from '@api/client';
import { posApi, type BatchSyncResult, type NewSaleInput } from '@api/posApi';
import { registerReplayHandler } from '@services/offlineReplay';
import { useOfflineQueueStore } from '@store/offlineQueueStore';
import { queryClient } from '@store/queryClient';

/**
 * Offline checkout. A sale rung up without a connection is queued on the
 * device with its own `clientRef` (the server's idempotency key for
 * batch-sync), then replayed when the connection returns. The server answers
 * per sale, so a `duplicate` (pushed earlier, reply lost) is as good as
 * `synced`, and a `conflict` is parked for a person to review instead of being
 * retried forever.
 */

export const POS_SALE_QUEUE_KIND = 'pos.sale';

export interface QueuedSaleMeta {
  clientRef: string;
  total: number;
  method: string;
  itemCount: number;
  itemNames: string[];
  cashierName: string;
  createdAt: string;
}

export interface QueuedSalePayload {
  input: NewSaleInput;
  meta: QueuedSaleMeta;
}

export interface SyncOutcome extends QueuedSaleMeta {
  status: BatchSyncResult['status'];
  receiptNumber: string | null;
  saleId: string | null;
  error: string | null;
  syncedAt: string;
  /** Kept for conflicts so the sale can be re-queued once the cause is fixed. */
  input?: NewSaleInput;
}

interface PosSyncState {
  lastPushAt: string | null;
  outcomes: SyncOutcome[];
  record: (outcomes: SyncOutcome[]) => void;
  dismiss: (clientRef: string) => void;
}

/** Last push time and the per-sale results the reconciliation screen lists. */
export const usePosSyncStore = create<PosSyncState>()(
  persist(
    set => ({
      lastPushAt: null,
      outcomes: [],
      record: outcomes =>
        set(state => ({
          lastPushAt: new Date().toISOString(),
          outcomes: [
            ...outcomes,
            ...state.outcomes.filter(
              old => !outcomes.some(next => next.clientRef === old.clientRef),
            ),
          ].slice(0, 200),
        })),
      dismiss: clientRef =>
        set(state => ({
          outcomes: state.outcomes.filter(item => item.clientRef !== clientRef),
        })),
    }),
    { name: 'vemtap-pos-sync', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Queue a sale rung up offline. Returns its clientRef. */
export function queueOfflineSale(
  input: NewSaleInput,
  meta: Omit<QueuedSaleMeta, 'clientRef' | 'createdAt'>,
) {
  const clientRef = input.clientRef ?? createIdempotencyKey();
  const createdAt = new Date().toISOString();
  const payload: QueuedSalePayload = {
    input: { ...input, clientRef, orderedAt: input.orderedAt ?? createdAt },
    meta: { ...meta, clientRef, createdAt },
  };
  useOfflineQueueStore.getState().enqueue({ kind: POS_SALE_QUEUE_KIND, payload });
  return clientRef;
}

export function queuedOfflineSales(): QueuedSalePayload[] {
  return useOfflineQueueStore
    .getState()
    .queue.filter(item => item.kind === POS_SALE_QUEUE_KIND)
    .map(item => item.payload as QueuedSalePayload);
}

function toOutcome(
  payload: QueuedSalePayload,
  result: BatchSyncResult | undefined,
): SyncOutcome {
  const status = result?.status ?? 'failed';
  return {
    ...payload.meta,
    status,
    receiptNumber: result?.receiptNumber ?? null,
    saleId: result?.saleId ?? null,
    error: result?.error ?? null,
    syncedAt: new Date().toISOString(),
    ...(status === 'conflict' ? { input: payload.input } : {}),
  };
}

/** Put a conflicted sale back in the queue (e.g. after restocking). */
export function requeueConflict(clientRef: string) {
  const outcome = usePosSyncStore
    .getState()
    .outcomes.find(item => item.clientRef === clientRef);
  if (!outcome?.input) return false;
  const {
    input,
    status: _status,
    receiptNumber: _r,
    saleId: _s,
    error: _e,
    syncedAt: _t,
    ...meta
  } = outcome;
  useOfflineQueueStore.getState().enqueue({
    kind: POS_SALE_QUEUE_KIND,
    payload: { input, meta } satisfies QueuedSalePayload,
  });
  usePosSyncStore.getState().dismiss(clientRef);
  return true;
}

/**
 * Push every queued sale in one batch-sync call. Synced, duplicate and
 * conflict sales leave the queue (conflicts move to the review list); failed
 * ones stay for the next attempt.
 */
export async function syncOfflineSales(): Promise<SyncOutcome[]> {
  const { queue, dequeue } = useOfflineQueueStore.getState();
  const items = queue.filter(item => item.kind === POS_SALE_QUEUE_KIND);
  if (!items.length) return [];

  const payloads = items.map(item => item.payload as QueuedSalePayload);
  const results = await posApi.batchSync(payloads.map(payload => payload.input));
  const byRef = new Map(results.map(result => [result.clientRef, result]));

  const outcomes = payloads.map(payload =>
    toOutcome(payload, byRef.get(payload.meta.clientRef)),
  );
  items.forEach((item, index) => {
    if (outcomes[index].status !== 'failed') dequeue(item.id);
  });
  usePosSyncStore.getState().record(outcomes);
  void queryClient.invalidateQueries({ queryKey: ['pos'] });
  return outcomes;
}

// Reconnect replay: the generic replayer calls this once per queued sale; the
// first call pushes the whole batch, later ones find their sale already gone.
registerReplayHandler(POS_SALE_QUEUE_KIND, async ({ payload }) => {
  const ref = (payload as QueuedSalePayload).meta.clientRef;
  const stillQueued = queuedOfflineSales().some(item => item.meta.clientRef === ref);
  if (!stillQueued) return;
  const outcomes = await syncOfflineSales();
  const mine = outcomes.find(outcome => outcome.clientRef === ref);
  if (mine?.status === 'failed') {
    throw new Error(mine.error ?? 'Sale did not sync');
  }
});
