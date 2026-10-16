import { z } from 'zod';
import { requestValidated } from '@api/client';
import {
  decimal,
  nullableArray,
  nullableDecimal,
  nullableFlag,
  nullableNumber,
  nullableText,
  nullableTimestamp,
} from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Business POS endpoints (`/pos/*`, `/public/pos/*`). Contracts are the
 * "🆕 NEW — POS (audit §5)" block of API-REFERENCE.md.
 *
 * Money arrives as numbers from the entity transformers, but numeric strings
 * are accepted everywhere through `decimal()` so a raw aggregate never fails a
 * whole screen.
 */

const money = () => decimal();
const optionalMoney = () =>
  nullableDecimal().transform(value => (value == null ? 0 : value));

export const paymentMethods = ['cash', 'transfer', 'card', 'split'] as const;
export type PosPaymentMethod = (typeof paymentMethods)[number];
export type PosSaleStatus = 'completed' | 'refunded' | 'partial_refund';
export type PosOrderType = 'dine_in' | 'takeaway';

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const permissionsSchema = z.looseObject({
  voidRequiresPin: nullableFlag(),
  refundRequiresPin: nullableFlag(),
  reprintRequiresPin: nullableFlag(),
  drawerOpenRequiresPin: nullableFlag(),
  discountOverrideRequiresPin: nullableFlag(),
  discountMaxPercent: nullableNumber(100),
  discountMaxAmount: nullableNumber(0),
  idleLockMinutes: nullableNumber(0),
});

const tenderRailsSchema = z.looseObject({
  cash: nullableFlag(true),
  card: nullableFlag(true),
  oneTap: nullableFlag(),
  transfer: z
    .looseObject({
      enabled: nullableFlag(),
      bankName: nullableText(),
      accountNumber: nullableText(),
      accountName: nullableText(),
    })
    .nullish()
    .transform(
      value =>
        value ?? { enabled: false, bankName: '', accountNumber: '', accountName: '' },
    ),
  houseTab: z
    .looseObject({ enabled: nullableFlag(), limit: nullableNumber(0) })
    .nullish()
    .transform(value => value ?? { enabled: false, limit: 0 }),
});

export const posSettingsSchema = z.looseObject({
  currency: nullableText('NGN'),
  receiptHeader: nullableText(),
  receiptFooter: nullableText(),
  receiptAddress: nullableText(),
  receiptPhone: nullableText(),
  receiptWidth: nullableNumber(80),
  autoPrintReceipt: nullableFlag(),
  autoPrintOn: nullableArray(z.string()),
  printKitchenChits: nullableFlag(),
  showLogo: nullableFlag(true),
  tin: nullableText(),
  taxEnabled: nullableFlag(),
  taxRate: nullableNumber(0),
  taxLabel: nullableText('VAT'),
  pricesIncludeTax: nullableFlag(),
  takeawayVatExempt: nullableFlag(),
  serviceChargeEnabled: nullableFlag(),
  serviceChargeRate: nullableNumber(0),
  serviceChargeWaivable: nullableFlag(true),
  packagingFee: nullableNumber(0),
  packagingAutoApply: nullableFlag(),
  selfOrderingEnabled: nullableFlag(true),
  maxQrOrderValue: nullableNumber(0),
  rushPause: nullableFlag(),
  tableCount: nullableNumber(0),
  offlineBufferLimit: nullableNumber(200),
  autoSyncIntervalSec: nullableNumber(60),
  defaultPrepMinutes: nullableNumber(15),
  loyaltyEnabled: nullableFlag(),
  permissions: permissionsSchema
    .nullish()
    .transform(value => value ?? permissionsSchema.parse({})),
  tenderRails: tenderRailsSchema
    .nullish()
    .transform(value => value ?? tenderRailsSchema.parse({})),
});
export type PosSettings = z.infer<typeof posSettingsSchema>;

/** Partial update body; nested objects merge field by field on the server. */
export type PosSettingsUpdate = Partial<
  Omit<PosSettings, 'permissions' | 'tenderRails'>
> & {
  permissions?: Partial<PosSettings['permissions']>;
  tenderRails?: {
    cash?: boolean;
    card?: boolean;
    oneTap?: boolean;
    transfer?: Partial<PosSettings['tenderRails']['transfer']>;
    houseTab?: Partial<PosSettings['tenderRails']['houseTab']>;
  };
};

export const posSettingsSummarySchema = z.looseObject({
  taxLabel: z.string().nullish(),
  serviceChargeLabel: z.string().nullish(),
  receiptWidth: nullableNumber(80),
  activeCashiers: nullableNumber(0),
  tillCount: nullableNumber(0),
  peripheralCount: nullableNumber(0),
  staffPinCount: nullableNumber(0),
  tableCount: nullableNumber(0),
  offlineBufferLimit: nullableNumber(0),
  autoSyncIntervalSec: nullableNumber(0),
  supervisorPinRequired: nullableFlag(),
});
export type PosSettingsSummary = z.infer<typeof posSettingsSummarySchema>;

// ---------------------------------------------------------------------------
// Register, tills, branches
// ---------------------------------------------------------------------------

const personSchema = z.looseObject({
  id: z.string().optional(),
  firstName: nullableText(),
  lastName: nullableText(),
  phone: nullableText(),
  email: nullableText(),
});

export const posTillSchema = z.looseObject({
  id: z.string(),
  branchId: z.string(),
  name: z.string(),
  code: z.string(),
  status: z.enum(['active', 'idle', 'offline', 'disabled']).catch('idle'),
  deviceLabel: nullableText(),
  lastSeenAt: nullableTimestamp(),
  occupant: z
    .looseObject({
      sessionId: z.string(),
      cashierId: z.string(),
      cashierName: nullableText(),
      openedAt: z.string(),
    })
    .nullish(),
  todaySales: optionalMoney(),
  todayTransactions: nullableNumber(0),
});
export type PosTill = z.infer<typeof posTillSchema>;

const posTillListSchema = z.looseObject({
  data: z.array(posTillSchema),
  limit: z.number().nullish(),
});
export type PosTillList = z.infer<typeof posTillListSchema>;

export const posBranchSummarySchema = z.looseObject({
  branchId: z.string(),
  name: nullableText(),
  address: nullableText(),
  todaySales: optionalMoney(),
  todayTransactions: nullableNumber(0),
  tillCount: nullableNumber(0),
  openSessions: nullableNumber(0),
  current: nullableFlag(),
});
export type PosBranchSummary = z.infer<typeof posBranchSummarySchema>;

export const registerSessionSchema = z.looseObject({
  id: z.string(),
  branchId: z.string(),
  tillId: z.string().nullish(),
  openedAt: z.string(),
  closedAt: nullableTimestamp(),
  openingCash: optionalMoney(),
  expectedCash: optionalMoney(),
  totalSales: optionalMoney(),
  transactionCount: nullableNumber(0),
  status: z.enum(['open', 'closed']).catch('open'),
  countedCash: nullableDecimal(),
  variance: nullableDecimal(),
  till: z
    .looseObject({ id: z.string(), name: nullableText(), code: nullableText() })
    .nullish(),
  branch: z.looseObject({ id: z.string(), name: nullableText() }).nullish(),
});
export type RegisterSession = z.infer<typeof registerSessionSchema>;

const registerStatusSchema = z.looseObject({
  isOpen: z.boolean(),
  session: registerSessionSchema.nullish(),
});
export type RegisterStatus = z.infer<typeof registerStatusSchema>;

export const zReportSchema = z.looseObject({
  registerSessionId: z.string(),
  status: z.string(),
  openedAt: z.string(),
  closedAt: nullableTimestamp(),
  openingCash: optionalMoney(),
  totalSales: optionalMoney(),
  transactionCount: nullableNumber(0),
  cashSales: optionalMoney(),
  cashDrops: optionalMoney(),
  expectedCash: optionalMoney(),
  countedCash: nullableDecimal(),
  variance: nullableDecimal(),
  paymentBreakdown: z
    .record(z.string(), money())
    .nullish()
    .transform(value => value ?? {}),
});
export type ZReport = z.infer<typeof zReportSchema>;

// ---------------------------------------------------------------------------
// Sales
// ---------------------------------------------------------------------------

const saleItemSchema = z.looseObject({
  id: z.string(),
  productId: z.string().nullish(),
  productName: nullableText(),
  sku: nullableText(),
  unitPrice: optionalMoney(),
  quantity: z.number(),
  discount: optionalMoney(),
  totalPrice: optionalMoney(),
  refundedQuantity: nullableNumber(0),
});

const splitPaymentSchema = z.looseObject({
  method: z.string(),
  amount: optionalMoney(),
  payer: z.string().nullish(),
});

export const posSaleSchema = z.looseObject({
  id: z.string(),
  receiptNumber: z.string(),
  branchId: z.string(),
  cashierId: z.string().nullish(),
  cashierName: nullableText(),
  customerId: z.string().nullish(),
  customerName: z.string().nullish(),
  subtotal: optionalMoney(),
  discountAmount: optionalMoney(),
  tax: optionalMoney(),
  serviceCharge: optionalMoney(),
  packagingFee: optionalMoney(),
  tipAmount: optionalMoney(),
  total: optionalMoney(),
  amountPaid: optionalMoney(),
  change: optionalMoney(),
  paymentMethod: z.string(),
  status: z.enum(['completed', 'refunded', 'partial_refund']).catch('completed'),
  orderType: z.enum(['dine_in', 'takeaway']).catch('dine_in'),
  orderedAt: nullableTimestamp(),
  createdAt: nullableTimestamp(),
  clientRef: z.string().nullish(),
  registerSessionId: z.string().nullish(),
  notes: nullableText(),
  itemCount: nullableNumber(0),
  pointsEarned: nullableNumber(0),
  hideCustomerInfoOnReceipt: nullableFlag(),
  items: nullableArray(saleItemSchema),
  splitPayments: nullableArray(splitPaymentSchema),
  customer: personSchema.nullish(),
  branch: z
    .looseObject({ id: z.string(), name: nullableText(), address: nullableText() })
    .nullish(),
  registerSession: z
    .looseObject({
      id: z.string(),
      openedAt: nullableTimestamp(),
      tillId: z.string().nullish(),
    })
    .nullish(),
  receipt: z
    .looseObject({
      businessName: nullableText(),
      logo: nullableText(),
      header: nullableText(),
      footer: nullableText(),
      address: nullableText(),
      phone: nullableText(),
      tin: nullableText(),
      taxLabel: nullableText('VAT'),
      width: nullableNumber(80),
    })
    .nullish(),
});
export type PosSale = z.infer<typeof posSaleSchema>;

const salesPageSchema = z.looseObject({
  data: z.array(posSaleSchema),
  total: nullableNumber(0),
  page: nullableNumber(1),
  limit: nullableNumber(10),
  hasNextPage: nullableFlag(),
  meta: z
    .looseObject({
      counts: z.record(z.string(), z.number()).nullish(),
      grossTotal: optionalMoney(),
      byMethod: z.record(z.string(), money()).nullish(),
    })
    .nullish(),
});
export type PosSalesPage = z.infer<typeof salesPageSchema>;

export interface PosSalesQuery {
  page?: number;
  limit?: number;
  status?: PosSaleStatus;
  paymentMethod?: PosPaymentMethod;
  branchId?: string;
  sessionId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface NewSaleLine {
  productId: string;
  quantity: number;
  discount?: number;
}

export interface NewSalePayment {
  method: PosPaymentMethod;
  amountPaid: number;
  change?: number;
  splitDetails?: {
    method: Exclude<PosPaymentMethod, 'split'>;
    amount: number;
    payer?: string;
  }[];
}

export interface NewSaleInput {
  branchId: string;
  items: NewSaleLine[];
  payment: NewSalePayment;
  cartDiscountAmount?: number;
  customerId?: string;
  notes?: string;
  clientRef?: string;
  orderedAt?: string;
  orderType?: PosOrderType;
  waiveServiceCharge?: boolean;
  overrideToken?: string;
}

export const heldSaleSchema = z.looseObject({
  id: z.string(),
  branchId: z.string(),
  subtotal: optionalMoney(),
  discountAmount: optionalMoney(),
  tax: optionalMoney(),
  serviceCharge: optionalMoney(),
  packagingFee: optionalMoney(),
  total: optionalMoney(),
  note: nullableText(),
  heldAt: z.string(),
  orderType: z.enum(['dine_in', 'takeaway']).catch('dine_in'),
  customer: personSchema.nullish(),
  cashier: personSchema.nullish(),
  items: nullableArray(
    z.looseObject({
      productId: z.string(),
      productName: nullableText(),
      unitPrice: optionalMoney(),
      quantity: z.number(),
      totalPrice: optionalMoney(),
    }),
  ),
});
export type HeldSale = z.infer<typeof heldSaleSchema>;

export interface HoldSaleInput {
  branchId: string;
  customerId?: string;
  note?: string;
  discountAmount?: number;
  orderType?: PosOrderType;
  items: {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
}

export const batchSyncResultSchema = z.looseObject({
  clientRef: z.string().nullish(),
  status: z.enum(['synced', 'duplicate', 'conflict', 'failed']).catch('failed'),
  success: nullableFlag(),
  saleId: z.string().nullish(),
  receiptNumber: z.string().nullish(),
  error: z.string().nullish(),
});
export type BatchSyncResult = z.infer<typeof batchSyncResultSchema>;

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export type PosCustomerSegment = 'vip' | 'new' | 'lapsed';

export const posCustomerSchema = z.looseObject({
  id: z.string(),
  firstName: nullableText(),
  lastName: nullableText(),
  email: nullableText(),
  phone: nullableText(),
  totalSpent: optionalMoney(),
  totalVisits: nullableNumber(0),
  firstVisitAt: nullableTimestamp(),
  lastVisitAt: nullableTimestamp(),
  pointsBalance: nullableNumber(0),
  tier: nullableText('Bronze'),
  segments: nullableArray(z.string()),
});
export type PosCustomer = z.infer<typeof posCustomerSchema>;

const customersPageSchema = z.looseObject({
  data: z.array(posCustomerSchema),
  total: nullableNumber(0),
  page: nullableNumber(1),
  limit: nullableNumber(10),
  segmentCounts: z
    .looseObject({
      all: nullableNumber(0),
      vip: nullableNumber(0),
      new: nullableNumber(0),
      lapsed: nullableNumber(0),
    })
    .nullish(),
});
export type PosCustomersPage = z.infer<typeof customersPageSchema>;

export const posCustomerDetailSchema = posCustomerSchema.extend({
  averageOrderValue: optionalMoney(),
  lifetimeValue: optionalMoney(),
  recentPurchases: nullableArray(
    z.looseObject({
      id: z.string(),
      date: nullableTimestamp(),
      total: optionalMoney(),
      items: nullableNumber(0),
      itemNames: nullableArray(z.string()),
      paymentMethod: nullableText(),
      receipt: nullableText(),
    }),
  ),
});
export type PosCustomerDetail = z.infer<typeof posCustomerDetailSchema>;

const customerRewardsSchema = z.looseObject({
  pointsBalance: nullableNumber(0),
  tier: nullableText('Bronze'),
  data: z.array(
    z.looseObject({
      id: z.string(),
      name: z.string(),
      description: nullableText(),
      category: nullableText(),
      pointsRequired: z.number(),
      coverImage: nullableText(),
      expiryDate: nullableTimestamp(),
      affordable: nullableFlag(),
      pointsShort: nullableNumber(0),
    }),
  ),
});
export type PosCustomerRewards = z.infer<typeof customerRewardsSchema>;

// ---------------------------------------------------------------------------
// Stock
// ---------------------------------------------------------------------------

const stockMovementSchema = z.looseObject({
  id: z.string(),
  type: nullableText(),
  quantityChange: nullableNumber(0),
  previousQuantity: nullableNumber(0),
  newQuantity: nullableNumber(0),
  reason: nullableText(),
  createdAt: nullableTimestamp(),
  user: personSchema.nullish(),
});
export type StockMovement = z.infer<typeof stockMovementSchema>;

const stockMovementsSchema = z.union([
  z.array(stockMovementSchema).transform(data => ({ data, total: data.length })),
  z.looseObject({ data: z.array(stockMovementSchema), total: nullableNumber(0) }),
]);

// ---------------------------------------------------------------------------
// Staff PINs, peripherals
// ---------------------------------------------------------------------------

export type PosOverrideAction =
  'void' | 'refund' | 'reprint' | 'drawer_open' | 'discount';

export const staffPinRowSchema = z.looseObject({
  userId: z.string(),
  name: nullableText(),
  role: nullableText(),
  branchId: z.string().nullish(),
  hasPin: nullableFlag(),
  isSupervisor: nullableFlag(),
  lockedUntil: nullableTimestamp(),
});
export type StaffPinRow = z.infer<typeof staffPinRowSchema>;

const overrideTokenSchema = z.looseObject({
  overrideToken: z.string(),
  expiresAt: z.string(),
  supervisorName: nullableText(),
});
export type OverrideToken = z.infer<typeof overrideTokenSchema>;

const overridesPageSchema = z.looseObject({
  data: z.array(
    z.looseObject({
      id: z.string(),
      action: z.string(),
      createdAt: z.string(),
      supervisorName: nullableText(),
      requestedByName: nullableText(),
      reason: nullableText(),
    }),
  ),
  total: nullableNumber(0),
});
export type OverridesPage = z.infer<typeof overridesPageSchema>;

export type PeripheralType =
  'card_terminal' | 'printer' | 'cash_drawer' | 'scanner' | 'kds' | 'customer_display';
export type PeripheralConnection = 'ip' | 'bluetooth' | 'usb';

export const peripheralSchema = z.looseObject({
  id: z.string(),
  branchId: z.string(),
  tillId: z.string().nullish(),
  type: z.string(),
  name: z.string(),
  model: nullableText(),
  connection: z.string(),
  address: nullableText(),
  status: z.enum(['connected', 'disconnected', 'error']).catch('disconnected'),
  lastSeenAt: nullableTimestamp(),
});
export type Peripheral = z.infer<typeof peripheralSchema>;

// ---------------------------------------------------------------------------
// Kitchen, display, split, public
// ---------------------------------------------------------------------------

export const kitchenOrderSchema = z.looseObject({
  id: z.string(),
  reference: z.string(),
  status: z.string(),
  tableNumber: z.string().nullish(),
  notes: z.string().nullish(),
  guestName: z.string().nullish(),
  guestPhone: z.string().nullish(),
  totalAmount: optionalMoney(),
  paid: nullableFlag(),
  createdAt: z.string(),
  elapsedMinutes: nullableNumber(0),
  lines: nullableArray(
    z.looseObject({ name: z.string(), quantity: z.number(), lineTotal: optionalMoney() }),
  ),
});
export type KitchenOrder = z.infer<typeof kitchenOrderSchema>;

const kitchenStreamSchema = z.looseObject({
  data: z.array(kitchenOrderSchema),
  counts: z
    .looseObject({
      new: nullableNumber(0),
      processing: nullableNumber(0),
      ready: nullableNumber(0),
      completed: nullableNumber(0),
    })
    .nullish()
    .transform(value => value ?? { new: 0, processing: 0, ready: 0, completed: 0 }),
  averagePrepMinutes: z.number().nullish(),
  unpaidTotal: optionalMoney(),
});
export type KitchenStream = z.infer<typeof kitchenStreamSchema>;
export type KitchenStatus = 'new' | 'processing' | 'ready' | 'completed';

export const displayTicketSchema = z.looseObject({
  reference: z.string().nullish(),
  tableNumber: z.string().nullish(),
  customerName: z.string().nullish(),
  orderType: z.enum(['dine_in', 'takeaway']).catch('dine_in'),
  lines: z.array(
    z.looseObject({
      name: z.string(),
      quantity: z.number(),
      unitPrice: optionalMoney(),
      lineTotal: optionalMoney(),
    }),
  ),
  itemCount: nullableNumber(0),
  subtotal: optionalMoney(),
  discountAmount: optionalMoney(),
  tax: optionalMoney(),
  serviceCharge: optionalMoney(),
  packagingFee: optionalMoney(),
  total: optionalMoney(),
  updatedAt: z.string(),
});
export type DisplayTicket = z.infer<typeof displayTicketSchema>;

const tipOptionSchema = z.looseObject({ percent: z.number(), amount: z.number() });
export type TipOption = z.infer<typeof tipOptionSchema>;

export const displayStateSchema = z.looseObject({
  till: z.looseObject({ id: z.string(), name: nullableText(), code: nullableText() }),
  venue: z.looseObject({
    name: nullableText(),
    logo: nullableText(),
    branchName: nullableText(),
  }),
  taxLabel: nullableText('VAT'),
  paymentMethods: z.looseObject({
    cash: nullableFlag(true),
    card: nullableFlag(true),
    transfer: nullableFlag(),
    oneTap: nullableFlag(),
  }),
  transfer: z
    .looseObject({
      bankName: nullableText(),
      accountNumber: nullableText(),
      accountName: nullableText(),
    })
    .nullish(),
  ticket: displayTicketSchema.nullish(),
  tipOptions: nullableArray(tipOptionSchema),
});
export type DisplayState = z.infer<typeof displayStateSchema>;

export interface DisplayTicketInput {
  lines: { name: string; quantity: number; unitPrice: number }[];
  discountAmount?: number;
  orderType?: PosOrderType;
  waiveServiceCharge?: boolean;
  tableNumber?: string;
  customerName?: string;
  reference?: string;
}

export type SplitMode = 'equal' | 'by_item' | 'custom';

export interface SplitPreviewInput {
  mode: SplitMode;
  lines: { id: string; name: string; quantity: number; unitPrice: number }[];
  people: { name: string; lineIds?: string[]; amount?: number }[];
  discountAmount?: number;
  orderType?: PosOrderType;
  waiveServiceCharge?: boolean;
}

const splitPreviewSchema = z.looseObject({
  subtotal: optionalMoney(),
  discountAmount: optionalMoney(),
  tax: optionalMoney(),
  serviceCharge: optionalMoney(),
  packagingFee: optionalMoney(),
  total: optionalMoney(),
  people: z.array(
    z.looseObject({
      name: z.string(),
      lineIds: nullableArray(z.string()),
      tax: optionalMoney(),
      serviceCharge: optionalMoney(),
      packagingFee: optionalMoney(),
      amount: optionalMoney(),
    }),
  ),
});
export type SplitPreview = z.infer<typeof splitPreviewSchema>;

export const orderTrackingSchema = z.looseObject({
  orderId: z.string(),
  reference: z.string(),
  status: z.string(),
  cancelled: nullableFlag(),
  steps: z.array(
    z.looseObject({
      status: z.string(),
      at: z.string().nullish(),
      reached: nullableFlag(),
    }),
  ),
  tableNumber: z.string().nullish(),
  notes: z.string().nullish(),
  lines: z.array(
    z.looseObject({
      name: z.string(),
      quantity: z.number(),
      unitPrice: optionalMoney(),
      lineTotal: optionalMoney(),
    }),
  ),
  totalAmount: optionalMoney(),
  prepMinutes: nullableNumber(15),
  estimatedReadyAt: z.string(),
  server: z.looseObject({ firstName: z.string() }).nullish(),
  venue: z.looseObject({
    businessName: nullableText(),
    branchName: nullableText(),
    logo: nullableText(),
  }),
});
export type OrderTracking = z.infer<typeof orderTrackingSchema>;

export const guestOrderingInfoSchema = z.looseObject({
  branchId: z.string(),
  branchName: nullableText(),
  businessName: nullableText(),
  logo: nullableText(),
  currency: nullableText('NGN'),
  acceptingOrders: nullableFlag(true),
  rushPause: nullableFlag(),
  maxOrderValue: z.number().nullish(),
  tableCount: nullableNumber(0),
  prepMinutes: nullableNumber(15),
  pricing: z.looseObject({
    taxEnabled: nullableFlag(),
    taxRate: nullableNumber(0),
    taxLabel: nullableText('VAT'),
    pricesIncludeTax: nullableFlag(),
    serviceChargeEnabled: nullableFlag(),
    serviceChargeRate: nullableNumber(0),
  }),
});
export type GuestOrderingInfo = z.infer<typeof guestOrderingInfoSchema>;

export interface GuestOrderInput {
  branchId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  tableNumber?: string;
  notes?: string;
  items: ({ itemId: string; quantity: number } | { offerId: string; quantity: number })[];
}

const placedOrderSchema = z.looseObject({
  id: z.string(),
  status: z.string(),
  trackingToken: z.string().nullish(),
  totalAmount: optionalMoney(),
});
export type PlacedOrder = z.infer<typeof placedOrderSchema>;

const okSchema = z.looseObject({});

// ---------------------------------------------------------------------------
// Methods
// ---------------------------------------------------------------------------

type Opts = ApiRequestOptions;

export const posApi = {
  getSettings: (o: Opts = {}) =>
    requestValidated({ method: 'GET', url: '/pos/settings', ...o }, posSettingsSchema),
  updateSettings: (body: PosSettingsUpdate, o: Opts = {}) =>
    requestValidated(
      { method: 'PATCH', url: '/pos/settings', data: body, ...o },
      posSettingsSchema,
    ),
  getSettingsSummary: (o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: '/pos/settings/summary', ...o },
      posSettingsSummarySchema,
    ),

  getRegisterStatus: (o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: '/pos/register/status', ...o },
      registerStatusSchema,
    ),
  openRegister: (body: { openingCash: number; tillId?: string }, o: Opts = {}) =>
    requestValidated(
      { method: 'POST', url: '/pos/register/open', data: body, ...o },
      registerSessionSchema,
    ),
  closeRegister: (body: { countedCash?: number }, o: Opts = {}) =>
    requestValidated(
      { method: 'POST', url: '/pos/register/close', data: body, ...o },
      registerSessionSchema,
    ),
  cashDrop: (body: { amount: number; reason: string }, o: Opts = {}) =>
    requestValidated(
      { method: 'POST', url: '/pos/register/cash-drop', data: body, ...o },
      okSchema,
    ),
  getZReport: (o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: '/pos/register/z-report', ...o },
      zReportSchema,
    ),

  getTills: (branchId: string | null, o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: '/pos/tills', params: branchId ? { branchId } : {}, ...o },
      posTillListSchema,
    ),
  createTill: (
    body: { branchId: string; name: string; code?: string; deviceLabel?: string },
    o: Opts = {},
  ) =>
    requestValidated(
      { method: 'POST', url: '/pos/tills', data: body, ...o },
      posTillSchema.partial({ todaySales: true, todayTransactions: true }),
    ),
  updateTill: (
    id: string,
    body: {
      name?: string;
      deviceLabel?: string;
      status?: 'idle' | 'offline' | 'disabled';
    },
    o: Opts = {},
  ) =>
    requestValidated(
      { method: 'PATCH', url: `/pos/tills/${id}`, data: body, ...o },
      okSchema,
    ),
  deleteTill: (id: string, o: Opts = {}) =>
    requestValidated({ method: 'DELETE', url: `/pos/tills/${id}`, ...o }, okSchema),
  getBranchSummary: (o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: '/pos/branches/summary', ...o },
      z.array(posBranchSummarySchema),
    ),

  getSales: (query: PosSalesQuery, o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: '/pos/sales', params: query, ...o },
      salesPageSchema,
    ),
  getSale: (id: string, o: Opts = {}) =>
    requestValidated({ method: 'GET', url: `/pos/sales/${id}`, ...o }, posSaleSchema),
  completeSale: (body: NewSaleInput, o: Opts = {}) =>
    requestValidated(
      { method: 'POST', url: '/pos/sales', data: body, ...o },
      posSaleSchema,
    ),
  batchSync: (body: NewSaleInput[], o: Opts = {}) =>
    requestValidated(
      { method: 'POST', url: '/pos/sales/batch-sync', data: body, ...o },
      z.array(batchSyncResultSchema),
    ),
  refundSale: (
    id: string,
    body: {
      status: 'refunded' | 'partial_refund';
      reason?: string;
      refundItems?: { saleItemId: string; quantity: number }[];
      overrideToken?: string;
    },
    o: Opts = {},
  ) =>
    requestValidated(
      { method: 'PATCH', url: `/pos/sales/${id}/status`, data: body, ...o },
      posSaleSchema,
    ),
  getHeldSales: (branchId: string | null, o: Opts = {}) =>
    requestValidated(
      {
        method: 'GET',
        url: '/pos/sales/held',
        params: branchId ? { branchId } : {},
        ...o,
      },
      z.array(heldSaleSchema),
    ),
  holdSale: (body: HoldSaleInput, o: Opts = {}) =>
    requestValidated(
      { method: 'POST', url: '/pos/sales/hold', data: body, ...o },
      heldSaleSchema,
    ),
  deleteHeldSale: (id: string, o: Opts = {}) =>
    requestValidated({ method: 'DELETE', url: `/pos/sales/held/${id}`, ...o }, okSchema),
  previewSplit: (body: SplitPreviewInput, o: Opts = {}) =>
    requestValidated(
      { method: 'POST', url: '/pos/sales/split-preview', data: body, ...o },
      splitPreviewSchema,
    ),

  getCustomers: (
    query: {
      page?: number;
      limit?: number;
      search?: string;
      segment?: PosCustomerSegment;
      branchId?: string;
    },
    o: Opts = {},
  ) =>
    requestValidated(
      { method: 'GET', url: '/pos/customers', params: query, ...o },
      customersPageSchema,
    ),
  getCustomer: (id: string, o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: `/pos/customers/${id}`, ...o },
      posCustomerDetailSchema,
    ),
  getCustomerRewards: (id: string, branchId: string | null, o: Opts = {}) =>
    requestValidated(
      {
        method: 'GET',
        url: `/pos/customers/${id}/rewards`,
        params: branchId ? { branchId } : {},
        ...o,
      },
      customerRewardsSchema,
    ),

  /** Staff issues a one-time code; the customer redeems it in their app. */
  generateRedemptionCode: (body: { rewardId: string; branchId: string }, o: Opts = {}) =>
    requestValidated(
      { method: 'POST', url: '/loyalty/redemption/generate-code', data: body, ...o },
      z.looseObject({ code: z.string() }),
    ),

  setStock: (id: string, body: { quantity: number; reason?: string }, o: Opts = {}) =>
    requestValidated(
      { method: 'PATCH', url: `/pos/products/${id}/stock`, data: body, ...o },
      okSchema,
    ),
  getStockMovements: (itemId: string, o: Opts = {}) =>
    requestValidated(
      {
        method: 'GET',
        url: '/inventory/counting/movements',
        params: { itemId, limit: 20 },
        ...o,
      },
      stockMovementsSchema,
    ),

  getStaffPins: (o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: '/pos/staff-pins', ...o },
      z.looseObject({ data: z.array(staffPinRowSchema) }),
    ),
  setStaffPin: (
    userId: string,
    body: { pin: string; isSupervisor?: boolean },
    o: Opts = {},
  ) =>
    requestValidated(
      { method: 'PUT', url: `/pos/staff-pins/${userId}`, data: body, ...o },
      okSchema,
    ),
  removeStaffPin: (userId: string, o: Opts = {}) =>
    requestValidated(
      { method: 'DELETE', url: `/pos/staff-pins/${userId}`, ...o },
      okSchema,
    ),
  verifyOverride: (
    body: {
      pin: string;
      action: PosOverrideAction;
      referenceId?: string;
      reason?: string;
    },
    o: Opts = {},
  ) =>
    requestValidated(
      { method: 'POST', url: '/pos/staff-pins/verify', data: body, ...o },
      overrideTokenSchema,
    ),
  getOverrides: (query: { page?: number; limit?: number }, o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: '/pos/staff-pins/overrides', params: query, ...o },
      overridesPageSchema,
    ),

  getPeripherals: (branchId: string | null, o: Opts = {}) =>
    requestValidated(
      {
        method: 'GET',
        url: '/pos/peripherals',
        params: branchId ? { branchId } : {},
        ...o,
      },
      z.looseObject({ data: z.array(peripheralSchema), total: nullableNumber(0) }),
    ),
  createPeripheral: (
    body: {
      branchId: string;
      tillId?: string;
      type: PeripheralType;
      name: string;
      model?: string;
      connection: PeripheralConnection;
      address?: string;
    },
    o: Opts = {},
  ) =>
    requestValidated(
      { method: 'POST', url: '/pos/peripherals', data: body, ...o },
      peripheralSchema,
    ),
  deletePeripheral: (id: string, o: Opts = {}) =>
    requestValidated({ method: 'DELETE', url: `/pos/peripherals/${id}`, ...o }, okSchema),

  getKitchenStream: (
    query: { branchId?: string; status?: KitchenStatus },
    o: Opts = {},
  ) =>
    requestValidated(
      { method: 'GET', url: '/pos/kitchen/orders', params: query, ...o },
      kitchenStreamSchema,
    ),
  updateKitchenStatus: (
    id: string,
    body: { status: KitchenStatus | 'cancelled'; reason?: string },
    o: Opts = {},
  ) =>
    requestValidated(
      { method: 'PATCH', url: `/pos/kitchen/orders/${id}/status`, data: body, ...o },
      okSchema,
    ),

  getDisplay: (tillId: string, o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: `/pos/display/${tillId}`, ...o },
      displayStateSchema,
    ),
  putDisplayTicket: (tillId: string, body: DisplayTicketInput, o: Opts = {}) =>
    requestValidated(
      { method: 'PUT', url: `/pos/display/${tillId}/ticket`, data: body, ...o },
      displayTicketSchema,
    ),
  clearDisplay: (tillId: string, saleId?: string, o: Opts = {}) =>
    requestValidated(
      {
        method: 'DELETE',
        url: `/pos/display/${tillId}/ticket`,
        params: saleId ? { saleId } : {},
        ...o,
      },
      okSchema,
    ),
  sendTipRating: (
    tillId: string,
    body: { saleId?: string; tipAmount: number; rating?: number },
    o: Opts = {},
  ) =>
    requestValidated(
      { method: 'POST', url: `/pos/display/${tillId}/tip-rating`, data: body, ...o },
      okSchema,
    ),

  trackOrder: (token: string, o: Opts = {}) =>
    requestValidated(
      {
        method: 'GET',
        url: `/public/pos/orders/track/${encodeURIComponent(token)}`,
        ...o,
      },
      orderTrackingSchema,
    ),
  getGuestOrderingInfo: (branchId: string, o: Opts = {}) =>
    requestValidated(
      { method: 'GET', url: `/public/pos/branches/${branchId}/ordering`, ...o },
      guestOrderingInfoSchema,
    ),
  placeGuestOrder: (body: GuestOrderInput, o: Opts = {}) =>
    requestValidated(
      { method: 'POST', url: '/pos/orders', data: body, ...o },
      placedOrderSchema,
    ),
};
