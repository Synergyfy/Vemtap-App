import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HowToClaimScreen } from '@features/howToClaim/screens/HowToClaimScreen';
import type { PublicOfferDetail } from '@api/dealsApi';
import { useLocationStore } from '@store/locationStore';
import { strings } from '@constants/strings';

/**
 * The claim walkthrough resolves the deal it describes.
 *
 * The regressions locked in: the screen read `dealsGrid.find(id) ?? [0]`, so
 * any real offer rendered some *other* deal's merchant, address and distance;
 * and its button jumped straight to the success screen without a single API
 * call. Steps stay platform copy — every slot that names the deal now comes
 * from the deal itself.
 */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

let mockGetOfferDetails = jest.fn();

jest.mock('@api/dealsApi', () => ({
  dealsApi: {
    getPublicOfferDetails: (...args: unknown[]) => mockGetOfferDetails(...args),
    setReaction: jest.fn(),
    toggleSave: jest.fn(),
    getEngagement: jest.fn(),
  },
}));

const LIVE_ID = 'aa90831c-4837-4fdd-bbc4-4445ba041284';

const DETAIL: PublicOfferDetail = {
  id: LIVE_ID,
  name: 'Soft Drinks Special Offer',
  description: 'Pepsi and friends',
  status: 'active',
  galleryImages: [],
  pricingType: 'fixed_discount_amount',
  calculatedPrice: '200.00',
  dealPrice: '200.00',
  originalPrice: 1000,
  discountValue: '800.00',
  fixedPrice: null,
  discountPercent: 80,
  mainImage: 'https://example.test/drinks.jpg',
  endDate: '2027-02-14T00:00:00.000Z',
  isExpired: false,
  isFeatured: false,
  isTrending: false,
  items: [],
  terms: [],
  claimedCount: 0,
  maxClaims: 100,
  maxClaimsPerCustomer: 1,
  likesCount: 4,
  dislikesCount: 0,
  reviewsCount: 2,
  averageRating: null,
  views: 0,
  visits: 0,
  businessId: 'business-1',
  branchId: null,
  business: {
    id: 'business-1',
    name: 'Test store',
    slug: '8GUF52339',
    uniqueCode: 'QFN2OX8BJ',
    address: 'Dei-dei, Abuja',
    city: 'Abuja',
    state: 'FCT',
    latitude: 9.0567,
    longitude: 7.4969,
    phone: '08165155312',
    isVerified: true,
  },
};

const clients: QueryClient[] = [];

async function renderScreen(dealId: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <HowToClaimScreen
        route={{ params: { dealId } } as never}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useLocationStore.setState({ area: 'Apo', coords: null, radiusKm: 5 });
  mockGetOfferDetails = jest.fn().mockResolvedValue(DETAIL);
});

afterEach(() => clients.forEach(client => client.clear()));

describe('HowToClaimScreen', () => {
  test('renders the three claim steps for a live offer', async () => {
    const screen = await renderScreen(LIVE_ID);

    await waitFor(() =>
      expect(screen.getByText('Claim your deal in 3 simple steps')).toBeTruthy(),
    );
    expect(screen.getByText('Claim the Deal')).toBeTruthy();
    expect(screen.getByText('Visit the Business')).toBeTruthy();
    expect(screen.getByText('Show Your Claim')).toBeTruthy();
    expect(screen.getByText('How to Claim')).toBeTruthy();
  });

  test('an old demo id is not found, with no request', async () => {
    const screen = await renderScreen('urban-grill-lunch');

    expect(screen.getByText(strings.errors.notFound)).toBeTruthy();
    expect(mockGetOfferDetails).not.toHaveBeenCalled();
  });

  test('names the deal it belongs to — merchant, address, distance, expiry', async () => {
    const screen = await renderScreen(LIVE_ID);

    await waitFor(() =>
      expect(
        screen.getByText(
          strings.howToClaim.stepTwoBody('Test store', 'Abuja', '14 Feb 2027'),
        ),
      ).toBeTruthy(),
    );
    expect(screen.getByText('Dei-dei, Abuja')).toBeTruthy();
    expect(screen.queryByText('Plot 412, Apo Resettlement')).toBeNull();
  });

  test('the claim button returns a real offer to its deal instead of faking success', async () => {
    const screen = await renderScreen(LIVE_ID);
    await waitFor(() => expect(screen.getByText('Claim Deal')).toBeTruthy());

    await fireEvent.press(screen.getByText('Claim Deal'));

    expect(mockNavigate).toHaveBeenCalledWith('DealDetail', { dealId: LIVE_ID });
    expect(mockNavigate).not.toHaveBeenCalledWith(
      'DealClaimedSuccess',
      expect.anything(),
    );
  });

  test('an unknown deal says so instead of showing another deal', async () => {
    mockGetOfferDetails = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error('Not found'), { status: 404 }));

    const screen = await renderScreen(LIVE_ID);

    await waitFor(() => expect(screen.getByText(strings.errors.notFound)).toBeTruthy());
    expect(screen.queryByText('Claim your deal in 3 simple steps')).toBeNull();
    expect(screen.queryByText(strings.howToClaim.stepOneBody)).toBeNull();
  });
});
