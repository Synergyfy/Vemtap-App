import type {
  CustomerCard,
  CustomerDirectory,
  CustomerDossier,
} from '@api/businessCustomersApi';

/** `/business-customers` payloads: a frequent patron and a new one. */
export const michaelCard: CustomerCard = {
  userId: 'c0ffee00-0000-4000-8000-000000000001',
  name: 'Michael James',
  email: 'michael@example.com',
  phone: '+234 803 219 8831',
  avatarUrl: null,
  segment: 'frequent',
  visits: 14,
  orders: 11,
  claims: 4,
  bookings: 0,
  spend: 318500,
  pointsBalance: 2450,
  tier: 'Gold',
  firstSeenAt: '2026-06-12T09:00:00.000Z',
  lastSeenAt: '2026-10-16T08:24:00.000Z',
  lastInteraction: { kind: 'pos', reference: 'RC-94021' },
};

export const amakaCard: CustomerCard = {
  ...michaelCard,
  userId: 'c0ffee00-0000-4000-8000-000000000002',
  name: 'Amaka Kalu',
  email: null,
  phone: null,
  segment: 'new',
  visits: 1,
  orders: 1,
  claims: 1,
  spend: 6500,
  pointsBalance: 150,
  tier: 'Bronze',
  lastInteraction: { kind: 'claim', reference: 'Lunch Combo' },
};

export const directoryFixture: CustomerDirectory = {
  data: [michaelCard, amakaCard],
  total: 2,
  page: 1,
  limit: 20,
  hasNextPage: false,
  meta: {
    segmentCounts: { all: 2, frequent: 1, returning: 0, new: 1, inactive: 0 },
    insight: { customers: 2, frequentCustomers: 1, frequentSpendShare: 0.58, dormant: 3 },
  },
};

export const dossierFixture: CustomerDossier = {
  ...michaelCard,
  memberSince: '2026-06-01T00:00:00.000Z',
  preferredBranch: { id: 'b-wuse', name: 'Wuse Branch' },
  firstInteraction: { kind: 'visit', at: '2026-06-12T09:00:00.000Z' },
  metrics: {
    visitsPerMonth: 2.2,
    averageOrder: 28954.55,
    redeemed: 4,
    redemptionRate: 1,
  },
  recentPurchases: [
    {
      id: 'sale-1',
      kind: 'pos',
      reference: 'RC-94021',
      total: 51600,
      paymentMethod: 'card',
      items: 'Woodfire Ribeye Steak (x1)',
      at: '2026-10-16T08:24:00.000Z',
      branchName: 'Wuse Branch',
    },
  ],
  recentClaims: [
    {
      id: 'claim-1',
      offerName: '20% Off Prime Lunch Combo',
      status: 'redeemed',
      claimCode: 'VT-48F2G1',
      saved: 2400,
      claimedAt: '2026-10-04T12:00:00.000Z',
      redeemedAt: '2026-10-04T13:00:00.000Z',
      branchName: 'Wuse Branch',
    },
  ],
  loyaltyLedger: [
    { id: 'pt-1', points: 350, reason: 'Order RC-94021', at: '2026-10-16T08:24:00.000Z' },
    {
      id: 'pt-2',
      points: -500,
      reason: 'Artisan Dessert',
      at: '2026-10-04T12:00:00.000Z',
    },
  ],
  note: {
    note: 'Prefers the quiet booth near the patio.',
    tags: ['vip', 'wine'],
    updatedAt: '2026-09-28T10:00:00.000Z',
    updatedBy: 'Ada Obi',
  },
};
