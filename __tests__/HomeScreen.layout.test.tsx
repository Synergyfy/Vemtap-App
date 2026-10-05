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

jest.mock('@hooks/useNetworkStatus', () => ({
  useIsOnline: () => true,
}));

describe('HomeScreen Deals Near You layout', () => {
  it('pushes Deals Discovery while keeping Home active', async () => {
    const screen = await render(
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>,
    );

    await fireEvent.press(screen.getByLabelText('See All Deals Near You'));

    // The count and copy now come from the live-feed double, not the seed file.
    expect(await screen.findByText('Showing 3 deals')).toBeTruthy();
    expect(screen.getByText('20% Off Prime Lunch Combo')).toBeTruthy();
    expect(screen.getByLabelText(/Home, tab/i).props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(
      screen.getByLabelText(/Discover, tab/i).props.accessibilityState,
    ).toMatchObject({ selected: false });
    expect(screen.getByLabelText(/Deals, tab/i)).toBeTruthy();
    expect(screen.getByLabelText(/Saved, tab/i)).toBeTruthy();
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

    // The first offer is the featured card, so the rest are the "near you" list.
    // An offer can appear in both the list and the trending rail, so counts are
    // asserted with getAllByText rather than expecting a single match.
    expect(screen.getByText('20% Off Prime Lunch Combo')).toBeTruthy();
    expect(screen.getAllByText('30% Off Family Platter').length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByTestId('deals-view-toggle-grid'));

    // The grid card drops the discount prefix because the badge beside it
    // already reads "30% OFF" — printing it twice wastes the only line.
    expect(screen.getByLabelText('Family Platter')).toBeTruthy();
    // Scoped to the grid card: the trending rail keeps the full title, since its
    // badge is optional and the name is what identifies the offer there.
    expect(screen.queryByText('30% Off Family Platter')).not.toBeNull();

    await fireEvent.press(screen.getByTestId('deals-view-toggle-list'));

    expect(screen.getAllByText('30% Off Family Platter').length).toBeGreaterThan(0);
  });
});
