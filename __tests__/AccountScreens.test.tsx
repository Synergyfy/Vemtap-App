import React from 'react';
import { render } from '@testing-library/react-native';
import {
  BookingDetailScreen,
  EditProfileScreen,
  MoreHubScreen,
  MyActivityScreen,
  RewardsScreen,
  SavingsHistoryScreen,
} from '@features/accountHub/screens';

test('renders all six standalone account screens', async () => {
  const more = await render(<MoreHubScreen />);
  const profile = await render(<EditProfileScreen />);
  const rewards = await render(<RewardsScreen />);
  const savings = await render(<SavingsHistoryScreen />);
  const activity = await render(<MyActivityScreen />);
  const booking = await render(<BookingDetailScreen />);

  expect(more.getByText('More')).toBeTruthy();
  expect(profile.getByText('Edit Profile')).toBeTruthy();
  expect(rewards.getByText('Rewards & Loyalty')).toBeTruthy();
  expect(savings.getByText('Savings History & Ledger')).toBeTruthy();
  expect(activity.getByText('User Activity')).toBeTruthy();
  expect(booking.getByText('Booking Detail')).toBeTruthy();
});
