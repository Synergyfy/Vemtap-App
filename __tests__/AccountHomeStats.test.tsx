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

jest.mock('@store/authStore', () => ({
  useAuthStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({ user: null, status: 'authenticated', markUnauthenticated: jest.fn() }),
    { getState: () => ({ markUnauthenticated: jest.fn() }) },
  ),
}));

function order(status: string) {
  return { id: `order-${status}`, status, totalAmount: 1000, items: [] };
}

beforeEach(() => {
  mockOrders.mockReturnValue({ isSuccess: true, isError: false, data: [] });
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

  // Tile + Savings History badge, both unresolved.
  expect(screen.getAllByText(strings.customerDashboard.metricUnavailable)).toHaveLength(
    2,
  );
  expect(screen.queryByText('₦18,500')).toBeNull();
});

test('Active Deals reports the real (currently unknown) count, not the placeholder', async () => {
  mockAnalytics.mockReturnValue({ isSuccess: true, isError: false, data: undefined });

  const screen = await render(<AccountHomeScreen />);

  // No customer claims endpoint exists yet, so both the tile and the My Deals
  // badge report zero — never the designed "3 Live" / "3 Active".
  expect(screen.getByText('0 Live')).toBeTruthy();
  expect(screen.getByText('0 Active')).toBeTruthy();
  expect(screen.queryByText('3 Live')).toBeNull();
  expect(screen.queryByText('3 Active')).toBeNull();
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

test('Saved Items carries no invented badge', async () => {
  mockAnalytics.mockReturnValue({ isSuccess: true, isError: false, data: undefined });

  const screen = await render(<AccountHomeScreen />);

  // `useSavedDealsList` is a stub — the endpoint does not exist — so the row
  // must not print a count.
  expect(screen.queryByText('12 items')).toBeNull();
});
