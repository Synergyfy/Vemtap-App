import React from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { PosBranchTillSwitcherScreen } from '@features/business/screens/PosBranchTillSwitcherScreen';
import {
  PosHomeSalesOperationsScreen,
  type PosHomeView,
} from '@features/business/screens/PosHomeSalesOperationsScreen';
import { PosNewSaleCatalogScreen } from '@features/business/screens/PosNewSaleCatalogScreen';
import { PosCurrentSaleCartScreen } from '@features/business/screens/PosCurrentSaleCartScreen';
import {
  cashPresets,
  PosTenderCheckoutScreen,
  type PosTenderCheckoutView,
} from '@features/business/screens/PosTenderCheckoutScreen';
import { PosSaleCompletedScreen } from '@features/business/screens/PosSaleCompletedScreen';
import { PosReceiptCustomizationScreen } from '@features/business/screens/PosReceiptCustomizationScreen';
import type { ReceiptView } from '@features/business/utils/posMappers';
import { posSettingsSchema } from '@api/posApi';

afterEach(cleanup);

const settings = posSettingsSchema.parse({ taxEnabled: true, taxRate: 7.5 });

const homeView: PosHomeView = {
  storeName: 'Test Kitchen',
  branches: [
    { id: 'b1', name: 'Branch One', current: true },
    { id: 'b2', name: 'Branch Two', current: false },
  ],
  activeBranchName: 'Branch One',
  online: true,
  queuedCount: 0,
  shiftLabel: 'Shift opened 8:00 AM',
  summary: {
    sales: '₦1,000',
    salesNote: 'Average ticket ₦500',
    transactions: '2',
    transactionsNote: 'Completed sales today',
    pending: '1',
    pendingNote: 'Parked tickets to resume',
    refunds: '0',
    refundsNote: 'Full and partial',
  },
  drawer: { openingFloat: '₦100', cashInTill: '₦600', balanceLabel: 'Balanced (±0)' },
};

const receipt: ReceiptView = {
  id: 'sale-1',
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
  footer: 'Come again',
  logo: null,
  customer: { name: 'Tolu A', phone: '0800', initials: 'TA' },
  pointsEarned: 20,
  lines: [{ id: 'l1', name: 'Rice', qty: 2, price: '₦1,000', refunded: 0 }],
  totals: [
    { id: 'subtotal', label: 'Subtotal', value: '₦1,000' },
    { id: 'tax', label: 'VAT (7.5%)', value: '₦75' },
  ],
  payments: [{ id: 'tendered', label: 'Paid (Cash)', value: '₦2,000' }],
};

describe('pos home', () => {
  const copy = strings.posHomeSalesOperations;

  it('shows an error with retry until the view arrives', async () => {
    const onRetry = jest.fn();
    const view = await render(<PosHomeSalesOperationsScreen isError onRetry={onRetry} />);
    await act(async () => {
      fireEvent.press(view.getByText(strings.common.retry));
    });
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders live figures and routes quick actions', async () => {
    const onQuickAction = jest.fn();
    const view = await render(
      <PosHomeSalesOperationsScreen view={homeView} onQuickAction={onQuickAction} />,
    );
    expect(view.getByText('Test Kitchen')).toBeTruthy();
    expect(view.getByText('₦1,000')).toBeTruthy();
    expect(view.getByText('Balanced (±0)')).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.quickActions.newSale.label));
    });
    expect(onQuickAction).toHaveBeenCalledWith('new-sale');
  });

  it('offers to open the register when no shift is open', async () => {
    const view = await render(
      <PosHomeSalesOperationsScreen view={{ ...homeView, drawer: null }} />,
    );
    expect(view.getByText(copy.drawer.closedTitle)).toBeTruthy();
  });
});

describe('pos branch & till switcher', () => {
  const copy = strings.posBranchTillSwitcher;

  it('needs an opening float to open a free till and sends the selection', async () => {
    const onConfirm = jest.fn();
    const view = await render(
      <PosBranchTillSwitcherScreen
        view={{
          businessName: 'Test Kitchen',
          currentBranchName: 'Branch One',
          registerStatus: copy.registerClosed,
          staffName: 'Ada Obi',
          activeTillId: null,
          hasOpenSession: false,
          tills: [
            {
              id: 't1',
              name: 'Front',
              meta: copy.tillAvailable,
              status: 'idle',
              amount: '₦0',
              occupiedByOther: false,
            },
            {
              id: 't2',
              name: 'Bar',
              meta: 'Musa since 9:00',
              status: 'active',
              amount: '₦0',
              occupiedByOther: true,
            },
          ],
          tillsBadge: copy.tillsBadge(2, 3),
          branches: [],
        }}
        onConfirm={onConfirm}
      />,
    );
    await act(async () => {
      fireEvent.press(view.getByLabelText('Front'));
    });
    const float = await view.findByLabelText(copy.openingFloatLabel);
    await act(async () => {
      fireEvent.changeText(float, '5000');
    });
    await waitFor(() => expect(view.getByDisplayValue('5000')).toBeTruthy());
    await act(async () => {
      fireEvent.press(view.getByText(copy.confirmCta));
    });
    expect(onConfirm).toHaveBeenCalledWith({
      branchId: null,
      tillId: 't1',
      openingCash: 5000,
    });
  });
});

describe('pos new sale catalog', () => {
  const copy = strings.posNewSaleCatalog;

  it('adds in-stock items and blocks sold-out ones', async () => {
    const onAddItem = jest.fn();
    const view = await render(
      <PosNewSaleCatalogScreen
        search=""
        category="all"
        onAddItem={onAddItem}
        view={{
          registerLabel: 'Branch One',
          categories: [{ id: 'c1', label: 'Mains' }],
          totalItems: 2,
          items: [
            {
              id: 'i1',
              name: 'Rice',
              detail: '',
              price: '₦500',
              stockLabel: copy.stockLeft(8),
              stockTone: 'ready',
              inTicket: 0,
            },
            {
              id: 'i2',
              name: 'Soup',
              detail: '',
              price: '₦900',
              stockLabel: copy.stockOut,
              stockTone: 'out',
              inTicket: 0,
            },
          ],
          ticket: { itemCount: 0, total: '₦0', customerName: null, taxLabel: copy.noTax },
        }}
      />,
    );
    await act(async () => {
      fireEvent.press(view.getByLabelText(`Rice ${copy.addItemCta}`));
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText(`Soup ${copy.addItemCta}`));
    });
    expect(onAddItem).toHaveBeenCalledTimes(1);
    expect(onAddItem).toHaveBeenCalledWith('i1');
  });
});

describe('pos current sale cart', () => {
  const copy = strings.posCurrentSaleCart;
  const cartView = {
    storeLabel: 'Test Kitchen • Branch One',
    tableLabel: copy.tableLabel('4'),
    customer: null,
    lines: [
      {
        id: 'i1',
        name: 'Rice',
        qty: 2,
        unit: '₦500',
        lineTotal: '₦1,000',
        atStockLimit: false,
      },
    ],
    totals: [{ id: 'subtotal', label: 'Subtotal', value: '₦1,000' }],
    grandTotal: '₦1,000',
    note: '',
    cartDiscount: '',
    takeaway: false,
  };

  it('changes quantities and toggles takeaway', async () => {
    const onChangeQty = jest.fn();
    const onToggleTakeaway = jest.fn();
    const view = await render(
      <PosCurrentSaleCartScreen
        view={cartView}
        onChangeQty={onChangeQty}
        onToggleTakeaway={onToggleTakeaway}
      />,
    );
    await act(async () => {
      fireEvent.press(view.getByLabelText('Rice increase'));
    });
    expect(onChangeQty).toHaveBeenCalledWith('i1', 3);
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.takeawayCta));
    });
    expect(onToggleTakeaway).toHaveBeenCalledWith(true);
  });

  it('cannot charge an empty ticket', async () => {
    const onCharge = jest.fn();
    const view = await render(
      <PosCurrentSaleCartScreen view={{ ...cartView, lines: [] }} onCharge={onCharge} />,
    );
    await act(async () => {
      fireEvent.press(view.getByText(copy.chargeCta));
    });
    expect(onCharge).not.toHaveBeenCalled();
    expect(view.getByText(copy.empty.title)).toBeTruthy();
  });
});

describe('pos tender checkout', () => {
  const copy = strings.posTenderCheckout;
  const tenderView: PosTenderCheckoutView = {
    orderLabel: 'Branch One',
    orderTypeLabel: copy.dineInLabel,
    totalAmount: 1075,
    lines: [{ id: 'i1', qty: '2×', name: 'Rice', price: '₦1,000' }],
    itemCount: 2,
    totals: [],
    customer: null,
    methods: ['cash', 'card', 'split'],
    cardTerminal: null,
    transfer: null,
    offline: false,
  };

  it('suggests whole-note cash presets at or above the total', () => {
    expect(cashPresets(1075)).toEqual([1075, 2000, 5000, 10000]);
  });

  it('refuses short cash and completes with the tendered amount', async () => {
    const onCompleteSale = jest.fn();
    const view = await render(
      <PosTenderCheckoutScreen view={tenderView} onCompleteSale={onCompleteSale} />,
    );
    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.tenderedLabel), '1000');
    });
    await act(async () => {
      fireEvent.press(view.getByText(`${copy.completeCta} (₦1,075)`));
    });
    expect(onCompleteSale).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.tenderedLabel), '2000');
    });
    await act(async () => {
      fireEvent.press(view.getByText(`${copy.completeCta} (₦1,075)`));
    });
    expect(onCompleteSale).toHaveBeenCalledWith({ method: 'cash', amountPaid: 2000 });
  });

  it('labels the offline save and hands split off to the split screen', async () => {
    const onSplit = jest.fn();
    const view = await render(
      <PosTenderCheckoutScreen
        view={{ ...tenderView, offline: true }}
        onSplit={onSplit}
      />,
    );
    expect(view.getByText(`${copy.completeOfflineCta} (₦1,075)`)).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.methods.split.label));
    });
    expect(onSplit).toHaveBeenCalled();
  });
});

describe('pos sale completed', () => {
  const copy = strings.posSaleCompleted;

  it('renders the receipt with points earned', async () => {
    const view = await render(<PosSaleCompletedScreen receipt={receipt} />);
    expect(view.getByText(copy.headline)).toBeTruthy();
    expect(view.getByText(copy.pointsEarned(20))).toBeTruthy();
    expect(view.getByText('2× Rice')).toBeTruthy();
  });

  it('explains an offline sale that is waiting to sync', async () => {
    const view = await render(
      <PosSaleCompletedScreen
        offlineSale={{
          clientRef: 'ref',
          amount: '₦500',
          tender: 'Cash',
          itemNames: ['Rice'],
          when: '10:00 AM',
        }}
      />,
    );
    expect(view.getByText(copy.offlineHeadline)).toBeTruthy();
    expect(view.getByText(copy.offlineBody)).toBeTruthy();
  });
});

describe('pos receipt customization', () => {
  const copy = strings.posReceiptCustomization;

  it('previews the footer and saves only changed fields', async () => {
    const onSave = jest.fn();
    const view = await render(
      <PosReceiptCustomizationScreen
        settings={settings}
        businessName="Test Kitchen"
        sample={receipt}
        onSave={onSave}
      />,
    );
    await act(async () => {
      fireEvent.changeText(view.getByLabelText(copy.footerLabel), 'Thanks!');
    });
    await waitFor(() => expect(view.getAllByText('Thanks!').length).toBeGreaterThan(0));
    await act(async () => {
      fireEvent.press(view.getByText(copy.saveCta));
    });
    expect(onSave).toHaveBeenCalledWith({ receiptFooter: 'Thanks!' });
  });

  it('is read-only for staff', async () => {
    const view = await render(
      <PosReceiptCustomizationScreen
        settings={settings}
        businessName="Test Kitchen"
        sample={null}
        canEdit={false}
      />,
    );
    expect(view.getByText(copy.readOnly)).toBeTruthy();
    expect(view.getByText(copy.noSample)).toBeTruthy();
  });
});
