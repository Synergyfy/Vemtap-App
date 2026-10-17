import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DealDetailScreen } from '@features/dealDetail/screens/DealDetailScreen';
import { useDealDetail } from '@features/dealDetail/hooks/useDealDetail';
import type { PublicOfferDetail } from '@api/dealsApi';
import { useLocationStore } from '@store/locationStore';
import { userSchema } from '@api/authApi';
import { useAuthStore } from '@store/authStore';
import { strings } from '@constants/strings';

/**
 * Resolving a deal id to the page's content.
 *
 * Every deal id is a real offer uuid now that the bundled demo deals are gone.
 * A miss (or an old demo id) must surface as "not found", never as some other
 * deal's price and picture.
 */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: mockParams }),
}));

/** Captures every region the screen passes to the (renderless) map. */
const mockMapRegions: Array<Record<string, number>> = [];

jest.mock('@components/shared/LocationMapView', () => ({
  LocationMapView: (props: { region: Record<string, number> }) => {
    mockMapRegions.push(props.region);
    return null;
  },
}));

let mockParams: { dealId: string };

const mockGetOfferDetails = jest.fn();
const mockGetBusinessByCode = jest.fn();

jest.mock('@api/dealsApi', () => ({
  dealsApi: {
    getPublicOfferDetails: (...args: unknown[]) => mockGetOfferDetails(...args),
    setReaction: jest.fn(),
    toggleSave: jest.fn(),
    getEngagement: jest.fn(async () => ({
      likesCount: 0,
      dislikesCount: 0,
      reviewsCount: 0,
      averageRating: null,
    })),
  },
}));

jest.mock('@api/publicBusinessApi', () => ({
  publicBusinessApi: {
    getByCode: (...args: unknown[]) => mockGetBusinessByCode(...args),
  },
}));

const LIVE_ID = 'aa90831c-4837-4fdd-bbc4-4445ba041284';
const BUSINESS_CODE = 'QFN2OX8BJ';

const DETAIL: PublicOfferDetail = {
  id: LIVE_ID,
  name: 'Soft Drinks Special Offer',
  description: 'Pepsi and friends',
  longDescription: 'A long description about fizzy drinks.',
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
    uniqueCode: BUSINESS_CODE,
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

function Probe({ dealId }: { dealId: string }) {
  const state = useDealDetail(dealId);
  return (
    <>
      <Text testID="resolved">
        {state.status === 'resolved' ? state.deal.title : state.status}
      </Text>
      <Text testID="businessCode">
        {state.status === 'resolved' ? (state.deal.businessCode ?? '') : ''}
      </Text>
    </>
  );
}

async function renderProbe(dealId: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  const view = await render(
    <QueryClientProvider client={client}>
      <Probe dealId={dealId} />
    </QueryClientProvider>,
  );
  return { ...view, client };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { dealId: LIVE_ID };
  useLocationStore.setState({
    area: 'Apo',
    coords: null,
    radiusKm: 5,
  });
  mockGetOfferDetails.mockResolvedValue(DETAIL);
  mockGetBusinessByCode.mockResolvedValue({
    uniqueCode: BUSINESS_CODE,
    name: 'Test store',
  });
});

afterEach(() => clients.forEach(client => client.clear()));

async function renderScreen(dealId: string) {
  mockParams = { dealId };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <DealDetailScreen
        route={{ params: { dealId } } as never}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack } as never}
      />
    </QueryClientProvider>,
  );
}

describe('useDealDetail', () => {
  test('treats an old demo id as not found without asking the server', async () => {
    const view = await renderProbe('urban-grill-lunch');

    expect(view.getByTestId('resolved').props.children).toBe('notFound');
    // A non-uuid id is a 400 on the server, so asking would be a bug.
    expect(mockGetOfferDetails).not.toHaveBeenCalled();
  });

  test('fetches a real offer and renders its own title', async () => {
    const view = await renderProbe(LIVE_ID);

    await waitFor(() =>
      expect(view.getByTestId('resolved').props.children).toBe(DETAIL.name),
    );
    expect(mockGetOfferDetails).toHaveBeenCalledWith(LIVE_ID);
  });

  /**
   * Regression: the details payload's `business.slug` is the *branch's* code
   * (8GUF52339), and `/public/businesses/code/:code` answers 404 for it. The
   * merchant link must use the payload's `business.uniqueCode` instead.
   */
  test('uses the business uniqueCode, never the branch slug', async () => {
    const view = await renderProbe(LIVE_ID);

    await waitFor(() =>
      expect(view.getByTestId('businessCode').props.children).toBe(BUSINESS_CODE),
    );
    expect(view.getByTestId('businessCode').props.children).not.toBe('8GUF52339');
  });

  test('hides the merchant link when the payload omits the code', async () => {
    mockGetOfferDetails.mockResolvedValue({
      ...DETAIL,
      business: { ...DETAIL.business!, uniqueCode: null },
    });

    const view = await renderProbe(LIVE_ID);

    await waitFor(() => expect(view.getByTestId('resolved')).toBeTruthy());
    expect(view.getByTestId('businessCode').props.children).toBe('');
  });

  test('reports an unknown offer as not found instead of another deal', async () => {
    const notFound = Object.assign(new Error('Not found'), { status: 404 });
    mockGetOfferDetails.mockRejectedValue(notFound);

    const view = await renderProbe(LIVE_ID);

    await waitFor(() =>
      expect(view.getByTestId('resolved').props.children).toBe('notFound'),
    );
  });
});

describe('DealDetailScreen', () => {
  test('shows the real offer, never a stand-in', async () => {
    const view = await renderScreen(LIVE_ID);

    await waitFor(() => expect(view.getByText(DETAIL.name)).toBeTruthy());
  });

  test('says the offer is unavailable instead of inventing one', async () => {
    mockGetOfferDetails.mockRejectedValue(
      Object.assign(new Error('Not found'), { status: 404 }),
    );

    const view = await renderScreen(LIVE_ID);

    await waitFor(() => expect(view.getByText(strings.errors.notFound)).toBeTruthy());
    expect(view.queryByText(DETAIL.name)).toBeNull();
  });

  test('links a real offer to its merchant by code', async () => {
    const view = await renderScreen(LIVE_ID);
    await waitFor(() => expect(view.getByText(DETAIL.name)).toBeTruthy());

    // The merchant row opens the public business profile for this code.
    view.getByLabelText(`Open business page for ${DETAIL.business!.name}`);
  });
});

/**
 * The Location & Hours card used to be a fixed demo: the same Apo map for
 * every deal and an "Open Now" badge that asserted hours nobody had fetched.
 * Both now follow the merchant's own data — and neither is invented when the
 * data is missing.
 */
describe('DealDetailScreen location and hours', () => {
  /** Every weekday, around the clock, so "open" holds at any run time. */
  const alwaysOpen = Object.fromEntries(
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
      day => [day, { from: '00:00', to: '23:59', isClosed: false }],
    ),
  );
  const alwaysClosed = Object.fromEntries(
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
      day => [day, { from: '09:00', to: '17:00', isClosed: true }],
    ),
  );

  beforeEach(() => {
    mockMapRegions.length = 0;
  });

  test('centres the map on the merchant it is actually showing', async () => {
    const view = await renderScreen(LIVE_ID);

    await waitFor(() => expect(view.getByText(DETAIL.name)).toBeTruthy());
    await waitFor(() => expect(mockMapRegions.length).toBeGreaterThan(0));

    const region = mockMapRegions[mockMapRegions.length - 1];
    expect(region.latitude).toBe(DETAIL.business!.latitude);
    expect(region.longitude).toBe(DETAIL.business!.longitude);
  });

  test('shows the address without a map when the offer has no coordinates', async () => {
    mockGetOfferDetails.mockResolvedValue({
      ...DETAIL,
      business: { ...DETAIL.business!, latitude: null, longitude: null },
    });

    const view = await renderScreen(LIVE_ID);

    await waitFor(() => expect(view.getByText(DETAIL.name)).toBeTruthy());
    expect(mockMapRegions).toHaveLength(0);
    expect(view.getAllByText(/Dei-dei, Abuja/).length).toBeGreaterThan(0);
  });

  test('shows "Open Now" when the profile hours are open', async () => {
    mockGetBusinessByCode.mockResolvedValue({
      uniqueCode: BUSINESS_CODE,
      name: 'Test store',
      openingHours: alwaysOpen,
    });

    const view = await renderScreen(LIVE_ID);

    await waitFor(() => expect(view.getByText('Open Now')).toBeTruthy());
  });

  test('shows "Closed" when the profile hours say so', async () => {
    mockGetBusinessByCode.mockResolvedValue({
      uniqueCode: BUSINESS_CODE,
      name: 'Test store',
      openingHours: alwaysClosed,
    });

    const view = await renderScreen(LIVE_ID);

    await waitFor(() => expect(view.getByText('Closed')).toBeTruthy());
    expect(view.queryByText('Open Now')).toBeNull();
  });

  test('shows no badge at all while the hours are unknown', async () => {
    const view = await renderScreen(LIVE_ID);

    await waitFor(() => expect(view.getByText(DETAIL.name)).toBeTruthy());
    // The default mock profile carries no hours — guessing either way would be
    // a claim the API never made.
    expect(view.queryByText('Open Now')).toBeNull();
    expect(view.queryByText('Closed')).toBeNull();
  });

  test('the terms row shows the merchant’s own first term when there is one', async () => {
    mockGetOfferDetails.mockResolvedValue({
      ...DETAIL,
      terms: ['Valid for dine-in only before 4 PM.'],
    });

    const view = await renderScreen(LIVE_ID);

    await waitFor(() =>
      expect(view.getByText('Valid for dine-in only before 4 PM.')).toBeTruthy(),
    );
  });

  test('a live offer with no terms keeps no invented subtitle', async () => {
    const view = await renderScreen(LIVE_ID);

    await waitFor(() => expect(view.getByText(DETAIL.name)).toBeTruthy());
    expect(view.queryByText('Valid 12 PM - 4 PM weekdays only')).toBeNull();
  });
});

/**
 * Who the claim flow says is claiming.
 *
 * The identity card used to be a hardcoded profile — "JD", "John Doe",
 * "john@email.com" with a verified badge that made no claim about anything —
 * and the terms sheet addressed the claim to that same fixed address. Both
 * now come from the session, and only the signed-in customer can see any of it
 * (the flow is gated on `isAuthenticated`).
 */
describe('DealDetailScreen claim identity', () => {
  /** Same shape the signup flow stores: `emailVerified` drives the badge. */
  const ada = userSchema.parse({
    id: '3c0d3a2a-1f6b-4b3e-9c2d-5a1e0b7f4d21',
    email: 'ada.okon@example.com',
    firstName: 'Ada',
    lastName: 'Okon',
    phone: '0801 111 2222',
    emailVerified: true,
  });

  const openIdentitySheet = async (dealId: string) => {
    const view = await renderScreen(dealId);
    await waitFor(() => expect(view.getByText('Claim Deal')).toBeTruthy());
    await fireEvent.press(view.getByText('Claim Deal'));
    await waitFor(() =>
      expect(view.getByText(strings.deals.claimFlow.confirmClaim)).toBeTruthy(),
    );
    await fireEvent.press(view.getByText(strings.deals.claimFlow.confirmClaim));
    await waitFor(() =>
      expect(view.getByText(strings.deals.claimFlow.claimForMe)).toBeTruthy(),
    );
    return view;
  };

  beforeEach(() => {
    useAuthStore.setState({ user: ada, status: 'authenticated' });
  });

  afterEach(() => {
    useAuthStore.setState({ user: null, status: 'unauthenticated' });
  });

  test('the identity card shows the signed-in customer, not a scripted profile', async () => {
    const view = await openIdentitySheet(LIVE_ID);

    expect(view.getByText('Ada Okon')).toBeTruthy();
    expect(view.getByText('ada.okon@example.com')).toBeTruthy();
    expect(view.getByText('AO')).toBeTruthy();
    expect(view.queryByText('John Doe')).toBeNull();
    expect(view.queryByText('john@email.com')).toBeNull();
  });

  test('the verified badge follows the session flag', async () => {
    const view = await openIdentitySheet(LIVE_ID);

    expect(view.getByLabelText(strings.deals.claimFlow.emailVerified)).toBeTruthy();
  });

  test('an unverified session shows no verified badge', async () => {
    useAuthStore.setState({
      user: { ...ada, emailVerified: false },
      status: 'authenticated',
    });

    const view = await openIdentitySheet(LIVE_ID);

    expect(view.getByText('ada.okon@example.com')).toBeTruthy();
    expect(view.queryByLabelText(strings.deals.claimFlow.emailVerified)).toBeNull();
  });

  test('offers no fake "claim for someone else" path', async () => {
    const view = await openIdentitySheet(LIVE_ID);

    // Giving a deal to someone else is the gift flow; the old recipient path
    // never reached the API.
    expect(view.queryByText(strings.deals.claimFlow.claimSomeoneElse)).toBeNull();
    expect(view.getByText(strings.deals.claimFlow.claimGift)).toBeTruthy();
  });

  test('the self-claim form opens prefilled from the session', async () => {
    const view = await openIdentitySheet(LIVE_ID);

    // A real offer verifies the claimant by emailed code first, so the details
    // sheet opens already holding the session's identity.
    await fireEvent.press(view.getByText(strings.deals.claimFlow.claimForMe));

    await waitFor(() => {
      expect(view.getByLabelText(strings.deals.claimFlow.firstName).props.value).toBe(
        'Ada',
      );
    });
    expect(view.getByLabelText(strings.deals.claimFlow.lastName).props.value).toBe(
      'Okon',
    );
    expect(view.getByLabelText(strings.deals.claimFlow.email).props.value).toBe(
      'ada.okon@example.com',
    );
    expect(view.getByLabelText(strings.deals.claimFlow.phone).props.value).toBe(
      '0801 111 2222',
    );
  });
});
