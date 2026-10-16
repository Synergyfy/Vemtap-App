import { formatClock, formatCurrency, formatWhen } from '@utils/formatters';

/**
 * Shared formatting for POS screens. Screens receive display-ready strings;
 * the per-screen view mappers live next to the hook that feeds them in the
 * route wrappers, and the pure pieces they share live here so they are unit
 * tested once.
 */

export const naira = (amount: number | null | undefined) => formatCurrency(amount ?? 0);

export const personName = (
  person: { firstName?: string | null; lastName?: string | null } | null | undefined,
  fallback = '',
) => {
  const name = `${person?.firstName ?? ''} ${person?.lastName ?? ''}`.trim();
  return name || fallback;
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

/** `cash` → `Cash`, `partial_refund` → `Partial refund`. */
export const titleCase = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ') : '';

export const tenderLabel = (method: string) =>
  ({ cash: 'Cash', card: 'Card', transfer: 'Bank transfer', split: 'Split' })[method] ??
  titleCase(method);

export const when = (iso: string | null | undefined) => (iso ? formatWhen(iso) : '');
export const clock = (iso: string | null | undefined) => (iso ? formatClock(iso) : '');

/** Midnight today in ISO, for "today" filters. */
export const startOfTodayIso = (now: Date = new Date()) => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start.toISOString().slice(0, 10);
};

/** Variance line for a drawer: balanced, over or short. */
export const drawerVarianceLabel = (variance: number | null | undefined) => {
  if (variance == null) return 'Not counted yet';
  if (Math.abs(variance) < 0.005) return 'Balanced (±0)';
  return variance > 0
    ? `Over by ${naira(variance)}`
    : `Short by ${naira(Math.abs(variance))}`;
};

/** Share of a total as a whole percent, safe for an empty total. */
export const percentOf = (part: number, total: number) =>
  total > 0 ? Math.round((part / total) * 100) : 0;

export interface TotalsRow {
  id: string;
  label: string;
  value: string;
  tone?: 'default' | 'discount' | 'strong' | 'primary';
}

/**
 * Subtotal / discount / tax / service / packaging rows for any priced ticket.
 * Zero rows are left out so a business without a service charge never shows
 * one; the tax row is labelled as included when prices carry it.
 */
export function totalsRows(
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    serviceCharge: number;
    packagingFee: number;
    tip?: number;
  },
  tax: { label: string; rate: number; included: boolean },
  labels: {
    subtotal: string;
    discount: string;
    service: string;
    packaging: string;
    tip?: string;
    taxIncluded: (label: string) => string;
  },
): TotalsRow[] {
  const rows: TotalsRow[] = [
    { id: 'subtotal', label: labels.subtotal, value: naira(totals.subtotal) },
  ];
  if (totals.discount > 0) {
    rows.push({
      id: 'discount',
      label: labels.discount,
      value: `-${naira(totals.discount)}`,
      tone: 'discount',
    });
  }
  if (totals.tax > 0) {
    rows.push({
      id: 'tax',
      label: tax.included ? labels.taxIncluded(tax.label) : `${tax.label} (${tax.rate}%)`,
      value: naira(totals.tax),
    });
  }
  if (totals.serviceCharge > 0) {
    rows.push({
      id: 'service',
      label: labels.service,
      value: naira(totals.serviceCharge),
    });
  }
  if (totals.packagingFee > 0) {
    rows.push({
      id: 'packaging',
      label: labels.packaging,
      value: naira(totals.packagingFee),
    });
  }
  if (totals.tip && totals.tip > 0 && labels.tip) {
    rows.push({ id: 'tip', label: labels.tip, value: naira(totals.tip) });
  }
  return rows;
}

/** The subset of a POS sale the receipt views read. */
export interface ReceiptSale {
  id: string;
  receiptNumber: string;
  status: string;
  paymentMethod: string;
  orderType?: string;
  subtotal: number;
  discountAmount: number;
  tax: number;
  serviceCharge: number;
  packagingFee: number;
  tipAmount?: number;
  total: number;
  amountPaid: number;
  change: number;
  cashierName: string;
  orderedAt?: string | null;
  createdAt?: string | null;
  pointsEarned?: number;
  hideCustomerInfoOnReceipt?: boolean;
  customer?: { firstName?: string; lastName?: string; phone?: string } | null;
  branch?: { name?: string; address?: string } | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
    refundedQuantity?: number;
  }[];
  splitPayments: { method: string; amount: number; payer?: string | null }[];
  receipt?: {
    businessName?: string;
    logo?: string;
    header?: string;
    footer?: string;
    address?: string;
    phone?: string;
    tin?: string;
    taxLabel?: string;
  } | null;
}

export interface ReceiptView {
  id: string;
  receiptNumber: string;
  when: string;
  status: 'completed' | 'refunded' | 'partial_refund';
  tender: string;
  amount: string;
  cashier: string;
  storeName: string;
  branchName: string;
  address: string;
  phone: string;
  tin: string;
  header: string;
  footer: string;
  logo: string | null;
  customer: { name: string; phone: string; initials: string } | null;
  pointsEarned: number;
  lines: {
    id: string;
    name: string;
    qty: number;
    price: string;
    note?: string;
    refunded: number;
  }[];
  totals: TotalsRow[];
  payments: { id: string; label: string; value: string }[];
}

export function toReceiptView(
  sale: ReceiptSale,
  labels: {
    totals: Parameters<typeof totalsRows>[2];
    tendered: string;
    change: string;
    refundedNote: (qty: number) => string;
  },
  taxRate = 0,
): ReceiptView {
  const showCustomer = sale.customer && !sale.hideCustomerInfoOnReceipt;
  const customerName = personName(sale.customer ?? undefined);
  const taxLabel = sale.receipt?.taxLabel || 'VAT';
  const payments =
    sale.paymentMethod === 'split'
      ? sale.splitPayments.map((part, index) => ({
          id: `split-${index}`,
          label: part.payer
            ? `${part.payer} • ${tenderLabel(part.method)}`
            : tenderLabel(part.method),
          value: naira(part.amount),
        }))
      : [
          {
            id: 'tendered',
            label: `${labels.tendered} (${tenderLabel(sale.paymentMethod)})`,
            value: naira(sale.amountPaid),
          },
          ...(sale.change > 0
            ? [{ id: 'change', label: labels.change, value: naira(sale.change) }]
            : []),
        ];
  return {
    id: sale.id,
    receiptNumber: sale.receiptNumber,
    when: when(sale.orderedAt ?? sale.createdAt),
    status: (['completed', 'refunded', 'partial_refund'].includes(sale.status)
      ? sale.status
      : 'completed') as ReceiptView['status'],
    tender: tenderLabel(sale.paymentMethod),
    amount: naira(sale.total),
    cashier: sale.cashierName,
    storeName: sale.receipt?.businessName ?? '',
    branchName: sale.branch?.name ?? '',
    address: sale.receipt?.address ?? sale.branch?.address ?? '',
    phone: sale.receipt?.phone ?? '',
    tin: sale.receipt?.tin ?? '',
    header: sale.receipt?.header ?? '',
    footer: sale.receipt?.footer ?? '',
    logo: sale.receipt?.logo || null,
    customer:
      showCustomer && customerName
        ? {
            name: customerName,
            phone: sale.customer?.phone ?? '',
            initials: initials(customerName),
          }
        : null,
    pointsEarned: sale.pointsEarned ?? 0,
    lines: sale.items.map(item => ({
      id: item.id,
      name: item.productName,
      qty: item.quantity,
      price: naira(item.totalPrice),
      note: item.refundedQuantity
        ? labels.refundedNote(item.refundedQuantity)
        : undefined,
      refunded: item.refundedQuantity ?? 0,
    })),
    totals: totalsRows(
      {
        subtotal: sale.subtotal,
        discount: sale.discountAmount,
        tax: sale.tax,
        serviceCharge: sale.serviceCharge,
        packagingFee: sale.packagingFee,
        tip: sale.tipAmount,
      },
      {
        label: taxLabel,
        rate: taxRate,
        // Tax-inclusive prices: the total is the net plus surcharges only.
        included:
          sale.tax > 0 &&
          Math.abs(
            sale.total -
              (sale.subtotal -
                sale.discountAmount +
                sale.serviceCharge +
                sale.packagingFee),
          ) < 0.01,
      },
      labels.totals,
    ),
    payments,
  };
}

/** Plain-text receipt for sharing over SMS / WhatsApp. */
export function receiptShareText(view: ReceiptView) {
  const lines = [
    view.storeName,
    view.branchName,
    `${view.receiptNumber} • ${view.when}`,
    '',
    ...view.lines.map(line => `${line.qty}× ${line.name}  ${line.price}`),
    '',
    ...view.totals.map(row => `${row.label}: ${row.value}`),
    `Total: ${view.amount}`,
    view.footer,
  ];
  return lines
    .filter(line => line !== undefined)
    .join('\n')
    .trim();
}

/** One sale as a ledger row. */
export interface LedgerRowView {
  id: string;
  reference: string;
  status: 'completed' | 'refunded' | 'partial_refund' | 'queued';
  when: string;
  total: string;
  method: string;
  customer: string;
  itemCount: number;
  items: string;
  note: string;
}

export function toLedgerRow(
  sale: {
    id: string;
    receiptNumber: string;
    status: string;
    orderedAt?: string | null;
    createdAt?: string | null;
    total: number;
    paymentMethod: string;
    amountPaid: number;
    change: number;
    customerName?: string | null;
    itemCount?: number;
    items: { productName: string }[];
  },
  labels: { walkIn: string; tendered: (paid: string, change: string) => string },
): LedgerRowView {
  return {
    id: sale.id,
    reference: sale.receiptNumber,
    status: (['completed', 'refunded', 'partial_refund'].includes(sale.status)
      ? sale.status
      : 'completed') as LedgerRowView['status'],
    when: when(sale.orderedAt ?? sale.createdAt),
    total: naira(sale.total),
    method: tenderLabel(sale.paymentMethod),
    customer: sale.customerName || labels.walkIn,
    itemCount: sale.itemCount ?? sale.items.length,
    items: sale.items.map(item => item.productName).join(', '),
    note:
      sale.paymentMethod === 'cash'
        ? labels.tendered(naira(sale.amountPaid), naira(sale.change))
        : '',
  };
}
