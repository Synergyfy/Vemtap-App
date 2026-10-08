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
