import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DealTermsConditionsScreen } from '@features/dealDetail/screens/DealTermsConditionsScreen';
import type { PublicOfferDetail } from '@api/dealsApi';
import { useLocationStore } from '@store/locationStore';
import { strings } from '@constants/strings';

/**
 * The terms page describes the deal it was opened for.
 *
 * It used to read `dealsGrid.find(id) ?? [0]` and render every slot from
 * static copy — a live offer showed "Urban Grill & Bistro", "₦9,600" and
 * "20 Sep 2025" regardless of what it actually was. Identity, validity, the
 * redeemable window and the merchant's own terms now come from the offer and
 * its profile; platform-fair-use sections stay static on purpose.
 */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

let mockGetOfferDetails = jest.fn();
const mockGetBusinessByCode = jest.fn();

jest.mock('@api/dealsApi', () => ({
  dealsApi: {
    getPublicOfferDetails: (...args: unknown[]) => mockGetOfferDetails(...args),
    setReaction: jest.fn(),
    toggleSave: jest.fn(),
    getEngagement: jest.fn(),
  },
}));

jest.mock('@api/publicBusinessApi', () => ({
  publicBusinessApi: {
    getByCode: (...args: unknown[]) => mockGetBusinessByCode(...args),
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

/** Every weekday, around the clock, so the window holds at any run time. */
const alwaysOpen = Object.fromEntries(
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
    day => [day, { from: '00:00', to: '23:59', isClosed: false }],
  ),
);

const clients: QueryClient[] = [];

async function renderScreen(dealId: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <DealTermsConditionsScreen
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
  mockGetBusinessByCode.mockResolvedValue({
    uniqueCode: 'QFN2OX8BJ',
    name: 'Test store',
  });
});

afterEach(() => clients.forEach(client => client.clear()));

describe('DealTermsConditionsScreen', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the terms and expands the FAQ', async () => {
    const screen = await renderScreen('urban-grill-lunch');

    expect(screen.getByText('Deal Terms & Conditions')).toBeTruthy();
    expect(screen.getByText('Redemption Rules')).toBeTruthy();
    expect(
      screen.queryByText(
        'Yes! Unredeemed claims can be released penalty-free up to 30 minutes before the end of the daily lunch window so other members can enjoy them.',
      ),
    ).toBeNull();

    await fireEvent.press(screen.getByLabelText('Can I cancel if my plans change?'));

    expect(
      screen.getByText(
        'Yes! Unredeemed claims can be released penalty-free up to 30 minutes before the end of the daily lunch window so other members can enjoy them.',
      ),
    ).toBeTruthy();
  });

  it('opens the How to Claim screen', async () => {
    const screen = await renderScreen('urban-grill-lunch');

    await fireEvent.press(screen.getByLabelText('Claim Deal'));

    expect(mockNavigate).toHaveBeenCalledWith('HowToClaim', {
      dealId: 'urban-grill-lunch',
    });
  });

  it('shows the live offer’s own identity, never the demo merchant', async () => {
    const screen = await renderScreen(LIVE_ID);

    await waitFor(() => expect(screen.getByText(DETAIL.name)).toBeTruthy());
    expect(screen.getByText('Test store • Abuja')).toBeTruthy();
    expect(screen.queryByText(strings.dealTerms.merchant)).toBeNull();
    expect(screen.queryByText('Lunch Combo — 20% Off')).toBeNull();
    // Verified merchant → the pill stays.
    expect(screen.getByText(strings.dealTerms.vetted)).toBeTruthy();
  });

  it('hides the vetted pill when the API reports an unverified merchant', async () => {
    mockGetOfferDetails.mockResolvedValue({
      ...DETAIL,
      business: { ...DETAIL.business!, isVerified: false },
    });

    const screen = await renderScreen(LIVE_ID);

    await waitFor(() => expect(screen.getByText(DETAIL.name)).toBeTruthy());
    expect(screen.queryByText(strings.dealTerms.vetted)).toBeNull();
  });

  it('words the validity from the offer’s real end date', async () => {
    const screen = await renderScreen(LIVE_ID);

    await waitFor(() => expect(screen.getByText('14 Feb 2027')).toBeTruthy());
    // The demo date belongs to the bundled deals only.
    expect(screen.queryByText(strings.dealTerms.validityDate)).toBeNull();
  });

  it('renders the merchant’s own terms as an offer-terms section', async () => {
    mockGetOfferDetails.mockResolvedValue({
      ...DETAIL,
      terms: ['Valid for dine-in only.', 'Not combinable with other offers.'],
    });

    const screen = await renderScreen(LIVE_ID);

    await waitFor(() =>
      expect(screen.getByText(strings.dealTerms.merchantTermsTitle)).toBeTruthy(),
    );
    expect(screen.getByText('Valid for dine-in only.')).toBeTruthy();
    expect(screen.getByText('Not combinable with other offers.')).toBeTruthy();
  });

  it('keeps no offer-terms section when the offer has none', async () => {
    const screen = await renderScreen(LIVE_ID);

    await waitFor(() => expect(screen.getByText(DETAIL.name)).toBeTruthy());
    expect(screen.queryByText(strings.dealTerms.merchantTermsTitle)).toBeNull();
  });

  it('derives the redeemable window from the profile’s hours', async () => {
    mockGetBusinessByCode.mockResolvedValue({
      uniqueCode: 'QFN2OX8BJ',
      name: 'Test store',
      openingHours: alwaysOpen,
    });

    const screen = await renderScreen(LIVE_ID);

    // The window node only renders inside the live-hours branch.
    await waitFor(() => expect(screen.getByText('12:00 AM – 11:59 PM')).toBeTruthy());
    // The scripted lunch window never appears for a real offer.
    expect(screen.queryByText(strings.dealTerms.redeemableWindow)).toBeNull();
  });

  it('falls back to neutral hours copy instead of inventing a window', async () => {
    const screen = await renderScreen(LIVE_ID);

    await waitFor(() => expect(screen.getByText(DETAIL.name)).toBeTruthy());
    await waitFor(() =>
      expect(screen.getByText(strings.dealTerms.hoursFallback)).toBeTruthy(),
    );
    expect(screen.queryByText(strings.dealTerms.redeemableWindow)).toBeNull();
  });

  it('says the terms are unavailable instead of showing another deal', async () => {
    mockGetOfferDetails = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error('Not found'), { status: 404 }));

    const screen = await renderScreen(LIVE_ID);

    await waitFor(() => expect(screen.getByText(strings.errors.notFound)).toBeTruthy());
    expect(screen.queryByText('Redemption Rules')).toBeNull();
    expect(mockGetBusinessByCode).not.toHaveBeenCalled();
  });
});
