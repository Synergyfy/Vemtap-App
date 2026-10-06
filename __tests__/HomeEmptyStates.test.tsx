import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { toPopularProduct } from '@features/home/hooks/useNearbyProducts';
import { strings } from '@constants/strings';

/**
 * Every Home section must say when it has nothing.
 *
 * Each of them used to render a bare header over no content when its data was
 * missing, which reads as a broken screen rather than an empty one. Products are
 * the live case today: `GET /products` returns nothing on the test API.
 */

const mockBusinesses = jest.fn();
const mockProducts = jest.fn();
const mockDeals = jest.fn();

// Partial mocks: the data hooks are stubbed, the pure mappers stay real so they
// are still exercised here.
jest.mock('@features/home/hooks/useNearbyBusinesses', () => ({
  ...jest.requireActual('@features/home/hooks/useNearbyBusinesses'),
  useNearbyBusinesses: () => mockBusinesses(),
}));

jest.mock('@features/home/hooks/useNearbyProducts', () => ({
  ...jest.requireActual('@features/home/hooks/useNearbyProducts'),
  useNearbyProducts: () => mockProducts(),
}));

jest.mock('@features/home/hooks/useHomeDeals', () => ({
  useHomeDeals: () => mockDeals(),
}));

jest.mock('@features/deals/hooks/useDealEngagementActions', () => ({
  engagementKeys: {
    counts: (id: string) => ['offers', 'engagement', id],
    reaction: (id: string) => ['offers', 'reaction', id],
    saved: (id: string) => ['offers', 'saved', id],
  },
  useDealReaction: () => ({ liked: false, toggle: jest.fn() }),
  useDealSave: () => ({ saved: false, toggle: jest.fn() }),
}));

jest.mock('@features/dealDetail/components/DealCommentsSheet', () => ({
  DealCommentsSheet: () => null,
}));

jest.mock('@features/dealDetail/components/DealShareSheet', () => ({
  DealShareSheet: () => null,
}));

jest.mock('@hooks/useNetworkStatus', () => ({
  useIsOnline: () => true,
}));

const emptyDeals = {
  featured: null,
  nearby: [],
  trending: [],
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
};

const LOADING = { ...emptyDeals, isLoading: true };

async function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const screen = await render(
    <QueryClientProvider client={client}>
      <HomeScreen />
    </QueryClientProvider>,
  );
  client.clear();
  return screen;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDeals.mockReturnValue(emptyDeals);
  mockBusinesses.mockReturnValue({ data: [] });
  mockProducts.mockReturnValue({ data: [] });
});

describe('Home empty states', () => {
  it('explains every empty section rather than showing bare headers', async () => {
    const screen = await renderHome();

    // Featured, deals near you, trending, businesses, products.
    await waitFor(() =>
      expect(screen.getByText(strings.home.emptyFeaturedTitle)).toBeTruthy(),
    );
    expect(screen.getByText(strings.featuredDeals.emptyTitle)).toBeTruthy();
    expect(screen.getByText(strings.home.emptyTrendingTitle)).toBeTruthy();
    expect(screen.getByText(strings.home.noBusinessesTitle)).toBeTruthy();
    expect(screen.getByText(strings.home.emptyProductsTitle)).toBeTruthy();
  });

  it('shows a loading state rather than an empty one while fetching', async () => {
    mockDeals.mockReturnValue(LOADING);

    const screen = await renderHome();

    await waitFor(() =>
      expect(screen.getByLabelText(strings.common.loading)).toBeTruthy(),
    );
    // A section that has not loaded yet must not claim to be empty.
    expect(screen.queryByText(strings.home.emptyFeaturedTitle)).toBeNull();
  });

  it('keeps the section headers so the page structure is intact when empty', async () => {
    const screen = await renderHome();

    await waitFor(() =>
      expect(screen.getByText(strings.home.emptyFeaturedTitle)).toBeTruthy(),
    );
    expect(screen.getByText(strings.home.featured)).toBeTruthy();
    expect(screen.getByText(strings.home.popularNearYou)).toBeTruthy();
  });
});

describe('useNearbyProducts mapping', () => {
  test('exposes an honest mapping for a catalogue item', async () => {
    const mapped = toPopularProduct({
      id: 'item-1',
      name: 'Soft Drinks',
      price: 1000,
      mainImage: 'https://example.test/s.png',
      // No merchant name on a catalogue item, and no original price.
      businessId: 'business-1',
    } as never);

    expect(mapped.title).toBe('Soft Drinks');
    expect(mapped.merchant).toBe('');
    expect(mapped.priceWas).toBe('');
    expect(mapped.price).toContain('1,000');
  });
});
