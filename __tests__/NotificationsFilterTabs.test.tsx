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

  // Counts are read off the rows in hand, so they total 4 here — the old
  // fixture asserted a hardcoded 'All 3' from a stored string.
  const expectations: Array<[string, boolean, boolean, boolean, boolean]> = [
    ['Deals & Claims 1', true, false, false, false],
    ['Orders & Bookings 1', false, true, false, false],
    ['Rewards 1', false, false, true, false],
    ['System 1', false, false, false, true],
    ['All 4', true, true, true, true],
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

  for (const tab of ['All', 'Deals & Claims', 'Rewards']) {
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

  for (const tab of ['All', 'Deals & Claims', 'Rewards']) {
    // eslint-disable-next-line no-await-in-loop -- presses must run sequentially
    await fireEvent.press(screen.getByText(tab));
    expect(screen.queryByText('Something went wrong')).toBeNull();
  }
  expect(screen.getByText(copy.caughtUpTitle)).toBeTruthy();
});

test('the chip counts follow the rows instead of a stored string', async () => {
  // Two deals and no rewards: the tabs must say so. This is the guard against
  // counts going back to being written down in strings.ts.
  mockLive([
    liveRows[0],
    { ...liveRows[0], id: 'n5', title: 'SecondDeal' },
    liveRows[1],
    liveRows[3],
  ]);

  await render(
    <TypeDensityProvider density="comfortable">
      <NotificationsCenterScreen />
    </TypeDensityProvider>,
  );
  await waitFor(() => expect(visible('DealRow')).toBe(true));

  expect(screen.getByText('Deals & Claims 2')).toBeTruthy();
  expect(screen.getByText('Orders & Bookings 1')).toBeTruthy();
  // Empty tabs carry no number at all rather than a zero.
  expect(screen.getByText('Rewards')).toBeTruthy();
  expect(screen.getByText('All 4')).toBeTruthy();
});

test('no mock notification is rendered while the query is still loading', async () => {
  mockNotifs.mockReturnValue({
    isLoading: true,
    isError: false,
    data: undefined,
    refetch: jest.fn(),
  });

  await render(<NotificationsCenterScreen />);

  // The old screen fell back to five hardcoded rows here, so a loading account
  // showed a full inbox of fiction.
  for (const fiction of [
    'Deal Expiring Soon! ⏳',
    'Appointment Confirmed',
    'Samuel sent you a Gift! 🎁',
    '+150 VEM Points Earned 🎉',
    'New Weekend Flash Deals in Apo',
    'Urban Grill Apo',
  ]) {
    expect(screen.queryByText(fiction)).toBeNull();
  }
});

test('no mock notification survives on a real account with rows', async () => {
  mockLive(liveRows);

  await render(
    <TypeDensityProvider density="comfortable">
      <NotificationsCenterScreen />
    </TypeDensityProvider>,
  );
  await waitFor(() => expect(visible('DealRow')).toBe(true));

  for (const fiction of [
    'Deal Expiring Soon! ⏳',
    'Appointment Confirmed',
    'Samuel sent you a Gift! 🎁',
    '+150 VEM Points Earned 🎉',
    'New Weekend Flash Deals in Apo',
  ]) {
    expect(screen.queryByText(fiction)).toBeNull();
  }
});

test('a failed query offers a retry instead of an invented inbox', async () => {
  const refetch = jest.fn();
  mockNotifs.mockReturnValue({
    isLoading: false,
    isError: true,
    data: undefined,
    refetch,
  });

  await render(<NotificationsCenterScreen />);

  expect(screen.queryByText('Deal Expiring Soon! ⏳')).toBeNull();
  await fireEvent.press(screen.getByText('Retry'));
  expect(refetch).toHaveBeenCalledTimes(1);
});

test('rows are split by the day they landed, not by whether they are unread', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);

  mockLive([
    // Unread, but from two days ago: it belongs under Earlier, not Today.
    { ...liveRows[0], id: 'old', createdAt: yesterday.toISOString() },
    liveRows[1],
  ]);

  await render(
    <TypeDensityProvider density="comfortable">
      <NotificationsCenterScreen />
    </TypeDensityProvider>,
  );
  await waitFor(() => expect(visible('DealRow')).toBe(true));

  expect(screen.getByText('Today')).toBeTruthy();
  expect(screen.getByText('Earlier This Week')).toBeTruthy();
  // Section sizes are counted from the rows, not written down. Each section
  // holds one row here, so the singular label appears once per section.
  expect(screen.getAllByText('1 update')).toHaveLength(2);
});
