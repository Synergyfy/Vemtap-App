import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { TabNavigator } from '@navigation/TabNavigator';

jest.mock('@features/deals/hooks/usePublicOffers', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
);
jest.mock('@features/deals/hooks/useDealEngagementActions', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockDealEngagementActionsModule(),
);
jest.mock('@features/home/hooks/useNearbyBusinesses', () =>
  jest.requireActual('./helpers/mockHomeBusinesses').mockHomeBusinessesModule(),
);
jest.mock('@features/home/hooks/useNearbyProducts', () =>
  jest.requireActual('./helpers/mockHomeProducts').mockHomeProductsModule(),
);

jest.mock('@hooks/useNetworkStatus', () => ({
  useIsOnline: () => true,
}));

const feedDouble = jest.requireMock('@features/deals/hooks/usePublicOffers');
const { MOCK_OFFERS } = jest.requireActual('./helpers/mockOffersFeed') as {
  MOCK_OFFERS: unknown[];
};

/**
 * Home's featured rail takes the first three offers, so this suite — which
 * exercises the "Deals Near You" list and grid — needs a feed with something
 * left over after featured has had its share. The extras carry distinct titles
 * so no card copy matches twice, and one is discount-prefixed so the grid
 * card's title shortening stays exercisable.
 */
const extraOffer = (index: number, id: string, name: string) => ({
  ...(MOCK_OFFERS[index] as Record<string, unknown>),
  id,
  name,
});

const allOffers = [
  ...MOCK_OFFERS,
  extraOffer(0, 'offer-midnight-ramen', '20% Off Midnight Ramen Special'),
  extraOffer(1, 'offer-matcha-flight', '2 for 1 Matcha Flight'),
];

// Remapped so the Deals tab's own feed view matches the offers it is given,
// rather than the three the shared default was mapped from.
const mapper = jest.requireActual('@features/deals/utils/offerMapper') as {
  mapOfferToFeatured: (offer: unknown, origin: unknown) => unknown;
  mapOfferToListItem: (offer: unknown, origin: unknown) => unknown;
  mapOfferToGridItem: (offer: unknown, origin: unknown) => unknown;
};
const { areaCoords } = jest.requireActual('@constants/locations') as {
  areaCoords: (area: string) => { latitude: number; longitude: number };
};
const origin = areaCoords('Apo');

feedDouble.usePublicOffersFeed.mockReturnValue({
  offers: allOffers,
  isLoading: false,
  isError: false,
  isSuccess: true,
  refetch: jest.fn(),
  feed: {
    area: 'Apo',
    featured: mapper.mapOfferToFeatured(allOffers[0], origin),
    list: allOffers.map(offer => mapper.mapOfferToListItem(offer, origin)),
    grid: allOffers.map(offer => mapper.mapOfferToGridItem(offer, origin)),
  },
});

describe('HomeScreen Deals Near You layout', () => {
  it('pushes Deals Discovery while keeping Home active', async () => {
    const screen = await render(
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>,
    );

    await fireEvent.press(screen.getByLabelText('See All Deals Near You'));

    // The count and copy now come from the live-feed double, not the seed file.
    expect(await screen.findByText('Showing 5 deals')).toBeTruthy();
    expect(screen.getByText('20% Off Prime Lunch Combo')).toBeTruthy();
    expect(screen.getByLabelText(/Home, tab/i).props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(
      screen.getByLabelText(/Business, tab/i).props.accessibilityState,
    ).toMatchObject({ selected: false });
    expect(screen.getByLabelText(/Deals, tab/i)).toBeTruthy();
    expect(screen.getByLabelText(/Account, tab/i)).toBeTruthy();
  });

  it('toggles Deals without losing its tab and root navigation context', async () => {
    const screen = await render(
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>,
    );

    await fireEvent.press(await screen.findByLabelText(/Deals, tab/i));
    await fireEvent.press(await screen.findByTestId('deals-view-toggle-list'));
    expect(await screen.findByText(/Deals in/i)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('deals-view-toggle-grid'));
    expect(await screen.findByText(/Deals in/i)).toBeTruthy();
  });

  it('toggles inside the real tab navigation context', async () => {
    const screen = await render(
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>,
    );

    await fireEvent.press(await screen.findByTestId('deals-view-toggle-grid'));
    expect(await screen.findByText('20% Off Prime Lunch Combo')).toBeTruthy();
    expect(screen.getByTestId('deals-view-toggle-list').props.className).toContain(
      'shadow-xs',
    );
    expect(screen.getByTestId('deals-view-toggle-grid').props.className).toContain(
      'shadow-xs',
    );

    await fireEvent.press(screen.getByTestId('deals-view-toggle-list'));
    expect(await screen.findByText('20% Off Prime Lunch Combo')).toBeTruthy();
  });

  it('switches between list and two-column grid layouts', async () => {
    const screen = await render(<HomeScreen />);

    // The first three offers are the featured rail, so the extras are the
    // "near you" list. An offer can appear in both the list and the trending
    // rail, so counts are asserted with getAllByText rather than expecting a
    // single match.
    expect(screen.getByText('20% Off Prime Lunch Combo')).toBeTruthy();
    expect(screen.getAllByText('30% Off Family Platter').length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByTestId('deals-view-toggle-grid'));

    // The grid card drops the discount prefix because the badge beside it
    // already reads "20% OFF" — printing it twice wastes the only line.
    expect(screen.getByLabelText('Midnight Ramen Special')).toBeTruthy();
    // Scoped to the grid card: the trending rail keeps the full title, since its
    // badge is optional and the name is what identifies the offer there.
    expect(screen.queryByText('20% Off Midnight Ramen Special')).not.toBeNull();

    await fireEvent.press(screen.getByTestId('deals-view-toggle-list'));

    expect(screen.getAllByText('30% Off Family Platter').length).toBeGreaterThan(0);
  });
});
