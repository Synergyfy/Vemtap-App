import React from 'react';
import { render } from '@testing-library/react-native';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { ClaimedDealDetailPassScreen } from '@features/claimedDeal/screens/ClaimedDealDetailPassScreen';
import { MyDealsHubScreen } from '@features/myDeals/screens/MyDealsHubScreen';

test('renders all four standalone hub and pass screens', async () => {
  const onOpenDeal = jest.fn();
  const onNavigate = jest.fn();
  const saved = await render(
    <SavedHubScreen onOpenDeal={onOpenDeal} onNavigate={onNavigate} />,
  );
  const dashboard = await render(
    <CustomerDashboardScreen onOpenDeal={onOpenDeal} onNavigate={onNavigate} />,
  );
  const deals = await render(
    <MyDealsHubScreen onOpenDeal={onOpenDeal} onNavigate={onNavigate} />,
  );
  const pass = await render(
    <ClaimedDealDetailPassScreen onUseDeal={onOpenDeal} onOpenChat={onOpenDeal} />,
  );

  expect(saved.getByText('Saved Items')).toBeTruthy();
  expect(dashboard.getByText('Weekend Deals Are Here')).toBeTruthy();
  expect(deals.getByText('Total Savings to Date')).toBeTruthy();
  expect(pass.getByText('Claim Verification')).toBeTruthy();
});
