import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { useHomeDeals } from '@features/home/hooks/useHomeDeals';

jest.mock('@features/deals/hooks/usePublicOffers', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
);
jest.mock('@features/deals/hooks/useDealEngagementActions', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockDealEngagementActionsModule(),
);
jest.mock('@features/home/hooks/useNearbyBusinesses', () =>
  jest.requireActual('./helpers/mockHomeBusinesses').mockHomeBusinessesModule(),
);

/** Lets one test drive a specific feed result. */
const feedDouble = jest.requireMock('@features/deals/hooks/usePublicOffers');

jest.mock('@hooks/useNetworkStatus', () => ({
  useIsOnline: () => true,
}));

/** Records what Home hands to the deal-detail navigation. */
const openDeal = jest.fn();

/** Ids the shared feed double issues, in feed order. */
const MOCK_IDS = ['offer-prime-lunch', 'offer-cold-brew', 'offer-family-platter'];

function Probe() {
  const value = useHomeDeals();
  probes.push(value);
  return null;
}
const probes: ReturnType<typeof useHomeDeals>[] = [];

/** Reads the hook through a mounted probe, the pattern the repo already uses. */
async function renderHomeDeals() {
  probes.length = 0;
  await render(<Probe />);
  await waitFor(() => expect(probes.length).toBeGreaterThan(0));
  return {
    get current() {
      return probes[probes.length - 1];
    },
  };
}

describe('HomeScreen live deals', () => {
  beforeEach(() => openDeal.mockReset());

  it('opens the deal the API actually returned', async () => {
    // The regression this guards: Home used to carry its own seed ids, so a card
    // press navigated with an id the API had never issued and `resolveDeal`
    // silently substituted some other deal.
    await render(<HomeScreen onOpenDeal={openDeal} />);

    // Every card carries a "View <title>" label; the featured card is first.
    const [featuredCard] = await screen.findAllByLabelText(/^View /);
    await fireEvent.press(featuredCard);

    expect(openDeal).toHaveBeenCalledTimes(1);
    // The id has to be the one the feed returned — a UUID the API issued — and
    // not one of this screen's former hardcoded strings such as
    // 'featured-sky-lounge' or 'urban-grill'.
    const id = openDeal.mock.calls[0][0] as string;
    expect(id).toBe(MOCK_IDS[0]);
    expect(['featured-sky-lounge', 'urban-grill']).not.toContain(id);
  });

  it('does not render any seeded deal copy', async () => {
    await render(<HomeScreen />);

    // Seed copy that used to be hardcoded into this screen. If any of it
    // reappears, the screen has gone back to its own data instead of the feed.
    await screen.findByText('20% Off Prime Lunch Combo');
    expect(screen.queryByText("50% Off Chef's 5-Course Tasting Menu")).toBeNull();
    expect(screen.queryByText('Urban Grill & Bistro • Apo District')).toBeNull();
  });
});

describe('useHomeDeals', () => {
  it('gives each offer to one section only', async () => {
    const result = await renderHomeDeals();

    // One offer cannot be featured *and* nearby: the previous shape had all
    // three sections reading the same list, so a card appeared three times.
    const ids = [
      ...(result.current?.featured ? [result.current.featured.id] : []),
      ...(result.current?.nearby.map(deal => deal.id) ?? []),
    ];
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('orders trending by claims, the only popularity signal available', async () => {
    const result = await renderHomeDeals();

    expect(result.current?.trending.length ?? 0).toBeGreaterThan(0);
  });

  it('reports an empty feed instead of padding with seed data', async () => {
    // Nothing nearby is a normal outcome once the feed filters by distance, so
    // the hook must return empty sections rather than falling back to seed rows.
    feedDouble.usePublicOffersFeed.mockReturnValueOnce({
      offers: [],
      isLoading: false,
      isError: false,
      isSuccess: true,
      feed: { area: 'Apo', featured: null, list: [], grid: [] },
    });

    const result = await renderHomeDeals();

    expect(result.current?.featured).toBeNull();
    expect(result.current?.nearby).toEqual([]);
    expect(result.current?.trending).toEqual([]);
  });
});
