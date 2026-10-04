import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from '@navigation/TabNavigator';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { PersonalHubNavigator } from '@navigation/PersonalHubNavigator';

jest.mock('@features/deals/hooks/usePublicOffers', () =>
  jest.requireActual('./helpers/mockOffersFeed').mockOffersFeedModule(),
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
  const personal = await auditNavigator(<PersonalHubNavigator />, [
    'My Deals',
    'Messages',
    'Orders',
    'More',
    'Home',
  ]);
  const business = await auditNavigator(<BusinessTabNavigator />, [
    'Orders',
    'Messages',
    'Business',
    'More',
    'Overview',
  ]);
  const consumer = await auditNavigator(<TabNavigator />, [
    'Deals',
    'Discover',
    'Saved',
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
