/**
 * Shared mocks for the customer-hub hooks introduced with the Phase 1 API
 * integration (`GET /me/claims`, the Saved Hub and its save toggles).
 *
 * Every hook is a `jest.fn` whose default is an idle query — the shape a
 * disabled/signed-out hook returns — so individual tests can override just the
 * value they exercise without re-declaring the whole module.
 */

const idleQuery = () => ({
  data: undefined,
  isLoading: false,
  isPending: false,
  isError: false,
  isSuccess: false,
  refetch: jest.fn(),
});

const idleMutation = () => ({ mutate: jest.fn(), isPending: false });

export const savedHubFixtures = {
  deal: {
    id: 'save-deal-1',
    type: 'DEAL' as const,
    savedAt: '2026-10-08T10:00:00.000Z',
    item: {
      offerId: 'offer-1',
      name: 'Sole District Boutique Weekend Drop',
      mainImage: null,
      businessName: 'Sole District Boutique',
      businessLogo: null,
      branchName: 'Area 11 Mall',
      branchAddress: 'Area 11, Garki',
      calculatedPrice: 28000,
      originalPrice: 40000,
      discountPercent: 30,
      endDate: '2026-11-07T10:00:00.000Z',
      isExpired: false,
    },
  },
  business: {
    id: 'save-business-1',
    type: 'BUSINESS' as const,
    savedAt: '2026-10-08T09:00:00.000Z',
    item: {
      id: 'business-1',
      name: 'Glow & Serenity Spa & Salon',
      logoUrl: null,
      categoryName: 'Wellness & Spa',
      address: 'Maitama Heights',
      city: 'Abuja',
      isVerified: true,
      slug: 'GLOWSERE1',
      branchCode: 'BR123XYZ9',
    },
  },
  service: {
    id: 'save-service-1',
    type: 'SERVICE' as const,
    savedAt: '2026-10-08T08:00:00.000Z',
    item: {
      id: 'service-1',
      name: 'Deep Hydration Facial',
      mainImage: null,
      price: 16000,
      priceType: 'fixed',
      priceRangeMin: null,
      priceRangeMax: null,
      duration: '90 min',
      businessId: 'business-1',
      businessName: 'Glow & Serenity Spa & Salon',
      branchId: 'branch-1',
      branchName: 'Maitama Heights',
      isBookable: true,
    },
  },
};

export const claimFixture = {
  id: 'claim-1',
  claimCode: 'VEM4-1YVXBYLZA-S2DT',
  status: 'ACTIVE' as const,
  expiresAt: '2026-11-15T19:26:05.899Z',
  claimedAt: '2026-10-08T19:26:05.899Z',
  redeemedAt: null,
  offer: {
    id: 'offer-1',
    name: 'Apo Lunch Combo',
    mainImage: null,
    calculatedPrice: 8500,
    originalPrice: 10000,
    discountPercent: 15,
    pricingType: 'percentage_discount',
    discountValue: 15,
    businessId: 'business-1',
    businessName: 'Patrick Ventures',
    businessLogo: null,
    branchId: 'branch-1',
    branchName: 'Apo Branch',
    branchAddress: 'Apo Roundabout, Apo',
    endDate: '2026-11-07T18:33:30.087Z',
  },
};

/** Fixtures mirroring one redeemed claim from `GET /me/savings`. */
export const savingsFixtures = {
  entry: {
    id: 'saving-1',
    redeemedAt: '2026-10-08T18:27:00.343Z',
    merchantName: 'Patrick Ventures',
    merchantImageUrl: null,
    offerName: 'Apo Lunch Combo',
    claimCode: 'VEM4-1YVXBYLZA-S2DT',
    originalAmount: 10000,
    paidAmount: 8500,
    savedAmount: 1500,
    currency: 'NGN',
    categoryId: 'cat-1',
    categoryName: 'Food & Dining',
  },
  category: {
    id: 'cat-1',
    name: 'Food & Dining',
    redemptions: 1,
    savedAmount: 1500,
    sharePercent: 100,
  },
};

const okQuery = <T>(data: T) => ({
  data,
  isLoading: false,
  isPending: false,
  isError: false,
  isSuccess: true,
  refetch: jest.fn(),
});

/**
 * Mocks for the savings ledger (`GET /me/savings`) and the loyalty figures
 * that back the Savings hero. Defaults to a successful, populated response so
 * the screen renders real-looking rows; override per test for empty/error.
 */
export const mockSavingsModule = (options: { empty?: boolean } = {}) => {
  const empty = options.empty ?? false;
  return {
    SAVINGS_RANGE_DAYS: { month: 30, quarter: 90, allTime: undefined },
    useSavingsLedger: jest.fn(() =>
      okQuery({
        data: empty ? [] : [savingsFixtures.entry],
        total: empty ? 0 : 1,
        page: 1,
        limit: 10,
        totalSavedAmount: empty ? 0 : 1500,
      }),
    ),
    useSavingsCategories: jest.fn(() =>
      okQuery({
        data: empty ? [] : [savingsFixtures.category],
        totalSavedAmount: empty ? 0 : 1500,
        totalRedemptions: empty ? 0 : 1,
      }),
    ),
  };
};

/** Loyalty figures behind the Savings hero and the dashboard Rewards card. */
export const mockLoyaltyModule = () => ({
  useLoyaltyAnalytics: jest.fn(() =>
    okQuery({
      totals: {
        totalVisits: 0,
        rewardPoints: 0,
        netSavings: 1500,
        redeemedPoints: 0,
        dealsRedeemed: 1,
        avgDiscountPercent: 15,
      },
      growth: {
        periodDays: 30,
        netSavings: { current: 1500, previous: 0, percent: null },
        dealsRedeemed: { current: 1, previous: 0, percent: null },
      },
      trends: null,
    }),
  ),
  useLoyaltyBalance: jest.fn(() => okQuery(0)),
  useLoyaltyTier: jest.fn(() =>
    okQuery({
      points: 0,
      tier: 'Bronze',
      nextTier: 'Silver',
      pointsToNext: 1000,
      progressPercent: 0,
      thresholds: [{ name: 'Bronze', minPoints: 0 }],
    }),
  ),
  useRewards: jest.fn(() => okQuery([])),
  useLoyaltyLogs: jest.fn(() => okQuery({ data: [], total: 0 })),
});

export const mockSavedHubModule = () => ({
  savedHubKeys: {
    all: ['me', 'saved'],
    feed: jest.fn(),
    counts: jest.fn(),
    dealStatus: jest.fn(),
    businessStatus: jest.fn(),
    serviceStatus: jest.fn(),
  },
  useSavedFeed: jest.fn(() => idleQuery()),
  useSavedTotals: jest.fn(() => ({
    deals: undefined,
    businesses: undefined,
    services: undefined,
    all: undefined,
    isSuccess: false,
    isLoading: false,
  })),
  useDealSaveStatus: jest.fn(() => idleQuery()),
  useBusinessSaveStatus: jest.fn(() => idleQuery()),
  useServiceSaveStatus: jest.fn(() => idleQuery()),
  useToggleDealSave: jest.fn(() => idleMutation()),
  useToggleBusinessSave: jest.fn(() => idleMutation()),
  useToggleServiceSave: jest.fn(() => idleMutation()),
});

export const mockMyClaimsModule = () => ({
  myClaimKeys: {
    all: ['me', 'claims'],
    list: jest.fn(),
    count: jest.fn(),
  },
  useMyClaims: jest.fn(() => idleQuery()),
  useActiveClaimsCount: jest.fn(() => idleQuery()),
  useClaimsCount: jest.fn(() => idleQuery()),
  useClaimPass: jest.fn(() => ({ ...idleQuery(), claim: undefined, isNotFound: false })),
});
