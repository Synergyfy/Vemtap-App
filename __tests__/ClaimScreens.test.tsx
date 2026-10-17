import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dealsApi, type PublicOfferDetail } from '@api/dealsApi';
import { strings } from '@constants/strings';
import { DealClaimedSuccessScreen } from '@features/claimedDeal/screens/DealClaimedSuccessScreen';
import { GiftDealSentSuccessScreen } from '@features/giftDeal/screens/GiftDealSentSuccessScreen';
import { claimPassParams } from '@navigation/claimPassLink';

const OFFER_ID = 'aa90831c-4837-4fdd-bbc4-4445ba041284';

const OFFER = {
  id: OFFER_ID,
  name: 'Lunch for Two',
  status: 'active',
  galleryImages: [],
  calculatedPrice: '8000.00',
  originalPrice: 10000,
  discountPercent: 20,
  mainImage: 'https://example.test/lunch.jpg',
  endDate: '2027-02-14T00:00:00.000Z',
  items: [],
  terms: [],
  business: { id: 'b1', name: 'Aurora Grill', uniqueCode: 'QFN2OX8BJ', city: 'Abuja' },
} as unknown as PublicOfferDetail;

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  canGoBack: jest.fn(() => true),
};

function withClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(dealsApi, 'getPublicOfferDetails').mockResolvedValue(OFFER);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('claim success shows the claimed offer and the issued code, then opens the pass', async () => {
  const screen = await withClient(
    <DealClaimedSuccessScreen
      navigation={navigation as never}
      route={
        {
          key: 'c',
          name: 'DealClaimedSuccess',
          params: { dealId: OFFER_ID, claimCode: 'VEM1-LUNCH-7F2A' },
        } as never
      }
    />,
  );

  expect(screen.getByText(strings.claimSuccess.title)).toBeTruthy();
  expect(screen.getByText('VEM1-LUNCH-7F2A')).toBeTruthy();
  await waitFor(() => expect(screen.getByText('Lunch for Two')).toBeTruthy());
  expect(screen.getAllByText('Aurora Grill').length).toBeGreaterThan(0);
  expect(screen.queryByText('20 Sep 2025')).toBeNull();

  await act(async () => {
    fireEvent.press(screen.getByText(strings.claimSuccess.viewMyDeal));
  });
  expect(navigation.navigate).toHaveBeenCalledWith('Tabs', claimPassParams(OFFER_ID));
});

test('gift sent shows the real offer and no invented claim code', async () => {
  const screen = await withClient(
    <GiftDealSentSuccessScreen
      navigation={navigation as never}
      route={
        {
          key: 'g',
          name: 'GiftDealSentSuccess',
          params: {
            dealId: OFFER_ID,
            recipient: {
              firstName: 'Amara',
              lastName: 'Okafor',
              email: 'amara@email.com',
              phone: '8012345678',
            },
          },
        } as never
      }
    />,
  );

  expect(screen.getByText(strings.giftSuccess.title)).toBeTruthy();
  expect(screen.getByText('Amara Okafor')).toBeTruthy();
  await waitFor(() => expect(screen.getByText('Lunch for Two')).toBeTruthy());
  expect(screen.queryByText('#VT-GIFT-83921')).toBeNull();
});
