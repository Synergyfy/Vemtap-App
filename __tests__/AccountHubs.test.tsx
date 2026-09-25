import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { ClaimedDealDetailPassScreen } from '@features/claimedDeal/screens/ClaimedDealDetailPassScreen';
import { MyDealsHubScreen } from '@features/myDeals/screens/MyDealsHubScreen';

test('renders all four standalone hub and pass screens', async () => {
  const onOpenDeal = jest.fn();
  const saved = await render(<SavedHubScreen onOpenDeal={onOpenDeal} />);
  const dashboard = await render(<CustomerDashboardScreen onOpenDeal={onOpenDeal} />);
  const deals = await render(<MyDealsHubScreen onOpenDeal={onOpenDeal} />);
  const pass = await render(
    <ClaimedDealDetailPassScreen onUseDeal={onOpenDeal} onOpenChat={onOpenDeal} />,
  );

  expect(saved.getByText('Saved Items')).toBeTruthy();
  expect(saved.getByText('Saved Local Businesses (5)')).toBeTruthy();
  expect(dashboard.getByText('Weekend Deals Are Here')).toBeTruthy();
  expect(deals.getByText('Total Savings to Date')).toBeTruthy();
  expect(pass.getByText('Claim Verification')).toBeTruthy();
});

test('filters Saved Hub deals, businesses, and search results', async () => {
  const saved = await render(<SavedHubScreen />);

  expect(saved.getByText('THE SKY LOUNGE & GRILL')).toBeTruthy();
  expect(saved.getByText('Glow & Serenity Spa')).toBeTruthy();

  await fireEvent.press(saved.getByRole('tab', { name: 'Deals (7)' }));
  expect(saved.queryByText('Saved Local Businesses (5)')).toBeNull();
  expect(saved.getByText('THE SKY LOUNGE & GRILL')).toBeTruthy();

  await fireEvent.press(saved.getByRole('tab', { name: 'Businesses (5)' }));
  expect(saved.queryByText('Saved Deals')).toBeNull();
  expect(saved.getByText('Glow & Serenity Spa')).toBeTruthy();

  await fireEvent.press(saved.getByRole('tab', { name: 'All (12)' }));
  await fireEvent.changeText(
    saved.getByPlaceholderText('Search saved vouchers, cafes, salons...'),
    'glow',
  );
  expect(saved.queryByText('THE SKY LOUNGE & GRILL')).toBeNull();
  expect(saved.getByText('Glow & Serenity Spa')).toBeTruthy();

  await fireEvent.changeText(
    saved.getByPlaceholderText('Search saved vouchers, cafes, salons...'),
    'zzz',
  );
  expect(saved.getByText('No saved deals found')).toBeTruthy();
  expect(saved.getByText('No saved businesses found')).toBeTruthy();

  await fireEvent.press(saved.getAllByText('Clear search')[0]);
  expect(saved.getByText('THE SKY LOUNGE & GRILL')).toBeTruthy();
  expect(saved.getByText('Glow & Serenity Spa')).toBeTruthy();
});
