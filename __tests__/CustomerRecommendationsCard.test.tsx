import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { strings } from '@constants/strings';

/**
 * "Deals You May Like" prefers `GET /recommendations` — the ranked feed that
 * drops offers this customer already claimed — and falls back to the public
 * offers feed when that call is refused.
 *
 * The endpoint is CUSTOMER-only, so the refusal path is the common one (an
 * anonymous visitor or an owner), and it must look identical to before rather
 * than like an error.
 */

const mockFeed = jest.fn();
const mockRecommended = jest.fn();

jest.mock('@features/deals/hooks/usePublicOffers', () => ({
  ...jest.requireActual('@features/deals/hooks/usePublicOffers'),
  usePublicOffersFeed: () => mockFeed(),
  useRecommendations: () => mockRecommended(),
}));

const copy = strings.customerDashboard;

function feedOffer(id: string, name: string) {
  return {
    id,
    name,
    status: 'active',
    fixedPrice: 10000,
    percentageOff: 20,
    calculatedPrice: 8000,
    originalPrice: 10000,
    discountPercent: 20,
    items: [],
    terms: [],
    claimedCount: 0,
  };
}

type FeedOffer = {
  id: string;
  name: string;
  status: string;
  fixedPrice: number;
  percentageOff: number;
  calculatedPrice: number;
  originalPrice: number;
  discountPercent: number;
  items: unknown[];
  terms: unknown[];
  claimedCount: number;
};

function feedShape(offers: FeedOffer[]) {
  return {
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    offers,
    hasRecommendations: false,
    feed: {
      area: 'Apo',
      featured: null,
      list: offers.map((offer, index) => ({
        id: offer.id,
        image: { uri: 'https://cdn/item.png' },
        leftBadge: { label: '-20%', tone: 'discount' },
        rightBadge: { kind: 'text', label: 'Live', tone: 'muted' },
        merchant: 'Azure Bistro',
        title: offer.name,
        price: '₦8,000',
        priceWas: '₦10,000',
        location: `${index + 1}.2 km`,
      })),
      grid: [],
    },
  };
}

async function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = await render(
    <QueryClientProvider client={client}>
      <CustomerDashboardScreen />
    </QueryClientProvider>,
  );
  client.clear();
  return view;
}

afterEach(() => {
  mockFeed.mockReset();
  mockRecommended.mockReset();
});

describe('deals you may like source', () => {
  it('renders the ranked recommendations when the call succeeds', async () => {
    mockFeed.mockReturnValue(feedShape([feedOffer('feed-1', 'From the public feed')]));
    // `useRecommendations` returns mapped `list` items (not the nested feed
    // shape the public hook builds), so the mock mirrors that difference.
    const ranked = feedShape([feedOffer('rec-1', 'Ranked pick for you')]);
    mockRecommended.mockReturnValue({
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      offers: [feedOffer('rec-1', 'Ranked pick for you')],
      list: ranked.feed.list,
      hasRecommendations: true,
    });

    const screen = await renderDashboard();

    await waitFor(() => expect(screen.getByText('Ranked pick for you')).toBeTruthy());
    expect(screen.queryByText('From the public feed')).toBeNull();
  });

  it('falls back to the public feed when recommendations are refused', async () => {
    // Exactly what a 401/403 leaves behind: no data, isError false, because the
    // card is not meant to surface that failure.
    mockFeed.mockReturnValue(feedShape([feedOffer('feed-1', 'From the public feed')]));
    mockRecommended.mockReturnValue({
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
      offers: [],
      list: [],
      hasRecommendations: false,
    });

    const screen = await renderDashboard();

    await waitFor(() => expect(screen.getByText('From the public feed')).toBeTruthy());
    expect(copy.mayLike).toBeTruthy();
  });

  it('shows the empty state only when neither feed has anything', async () => {
    mockFeed.mockReturnValue(feedShape([]));
    mockRecommended.mockReturnValue({
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
      offers: [],
      list: [],
      hasRecommendations: false,
    });

    const screen = await renderDashboard();

    await waitFor(() =>
      expect(screen.getByText(copy.recommendationsEmpty.title)).toBeTruthy(),
    );
  });
});
