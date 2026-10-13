import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { ClaimedDealDetailPassScreen } from '@features/claimedDeal/screens/ClaimedDealDetailPassScreen';
import { MyDealsHubScreen } from '@features/myDeals/screens/MyDealsHubScreen';
import { claimFixture, savedHubFixtures } from './helpers/mockCustomerHub';

jest.mock('@features/accountHub/hooks/useSavedHub', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockSavedHubModule(),
);

jest.mock('@features/myDeals/hooks/useMyClaims', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockMyClaimsModule(),
);

const { useSavedFeed } = jest.requireMock('@features/accountHub/hooks/useSavedHub');
const { useMyClaims, useActiveClaimsCount } = jest.requireMock(
  '@features/myDeals/hooks/useMyClaims',
);

const allRows = [
  savedHubFixtures.deal,
  savedHubFixtures.business,
  savedHubFixtures.service,
];

beforeEach(() => {
  (useSavedFeed as jest.Mock).mockImplementation((type?: string) => {
    const rows = type ? allRows.filter(row => row.type === type) : allRows;
    return {
      data: { data: rows, total: rows.length, page: 1, limit: 50 },
      isLoading: false,
      isSuccess: true,
      isError: false,
      refetch: jest.fn(),
    };
  });
  (useActiveClaimsCount as jest.Mock).mockReturnValue({
    data: 1,
    isSuccess: true,
    isError: false,
  });
  (useMyClaims as jest.Mock).mockImplementation((status?: string) => {
    const data = status === 'ACTIVE' ? [claimFixture] : [];
    return {
      data: { data, total: data.length, page: 1, limit: 50 },
      isLoading: false,
      isSuccess: true,
      isError: false,
      refetch: jest.fn(),
    };
  });
});

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

test('renders all four standalone hub and pass screens', async () => {
  const onOpenClaim = jest.fn();
  const saved = await renderWithClient(<SavedHubScreen onOpenDeal={onOpenClaim} />);
  const dashboard = await renderWithClient(
    <CustomerDashboardScreen onOpenDeal={onOpenClaim} />,
  );
  const deals = await renderWithClient(<MyDealsHubScreen onOpenClaim={onOpenClaim} />);
  const pass = await renderWithClient(
    <ClaimedDealDetailPassScreen
      claim={claimFixture}
      onUseDeal={onOpenClaim}
      onOpenChat={onOpenClaim}
    />,
  );

  expect(saved.getByText('Saved Items Hub')).toBeTruthy();
  expect(saved.getAllByText('Glow & Serenity Spa & Salon').length).toBeGreaterThan(0);
  expect(dashboard.getByText('Weekend Deals Are Here')).toBeTruthy();
  expect(deals.getByText('Total Savings to Date')).toBeTruthy();
  expect(pass.getByText('Claim Verification')).toBeTruthy();
});

test('pass renders the live claim code and offer for a real claim', async () => {
  const pass = await renderWithClient(
    <ClaimedDealDetailPassScreen claim={claimFixture} />,
  );

  expect(pass.getByText(claimFixture.claimCode)).toBeTruthy();
  expect(pass.getByText('Patrick Ventures')).toBeTruthy();
  expect(pass.getByText('Apo Lunch Combo')).toBeTruthy();
});

test('filters Saved Hub deals, businesses, and search results', async () => {
  const saved = await renderWithClient(<SavedHubScreen />);

  expect(saved.getByText('Sole District Boutique')).toBeTruthy();
  expect(saved.getAllByText('Glow & Serenity Spa & Salon').length).toBeGreaterThan(0);

  await fireEvent.press(saved.getByRole('tab', { name: /^Deals/ }));
  expect(useSavedFeed).toHaveBeenLastCalledWith('DEAL');
  expect(saved.queryByText('Glow & Serenity Spa & Salon')).toBeNull();
  expect(saved.getByText('Sole District Boutique')).toBeTruthy();

  await fireEvent.press(saved.getByRole('tab', { name: /^Businesses/ }));
  expect(useSavedFeed).toHaveBeenLastCalledWith('BUSINESS');
  expect(saved.queryByText('Sole District Boutique')).toBeNull();
  expect(saved.getByText('Glow & Serenity Spa & Salon')).toBeTruthy();

  await fireEvent.press(saved.getByRole('tab', { name: /^All/ }));
  await fireEvent.changeText(
    saved.getByPlaceholderText('Search saved deals, businesses & items...'),
    'glow',
  );
  expect(saved.queryByText('Sole District Boutique')).toBeNull();
  expect(saved.getAllByText('Glow & Serenity Spa & Salon').length).toBeGreaterThan(0);

  await fireEvent.changeText(
    saved.getByPlaceholderText('Search saved deals, businesses & items...'),
    'zzz',
  );
  expect(saved.getByText('No matching saved items')).toBeTruthy();

  await fireEvent.press(saved.getByText('Reset Filters'));
  expect(saved.getByText('Sole District Boutique')).toBeTruthy();
  expect(saved.getAllByText('Glow & Serenity Spa & Salon').length).toBeGreaterThan(0);
});
