import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const shift = strings.posTransactionsLedgerShift;
const receipts = strings.posTransactionsLedgerReceipts;
const details = strings.posTransactionDetails;
const terminal = strings.posOfflineCheckoutTerminal;
const queue = strings.posOfflineBufferQueue;
const sync = strings.posSyncReconciliation;

/* -------------------------------------------------------------------------- */
/* pos_transactions_ledger_1 - shift journal                                  */
/* -------------------------------------------------------------------------- */

export const posShiftLedgerFilters = [
  { id: 'all', label: shift.filterAll, count: '38', active: true },
  { id: 'completed', label: shift.filterCompleted, count: '35', active: false },
  { id: 'held', label: shift.filterHeld, count: '2', active: false },
  { id: 'refunded', label: shift.filterRefunded, count: '1', active: false },
] as const;

export const posShiftSalesMix = [
  { id: 'card', label: shift.mixCard, value: '\u20a6233,138', tone: 'brand' as const },
  {
    id: 'transfer',
    label: shift.mixTransfer,
    value: '\u20a675,427',
    tone: 'brand' as const,
  },
  { id: 'cash', label: shift.mixCash, value: '\u20a634,285', tone: 'success' as const },
];

export interface PosShiftJournalLine {
  id: string;
  name: string;
  qty: string;
  price: string;
}

export interface PosShiftJournalTicket {
  id: string;
  reference: string;
  badge: string;
  badgeTone: 'neutral' | 'brand' | 'warning';
  when: string;
  total: string;
  tender: string;
  tenderIcon: IconName;
  patron?: { initials: string; name: string; tier: string; terminal: string };
  lines: PosShiftJournalLine[];
  discount?: { label: string; value: string };
  note?: string;
  noteTone?: 'secondary' | 'tertiary';
  actions: { id: string; label: string; icon: IconName; tone: 'default' | 'danger' }[];
  expanded: boolean;
}

/** The first four shift-journal entries, exactly as the design shows them. */
export const posShiftJournal: readonly PosShiftJournalTicket[] = [
  {
    id: 'tk-108',
    reference: '#TK-108',
    badge: 'Table 04',
    badgeTone: 'neutral',
    when: '2:14 PM (5 mins ago) \u00b7 Cashier: Emeka O.',
    total: '\u20a628,882',
    tender: 'Paid \u2022 Contactless Card',
    tenderIcon: 'contactlessPay',
    patron: {
      initials: 'MJ',
      name: 'Michael James',
      tier: 'VIP 2\u2605',
      terminal: 'Terminal #01',
    },
    lines: [
      {
        id: 'l1',
        name: 'Woodfire Ribeye, Double Smash Burger',
        qty: '1x',
        price: '\u20a625,800',
      },
      { id: 'l2', name: 'Passionfruit Mojito', qty: '2x', price: '\u20a65,482' },
    ],
    discount: { label: 'Happy Hour Deal Applied', value: '-\u20a62,400' },
    actions: [
      { id: 'reprint', label: shift.reprintCta, icon: 'printerPos', tone: 'default' },
      { id: 'details', label: shift.detailCta, icon: 'receiptLong', tone: 'default' },
      { id: 'void', label: 'Void', icon: 'restore', tone: 'danger' },
    ],
    expanded: true,
  },
  {
    id: 'tk-107',
    reference: '#TK-107',
    badge: 'Takeout',
    badgeTone: 'neutral',
    when: '1:48 PM \u00b7 Walk-in Customer',
    total: '\u20a66,500',
    tender: 'Paid \u2022 Direct Bank Transfer',
    tenderIcon: 'bank',
    lines: [
      {
        id: 'l1',
        name: 'Double Smash Burger (Extra Cheese)',
        qty: '1x',
        price: '\u20a66,500',
      },
    ],
    actions: [
      { id: 'receipt', label: shift.receiptCta, icon: 'receiptLong', tone: 'default' },
    ],
    expanded: false,
  },
  {
    id: 'tk-106',
    reference: '#TK-106',
    badge: 'Table 02',
    badgeTone: 'neutral',
    when: '1:15 PM \u2022 Sarah A.',
    total: '\u20a619,200',
    tender: 'Paid \u2022 Split Bill (2 Diners)',
    tenderIcon: 'callSplitIcon',
    lines: [
      {
        id: 'l1',
        name: 'Part A: \u20a69,600 (Card) \u2022 Part B: \u20a69,600 (Cash)',
        qty: '',
        price: '',
      },
    ],
    actions: [
      { id: 'splits', label: shift.splitsCta, icon: 'visibility', tone: 'default' },
    ],
    expanded: false,
  },
  {
    id: 'tk-105',
    reference: '#TK-105',
    badge: 'Bar Tab',
    badgeTone: 'warning',
    when: '12:40 PM \u2022 On Hold / Parked',
    total: '\u20a68,400',
    tender: 'On Hold',
    tenderIcon: 'clockLock',
    lines: [],
    note: shift.openOrders,
    actions: [
      { id: 'resume', label: shift.resumeCta, icon: 'arrowForward', tone: 'default' },
    ],
    expanded: false,
  },
];

/* -------------------------------------------------------------------------- */
/* pos_transactions_ledger_2 - receipt ledger                                  */
/* -------------------------------------------------------------------------- */

export const posReceiptLedgerFilters = [
  { id: 'all', label: receipts.filterAll, count: '142', active: true },
  { id: 'completed', label: receipts.filterCompleted, count: '138', active: false },
  { id: 'pending', label: receipts.filterPending, count: '3', active: false },
  { id: 'refunded', label: receipts.filterRefunded, count: '1', active: false },
  { id: 'failed', label: receipts.filterFailed, count: '0', active: false },
] as const;

export type PosReceiptSyncState = 'synced' | 'queue' | 'none';

export interface PosLedgerReceipt {
  id: string;
  reference: string;
  statusLabel: string;
  statusTone: 'success' | 'brand' | 'tertiary';
  statusIcon: IconName;
  when: string;
  syncLabel: string;
  syncTone: 'brand' | 'warning';
  total: string;
  method: string;
  customer: string;
  customerIcon: IconName;
  itemCount: string;
  items: string;
  note: string;
  noteTone?: 'secondary' | 'success' | 'error';
}

/** Receipt-level ledger rows, newest first. */
export const posLedgerReceipts: readonly PosLedgerReceipt[] = [
  {
    id: 'rc-94021',
    reference: '#RC-94021',
    statusLabel: 'Completed',
    statusTone: 'success',
    statusIcon: 'checkCircle',
    when: 'Today, 02:45 PM',
    syncLabel: 'Synced',
    syncTone: 'brand',
    total: '\u20a627,251',
    method: 'Cash Tender',
    customer: 'Michael James',
    customerIcon: 'star',
    itemCount: '3 items',
    items: 'Woodfire Ribeye, Double Smash Burger, Mojito',
    note: 'Tendered: \u20a630,000 (Change: \u20a62,749)',
  },
  {
    id: 'rc-94020',
    reference: '#RC-94020',
    statusLabel: 'Completed',
    statusTone: 'success',
    statusIcon: 'contactlessPay',
    when: 'Today, 02:18 PM',
    syncLabel: 'Synced',
    syncTone: 'brand',
    total: '\u20a68,000',
    method: 'Moniepoint POS',
    customer: 'Guest Walk-in (Table 04)',
    customerIcon: 'tableRestaurant',
    itemCount: '2 items',
    items: 'Charcoal BBQ Wings, Truffle Fries',
    note: 'Card Auth: 4099\u2022\u2022\u202281',
  },
  {
    id: 'rc-94019',
    reference: '#RC-94019',
    statusLabel: 'Pending Settlement',
    statusTone: 'brand',
    statusIcon: 'sync',
    when: 'Today, 01:50 PM',
    syncLabel: 'Local Queue',
    syncTone: 'warning',
    total: '\u20a69,600',
    method: 'Bank Transfer',
    customer: 'Sarah Adams',
    customerIcon: 'person',
    itemCount: '1 item',
    items: 'Prime Lunch Combo Pass',
    note: 'Awaiting webhook verification',
  },
  {
    id: 'rc-94018',
    reference: '#RC-94018',
    statusLabel: 'Refunded',
    statusTone: 'tertiary',
    statusIcon: 'undo',
    when: 'Today, 01:10 PM',
    syncLabel: 'Synced',
    syncTone: 'brand',
    total: '-\u20a62,200',
    method: 'Cash Refund',
    customer: 'Walk-in Patron',
    customerIcon: 'person',
    itemCount: 'Voided item',
    items: 'Craft Draft Beer 500ml (Wrong pour void)',
    note: 'Auth PIN: Mgr Tunde B.',
    noteTone: 'error',
  },
  {
    id: 'rc-94017',
    reference: '#RC-94017',
    statusLabel: 'Completed',
    statusTone: 'success',
    statusIcon: 'qrCode',
    when: 'Today, 12:35 PM',
    syncLabel: 'Synced',
    syncTone: 'brand',
    total: '\u20a639,000',
    method: 'VEMTAP One-Tap',
    customer: 'Dr. Chidi Okafor',
    customerIcon: 'verified',
    itemCount: '4 items',
    items: '2x Ribeye Steak, 2x Cocktails',
    note: 'TX ID: VEM-8921-OK',
  },
];

/* -------------------------------------------------------------------------- */
/* pos_transaction_details                                                    */
/* -------------------------------------------------------------------------- */

export const posTransactionItems = [
  {
    id: 'ribeye',
    qty: '1x',
    name: 'Woodfire Ribeye Steak',
    modifier: '250g, Medium Rare, Truffle Jus',
    price: '\u20a616,000',
    wasPrice: null as string | null,
  },
  {
    id: 'burger',
    qty: '1x',
    name: 'Double Smash Burger & Fries',
    modifier: '-10% VIP \u2022 Brioche bun, extra pickles',
    price: '\u20a65,850',
    wasPrice: '\u20a66,500',
  },
  {
    id: 'mojito',
    qty: '1x',
    name: 'Passionfruit Mojito',
    modifier: 'Mocktail, standard ice',
    price: '\u20a63,500',
    wasPrice: null,
  },
] as const;

export const posTransactionTotals = [
  {
    id: 'subtotal',
    label: details.subtotalLabel,
    value: '\u20a626,000',
    tone: 'default' as const,
  },
  {
    id: 'discount',
    label: details.discountLabel,
    value: '-\u20a6650',
    tone: 'discount' as const,
  },
  { id: 'tax', label: details.taxLabel, value: '\u20a61,901', tone: 'default' as const },
] as const;

/* -------------------------------------------------------------------------- */
/* pos_offline_sale_local_buffer_terminal                                      */
/* -------------------------------------------------------------------------- */

export const posOfflineLines = [
  {
    id: 'l1',
    qty: '1x',
    name: terminal.line1,
    note: terminal.line1Note,
    price: terminal.line1Price,
  },
  {
    id: 'l2',
    qty: '1x',
    name: terminal.line2,
    note: terminal.line2Note,
    price: terminal.line2Price,
  },
  {
    id: 'l3',
    qty: '2x',
    name: terminal.line3,
    note: terminal.line3Note,
    price: terminal.line3Price,
  },
] as const;

/* -------------------------------------------------------------------------- */
/* pos_offline_buffer_local_queue                                             */
/* -------------------------------------------------------------------------- */

export const posBufferFilters = [
  { id: 'all', label: queue.filterAll, count: '5', active: true },
  { id: 'cash', label: queue.filterCash, count: '3', active: false },
  { id: 'card', label: queue.filterCard, count: '2', active: false },
  { id: 'audit', label: queue.filterAudit, count: undefined, active: false },
] as const;

export interface PosBufferedSale {
  id: string;
  reference: string;
  when: string;
  whenNote?: string;
  total: string;
  method: string;
  methodIcon: IconName;
  methodTone: 'success' | 'brand';
  detail: string;
  cashier: string;
  seal?: string;
  sealLabel?: string;
}

/** Encrypted device queue, newest first. */
export const posBufferedSales: readonly PosBufferedSale[] = [
  {
    id: 'loc-005',
    reference: '#LOC-TXN-402-005',
    when: '03:12 PM',
    total: '\u20a631,712.50',
    method: 'Cash Tender',
    methodIcon: 'payments',
    methodTone: 'success',
    detail: '3 items (Woodfire Ribeye, Double Burger, Mojito)',
    cashier: 'Cashier: Emeka Okafor',
    seal: 'SHA256: 8f4a2b90...21e0',
    sealLabel: queue.verifiedLabel,
  },
  {
    id: 'loc-004',
    reference: '#LOC-TXN-402-004',
    when: '02:58 PM',
    total: '\u20a614,800.00',
    method: 'POS Swipe',
    methodIcon: 'creditCard',
    methodTone: 'brand',
    detail:
      '2 items (T-Bone, Truffle Fries) \u2022 Customer: Sarah Adams (Cached profile)',
    cashier: 'RRN: 99402194',
    sealLabel: queue.slipLabel,
  },
  {
    id: 'loc-003',
    reference: '#LOC-TXN-402-003',
    when: '02:44 PM',
    total: '\u20a64,800.00',
    method: 'Cash Tender',
    methodIcon: 'payments',
    methodTone: 'success',
    detail: 'Charcoal BBQ Wings (6pcs)',
    cashier: '#LOCAL-HASH-003',
  },
  {
    id: 'loc-002',
    reference: '#LOC-TXN-402-002',
    when: '02:31 PM',
    total: '\u20a610,200.00',
    method: 'Cash Tender',
    methodIcon: 'payments',
    methodTone: 'success',
    detail: '2x Double Smash Burger & Fries',
    cashier: 'Till Cashier #01',
  },
  {
    id: 'loc-001',
    reference: '#LOC-TXN-402-001',
    when: '02:15 PM',
    whenNote: queue.firstTicketNote,
    total: '\u20a66,937.50',
    method: 'External POS Swipe',
    methodIcon: 'creditCard',
    methodTone: 'brand',
    detail: '1 item (Loaded Platter Combo)',
    cashier: 'AUTH: 881023',
  },
];

/* -------------------------------------------------------------------------- */
/* pos_cloud_sync_reconciliation_center                                        */
/* -------------------------------------------------------------------------- */

export const posSyncMetrics = [
  {
    id: 'waiting',
    title: sync.waitingTitle,
    value: sync.waitingValue,
    meta: sync.waitingMeta,
    tone: 'brand' as const,
    icon: 'clockLock' as IconName,
  },
  {
    id: 'synced',
    title: sync.syncedTitle,
    value: sync.syncedValue,
    meta: sync.syncedMeta,
    tone: 'success' as const,
    icon: 'checkCircle' as IconName,
  },
  {
    id: 'review',
    title: sync.reviewTitle,
    value: sync.reviewValue,
    meta: sync.reviewMeta,
    tone: 'error' as const,
    icon: 'alert' as IconName,
  },
  {
    id: 'push',
    title: sync.pushTitle,
    value: sync.pushValue,
    meta: sync.pushMeta,
    tone: 'neutral' as const,
    icon: 'cloudDone' as IconName,
  },
] as const;

export const posSyncJournal = [
  {
    id: 'loc-001',
    reference: 'LOC-TXN-402-001',
    when: '02:15 PM \u2022 Cashier: Emeka O.',
    total: '\u20a66,937.50',
    badge: 'Needs Review',
    badgeTone: 'tertiary' as const,
    footnote: null as string | null,
    conflictTitle: sync.conflictTitle,
    conflictBody: sync.conflictBody,
    actions: [sync.acceptCta, sync.customLineCta, sync.viewDetailsCta],
  },
  {
    id: 'loc-005',
    reference: 'LOC-TXN-402-005',
    when: sync.inflightMeta,
    total: '\u20a631,712.50',
    badge: sync.inflightBadge,
    badgeTone: 'brand' as const,
    footnote: null,
    conflictTitle: null,
    conflictBody: null,
    actions: [],
  },
  {
    id: 'loc-004',
    reference: 'LOC-TXN-402-004',
    when: sync.reconciledMeta,
    total: '\u20a614,800.00',
    badge: sync.reconciledBadge,
    badgeTone: 'success' as const,
    conflictTitle: null,
    conflictBody: null,
    actions: [],
    footnote: sync.reconciledBody,
  },
] as const;
