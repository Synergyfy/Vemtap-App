import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from '@navigation/TabNavigator';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { PersonalHubNavigator } from '@navigation/PersonalHubNavigator';

// Mounts three whole navigators (customer tabs, business tabs, personal hub)
// in one test, so it needs more headroom than the global cap on a loaded
// machine. Without this the suite fails on wall-clock, not on behaviour.
jest.setTimeout(180_000);

jest.mock('@features/home/hooks/useNearbyBusinesses', () =>
  jest.requireActual('./helpers/mockHomeBusinesses').mockHomeBusinessesModule(),
);
jest.mock('@features/home/hooks/useNearbyProducts', () =>
  jest.requireActual('./helpers/mockHomeProducts').mockHomeProductsModule(),
);

jest.mock('@features/deals/hooks/usePublicOffers', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
);
jest.mock('@features/deals/hooks/useDealEngagementActions', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockDealEngagementActionsModule(),
);
jest.mock('@features/discover/hooks/useDiscoverBusinesses', () =>
  jest.requireActual('./helpers/mockDiscoverBusinesses').mockDiscoverBusinessesModule(),
);
jest.mock('@features/accountHub/hooks/useSavedHub', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockSavedHubModule(),
);
jest.mock('@features/myDeals/hooks/useMyClaims', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockMyClaimsModule(),
);

jest.mock('@store/authStore', () => ({
  useAuthStore: Object.assign(
    jest.fn(() => ({ markUnauthenticated: jest.fn() })),
    { getState: () => ({ markUnauthenticated: jest.fn() }) },
  ),
}));

function captureWarnings() {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(' '));
  };
  return {
    warnings,
    restore: () => {
      console.warn = original;
    },
  };
}

async function auditNavigator(element: React.ReactElement, tabLabels: string[]) {
  const { warnings, restore } = captureWarnings();
  try {
    const screen = await render(<NavigationContainer>{element}</NavigationContainer>);
    // The duplicate-name check only runs on state changes, so each tab needs its own
    // committed state: batching the presses hides inactive branches of the tree.
    // Custom bars expose an accessibilityLabel; the default bar renders the label as
    // text, so fall back to that (fireEvent bubbles up to the pressable).
    for (const label of tabLabels) {
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        const labelled = screen.queryAllByLabelText(label);
        const asText = labelled.length > 0 ? [] : screen.queryAllByText(label);
        const target = labelled[labelled.length - 1] ?? asText[asText.length - 1];
        if (target) fireEvent.press(target);
      });
    }
    const duplicates = warnings.filter(m =>
      m.includes('same name nested inside one another'),
    );
    // Guard against a false pass: every tab must actually have been found.
    const missingTabs = tabLabels.filter(
      l =>
        screen.queryAllByLabelText(l).length === 0 &&
        screen.queryAllByText(l).length === 0,
    );
    return { duplicates, missingTabs };
  } finally {
    restore();
  }
}

test('no navigator nests a screen that reuses an ancestor route name', async () => {
  // The personal flow is a flat pushed stack now — it has no tabs and no nested
  // navigators, so there are no route names left to collide. Rendering it still
  // catches a regression that reintroduces a nesting navigator.
  const personal = await auditNavigator(<PersonalHubNavigator />, []);
  const business = await auditNavigator(<BusinessTabNavigator />, [
    'Orders',
    'Messages',
    'Business',
    'More',
    'Overview',
  ]);
  const consumer = await auditNavigator(<TabNavigator />, [
    'Deals',
    'Business',
    'Account',
    'Home',
  ]);

  expect(personal.missingTabs).toEqual([]);
  expect(business.missingTabs).toEqual([]);
  expect(consumer.missingTabs).toEqual([]);

  expect({
    personal: personal.duplicates,
    business: business.duplicates,
    consumer: consumer.duplicates,
  }).toEqual({ personal: [], business: [], consumer: [] });
});
