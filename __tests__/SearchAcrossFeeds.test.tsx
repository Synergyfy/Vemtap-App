import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { DealsDiscoveryScreen } from '@features/deals/screens/DealsDiscoveryScreen';
import { chipSearchTerm } from '@features/search/hooks/usePublicSearch';
import { strings } from '@constants/strings';

/**
 * Home's search bar and category chips are wired to `GET /public/search`, which
 * is the one endpoint that groups deals, businesses and categories by a single
 * query — so the bar and the chips drive the same request rather than two
 * different filters.
 *
 * The debounce is real (400ms, the shared `useDebounce` default), so these tests
 * wait for it rather than reaching into its internals.
 */

const mockSearch = jest.fn();
const mockDeals = jest.fn();
const mockProducts = jest.fn();
const mockFeed = jest.fn();

jest.mock('@api/publicSearchApi', () => ({
  ...jest.requireActual('@api/publicSearchApi'),
  publicSearchApi: {
    search: (params: unknown) => mockSearch(params),
  },
}));

// Partial mocks: the hooks are stubbed, the pure mappers stay real.
jest.mock('@features/home/hooks/useHomeDeals', () => ({
  useHomeDeals: () => mockDeals(),
}));

jest.mock('@features/home/hooks/useNearbyProducts', () => ({
  ...jest.requireActual('@features/home/hooks/useNearbyProducts'),
  useNearbyProducts: () => mockProducts(),
}));

jest.mock('@features/home/hooks/useNearbyBusinesses', () => ({
  ...jest.requireActual('@features/home/hooks/useNearbyBusinesses'),
  useNearbyBusinesses: () => ({ data: [] }),
}));

// Wrapped rather than assigned: the factory runs while the module's imports are
// still evaluating, before `const mockFeed` is initialised.
jest.mock('@features/deals/hooks/usePublicOffers', () => ({
  ...jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
  usePublicOffersFeed: (...args: unknown[]) => mockFeed(...args),
}));

jest.mock('@features/deals/hooks/useDealEngagementActions', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockDealEngagementActionsModule(),
);

jest.mock('@features/dealDetail/components/DealCommentsSheet', () => ({
  DealCommentsSheet: () => null,
}));

jest.mock('@features/dealDetail/components/DealShareSheet', () => ({
  DealShareSheet: () => null,
}));

jest.mock('@hooks/useNetworkStatus', () => ({
  useIsOnline: () => true,
}));

const OFFER = {
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
};

const BUSINESS = {
  id: 'business-cafe-aroma',
  name: 'Cafe Aroma',
  logoUrl: null,
  description: 'Coffee house',
  address: 'Apo, Abuja',
  state: 'Federal Capital Territory',
  city: 'Abuja',
  categoryId: 'category-cafe',
  categoryName: 'Food & Hospitality',
  isVerified: true,
  slug: 'cafe-aroma',
  branchCode: 'ABCD12345',
};

const emptyDeals = {
  featured: null,
  nearby: [],
  trending: [],
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
};

async function renderScreen(node: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const screen = await render(
    <QueryClientProvider client={client}>{node}</QueryClientProvider>,
  );
  client.clear();
  return screen;
}

const renderHome = () => renderScreen(<HomeScreen />);
const renderDeals = () =>
  renderScreen(<DealsDiscoveryScreen onOpenFilters={jest.fn()} onOpenDeal={jest.fn()} />);

beforeEach(() => {
  jest.clearAllMocks();
  mockDeals.mockReturnValue(emptyDeals);
  mockProducts.mockReturnValue({ data: [] });
  mockFeed.mockReturnValue(
    jest
      .requireActual('./helpers/mockOffersFeed')
      .mockOffersFeedModule()
      .usePublicOffersFeed(),
  );
  mockSearch.mockResolvedValue({
    deals: [],
    businesses: [],
    categories: [],
    products: [],
  });
});

/**
 * Phase 2: the search request carries the discovery origin, so results are
 * narrowed to the district the surrounding sections filter by. The coordinates
 * come from the location store's defaults rather than being hardcoded here.
 */
function expectSearchRequest(expected: { q: string; limit: number }) {
  expect(mockSearch).toHaveBeenCalledTimes(1);
  const params = mockSearch.mock.calls[0][0] as Record<string, unknown>;
  expect(params).toMatchObject(expected);
  expect(typeof params.lat).toBe('number');
  expect(typeof params.lng).toBe('number');
  expect(params.radius).toBeGreaterThan(0);
}

describe('Home search', () => {
  it('swaps the sections for results once the query settles', async () => {
    mockSearch.mockResolvedValue({
      deals: [OFFER],
      businesses: [BUSINESS],
      categories: [],
      products: [],
    });

    const screen = await renderHome();
    // Sections are up before anything is typed.
    expect(screen.getByText(strings.home.featured)).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText(strings.home.searchPlaceholder), 'lunch');

    await waitFor(() => expect(mockSearch).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expectSearchRequest({ q: 'lunch', limit: 20 });

    await waitFor(
      () => expect(screen.getByText('20% Off Prime Lunch Combo')).toBeTruthy(),
      { timeout: 3000 },
    );
    await waitFor(() => expect(screen.getByText(strings.search.businesses)).toBeTruthy());

    // The sections are replaced, not stacked underneath the results.
    expect(screen.queryByText(strings.home.featured)).toBeNull();
    expect(screen.queryByText(strings.home.popularNearYou)).toBeNull();
  });

  it('reads a search for the grouped business result', async () => {
    mockSearch.mockResolvedValue({
      deals: [],
      businesses: [BUSINESS],
      categories: [],
      products: [],
    });

    const screen = await renderHome();
    fireEvent.changeText(screen.getByLabelText(strings.home.searchPlaceholder), 'aroma');

    await waitFor(() => expect(screen.getByText('Cafe Aroma')).toBeTruthy(), {
      timeout: 3000,
    });
    // The row is not pressable: the payload carries no `uniqueCode`, so there is
    // no code that the merchant profile endpoint would accept.
    expect(screen.queryByText(strings.home.featured)).toBeNull();
  });

  it('explains an empty result instead of rendering nothing', async () => {
    const screen = await renderHome();
    fireEvent.changeText(screen.getByLabelText(strings.home.searchPlaceholder), 'zzz');

    await waitFor(
      () => expect(screen.getByText(strings.search.emptyTitle)).toBeTruthy(),
      {
        timeout: 3000,
      },
    );
    expect(screen.getByText(strings.search.emptyBody)).toBeTruthy();
  });

  it('reports a failed search rather than falling back to stale sections', async () => {
    mockSearch.mockRejectedValue(new Error('offline'));

    const screen = await renderHome();
    fireEvent.changeText(screen.getByLabelText(strings.home.searchPlaceholder), 'lunch');

    await waitFor(() => expect(screen.getByText(strings.common.error)).toBeTruthy(), {
      timeout: 3000,
    });
    expect(screen.queryByText(strings.home.featured)).toBeNull();
  });
});

describe('Home category chips', () => {
  it('searches with the chip term, emoji and all', async () => {
    const screen = await renderHome();

    fireEvent.press(screen.getByText('🍔 Food'));

    await waitFor(
      () => {
        expect(mockSearch).toHaveBeenCalledTimes(1);
        const params = mockSearch.mock.calls[0][0] as Record<string, unknown>;
        expect(params).toMatchObject({ q: 'Food', limit: 20 });
      },
      { timeout: 3000 },
    );
    // The label is display copy, so it lands in the input minus its emoji.
    expect(screen.getByLabelText(strings.home.searchPlaceholder).props.value).toBe(
      'Food',
    );
  });

  it('lights the chip the query matches and clears on All', async () => {
    mockSearch.mockResolvedValue({
      deals: [OFFER],
      businesses: [],
      categories: [],
      products: [],
    });
    const screen = await renderHome();

    fireEvent.press(screen.getByText('🍔 Food'));
    await waitFor(
      () => expect(screen.getByText('20% Off Prime Lunch Combo')).toBeTruthy(),
      {
        timeout: 3000,
      },
    );

    // "All" is the design's clear affordance: it empties the input, and the
    // sections come straight back without another request.
    fireEvent.press(screen.getByText('All'));
    await waitFor(
      () =>
        expect(screen.getByLabelText(strings.home.searchPlaceholder).props.value).toBe(
          '',
        ),
      { timeout: 3000 },
    );
    await waitFor(() => expect(screen.getByText(strings.home.featured)).toBeTruthy(), {
      timeout: 3000,
    });
  });
});

describe('Deals tab search', () => {
  it('shares the same endpoint and replaces the feed', async () => {
    mockSearch.mockResolvedValue({
      deals: [OFFER],
      businesses: [],
      categories: [],
      products: [],
    });

    const screen = await renderDeals();
    expect(screen.getByText(strings.deals.featuredEyebrow)).toBeTruthy();

    fireEvent.changeText(
      screen.getByLabelText(strings.deals.searchPlaceholderDots),
      'lunch',
    );

    await waitFor(
      () => expect(screen.getByText('20% Off Prime Lunch Combo')).toBeTruthy(),
      { timeout: 3000 },
    );
    expectSearchRequest({ q: 'lunch', limit: 20 });
    expect(screen.queryByText(strings.deals.featuredEyebrow)).toBeNull();
  });
});

describe('chipSearchTerm', () => {
  test('strips only the emoji prefix', () => {
    expect(chipSearchTerm('🍔 Food')).toBe('Food');
    expect(chipSearchTerm('⚡ Electronics')).toBe('Electronics');
    expect(chipSearchTerm('All')).toBe('All');
  });
});
