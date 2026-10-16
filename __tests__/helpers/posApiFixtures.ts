/* eslint-env jest */
import type * as PosApiModule from '@api/posApi';

// Loaded as the real module: test files mock '@api/posApi' with these fixtures,
// so importing it normally would read the half-built mock.
const {
  displayStateSchema,
  guestOrderingInfoSchema,
  kitchenOrderSchema,
  orderTrackingSchema,
  posCustomerDetailSchema,
  posCustomerSchema,
  posSaleSchema,
  posSettingsSchema,
  posSettingsSummarySchema,
  posTillSchema,
  registerSessionSchema,
  zReportSchema,
} = jest.requireActual<typeof PosApiModule>('@api/posApi');

/**
 * One small, consistent POS business for navigation tests: one branch, one open
 * till, one sale, one customer. Values are parsed through the real schemas so
 * a contract change breaks these fixtures instead of silently drifting.
 */
const now = '2026-10-16T10:00:00.000Z';

export const fixtureBranch = {
  id: 'b1',
  name: 'Branch One',
  isMainBranch: true,
  isActive: true,
};

export const fixtureMyBusiness = {
  id: 'bus-1',
  name: 'Test Kitchen',
  branches: [fixtureBranch],
};

export const fixtureSession = registerSessionSchema.parse({
  id: 'session-1',
  branchId: 'b1',
  tillId: 't1',
  openedAt: now,
  openingCash: 5000,
  expectedCash: 7000,
  status: 'open',
  till: { id: 't1', name: 'Front', code: 'TILL-01' },
});

export const fixtureSale = posSaleSchema.parse({
  id: 'sale-1',
  receiptNumber: 'RCT-20261016-001',
  branchId: 'b1',
  cashierName: 'Ada Obi',
  subtotal: 1000,
  tax: 75,
  total: 1075,
  amountPaid: 2000,
  change: 925,
  paymentMethod: 'cash',
  status: 'completed',
  orderType: 'dine_in',
  orderedAt: now,
  itemCount: 2,
  items: [
    {
      id: 'si1',
      productId: 'i1',
      productName: 'Rice',
      unitPrice: 500,
      quantity: 2,
      totalPrice: 1000,
    },
  ],
  receipt: { businessName: 'Test Kitchen', taxLabel: 'VAT' },
});

export const fixtureCustomer = posCustomerSchema.parse({
  id: 'c1',
  firstName: 'Tolu',
  lastName: 'Ade',
  phone: '08012345678',
  totalSpent: 1075,
  totalVisits: 1,
  pointsBalance: 120,
  tier: 'Bronze',
  segments: ['new'],
});

export const fixtureCatalogueItem = {
  id: 'i1',
  name: 'Rice',
  price: 500,
  status: 'active',
  itemType: 'product',
  stockQuantity: 10,
  isSuspended: false,
  category: { id: 'cat-1', name: 'Mains' },
};

export const posApiFixtures = {
  getSettings: async () => posSettingsSchema.parse({ taxEnabled: true, taxRate: 7.5 }),
  getSettingsSummary: async () =>
    posSettingsSummarySchema.parse({
      taxLabel: 'VAT 7.5%',
      tillCount: 1,
      activeCashiers: 1,
    }),
  updateSettings: async () => posSettingsSchema.parse({}),
  getRegisterStatus: async () => ({ isOpen: true, session: fixtureSession }),
  getZReport: async () =>
    zReportSchema.parse({
      registerSessionId: 'session-1',
      status: 'open',
      openedAt: now,
      openingCash: 5000,
      totalSales: 1075,
      transactionCount: 1,
      cashSales: 1075,
      expectedCash: 6075,
      paymentBreakdown: { cash: 1075 },
    }),
  getTills: async () => ({
    data: [
      posTillSchema.parse({
        id: 't1',
        branchId: 'b1',
        name: 'Front',
        code: 'TILL-01',
        status: 'active',
      }),
    ],
    limit: null,
  }),
  getBranchSummary: async () => [
    {
      branchId: 'b1',
      name: 'Branch One',
      address: '',
      todaySales: 1075,
      todayTransactions: 1,
      tillCount: 1,
      openSessions: 1,
      current: true,
    },
  ],
  getSales: async () => ({
    data: [fixtureSale],
    total: 1,
    page: 1,
    limit: 20,
    hasNextPage: false,
    meta: {
      counts: { completed: 1, refunded: 0, partial_refund: 0 },
      grossTotal: 1075,
      byMethod: { cash: 1075 },
    },
  }),
  getSale: async () => fixtureSale,
  getHeldSales: async () => [],
  getCustomers: async () => ({
    data: [fixtureCustomer],
    total: 1,
    page: 1,
    limit: 20,
    segmentCounts: { all: 1, vip: 0, new: 1, lapsed: 0 },
  }),
  getCustomer: async () =>
    posCustomerDetailSchema.parse({
      ...fixtureCustomer,
      averageOrderValue: 1075,
      recentPurchases: [],
    }),
  getCustomerRewards: async () => ({ pointsBalance: 120, tier: 'Bronze', data: [] }),
  getPeripherals: async () => ({ data: [], total: 0 }),
  getStaffPins: async () => ({ data: [] }),
  getOverrides: async () => ({ data: [], total: 0 }),
  getKitchenStream: async () => ({
    data: [
      kitchenOrderSchema.parse({
        id: 'o1',
        reference: '#ORDER001',
        status: 'new',
        totalAmount: 500,
        createdAt: now,
        lines: [],
      }),
    ],
    counts: { new: 1, processing: 0, ready: 0, completed: 0 },
    averagePrepMinutes: null,
    unpaidTotal: 500,
  }),
  getDisplay: async () =>
    displayStateSchema.parse({
      till: { id: 't1', name: 'Front', code: 'TILL-01' },
      venue: { name: 'Test Kitchen', branchName: 'Branch One' },
      taxLabel: 'VAT',
      paymentMethods: { cash: true, card: true, transfer: false, oneTap: false },
      ticket: {
        orderType: 'dine_in',
        lines: [{ name: 'Rice', quantity: 2, unitPrice: 500, lineTotal: 1000 }],
        subtotal: 1000,
        tax: 75,
        total: 1075,
        updatedAt: now,
      },
      tipOptions: [],
    }),
  putDisplayTicket: async () => undefined,
  clearDisplay: async () => ({}),
  getGuestOrderingInfo: async () =>
    guestOrderingInfoSchema.parse({
      branchId: 'b1',
      branchName: 'Branch One',
      businessName: 'Test Kitchen',
      pricing: { taxEnabled: true, taxRate: 7.5 },
    }),
  trackOrder: async () =>
    orderTrackingSchema.parse({
      orderId: 'o1',
      reference: '#ORDER001',
      status: 'new',
      steps: [{ status: 'new', at: now, reached: true }],
      lines: [],
      totalAmount: 500,
      estimatedReadyAt: now,
      venue: { businessName: 'Test Kitchen' },
    }),
  previewSplit: async () => ({
    subtotal: 1000,
    discountAmount: 0,
    tax: 75,
    serviceCharge: 0,
    packagingFee: 0,
    total: 1075,
    people: [
      {
        name: 'Guest 1',
        lineIds: [],
        tax: 38,
        serviceCharge: 0,
        packagingFee: 0,
        amount: 538,
      },
      {
        name: 'Guest 2',
        lineIds: [],
        tax: 37,
        serviceCharge: 0,
        packagingFee: 0,
        amount: 537,
      },
    ],
  }),
};

export const catalogueApiFixtures = {
  listBranchItems: async () => ({
    data: [fixtureCatalogueItem],
    total: 1,
    hasNextPage: false,
  }),
  listBranchCategories: async () => [{ id: 'cat-1', name: 'Mains' }],
  listBusinessItems: async () => ({
    data: [fixtureCatalogueItem],
    total: 1,
    hasNextPage: false,
  }),
};
