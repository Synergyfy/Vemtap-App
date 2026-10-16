import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { PosTransactionsLedgerReceiptsScreen } from '@features/business/screens/PosTransactionsLedgerReceiptsScreen';
import { PosTransactionsLedgerShiftScreen } from '@features/business/screens/PosTransactionsLedgerShiftScreen';
import { PosTransactionDetailsScreen } from '@features/business/screens/PosTransactionDetailsScreen';
import { PosOfflineBufferQueueScreen } from '@features/business/screens/PosOfflineBufferQueueScreen';
import { PosSyncReconciliationScreen } from '@features/business/screens/PosSyncReconciliationScreen';
import { PosHomeOfflineModeScreen } from '@features/business/screens/PosHomeOfflineModeScreen';
import type { LedgerRowView, ReceiptView } from '@features/business/utils/posMappers';

afterEach(cleanup);

const press = (element: Parameters<typeof fireEvent.press>[0]) =>
  act(async () => {
    fireEvent.press(element);
  });
const type = (element: Parameters<typeof fireEvent.changeText>[0], text: string) =>
  act(async () => {
    fireEvent.changeText(element, text);
  });

const row: LedgerRowView = {
  id: 's1',
  reference: 'RCT-1',
  status: 'completed',
  when: 'Today, 10:00 AM',
  total: '₦1,075',
  method: 'Cash',
  customer: 'Walk-in customer',
  itemCount: 2,
  items: 'Rice',
  note: 'Tendered: ₦2,000 (Change: ₦925)',
};

const receipt: ReceiptView = {
  id: 's1',
  receiptNumber: 'RCT-1',
  when: 'Today, 10:00 AM',
  status: 'completed',
  tender: 'Cash',
  amount: '₦1,075',
  cashier: 'Ada Obi',
  storeName: 'Test Kitchen',
  branchName: 'Branch One',
  address: '',
  phone: '',
  tin: '',
  header: '',
  footer: '',
  logo: null,
  customer: null,
  pointsEarned: 0,
  lines: [{ id: 'l1', name: 'Rice', qty: 2, price: '₦1,000', refunded: 0 }],
  totals: [{ id: 'subtotal', label: 'Subtotal', value: '₦1,000' }],
  payments: [{ id: 'tendered', label: 'Paid (Cash)', value: '₦2,000' }],
};

describe('pos receipts ledger', () => {
  const copy = strings.posTransactionsLedgerReceipts;

  it('shows gross takings, filters by status and opens a receipt', async () => {
    const onSelectFilter = jest.fn();
    const onOpenReceipt = jest.fn();
    const view = await render(
      <PosTransactionsLedgerReceiptsScreen
        search=""
        filter="all"
        onSelectFilter={onSelectFilter}
        onOpenReceipt={onOpenReceipt}
        view={{
          branchName: 'Branch One',
          online: true,
          registerLine: 'Front • Ada Obi',
          grossValue: '₦1,075',
          grossMeta: copy.grossMeta(1, 0),
          queuedCount: 2,
          filters: [
            { id: 'all', label: copy.filterAll, count: 1 },
            { id: 'refunded', label: copy.filterRefunded, count: 0 },
          ],
          rows: [row],
          hasMore: false,
        }}
      />,
    );
    expect(view.getByText(copy.queuedBadge(2))).toBeTruthy();
    await press(view.getByText(copy.filterRefunded));
    expect(onSelectFilter).toHaveBeenCalledWith('refunded');
    await press(view.getByLabelText('RCT-1 ₦1,075'));
    expect(onOpenReceipt).toHaveBeenCalledWith('s1');
  });
});

describe('pos shift ledger', () => {
  const copy = strings.posTransactionsLedgerShift;
  const shiftView = {
    scopeLabel: 'Branch One · Front',
    shiftOpen: true,
    shiftSales: '₦1,075',
    shiftMeta: copy.shiftMeta(1),
    mix: [{ id: 'cash', label: 'Cash', percent: 100 }],
    drawer: [{ id: 'expected', label: copy.drawer.expected, value: '₦2,075' }],
    rows: [row],
    held: [
      {
        id: 'h1',
        label: copy.heldLabel(null),
        total: '₦500',
        meta: 'Today',
        items: '1× Rice',
      },
    ],
    expectedCash: 2075,
  };

  it('resumes a parked ticket and closes the shift with a count', async () => {
    const onResumeTicket = jest.fn();
    const onCloseShift = jest.fn();
    const view = await render(
      <PosTransactionsLedgerShiftScreen
        view={shiftView}
        onResumeTicket={onResumeTicket}
        onCloseShift={onCloseShift}
      />,
    );
    expect(view.getByText('Cash (100%)')).toBeTruthy();
    await press(view.getByText(copy.resumeCta));
    expect(onResumeTicket).toHaveBeenCalledWith('h1');
    await press(view.getByText(copy.closeShiftCta));
    await type(await view.findByLabelText(copy.countedLabel), '2000');
    await press(view.getByText(copy.confirmCloseCta));
    expect(onCloseShift).toHaveBeenCalledWith(2000);
  });

  it('offers to open a register when no shift is open', async () => {
    const onOpenRegister = jest.fn();
    const view = await render(
      <PosTransactionsLedgerShiftScreen
        view={{ ...shiftView, shiftOpen: false, rows: [], held: [], drawer: [], mix: [] }}
        onOpenRegister={onOpenRegister}
      />,
    );
    expect(view.getByText(copy.empty.closedBody)).toBeTruthy();
    await press(view.getByText(copy.openRegisterCta));
    expect(onOpenRegister).toHaveBeenCalled();
  });
});

describe('pos transaction details', () => {
  const copy = strings.posTransactionDetails;

  it('refunds with a reason for managers', async () => {
    const onRefund = jest.fn();
    const view = await render(
      <PosTransactionDetailsScreen receipt={receipt} canRefund onRefund={onRefund} />,
    );
    await press(view.getByText(copy.refundCta));
    await type(await view.findByLabelText(copy.reasonLabel), 'Wrong order');
    await press(view.getByText(copy.confirmRefundCta));
    expect(onRefund).toHaveBeenCalledWith('Wrong order');
  });

  it('hides the refund for cashiers and fully refunded sales', async () => {
    const view = await render(
      <PosTransactionDetailsScreen
        receipt={{ ...receipt, status: 'refunded' }}
        canRefund
      />,
    );
    expect(view.queryByText(copy.refundCta)).toBeNull();
    expect(view.getByText(copy.status.refunded)).toBeTruthy();
  });
});

describe('pos offline queue, sync and home', () => {
  it('lists queued sales and syncs only when online', async () => {
    const copy = strings.posOfflineBufferQueue;
    const onSyncNow = jest.fn();
    const view = await render(
      <PosOfflineBufferQueueScreen
        filter="all"
        onSyncNow={onSyncNow}
        view={{
          online: false,
          pendingCount: 1,
          volume: '₦500',
          counts: { all: 1, cash: 1, card: 0, transfer: 0 },
          sales: [
            {
              id: 'q1',
              total: '₦500',
              method: 'Cash',
              when: 'Today',
              items: 'Rice',
              cashier: 'Ada',
            },
          ],
        }}
      />,
    );
    expect(view.getByText(copy.pendingValue(1))).toBeTruthy();
    await press(view.getByText(copy.syncCta));
    expect(onSyncNow).not.toHaveBeenCalled();
  });

  it('lets a conflict be retried or dismissed', async () => {
    const copy = strings.posSyncReconciliation;
    const onRequeue = jest.fn();
    const view = await render(
      <PosSyncReconciliationScreen
        onRequeue={onRequeue}
        view={{
          online: true,
          waiting: 0,
          synced: 3,
          needsReview: 1,
          lastPush: 'Just now',
          journal: [
            {
              id: 'ref-1',
              status: 'conflict',
              title: copy.entryTitle('₦500', 'Cash'),
              detail: 'Insufficient stock for Rice',
              when: 'Today',
              canRequeue: true,
            },
          ],
        }}
      />,
    );
    expect(view.getByText('Insufficient stock for Rice')).toBeTruthy();
    await press(view.getByText(copy.requeueCta));
    expect(onRequeue).toHaveBeenCalledWith('ref-1');
  });

  it('shows the offline home with the queue and the last tally', async () => {
    const copy = strings.posHomeOfflineMode;
    const view = await render(
      <PosHomeOfflineModeScreen
        view={{
          online: false,
          branchName: 'Branch One',
          shiftLine: 'Ada Obi • Front',
          queuedCount: 2,
          queuedAmount: '₦1,500',
          lastSync: null,
          menuCount: 12,
          tally: { sales: '₦10,000', transactions: '8', held: '1' },
        }}
      />,
    );
    expect(view.getByText(copy.offlineTitle)).toBeTruthy();
    expect(view.getByText(copy.bufferBody(2))).toBeTruthy();
    expect(view.getByText(copy.menuCached(12))).toBeTruthy();
  });
});
