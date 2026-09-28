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

  expect(saved.getByText('Saved Items Hub')).toBeTruthy();
  expect(saved.getByText('Glow & Serenity Spa & Salon')).toBeTruthy();
  expect(dashboard.getByText('Weekend Deals Are Here')).toBeTruthy();
  expect(deals.getByText('Total Savings to Date')).toBeTruthy();
  expect(pass.getByText('Claim Verification')).toBeTruthy();
});

test('filters Saved Hub deals, businesses, and search results', async () => {
  const saved = await render(<SavedHubScreen />);

  expect(saved.getByText('Urban Grill & Bistro')).toBeTruthy();
  expect(saved.getByText('Glow & Serenity Spa & Salon')).toBeTruthy();

  await fireEvent.press(saved.getByRole('tab', { name: /^Deals/ }));
  expect(saved.queryByText('Glow & Serenity Spa & Salon')).toBeNull();
  expect(saved.getByText('Sole District Boutique')).toBeTruthy();

  await fireEvent.press(saved.getByRole('tab', { name: /^Businesses/ }));
  expect(saved.queryByText('Sole District Boutique')).toBeNull();
  expect(saved.getByText('Glow & Serenity Spa & Salon')).toBeTruthy();

  await fireEvent.press(saved.getByRole('tab', { name: /^All/ }));
  await fireEvent.changeText(
    saved.getByPlaceholderText('Search saved deals, businesses & items...'),
    'glow',
  );
  expect(saved.queryByText('Sole District Boutique')).toBeNull();
  expect(saved.getByText('Glow & Serenity Spa & Salon')).toBeTruthy();

  await fireEvent.changeText(
    saved.getByPlaceholderText('Search saved deals, businesses & items...'),
    'zzz',
  );
  expect(saved.getByText('No saved items found')).toBeTruthy();

  await fireEvent.press(saved.getByText('Reset Filters'));
  expect(saved.getByText('Urban Grill & Bistro')).toBeTruthy();
  expect(saved.getByText('Glow & Serenity Spa & Salon')).toBeTruthy();
});
