/**
 * Test double for the live offers feed hook.
 *
 * The deals screens read from the API through `usePublicOffersFeed`, but the UI
 * tests assert on specific deal copy. Mocking the hook with the existing
 * `dealsFeed` fixtures keeps those assertions meaningful and stops the suite
 * making real network calls.
 */
/**
 * Two live-shaped offers, so screens that read the raw feed (Home) and screens
 * that read the mapped view models (Deals) can both be exercised from one double.
 */
const MOCK_OFFERS = [
  {
    id: 'offer-prime-lunch',
    name: '20% Off Prime Lunch Combo',
    description: 'Two-course lunch',
    pricingType: 'percentage',
    fixedPrice: null,
    percentageOff: 20,
    calculatedPrice: 4000,
    originalPrice: 5000,
    discountPercent: 20,
    status: 'active',
    branchId: null,
    branchName: null,
    categoryName: 'Food',
    business: {
      id: 'business-urban-grill',
      name: 'Urban Grill',
      latitude: 9.0765,
      longitude: 7.5186,
    },
    items: [{ id: 'item-1', name: 'Lunch combo', mainImage: null }],
    claimedCount: 12,
    isExpired: false,
  },
  {
    id: 'offer-cold-brew',
    name: 'Buy 1 Get 1 Cold Brew',
    description: 'Two coffees',
    pricingType: 'fixed_discount_amount',
    fixedPrice: 500,
    percentageOff: null,
    calculatedPrice: 1500,
    originalPrice: 1500,
    discountPercent: null,
    status: 'active',
    branchId: null,
    branchName: null,
    categoryName: 'Cafe',
    business: {
      id: 'business-cafe-aroma',
      name: 'Cafe Aroma',
      latitude: 9.087,
      longitude: 7.4805,
    },
    items: [],
    claimedCount: 4,
    isExpired: false,
  },
  {
    // A discount-prefixed title, so the Home grid card's shortened title (which
    // drops the prefix because the badge already shows it) is exercisable.
    id: 'offer-family-platter',
    name: '30% Off Family Platter',
    description: 'Serves four',
    pricingType: 'percentage',
    fixedPrice: null,
    percentageOff: 30,
    calculatedPrice: 7000,
    originalPrice: 10000,
    discountPercent: 30,
    status: 'active',
    branchId: null,
    branchName: null,
    categoryName: 'Food',
    business: {
      id: 'business-urban-grill',
      name: 'Urban Grill',
      latitude: 9.0765,
      longitude: 7.5186,
    },
    items: [],
    claimedCount: 2,
    isExpired: false,
  },
] as unknown[];

export const mockOffersFeedModule = () => {
  const mapper = jest.requireActual('@features/deals/utils/offerMapper') as {
    mapOfferToFeatured: (offer: unknown, origin: unknown) => unknown;
    mapOfferToListItem: (offer: unknown, origin: unknown) => unknown;
    mapOfferToGridItem: (offer: unknown, origin: unknown) => unknown;
  };
  const { areaCoords } = jest.requireActual('@constants/locations') as {
    areaCoords: (area: string) => { latitude: number; longitude: number };
  };
  const origin = areaCoords('Apo');

  return {
    // A jest.fn so a test can drive one specific result (an empty feed, an
    // error) without rebuilding the whole module.
    usePublicOffersFeed: jest.fn(() => ({
      offers: MOCK_OFFERS,
      isLoading: false,
      isError: false,
      isSuccess: true,
      feed: {
        area: 'Apo',
        featured: mapper.mapOfferToFeatured(MOCK_OFFERS[0], origin),
        list: MOCK_OFFERS.map(offer => mapper.mapOfferToListItem(offer, origin)),
        grid: MOCK_OFFERS.map(offer => mapper.mapOfferToGridItem(offer, origin)),
      },
    })),
    /**
     * The customer-only ranked feed. Defaults to "unavailable" (no data, not an
     * error) so surfaces render the public feed exactly as they did before the
     * endpoint was wired; a test that cares about recommendations overrides this
     * or asserts on `hasRecommendations`.
     */
    useRecommendations: jest.fn(() => ({
      offers: [],
      list: [],
      isLoading: false,
      isError: false,
      isSuccess: false,
      hasRecommendations: false,
    })),
    useDealEngagement: jest.fn(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
    })),
  };
};

/**
 * Test double for the optimistic like/save hooks. Those need a QueryClient,
 * which the UI suites do not mount, so they are stubbed to the neutral state.
 */
export const mockDealEngagementActionsModule = () => ({
  engagementKeys: {
    counts: (offerId: string) => ['offers', 'engagement', offerId],
    reaction: (offerId: string) => ['offers', 'reaction', offerId],
    saved: (offerId: string) => ['offers', 'saved', offerId],
  },
  useDealReaction: () => ({
    liked: false,
    toggle: jest.fn(),
    isPending: false,
    needsAuth: false,
  }),
  useDealSave: () => ({
    saved: false,
    toggle: jest.fn(),
    isPending: false,
    needsAuth: false,
  }),
});
