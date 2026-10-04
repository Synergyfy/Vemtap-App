import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { AppStack } from '@navigation/AppStack';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@features/deals/hooks/usePublicOffers', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
);
jest.mock('@features/deals/hooks/useDealEngagementActions', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockDealEngagementActionsModule(),
);

/**
 * The filter icon must open the one shared filter page from every feed that
 * shows it. Deals, Home and Discover each render their own icon, so a handler
 * that quietly stops navigating (a no-op `onOpenFilters`) is invisible until a
 * user taps a dead control — these tests press all three from the shell.
 */
afterEach(cleanup);

const homeFilter = strings.home.filter;
const dealsFilter = strings.deals.filters;
const discoverFilter = strings.discoverFeed.filterBusinesses;

/**
 * `DealFilters` is registered on the App stack, so the shell under test is
 * AppStack itself: rendering only the tab navigator would leave the route with
 * no parent to resolve against and the press would silently no-op.
 */
async function openShell() {
  await render(
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>,
  );
}

/** The tab bar renders its title as text, not an accessibility label. */
async function pressTab(label: string) {
  await act(async () => {
    fireEvent.press(screen.getByText(label));
  });
}

describe('shared deal filters', () => {
  it('opens the filter page from the Deals feed', async () => {
    await openShell();
    await pressTab(strings.home.tabDeals);
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText(dealsFilter)[0]);
    });
    expect(screen.getAllByText(strings.filters.title).length).toBeGreaterThan(0);
  });

  it('opens the same filter page from the Home search bar', async () => {
    await openShell();
    await pressTab(strings.home.tabHome);
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText(homeFilter)[0]);
    });
    expect(screen.getAllByText(strings.filters.title).length).toBeGreaterThan(0);
  });

  it('opens the same filter page from the Discover feed', async () => {
    await openShell();
    await pressTab(strings.home.tabDiscover);
    await act(async () => {
      fireEvent.press(screen.getByLabelText(discoverFilter));
    });
    expect(screen.getAllByText(strings.filters.title).length).toBeGreaterThan(0);
  });
});
