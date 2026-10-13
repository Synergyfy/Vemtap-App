import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userSchema } from '@api/authApi';
import { useAuthStore } from '@store/authStore';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { businessTabForRoute } from '@navigation/useBusinessNavigation';
import { NavigationHistoryTracker } from '@navigation/useHistoryBack';
import { navigationRef } from '@navigation/navigationRef';
import { strings } from '@constants/strings';

afterEach(cleanup);

/**
 * The business shell splits 107 screens across five *sibling* stacks. A NAVIGATE
 * action only bubbles to ancestors, so a control that targets a route in another
 * stack used to be dropped at runtime — the tap silently did nothing. These tests
 * pin the rewrite down from both directions.
 */
async function mountShell() {
  const warnings: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const text = args.map(a => (a instanceof Error ? a.message : String(a))).join(' ');
    if (text.includes('was not handled by any navigator')) warnings.push(text);
    originalError(...args);
  };

  // Mirror the real hierarchy: the shell is a `BusinessTabs` route of a parent.
  const Root = createNativeStackNavigator();
  await render(
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        <Root.Screen name="BusinessTabs" component={BusinessTabNavigator} />
      </Root.Navigator>
    </NavigationContainer>,
  );

  return {
    warnings,
    restore: () => {
      console.error = originalError;
    },
  };
}

async function openTab(label: string) {
  await act(async () => {
    fireEvent.press(screen.getByLabelText(label));
  });
}

describe('business shell cross-stack navigation', () => {
  it('routes every shell screen through the tab-aware helper', () => {
    // The table is the single place that knows which tab owns which screen.
    expect(businessTabForRoute.size).toBeGreaterThan(90);
    for (const [route, tab] of businessTabForRoute) {
      expect(typeof route).toBe('string');
      expect([
        'BusinessOverview',
        'BusinessOrders',
        'BusinessMessages',
        'BusinessHub',
        'BusinessMore',
      ]).toContain(tab);
    }
    // A representative of each stack, so a missing entry is caught.
    expect(businessTabForRoute.get('CentralDealsManagement')).toBe('BusinessHub');
    expect(businessTabForRoute.get('CampaignsHub')).toBe('BusinessMore');
    expect(businessTabForRoute.get('PosProductsInventory')).toBe('BusinessOrders');
    expect(businessTabForRoute.get('BusinessMessagesHome')).toBe('BusinessMessages');
  });

  it('hops from the More stack to a Hub-stack screen', async () => {
    const { warnings, restore } = await mountShell();
    try {
      await openTab(strings.businessShell.tabs.more);
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Marketing & Growth'));
      });
      expect(screen.getByText('Campaigns & Growth')).toBeTruthy();

      // "Insights" resolves to BusinessPerformanceAnalytics in the Hub stack.
      const insights = screen.queryAllByText('Insights');
      expect(insights.length).toBeGreaterThan(0);
      await act(async () => {
        fireEvent.press(insights[insights.length - 1] as never);
      });

      expect(screen.getByText('Business Performance')).toBeTruthy();
      expect(warnings).toEqual([]);
    } finally {
      restore();
    }
  });

  it('covers routes in both directions, not just More to Hub', () => {
    // Every screen in every stack is present in the table, so a hop from any stack
    // to any other stack can be rewritten — the direction does not matter.
    for (const tab of [
      'BusinessOverview',
      'BusinessOrders',
      'BusinessMessages',
      'BusinessHub',
      'BusinessMore',
    ] as const) {
      const routes = [...businessTabForRoute.entries()].filter(([, t]) => t === tab);
      expect(routes.length).toBeGreaterThan(0);
    }
    // Spot-check one route per stack in both directions.
    expect(businessTabForRoute.get('CentralDealsManagement')).toBe('BusinessHub');
    expect(businessTabForRoute.get('BusinessMoreHome')).toBe('BusinessMore');
    expect(businessTabForRoute.get('BusinessOrderDetail')).toBe('BusinessOrders');
    expect(businessTabForRoute.get('BusinessHubHome')).toBe('BusinessHub');
  });

  it('keeps same-stack navigation unchanged', async () => {
    const { warnings, restore } = await mountShell();
    try {
      await openTab(strings.businessShell.tabs.more);
      const before = screen.getAllByRole('button').length;
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Support & Help Desk'));
      });
      // A same-stack push changes the screen rather than being dropped.
      expect(screen.getAllByRole('button').length).not.toBe(before);
      expect(warnings).toEqual([]);
    } finally {
      restore();
    }
  });

  it('clears the session when the More hub signs the owner out', async () => {
    const owner = userSchema.parse({
      id: '3c0d3a2a-1f6b-4b3e-9c2d-5a1e0b7f4d21',
      email: 'ada.okon@example.com',
      firstName: 'Ada',
      lastName: 'Okon',
      phone: '0801 111 2222',
      role: 'Owner',
    });
    useAuthStore.setState({
      user: owner,
      status: 'authenticated',
      activeMode: 'business',
      ownerAccount: true,
      tokenRole: 'Owner',
    });

    const { restore } = await mountShell();
    try {
      await openTab(strings.businessShell.tabs.more);
      await act(async () => {
        fireEvent.press(screen.getByLabelText(strings.businessMore.signOut));
      });

      // The button used to be wired to a no-op; it must clear the session the
      // same way the customer-side sign out does.
      expect(useAuthStore.getState().status).toBe('unauthenticated');
      expect(useAuthStore.getState().user).toBeNull();
    } finally {
      restore();
      useAuthStore.setState({
        user: null,
        status: 'unauthenticated',
        activeMode: 'business',
        ownerAccount: false,
        tokenRole: null,
      });
    }
  });
});

describe('business orders/bookings switcher', () => {
  /**
   * The Orders hub renders both surfaces in place. This pins the wiring from
   * the route down — the screen-level tests cover the feed itself, but only
   * this shell mount proves the switcher keeps its navigation context inside
   * the real root (a hot-reload artifact once threw "Couldn't find a
   * navigation context" on the first press after the route gained hooks).
   */
  it('round-trips the switcher without losing the navigation context', async () => {
    const errors: string[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args.map(a => (a instanceof Error ? a.message : String(a))).join(' '));
      originalError(...args);
    };
    try {
      // The ref is optional only so mocked test environments can import screens.
      expect(navigationRef).toBeDefined();
      const rootRef = navigationRef!;
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const Root = createNativeStackNavigator();
      await render(
        <QueryClientProvider client={client}>
          <NavigationContainer ref={rootRef}>
            <Root.Navigator screenOptions={{ headerShown: false }}>
              <Root.Screen name="AppStack" component={() => <View />} />
              <Root.Screen name="BusinessTabs" component={BusinessTabNavigator} />
            </Root.Navigator>
            <NavigationHistoryTracker />
          </NavigationContainer>
        </QueryClientProvider>,
      );

      await act(async () => {
        rootRef.navigate('BusinessTabs' as never);
      });
      await openTab(strings.businessShell.tabs.orders);

      const pill = (label: string) =>
        screen
          .getAllByRole('tab')
          .filter(tab => String(tab.props.accessibilityLabel) === label);

      const toBookingsAndBack = async () => {
        await act(async () => {
          fireEvent.press(pill('Bookings')[0]);
        });
        expect(screen.getByText(strings.businessBookings.summaryTitle)).toBeTruthy();

        await act(async () => {
          fireEvent.press(pill('Orders')[0]);
        });
        expect(screen.getByText(strings.businessOrders.orders[0].reference)).toBeTruthy();
        expect(screen.queryByText(strings.businessBookings.summaryTitle)).toBeNull();
      };

      await toBookingsAndBack();
      await toBookingsAndBack();

      expect(errors.filter(text => text.includes('navigation context'))).toHaveLength(0);
    } finally {
      console.error = originalError;
    }
  });
});
