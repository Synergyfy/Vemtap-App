import { computeTicketTotals } from '@features/business/utils/posPricing';
import {
  drawerVarianceLabel,
  toLedgerRow,
  toReceiptView,
  totalsRows,
} from '@features/business/utils/posMappers';

const labels = {
  subtotal: 'Subtotal',
  discount: 'Discount',
  service: 'Service charge',
  packaging: 'Packaging',
  tip: 'Tip',
  taxIncluded: (label: string) => `${label} (included)`,
};

describe('computeTicketTotals (mirrors the server)', () => {
  const lines = [{ unitPrice: 5000, quantity: 2, discount: 0 }];

  it('adds exclusive VAT and the service charge on the net', () => {
    const totals = computeTicketTotals(lines, {
      taxEnabled: true,
      taxRate: 7.5,
      serviceChargeEnabled: true,
      serviceChargeRate: 10,
    });
    expect(totals).toMatchObject({
      subtotal: 10000,
      tax: 750,
      serviceCharge: 1000,
      total: 11750,
    });
  });

  it('reports the tax share of inclusive prices without adding it', () => {
    const totals = computeTicketTotals(lines, {
      taxEnabled: true,
      taxRate: 7.5,
      pricesIncludeTax: true,
    });
    expect(totals.tax).toBe(697.67);
    expect(totals.total).toBe(10000);
  });

  it('exempts takeaway and adds packaging when configured', () => {
    const totals = computeTicketTotals(
      lines,
      {
        taxEnabled: true,
        taxRate: 7.5,
        takeawayVatExempt: true,
        packagingFee: 300,
        packagingAutoApply: true,
      },
      { orderType: 'takeaway' },
    );
    expect(totals).toMatchObject({ tax: 0, packagingFee: 300, total: 10300 });
  });

  it('caps discounts at the subtotal', () => {
    expect(computeTicketTotals(lines, undefined, { cartDiscount: 50000 }).total).toBe(0);
  });
});

describe('pos mappers', () => {
  it('leaves zero charges out of the totals rows', () => {
    const rows = totalsRows(
      { subtotal: 1000, discount: 0, tax: 75, serviceCharge: 0, packagingFee: 0 },
      { label: 'VAT', rate: 7.5, included: false },
      labels,
    );
    expect(rows.map(row => row.id)).toEqual(['subtotal', 'tax']);
    expect(rows[1].label).toBe('VAT (7.5%)');
  });

  it('describes drawer variance', () => {
    expect(drawerVarianceLabel(null)).toBe('Not counted yet');
    expect(drawerVarianceLabel(0)).toBe('Balanced (±0)');
    expect(drawerVarianceLabel(-500)).toMatch(/^Short by /);
  });

  const sale = {
    id: 's1',
    receiptNumber: 'RCT-1',
    status: 'completed',
    paymentMethod: 'split',
    subtotal: 1000,
    discountAmount: 0,
    tax: 75,
    serviceCharge: 0,
    packagingFee: 0,
    total: 1075,
    amountPaid: 1075,
    change: 0,
    cashierName: 'Ada',
    orderedAt: '2026-10-16T10:00:00.000Z',
    hideCustomerInfoOnReceipt: true,
    customer: { firstName: 'Tolu', lastName: 'Ade', phone: '0800' },
    items: [
      {
        id: 'i1',
        productName: 'Rice',
        quantity: 2,
        unitPrice: 500,
        discount: 0,
        totalPrice: 1000,
        refundedQuantity: 1,
      },
    ],
    splitPayments: [
      { method: 'cash', amount: 538, payer: 'Tolu' },
      { method: 'card', amount: 537, payer: null },
    ],
    receipt: { businessName: 'Test Kitchen', taxLabel: 'VAT' },
  };

  it('builds a receipt: split payers, refunds, and hidden customer info', () => {
    const view = toReceiptView(
      sale,
      {
        totals: labels,
        tendered: 'Paid',
        change: 'Change',
        refundedNote: qty => `${qty} refunded`,
      },
      7.5,
    );
    expect(view.customer).toBeNull();
    expect(view.payments.map(row => row.label)).toEqual(['Tolu • Cash', 'Card']);
    expect(view.lines[0].note).toBe('1 refunded');
    expect(view.totals.find(row => row.id === 'tax')?.label).toBe('VAT (7.5%)');
  });

  it('flags tax-inclusive receipts', () => {
    const view = toReceiptView(
      { ...sale, total: 1000, tax: 69.77 },
      { totals: labels, tendered: 'Paid', change: 'Change', refundedNote: () => '' },
    );
    expect(view.totals.find(row => row.id === 'tax')?.label).toBe('VAT (included)');
  });

  it('builds a ledger row with the cash note', () => {
    const row = toLedgerRow(
      {
        ...sale,
        paymentMethod: 'cash',
        amountPaid: 2000,
        change: 925,
        customerName: null,
        itemCount: 2,
      },
      { walkIn: 'Walk-in', tendered: (paid, change) => `${paid}/${change}` },
    );
    expect(row.customer).toBe('Walk-in');
    expect(row.note).toContain('/');
    expect(row.itemCount).toBe(2);
  });
});
