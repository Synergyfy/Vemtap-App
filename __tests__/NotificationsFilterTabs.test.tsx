import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NotificationsCenterScreen } from '@features/accountHub/screens/NotificationsCenterScreen';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { strings } from '@constants/strings';

const mockNotifs = jest.fn();

jest.mock('@features/accountHub/hooks/useNotifications', () => ({
  useNotifications: () => mockNotifs(),
  useMarkNotificationRead: () => ({ mutate: jest.fn() }),
  useMarkAllNotificationsRead: () => ({ mutate: jest.fn() }),
}));

const copy = strings.notificationsCenter;
const visible = (title: string) => screen.queryByText(title) !== null;

function mockLive(data: unknown[]) {
  mockNotifs.mockReturnValue({
    isLoading: false,
    isError: false,
    data,
    refetch: jest.fn(),
  });
}

const liveRows = [
  {
    id: 'n1',
    title: 'DealRow',
    message: '20% OFF ready',
    type: 'deal.claimed',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'BookingRow',
    message: 'Table for two',
    type: 'booking.confirmed',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n3',
    title: 'PointsRow',
    message: '+50 points',
    type: 'loyalty.points',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n4',
    title: 'WelcomeRow',
    message: 'Thanks for joining',
    type: 'system.welcome',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

test('each filter tab shows exactly its own category, under the hub density', async () => {
  mockLive(liveRows);

  await render(
    <TypeDensityProvider density="comfortable">
      <NotificationsCenterScreen />
    </TypeDensityProvider>,
  );
  await waitFor(() => expect(visible('DealRow')).toBe(true));

  const expectations: Array<[string, boolean, boolean, boolean, boolean]> = [
    ['Deals & Claims 1', true, false, false, false],
    ['Orders & Bookings 1', false, true, false, false],
    ['Rewards 1', false, false, true, false],
    ['System', false, false, false, true],
    ['All 3', true, true, true, true],
  ];

  for (const [tab, deal, booking, points, welcome] of expectations) {
    // eslint-disable-next-line no-await-in-loop -- presses must run sequentially
    await fireEvent.press(screen.getByText(tab));
    // eslint-disable-next-line no-await-in-loop -- assert after each press settles
    await waitFor(
      () =>
        expect({
          deal: visible('DealRow'),
          booking: visible('BookingRow'),
          points: visible('PointsRow'),
          welcome: visible('WelcomeRow'),
        }).toEqual({ deal, booking, points, welcome }),
      { timeout: 2000 },
    );
    // Pressing never replaces the screen with the error fallback.
    expect(screen.queryByText('Something went wrong')).toBeNull();
    expect(screen.toJSON()).not.toBeNull();
  }
});

test('every tab is pressable while the notification query is still loading', async () => {
  mockNotifs.mockReturnValue({
    isLoading: true,
    isError: false,
    data: undefined,
    refetch: jest.fn(),
  });

  await render(<NotificationsCenterScreen />);

  for (const tab of [
    'All 3',
    'Deals & Claims 1',
    'Orders & Bookings 1',
    'Rewards 1',
    'System',
  ]) {
    // eslint-disable-next-line no-await-in-loop -- presses must run sequentially
    await fireEvent.press(screen.getByText(tab));
    expect(screen.toJSON()).not.toBeNull();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  }
  // Close the act scope before the test ends so the next render starts clean.
  await waitFor(() => expect(screen.getByText(copy.inbox)).toBeTruthy());
});

test('every tab is pressable on an empty live account', async () => {
  mockLive([]);

  await render(<NotificationsCenterScreen />);

  for (const tab of [
    'All 3',
    'Deals & Claims 1',
    'Orders & Bookings 1',
    'Rewards 1',
    'System',
  ]) {
    // eslint-disable-next-line no-await-in-loop -- presses must run sequentially
    await fireEvent.press(screen.getByText(tab));
    expect(screen.queryByText('Something went wrong')).toBeNull();
  }
  expect(screen.getByText(copy.caughtUpTitle)).toBeTruthy();
});
