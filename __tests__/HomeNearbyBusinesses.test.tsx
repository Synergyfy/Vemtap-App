import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useNearbyBusinesses,
  toNearbyBusiness,
} from '@features/home/hooks/useNearbyBusinesses';
import type { PublicBusiness } from '@api/dealsApi';

/**
 * Home's businesses section, from the real public endpoint.
 *
 * The section used to render the bundled Discover businesses under a
 * "Businesses Around You" heading, which read as live data but was fiction.
 *
 * The live endpoint exposes no coordinates and no ratings, so the card must omit
 * those rather than show a plausible distance or score — that behaviour is what
 * these lock down.
 */

const mockList = jest.fn();

jest.mock('@api/dealsApi', () => ({
  dealsApi: {
    listPublicBusinesses: (...args: unknown[]) => mockList(...args),
  },
}));

const BUSINESS = {
  id: '752d527c-602c-4303-b649-708e08eb24d7',
  name: 'ABC Beauty Store',
  logoUrl: 'https://example.test/logo.png',
  description: null,
  address: 'Apo Resettlement Abuja, Asokoro',
  state: 'Asokoro',
  city: 'Asokoro',
  categoryId: 'ad1fe34a-736b-441a-aa6c-8960969f5d18',
  categoryName: 'Beauty & Personal Care',
  isVerified: true,
} as unknown as PublicBusiness;

function Probe() {
  const { data } = useNearbyBusinesses();
  return (
    <>
      <Text testID="count">{data?.length ?? 0}</Text>
      <Text testID="name">{data?.[0]?.name ?? ''}</Text>
      <Text testID="distance">{data?.[0]?.distance ?? ''}</Text>
      <Text testID="rating">{data?.[0]?.rating ?? ''}</Text>
      <Text testID="meta">{data?.[0]?.meta ?? ''}</Text>
    </>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockList.mockResolvedValue([BUSINESS]);
});

describe('toNearbyBusiness', () => {
  test('maps the fields the endpoint actually returns', () => {
    const mapped = toNearbyBusiness(BUSINESS);

    expect(mapped.name).toBe('ABC Beauty Store');
    expect(mapped.category).toBe('Beauty & Personal Care');
    expect(mapped.meta).toBe('Verified');
  });

  test('leaves distance and rating empty rather than inventing them', () => {
    const mapped = toNearbyBusiness(BUSINESS);

    // The endpoint returns neither, so there is nothing to show.
    expect(mapped.distance).toBe('');
    expect(mapped.rating).toBe('');
    expect(mapped.ratingCount).toBe('');
  });

  test('falls back to a place when the business is not verified', () => {
    const mapped = toNearbyBusiness({ ...BUSINESS, isVerified: false });

    expect(mapped.meta).toBe('Asokoro, Asokoro');
  });

  test('handles a business with no logo', () => {
    const mapped = toNearbyBusiness({ ...BUSINESS, logoUrl: null });

    // A branded fallback rather than a broken image.
    expect(mapped.image).toBeDefined();
  });
});

describe('useNearbyBusinesses', () => {
  test('returns the real businesses the endpoint lists', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const screen = await render(
      <QueryClientProvider client={client}>
        <Probe />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('count').props.children).toBe(1));
    expect(screen.getByTestId('name').props.children).toBe('ABC Beauty Store');
    expect(screen.getByTestId('distance').props.children).toBe('');
    client.clear();
  });

  test('caps the list so Home is not a directory page', async () => {
    mockList.mockResolvedValue(
      Array.from({ length: 30 }, (_, index) => ({
        ...BUSINESS,
        id: `business-${index}`,
        name: `Business ${index}`,
      })),
    );

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={client}>
        <Probe />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('count').props.children).toBe(8));
    client.clear();
  });
});
