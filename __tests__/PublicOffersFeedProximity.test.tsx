import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePublicOffersFeed } from '@features/deals/hooks/usePublicOffers';
import { useLocationStore } from '@store/locationStore';
import { areaCoords } from '@constants/locations';
import { haversineMeters } from '@utils/geo';
import { formatDistanceLabel } from '@features/deals/utils/offerMapper';

const mockList = jest.fn();

jest.mock('@api/dealsApi', () => ({
  dealsApi: {
    listPublicOffers: (...args: unknown[]) => mockList(...args),
  },
}));

/** One offer with business coordinates, so a distance can be computed. */
const OFFER = {
  id: 'offer-1',
  name: 'Soft Drinks Special Offer',
  description: 'Fizzy drinks',
  pricingType: 'fixed_discount_amount',
  fixedPrice: 500,
  percentageOff: null,
  calculatedPrice: 1500,
  originalPrice: 2000,
  discountPercent: 25,
  status: 'active',
  branchId: null,
  branchName: null,
  categoryName: null,
  business: {
    id: 'business-1',
    name: 'Corner Shop',
    latitude: 9.0567,
    longitude: 7.4969,
  },
  items: [],
  claimedCount: 0,
  totalLimit: null,
  remainingLimit: null,
  startDate: null,
  endDate: null,
  isExpired: false,
  maxClaimsPerCustomer: null,
  audienceTarget: null,
  terms: [],
  claimCodePrefix: null,
};

const BUSINESS_POINT = { latitude: 9.0567, longitude: 7.4969 };

/** Garki's coordinates, deliberately not any district centre. */
const GPS = { latitude: 9.065, longitude: 7.4905 };

const feed = (data: unknown[] = [OFFER]) => ({
  data,
  total: data.length,
  hasNextPage: false,
});

function Probe() {
  const { feed: mapped } = usePublicOffersFeed(20);
  return (
    <>
      <Text testID="area">{mapped.area}</Text>
      <Text testID="distance">{mapped.grid[0]?.distance ?? ''}</Text>
    </>
  );
}

const clients: QueryClient[] = [];

async function renderProbe() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  const screen = await render(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  );
  return { screen, client };
}

const setStore = (state: {
  area?: 'Apo' | 'Garki';
  coords?: typeof GPS | null;
  radiusKm?: number;
}) => {
  useLocationStore.setState({
    area: state.area ?? 'Apo',
    coords: state.coords === undefined ? null : state.coords,
    radiusKm: state.radiusKm ?? 5,
  });
};

const lastCall = () => mockList.mock.calls.at(-1)?.[0] as Record<string, unknown>;

beforeEach(() => {
  mockList.mockReset();
  mockList.mockResolvedValue(feed());
  setStore({ area: 'Apo' });
});

afterEach(() => {
  clients.forEach(client => client.clear());
});

describe('usePublicOffersFeed proximity', () => {
  it('filters by the radius the user set', async () => {
    setStore({ area: 'Apo', radiusKm: 12 });
    await renderProbe();

    await waitFor(() => expect(mockList).toHaveBeenCalled());
    expect(lastCall()).toMatchObject({ radius: 12, limit: 20 });
  });

  it('filters from the real position when the user used GPS', async () => {
    setStore({ area: 'Garki', coords: GPS, radiusKm: 8 });
    await renderProbe();

    await waitFor(() => expect(mockList).toHaveBeenCalled());
    expect(lastCall()).toMatchObject({
      lat: GPS.latitude,
      lng: GPS.longitude,
      radius: 8,
    });
  });

  it('falls back to the district centre when the district was picked by hand', async () => {
    setStore({ area: 'Garki', coords: null });
    await renderProbe();

    await waitFor(() => expect(mockList).toHaveBeenCalled());
    const garki = areaCoords('Garki');
    expect(lastCall()).toMatchObject({ lat: garki.latitude, lng: garki.longitude });
  });

  /**
   * The distance on a card and the filter the API applied have to come from one
   * origin. Measuring from the district centre while filtering by GPS would
   * print a plausible but wrong number, so the label is checked against the
   * distance from the origin that was actually sent.
   */
  it('measures card distance from the same origin it filtered by', async () => {
    setStore({ area: 'Garki', coords: GPS });
    const { screen } = await renderProbe();

    await waitFor(() =>
      expect(screen.getByTestId('distance').props.children).toBe(
        formatDistanceLabel(haversineMeters(GPS, BUSINESS_POINT)),
      ),
    );

    // The district centre is a different origin and must produce a different
    // number — proving the card is not quietly using the old basis.
    expect(
      formatDistanceLabel(haversineMeters(areaCoords('Garki'), BUSINESS_POINT)),
    ).not.toBe(formatDistanceLabel(haversineMeters(GPS, BUSINESS_POINT)));
  });

  it('measures from the district centre when there is no GPS reading', async () => {
    setStore({ area: 'Garki', coords: null });
    const { screen } = await renderProbe();

    await waitFor(() =>
      expect(screen.getByTestId('distance').props.children).toBe(
        formatDistanceLabel(haversineMeters(areaCoords('Garki'), BUSINESS_POINT)),
      ),
    );
  });

  it('still labels the feed with the district the navbar shows', async () => {
    setStore({ area: 'Garki', coords: GPS });
    const { screen } = await renderProbe();

    await waitFor(() => expect(screen.getByTestId('area').props.children).toBe('Garki'));
  });

  it('refetches when the radius changes', async () => {
    // The store write re-renders the hook and radius is part of the query key,
    // so the feed cannot keep serving results for the previous radius.
    setStore({ area: 'Apo', radiusKm: 5 });
    await renderProbe();
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));

    setStore({ area: 'Apo', radiusKm: 25 });

    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));
    expect(lastCall()).toMatchObject({ radius: 25 });
  });

  it('refetches when the position changes', async () => {
    setStore({ area: 'Apo', coords: null });
    await renderProbe();
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));

    setStore({ area: 'Apo', coords: GPS });

    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));
    expect(lastCall()).toMatchObject({ lat: GPS.latitude, lng: GPS.longitude });
  });

  it('keeps the feed empty-safe when the API returns nothing nearby', async () => {
    // A narrow radius legitimately returns no offers; the mapper must not throw.
    mockList.mockResolvedValue(feed([]));
    setStore({ area: 'Apo', coords: GPS, radiusKm: 1 });
    const { screen } = await renderProbe();

    await waitFor(() => expect(screen.getByTestId('distance').props.children).toBe(''));
  });
});
