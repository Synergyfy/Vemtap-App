import React from 'react';
import { render } from '@testing-library/react-native';
import { AccountHomeScreen } from '@features/accountHub/screens/AccountHomeScreen';
import { strings } from '@constants/strings';

/**
 * The Account hub's stat tiles and row badges used to print designed
 * placeholders (`₦18,500`, `3 Live`, `3 Active`, `1 Pending`, `12 items`)
 * regardless of who was signed in. They now come from live queries, or are
 * omitted where no endpoint exists.
 */
const mockAnalytics = jest.fn();
const mockOrders = jest.fn();

jest.mock('@features/accountHub/hooks/useLoyalty', () => ({
  useLoyaltyAnalytics: () => mockAnalytics(),
}));

jest.mock('@features/order/hooks/useCustomerOrders', () => ({
  useCustomerOrders: () => mockOrders(),
}));

jest.mock('@features/accountHub/hooks/useSavedHub', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockSavedHubModule(),
);

jest.mock('@features/myDeals/hooks/useMyClaims', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockMyClaimsModule(),
);

jest.mock('@store/authStore', () => ({
  useAuthStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({ user: null, status: 'authenticated', markUnauthenticated: jest.fn() }),
    { getState: () => ({ markUnauthenticated: jest.fn() }) },
  ),
}));

const { useSavedTotals } = jest.requireMock('@features/accountHub/hooks/useSavedHub');
const { useActiveClaimsCount } = jest.requireMock('@features/myDeals/hooks/useMyClaims');

function order(status: string) {
  return { id: `order-${status}`, status, totalAmount: 1000, items: [] };
}

beforeEach(() => {
  mockOrders.mockReturnValue({ isSuccess: true, isError: false, data: [] });
  (useSavedTotals as jest.Mock).mockReturnValue({
    deals: undefined,
    businesses: undefined,
    services: undefined,
    all: undefined,
    isSuccess: false,
    isLoading: false,
  });
  (useActiveClaimsCount as jest.Mock).mockReturnValue({
    data: undefined,
    isSuccess: false,
    isError: false,
  });
});

test('Total Saved shows the customer’s live net savings', async () => {
  mockAnalytics.mockReturnValue({
    isSuccess: true,
    isError: false,
    data: { totals: { totalVisits: 3, rewardPoints: 120, netSavings: 24500 } },
  });

  const screen = await render(<AccountHomeScreen />);

  expect(screen.getByText('Total Saved')).toBeTruthy();
  // Tile and the Savings History badge share the one value.
  expect(screen.getAllByText('₦24.5k')).toHaveLength(2);
  expect(screen.queryByText('₦18,500')).toBeNull();
});

test('Total Saved shows the unavailable marker until the totals settle', async () => {
  mockAnalytics.mockReturnValue({ isSuccess: false, isError: false, data: undefined });

  const screen = await render(<AccountHomeScreen />);

  // Total Saved tile, Savings History badge and the Active Deals tile all
  // share the unresolved marker while their queries are unsettled.
  expect(screen.getAllByText(strings.customerDashboard.metricUnavailable)).toHaveLength(
    3,
  );
  expect(screen.queryByText('₦18,500')).toBeNull();
});

test('Active Deals reports the live claim count from GET /me/claims', async () => {
  mockAnalytics.mockReturnValue({ isSuccess: true, isError: false, data: undefined });
  (useActiveClaimsCount as jest.Mock).mockReturnValue({
    data: 3,
    isSuccess: true,
    isError: false,
  });

  const screen = await render(<AccountHomeScreen />);

  // Tile and My Deals badge share the one count — never the designed "3 Live".
  expect(screen.getAllByText('3 Live')).toHaveLength(1);
  expect(screen.getByText('3 Active')).toBeTruthy();
});

test('Active Deals shows the unavailable marker until the claims settle', async () => {
  mockAnalytics.mockReturnValue({ isSuccess: true, isError: false, data: undefined });

  const screen = await render(<AccountHomeScreen />);

  expect(screen.getByText(strings.customerDashboard.metricUnavailable)).toBeTruthy();
  // The badge is omitted rather than printing an invented zero.
  expect(screen.queryByText('0 Active')).toBeNull();
});

test('Orders badge counts the live open orders', async () => {
  mockAnalytics.mockReturnValue({ isSuccess: true, isError: false, data: undefined });
  mockOrders.mockReturnValue({
    isSuccess: true,
    isError: false,
    data: [order('new'), order('processing'), order('completed')],
  });

  const screen = await render(<AccountHomeScreen />);

  expect(screen.getByText('2 Pending')).toBeTruthy();
  expect(screen.queryByText('1 Pending')).toBeNull();
});

test('Saved Items carries the live unified-feed count', async () => {
  mockAnalytics.mockReturnValue({ isSuccess: true, isError: false, data: undefined });
  (useSavedTotals as jest.Mock).mockReturnValue({
    deals: 7,
    businesses: 3,
    services: 2,
    all: 12,
    isSuccess: true,
    isLoading: false,
  });

  const screen = await render(<AccountHomeScreen />);

  expect(screen.getByText('12 Saved')).toBeTruthy();
});

test('Saved Items carries no badge until the saved feed settles', async () => {
  mockAnalytics.mockReturnValue({ isSuccess: true, isError: false, data: undefined });

  const screen = await render(<AccountHomeScreen />);

  expect(screen.queryByText('12 Saved')).toBeNull();
});
