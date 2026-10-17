import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { MyActivityScreen } from '@features/accountHub/screens/MyActivityScreen';
import { RewardsScreen } from '@features/accountHub/screens/RewardsScreen';
import { AccountSettingsSecurityScreen } from '@features/accountHub/screens/AccountSettingsSecurityScreen';
import { loyaltyLogSchema } from '@api/loyaltyApi';

const ok = <T,>(data: T) => ({
  data,
  isLoading: false,
  isError: false,
  isSuccess: true,
  refetch: jest.fn(),
});

const mockActivity = jest.fn();
jest.mock('@features/accountHub/hooks/useActivity', () => ({
  useActivity: (...args: unknown[]) => mockActivity(...args),
  useActivitySummary: () => ({
    data: {
      claimed: 2,
      redeemed: 1,
      orders: 1,
      bookings: 0,
      visits: 3,
      reviews: 1,
      businesses: 2,
    },
    isLoading: false,
    isError: false,
  }),
}));

const mockRedeem = jest.fn();
jest.mock('@features/accountHub/hooks/useLoyalty', () => {
  const hub = jest.requireActual('./helpers/mockCustomerHub');
  const base = hub.mockLoyaltyModule({ balance: 300, rewards: [hub.rewardFixture] });
  return {
    ...base,
    useRedeemReward: () => ({
      mutate: mockRedeem,
      isPending: false,
      variables: undefined,
    }),
    useMyRedemptions: () => ({
      data: [
        {
          code: 'RWD-ABC123',
          rewardName: 'Free coffee',
          businessName: 'Aurora Grill',
          branchName: 'Wuse II',
          redeemedAt: '2026-10-10T10:00:00.000Z',
          expiresAt: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }),
  };
});

const mockRevoke = jest.fn();
jest.mock('@features/accountHub/hooks/useLinkedDevices', () => ({
  useLinkedDevices: () => ({
    data: [
      {
        id: 's1',
        deviceName: 'Pixel 8',
        platform: 'android',
        isCurrent: true,
        revokedAt: null,
      },
      {
        id: 's2',
        deviceName: 'iPad',
        platform: 'ios',
        isCurrent: false,
        revokedAt: null,
      },
      {
        id: 's3',
        deviceName: 'Old phone',
        platform: 'ios',
        isCurrent: false,
        revokedAt: '2026-01-01',
      },
    ],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useRevokeLinkedDevice: () => ({ mutate: mockRevoke }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockActivity.mockReturnValue(
    ok({
      data: [
        {
          kind: 'claim',
          id: 'c1',
          at: '2026-10-12T09:00:00.000Z',
          refId: 'offer-1',
          businessName: 'Aurora Grill',
          title: 'Lunch for Two',
          status: 'redeemed',
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    }),
  );
});

test('activity shows the period counts and live rows, and a claim opens its pass', async () => {
  const onOpenClaim = jest.fn();
  const screen = await render(<MyActivityScreen onOpenClaim={onOpenClaim} />);

  expect(screen.getByText('2')).toBeTruthy();
  expect(screen.getByText('3')).toBeTruthy();
  expect(screen.getByText('Aurora Grill')).toBeTruthy();
  expect(screen.queryByText(/Urban Grill|Glow/)).toBeNull();

  await act(async () => {
    fireEvent.press(screen.getByText(strings.accountScreens.activity.viewPass));
  });
  expect(onOpenClaim).toHaveBeenCalledWith('offer-1');
});

test('activity tabs query the matching kind', async () => {
  const screen = await render(<MyActivityScreen />);
  const reviews = strings.accountScreens.activity.tabs.find(tab => tab.key === 'reviews');

  await act(async () => {
    fireEvent.press(screen.getByLabelText(reviews!.label));
  });
  expect(mockActivity).toHaveBeenLastCalledWith('reviews', expect.anything());
});

test('rewards says how many more points a reward needs at its business', async () => {
  const screen = await render(<RewardsScreen />);
  const copy = strings.accountScreens.rewards;

  expect(screen.getByText('300')).toBeTruthy();
  expect(screen.getByText('Free dessert')).toBeTruthy();
  expect(screen.getByText(copy.needMore('200'))).toBeTruthy();
});

test('redeemed rewards list the issued code', async () => {
  const screen = await render(<RewardsScreen />);

  await act(async () => {
    fireEvent.press(screen.getByLabelText(strings.accountScreens.rewards.tabs[1]));
  });
  expect(screen.getByText('RWD-ABC123')).toBeTruthy();
  expect(screen.getByText('Free coffee')).toBeTruthy();
});

test('the loyalty log normalises signed backend amounts', () => {
  const row = loyaltyLogSchema.parse({
    id: 'l1',
    type: 'redeemed',
    amount: -150,
    reason: 'Reward',
    createdAt: '2026-10-01T00:00:00.000Z',
  });
  expect(row.type).toBe('spent');
  expect(row.points).toBe(150);
});

test('security lists live sessions and signs another device out', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  const copy = strings.accountSettingsSecurity;
  const screen = await render(<AccountSettingsSecurityScreen />);

  expect(screen.getByText('Pixel 8')).toBeTruthy();
  expect(screen.getByText(copy.activeNow)).toBeTruthy();
  expect(screen.queryByText('Old phone')).toBeNull();
  expect(screen.queryByText(/iPhone 15 Pro|Oct 4, 2024/)).toBeNull();

  await act(async () => {
    fireEvent.press(screen.getByLabelText(`${copy.signOutDevice} iPad`));
  });
  const buttons = alert.mock.calls[0][2] as { text: string; onPress?: () => void }[];
  await act(async () => {
    buttons.find(button => button.text === copy.signOutDevice)?.onPress?.();
  });
  expect(mockRevoke).toHaveBeenCalledWith('s2', expect.anything());
});
