/**
 * Test double for the live offers feed hook.
 *
 * The deals screens read from the API through `usePublicOffersFeed`, but the UI
 * tests assert on specific deal copy. Mocking the hook with the existing
 * `dealsFeed` fixtures keeps those assertions meaningful and stops the suite
 * making real network calls.
 */
export const mockOffersFeedModule = () => {
  const data = jest.requireActual('@features/deals/data/dealsFeed') as {
    dealsGrid: unknown[];
    dealsList: unknown[];
    featuredDealOfDay: unknown;
  };

  return {
    usePublicOffersFeed: () => ({
      offers: [],
      isLoading: false,
      isError: false,
      isSuccess: true,
      feed: {
        area: 'Apo',
        featured: data.featuredDealOfDay,
        list: data.dealsList,
        grid: data.dealsGrid,
      },
    }),
    useDealEngagement: () => ({ data: undefined, isLoading: false, isError: false }),
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
