import { useOfflineQueueStore } from '@store/offlineQueueStore';
import {
  queueOfflineSale,
  queuedOfflineSales,
  requeueConflict,
  syncOfflineSales,
  usePosSyncStore,
} from '@features/business/services/posOfflineSales';

const mockBatchSync = jest.fn();

jest.mock('@api/posApi', () => ({
  ...jest.requireActual('@api/posApi'),
  posApi: { batchSync: (...args: unknown[]) => mockBatchSync(...args) },
}));

jest.mock('@store/queryClient', () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));

const input = {
  branchId: 'b1',
  items: [{ productId: 'i1', quantity: 1 }],
  payment: { method: 'cash' as const, amountPaid: 500 },
};
const meta = {
  total: 500,
  method: 'Cash',
  itemCount: 1,
  itemNames: ['Rice'],
  cashierName: 'Ada',
};

beforeEach(() => {
  useOfflineQueueStore.getState().clear();
  usePosSyncStore.setState({ outcomes: [], lastPushAt: null });
  mockBatchSync.mockReset();
});

describe('offline POS sales', () => {
  it('queues a sale with its own clientRef and order time', () => {
    const ref = queueOfflineSale(input, meta);
    const [queued] = queuedOfflineSales();
    expect(queued.input.clientRef).toBe(ref);
    expect(queued.input.orderedAt).toBeTruthy();
  });

  it('clears synced and duplicate sales, parks conflicts and keeps failures', async () => {
    const synced = queueOfflineSale(input, meta);
    const duplicate = queueOfflineSale(input, meta);
    const conflict = queueOfflineSale(input, meta);
    const failed = queueOfflineSale(input, meta);
    mockBatchSync.mockResolvedValueOnce([
      { clientRef: synced, status: 'synced', saleId: 's1' },
      { clientRef: duplicate, status: 'duplicate', saleId: 's0' },
      { clientRef: conflict, status: 'conflict', error: 'Insufficient stock' },
      { clientRef: failed, status: 'failed', error: 'timeout' },
    ]);

    const outcomes = await syncOfflineSales();

    expect(mockBatchSync).toHaveBeenCalledTimes(1);
    expect(outcomes.map(item => item.status)).toEqual([
      'synced',
      'duplicate',
      'conflict',
      'failed',
    ]);
    expect(queuedOfflineSales().map(item => item.meta.clientRef)).toEqual([failed]);
    const parked = usePosSyncStore
      .getState()
      .outcomes.find(item => item.clientRef === conflict);
    expect(parked?.input).toBeTruthy();
  });

  it('re-queues a conflict once it is fixed', async () => {
    const conflict = queueOfflineSale(input, meta);
    mockBatchSync.mockResolvedValueOnce([
      { clientRef: conflict, status: 'conflict', error: 'stock' },
    ]);
    await syncOfflineSales();
    expect(queuedOfflineSales()).toHaveLength(0);

    expect(requeueConflict(conflict)).toBe(true);
    expect(queuedOfflineSales().map(item => item.meta.clientRef)).toEqual([conflict]);
    expect(usePosSyncStore.getState().outcomes).toHaveLength(0);
  });

  it('does nothing with an empty queue', async () => {
    expect(await syncOfflineSales()).toEqual([]);
    expect(mockBatchSync).not.toHaveBeenCalled();
  });
});
