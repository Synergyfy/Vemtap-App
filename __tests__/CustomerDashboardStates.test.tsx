import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { strings } from '@constants/strings';
import type { DealListItem } from '@features/deals/data/dealsFeed';
import { claimFixture } from './helpers/mockCustomerHub';

const mockBalance = jest.fn();
const mockAnalytics = jest.fn();
const mockTier = jest.fn();
const mockLogs = jest.fn();
const mockRewards = jest.fn();
const mockFeed = jest.fn();
const mockRecommendations = jest.fn();
const mockUnread = jest.fn();
const mockClaimsList = jest.fn();
const mockActiveClaimsCount = jest.fn();

jest.mock('@features/accountHub/hooks/useLoyalty', () => ({
  ...jest.requireActual('@features/accountHub/hooks/useLoyalty'),
  useLoyaltyBalance: () => mockBalance(),
  useLoyaltyAnalytics: () => mockAnalytics(),
  useLoyaltyLogs: () => mockLogs(),
  useRewards: () => mockRewards(),
  useLoyaltyTier: () => mockTier(),
}));

jest.mock('@features/myDeals/hooks/useMyClaims', () => ({
  useMyClaims: () => mockClaimsList(),
  useActiveClaimsCount: () => mockActiveClaimsCount(),
}));

jest.mock('@features/business/hooks/useBusinessDashboardData', () => ({
  ...jest.requireActual('@features/business/hooks/useBusinessDashboardData'),
  useUnreadNotificationsCount: () => mockUnread(),
}));

jest.mock('@features/deals/hooks/usePublicOffers', () => ({
  ...jest.requireActual('@features/deals/hooks/usePublicOffers'),
  usePublicOffersFeed: () => mockFeed(),
  useRecommendations: () => mockRecommendations(),
}));

const copy = strings.customerDashboard;

async function renderDashboard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CustomerDashboardScreen />
    </QueryClientProvider>,
  );
}

function feedItem(id: string, title: string): DealListItem {
  return {
    id,
    image: { uri: 'https://example.com/deal.jpg' },
    leftBadge: { label: '20% OFF', tone: 'discount' },
    rightBadge: { kind: 'timer', label: 'Ends in 4h' },
    merchant: 'Urban Grill & Bistro',
    statusIcon: 'verified',
    title,
    price: '₦9,600',
    priceWas: '₦12,000',
    save: 'Save ₦2,400',
    location: '0.8 km away',
    meta: 'Ends today',
    metaTone: 'tertiary',
    likes: 5,
    comments: 2,
    claimLabel: strings.deals.claimDeal,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: the tier query is still loading (returns no data yet).
  mockTier.mockReturnValue({ data: undefined });
  mockUnread.mockReturnValue({ data: undefined });
  mockClaimsList.mockReturnValue({
    isLoading: false,
    isError: false,
    isSuccess: false,
    data: undefined,
    refetch: jest.fn(),
  });
  mockActiveClaimsCount.mockReturnValue({
    isSuccess: false,
    isError: false,
    data: undefined,
  });
  // "Deals You May Like" reads the dedicated recommendations endpoint and
  // falls back to the public feed when it has no result yet.
  mockRecommendations.mockReturnValue({
    isLoading: true,
    isError: false,
    isSuccess: false,
    data: undefined,
    offers: [],
    list: [],
    hasRecommendations: false,
  });
});

test('while loading, known metrics show placeholders and each region shows a loading state', async () => {
  mockBalance.mockReturnValue({ isSuccess: false, isError: false, data: undefined });
  mockAnalytics.mockReturnValue({ isSuccess: false, isError: false, data: undefined });
  mockLogs.mockReturnValue({
    isLoading: true,
    isError: false,
    data: undefined,
    refetch: jest.fn(),
  });
  mockRewards.mockReturnValue({ isPending: true, isError: false, data: undefined });
  mockFeed.mockReturnValue({
    isLoading: true,
    isError: false,
    refetch: jest.fn(),
    feed: { list: [] },
  });
  mockClaimsList.mockReturnValue({
    isLoading: true,
    isError: false,
    isSuccess: false,
    data: undefined,
    refetch: jest.fn(),
  });

  const screen = await renderDashboard();

  // Unknown counts render the unavailable marker, never an invented zero.
  expect(screen.queryByText('0')).toBeNull();
  // three metric placeholders + four placeholders inside the rewards card
  expect(screen.getAllByText('—')).toHaveLength(7);
  // Assert the loading states per region rather than as one global count: the
  // rewards card now resolves platform-wide (no business scope needed), so it
  // contributes its own loading line instead of waiting on context.
  expect(screen.getAllByText(strings.common.loading).length).toBeGreaterThanOrEqual(3);
  expect(screen.queryByText(copy.activityEmpty.title)).toBeNull();
  expect(screen.queryByLabelText('Cart')).toBeNull();
  expect(screen.queryByText('3')).toBeNull();
  expect(screen.getByText('Apo, Abuja')).toBeTruthy();
});

test('query failures surface retryable error states, never a fake zero', async () => {
  mockBalance.mockReturnValue({ isSuccess: false, isError: true, data: undefined });
  mockAnalytics.mockReturnValue({ isSuccess: false, isError: false, data: undefined });
  mockLogs.mockReturnValue({
    isLoading: false,
    isError: true,
    data: undefined,
    refetch: jest.fn(),
  });
  mockRewards.mockReturnValue({ isPending: false, isError: true, data: undefined });
  mockFeed.mockReturnValue({
    isLoading: false,
    isError: true,
    refetch: jest.fn(),
    feed: { list: [] },
  });
  mockRecommendations.mockReturnValue({
    isLoading: false,
    isError: true,
    isSuccess: false,
    data: undefined,
    offers: [],
    list: [],
    hasRecommendations: false,
    refetch: jest.fn(),
  });
  mockClaimsList.mockReturnValue({
    isLoading: false,
    isError: true,
    isSuccess: false,
    data: undefined,
    refetch: jest.fn(),
  });
  mockActiveClaimsCount.mockReturnValue({
    isSuccess: false,
    isError: true,
    data: undefined,
  });

  const screen = await renderDashboard();

  expect(screen.getAllByText(strings.common.error)).toHaveLength(2);
  expect(screen.getAllByText(strings.common.retry)).toHaveLength(3);
  expect(screen.getAllByText('—')).toHaveLength(7);
  expect(screen.getByText(copy.rewardsUnavailable)).toBeTruthy();
  expect(screen.queryByText(copy.activityEmpty.title)).toBeNull();
  expect(screen.queryByText('0 pts')).toBeNull();
});

test('an empty account renders zero values and empty states, not placeholders', async () => {
  mockBalance.mockReturnValue({ isSuccess: true, isError: false, data: 0 });
  mockAnalytics.mockReturnValue({
    isSuccess: true,
    isError: false,
    data: { totals: { netSavings: 0 } },
  });
  mockLogs.mockReturnValue({
    isLoading: false,
    isError: false,
    data: { data: [] },
    refetch: jest.fn(),
  });
  // Rewards now resolve platform-wide (no business context needed), so an
  // empty list is a real answer, not a pending query waiting for a scope.
  mockRewards.mockReturnValue({ isPending: false, isError: false, data: [] });
  mockTier.mockReturnValue({
    data: {
      points: 0,
      tier: 'Bronze',
      nextTier: 'Silver',
      pointsToNext: 1000,
      progressPercent: 0,
      thresholds: [],
    },
  });
  mockUnread.mockReturnValue({ data: 0 });
  mockFeed.mockReturnValue({
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    feed: { list: [] },
  });
  mockRecommendations.mockReturnValue({
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: { data: [], total: 0 },
    offers: [],
    list: [],
    hasRecommendations: true,
    refetch: jest.fn(),
  });
  mockClaimsList.mockReturnValue({
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: { data: [], total: 0, page: 1, limit: 50 },
    refetch: jest.fn(),
  });
  mockActiveClaimsCount.mockReturnValue({
    isSuccess: true,
    isError: false,
    data: 0,
  });

  const screen = await renderDashboard();

  expect(screen.getAllByText('0')).toHaveLength(2);
  expect(screen.getByText('₦0')).toBeTruthy();
  expect(screen.getByText('Bronze Member')).toBeTruthy();
  expect(screen.getByText('0 / 1,000 pts')).toBeTruthy();
  expect(screen.getByText(copy.activeEmpty.title)).toBeTruthy();
  expect(screen.getByText(copy.activityEmpty.title)).toBeTruthy();
  expect(screen.getByText(copy.rewardsZero)).toBeTruthy();
  expect(screen.getByText(copy.recommendationsEmpty.title)).toBeTruthy();
  expect(screen.queryByText('—')).toBeNull();
  expect(screen.queryByText('2')).toBeNull();
  expect(screen.queryByText('3')).toBeNull();
});

test('a funded account renders real points, tier, ledger rows and two recommendations', async () => {
  const today = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString();

  mockBalance.mockReturnValue({ isSuccess: true, isError: false, data: 2450 });
  mockTier.mockReturnValue({
    data: {
      points: 2450,
      tier: 'Gold',
      nextTier: 'Platinum',
      pointsToNext: 3000,
      progressPercent: 81.7,
      thresholds: [],
    },
  });
  mockAnalytics.mockReturnValue({
    isSuccess: true,
    isError: false,
    data: { totals: { netSavings: 24500 } },
  });
  mockLogs.mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      data: [
        {
          id: 'log-1',
          type: 'earned',
          points: 100,
          reason: 'Deal Claimed at Urban Grill & Bistro',
          createdAt: today,
          businessId: 'biz-1',
        },
        {
          id: 'log-2',
          type: 'spent',
          points: 50,
          reason: null,
          createdAt: yesterday,
          businessId: 'biz-2',
        },
      ],
    },
    refetch: jest.fn(),
  });
  mockRewards.mockReturnValue({
    isPending: false,
    isError: false,
    data: [
      {
        id: 'reward-1',
        name: 'Free Coffee',
        pointsRequired: 500,
        category: 'free_product',
      },
      {
        id: 'reward-2',
        name: 'Suite Night',
        pointsRequired: 9000,
        category: 'tangible_gifts',
      },
    ],
  });
  mockFeed.mockReturnValue({
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    feed: {
      list: [
        feedItem('offer-1', 'Sourdough & Pastries Combo'),
        feedItem('offer-2', 'Cocktails & Small Plates'),
        feedItem('offer-3', 'Deep Hydration Facial'),
      ],
    },
  });
  mockRecommendations.mockReturnValue({
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: { data: [], total: 2 },
    offers: [],
    list: [
      feedItem('offer-1', 'Sourdough & Pastries Combo'),
      feedItem('offer-2', 'Cocktails & Small Plates'),
    ],
    hasRecommendations: true,
    refetch: jest.fn(),
  });
  mockUnread.mockReturnValue({ data: 3 });
  mockClaimsList.mockReturnValue({
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: { data: [claimFixture], total: 1, page: 1, limit: 50 },
    refetch: jest.fn(),
  });
  mockActiveClaimsCount.mockReturnValue({
    isSuccess: true,
    isError: false,
    data: 1,
  });

  const screen = await renderDashboard();

  expect(screen.getByText('2,450')).toBeTruthy();
  expect(screen.getByText('₦24.5k')).toBeTruthy();
  expect(screen.getByText('Gold Member')).toBeTruthy();
  expect(screen.getByText('2,450 pts')).toBeTruthy();
  expect(screen.getByText('Progress to Platinum')).toBeTruthy();
  expect(screen.getByText('2,450 / 3,000 pts')).toBeTruthy();

  expect(screen.getByText(copy.activityTitles.earned)).toBeTruthy();
  expect(screen.getByText(/Deal Claimed at Urban Grill & Bistro • Today/)).toBeTruthy();
  expect(screen.getByText('+100 pts')).toBeTruthy();
  expect(screen.getByText(copy.activityTitles.spent)).toBeTruthy();
  expect(screen.getByText('−50 pts')).toBeTruthy();

  expect(screen.getByText('1 reward available to unlock right now')).toBeTruthy();
  expect(screen.getByText('3')).toBeTruthy();

  expect(screen.getByText('Sourdough & Pastries Combo')).toBeTruthy();
  expect(screen.getByText('Cocktails & Small Plates')).toBeTruthy();
  expect(screen.queryByText('Deep Hydration Facial')).toBeNull();
  expect(screen.queryByText('—')).toBeNull();
});
