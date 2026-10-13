import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { TabNavigator } from '@navigation/TabNavigator';
import { NavigationHistoryTracker } from '@navigation/useHistoryBack';
import { navigationRef } from '@navigation/navigationRef';
import { useNavigationHistory } from '@navigation/navigationHistory';
import { strings } from '@constants/strings';

// Home reads the live offers feed through React Query, so any test that mounts
// the real shell needs the feed double (and its neutral engagement hooks).
jest.mock('@features/deals/hooks/usePublicOffers', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
);
jest.mock('@features/deals/hooks/useDealEngagementActions', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockDealEngagementActionsModule(),
);
jest.mock('@features/discover/hooks/useDiscoverBusinesses', () => ({
  useDiscoverBusinesses: jest.fn(() => ({
    data: [
      {
        id: 'urban-grill',
        image: { uri: 'https://example.test/logo.png' },
        name: 'Urban Grill & Bistro',
        category: 'Food & Dining',
        categoryFilter: 'Food & Dining',
        imageAlt: 'Urban Grill & Bistro',
        rating: '',
        reviews: 0,
        distance: '',
        location: 'Apo Boulevard, Abuja',
        activeDealLabel: '',
        status: { label: 'Verified Partner', icon: 'verified' },
        branchCode: 'URBANGRLL',
      },
    ],
    isLoading: false,
    isError: false,
  })),
}));

/** A bundled business summary, exactly what the Discover feed hands the profile. */
const SEED_BUSINESS = {
  id: 'urban-grill',
  image: { uri: 'https://example.test/logo.png' },
  name: 'Urban Grill & Bistro',
  category: 'Food & Dining',
  categoryFilter: 'Food & Dining',
  imageAlt: 'Urban Grill & Bistro',
  rating: '',
  reviews: 0,
  distance: '',
  location: 'Apo Boulevard, Abuja',
  activeDealLabel: '',
  status: { label: 'Verified Partner', icon: 'verified' },
  branchCode: 'URBANGRLL',
};

/**
 * True while the business profile screen is showing. The profile's navbar back
 * button is the marker: the Discover list card carries the business name and a
 * bookmark too, so neither of those is distinctive.
 */
const onProfile = () => screen.queryAllByLabelText(strings.common.goBack).length > 0;

/** What the Discover tab route currently holds. */
type RootRoute = {
  name?: string;
  params?: { screen?: string };
  state?: { routes?: { name?: string }[] };
};

const discoverRoute = () => {
  const root = (navigationRef as { getRootState?: () => unknown }).getRootState?.() as
    { routes?: RootRoute[] } | null | undefined;
  const discover = root?.routes?.find(route => route.name === 'Discover');
  return {
    hopParams: Object.keys(discover?.params ?? {}),
    stack: discover?.state?.routes?.map(route => route.name) ?? [],
  };
};

const press = async (label: string | RegExp) => {
  await act(async () => {
    fireEvent.press(screen.getByLabelText(label));
  });
};

afterEach(() => {
  cleanup();
  useNavigationHistory.getState().reset();
});

async function renderShell() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  await render(
    <QueryClientProvider client={client}>
      <NavigationContainer ref={navigationRef}>
        <TabNavigator />
        <NavigationHistoryTracker />
      </NavigationContainer>
    </QueryClientProvider>,
  );
  client.clear();
}

/**
 * Opens the merchant the way DealDetailScreen does it: a hop *through* the tab
 * navigator, which parks the nested screen in the tab route's own params.
 */
async function openProfileFromDeal() {
  // The tab bar navigates by route name through the container, and the params
  // carry the nested screen, so the call is typed loosely the way the deal
  // screen's own cross-shell hop is.
  const { navigate } = navigationRef as {
    navigate: (name: string, params?: object) => void;
  };
  await act(async () => {
    navigate('Discover', {
      screen: 'BusinessProfile',
      params: { business: SEED_BUSINESS },
    });
  });
}

test('returns the Business (Discover) tab to its base screen on a second tap', async () => {
  await renderShell();
  await press(/Business, tab/i);
  expect(await screen.findByText('Businesses Near You')).toBeTruthy();

  await press('View Urban Grill & Bistro');
  expect(onProfile()).toBe(true);

  await press(/Business, tab/i);

  await waitFor(() => expect(onProfile()).toBe(false));
  expect(screen.getByText('Businesses Near You')).toBeTruthy();
});

test('keeps the profile when the Business tab is switched away from and back', async () => {
  await renderShell();
  await press(/Business, tab/i);
  await press('View Urban Grill & Bistro');
  expect(onProfile()).toBe(true);

  await press(/Account, tab/i);
  await press(/Business, tab/i);

  // Switching tabs keeps the nested screen; only a re-tap unwinds it.
  expect(onProfile()).toBe(true);

  await press(/Business, tab/i);

  await waitFor(() => expect(onProfile()).toBe(false));
  expect(screen.getByText('Businesses Near You')).toBeTruthy();
});

test('leaves a non-focused tab alone when another tab is tapped', async () => {
  await renderShell();
  await press(/Business, tab/i);
  await press('View Urban Grill & Bistro');
  expect(onProfile()).toBe(true);

  await press(/Account, tab/i);
  expect(await screen.findByLabelText(/Business, tab/i)).toBeTruthy();

  await press(/Business, tab/i);
  expect(onProfile()).toBe(true);
});

test('unwinds a profile that a deal opened through the tab hop', async () => {
  await renderShell();
  await openProfileFromDeal();
  expect(onProfile()).toBe(true);

  // The hop left the Discover tab on the profile alone — its base screen was
  // never even underneath it — and its params still named the profile.
  expect(discoverRoute().stack).toEqual(['BusinessProfile']);
  expect(discoverRoute().hopParams).toContain('screen');

  await press(/Business, tab/i);

  // The re-tap rebuilds the tab on its base screen and drops the params.
  await waitFor(() => expect(onProfile()).toBe(false));
  expect(discoverRoute().stack).toEqual(['DiscoverHome']);
  expect(discoverRoute().hopParams).not.toContain('screen');
  expect(screen.getByText('Businesses Near You')).toBeTruthy();
});

test('does not re-open the profile on a later visit once it was unwound', async () => {
  await renderShell();
  await openProfileFromDeal();
  await press(/Business, tab/i);
  await waitFor(() => expect(onProfile()).toBe(false));

  // The hop's params used to bring the profile back every time the tab gained
  // focus again; after the re-tap they are gone for good.
  await press(/Account, tab/i);
  await press(/Business, tab/i);
  await waitFor(() => expect(discoverRoute().stack).toEqual(['DiscoverHome']));
  expect(onProfile()).toBe(false);
  expect(screen.getByText('Businesses Near You')).toBeTruthy();
});
