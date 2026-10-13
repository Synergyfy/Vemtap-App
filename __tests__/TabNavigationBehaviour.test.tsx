import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { BusinessTabNavigator } from '@navigation/BusinessTabNavigator';
import { NavigationHistoryTracker } from '@navigation/useHistoryBack';
import { navigationRef } from '@navigation/navigationRef';
import { useNavigationHistory } from '@navigation/navigationHistory';
import { strings } from '@constants/strings';

/**
 * The two tab behaviours, exercised on the real business shell:
 *
 *  1. Switching away from a nested screen and back keeps you where you were
 *     (deliberate, and the reason the reset below has to be a *re-tap*).
 *  2. Re-tapping the focused tab returns it to its base screen.
 *  3. Back crosses tab boundaries: leave Orders mid-flow, open something in
 *     another tab, press back, and you land on the Orders screen you came from.
 */

const shell = strings.businessShell;

afterEach(() => {
  cleanup();
  useNavigationHistory.getState().reset();
});

async function renderShell() {
  // The ref matters: React Navigation only routes an action that carries a
  // `target` through the container, and RootNavigator attaches it in the app.
  await render(
    <NavigationContainer ref={navigationRef}>
      <BusinessTabNavigator />
      <NavigationHistoryTracker />
    </NavigationContainer>,
  );
}

const pressLabel = async (label: string) => {
  await act(async () => {
    fireEvent.press(screen.getByLabelText(label));
  });
};

/**
 * Presses a business tab in the bar itself. Hubs reuse a tab's label in their
 * own controls — the Orders hub has an Orders/Bookings switcher, also a tab —
 * so the bar item is the last one: the bar is rendered after the screen it
 * shows, which is the same convention the consumer harness relies on.
 */
const pressTab = async (label: string) => {
  const barItem = screen.getAllByRole('tab', { name: label }).slice(-1)[0];
  await act(async () => {
    fireEvent.press(barItem);
  });
};

async function openOrdersNested() {
  await pressLabel(shell.tabs.orders);
  // The alert card is the Orders tab's entry into the POS register: a real
  // nested screen inside the Orders stack.
  await act(async () => {
    fireEvent.press(
      screen.queryByLabelText(strings.businessOrders.alertTitle) ??
        screen.getByLabelText(strings.businessOrders.alertTitleFor(0)),
    );
  });
}

/**
 * The screen a business tab is showing, with the route key that proves whether
 * it is the same screen or a rebuilt one. A re-tap that rebuilds its tab leaves
 * a different key behind even though the screen looks identical.
 */
function tabBase(tab: string) {
  const walk = (state: unknown): { name: string; key: string } | undefined => {
    const node = state as
      { routes?: { name?: string; key?: string; state?: unknown }[] } | undefined;
    const match = node?.routes?.find(route => route.name === tab);
    if (match) {
      // The screen on top of the tab's own stack is what the user sees.
      const stack = match.state as
        { index?: number; routes?: { name?: string; key?: string }[] } | undefined;
      const top = stack?.routes?.[stack?.index ?? 0];
      return top as { name: string; key: string } | undefined;
    }
    for (const route of node?.routes ?? []) {
      const nested = walk(route.state);
      if (nested) return nested;
    }
    return undefined;
  };
  const { getRootState } = navigationRef as {
    getRootState: () => unknown;
  };
  return walk(getRootState());
}

describe('business tab navigation', () => {
  it('restores the nested screen when you switch tabs and come back', async () => {
    await renderShell();
    await openOrdersNested();
    expect(screen.getByText(strings.businessPos.title)).toBeTruthy();

    await pressLabel(shell.tabs.more);
    await pressLabel(shell.tabs.orders);

    // Still the nested POS screen, not the Orders base.
    expect(screen.getByText(strings.businessPos.title)).toBeTruthy();
  });

  it('returns the focused tab to its base screen on a second tap', async () => {
    await renderShell();
    await openOrdersNested();
    expect(screen.getByText(strings.businessPos.title)).toBeTruthy();

    await pressLabel(shell.tabs.orders);

    // The nested POS screen is gone and the Orders hub is showing again.
    expect(screen.queryByText(strings.businessPos.title)).toBeNull();
    expect(screen.getAllByText(shell.tabs.orders).length).toBeGreaterThan(0);
    expect(
      screen.getByLabelText(
        screen.queryByLabelText(strings.businessOrders.alertTitle)
          ? strings.businessOrders.alertTitle
          : strings.businessOrders.alertTitleFor(0),
      ),
    ).toBeTruthy();
  });

  it('does nothing when a focused tab is re-tapped on its base screen', async () => {
    // A re-tap normally unwinds the tab, but on a tab that already rests on its
    // base screen there is nothing to unwind. Rebuilding it anyway would remount
    // a screen the merchant is already looking at, which reads as a reload.
    await renderShell();
    await pressTab(shell.tabs.orders);
    const before = tabBase('BusinessOrders');
    expect(before?.name).toBe('BusinessOrdersHome');

    await pressTab(shell.tabs.orders);

    // Same route key, so the hub was left mounted rather than torn down.
    expect(tabBase('BusinessOrders')?.key).toBe(before?.key);
    expect(screen.getAllByText(shell.tabs.orders).length).toBeGreaterThan(0);
  });

  it('leaves other tabs alone when one is re-tapped', async () => {
    await renderShell();
    await openOrdersNested();
    await pressLabel(shell.tabs.more);
    expect(screen.getAllByText(strings.businessMore.title).length).toBeGreaterThan(0);

    // More is a single-screen tab, so re-tapping it must not disturb Orders'
    // nested stack.
    await pressLabel(shell.tabs.more);
    await pressLabel(shell.tabs.orders);
    expect(screen.getByText(strings.businessPos.title)).toBeTruthy();
  });

  it('records tab hops with the tab each screen belongs to', async () => {
    await renderShell();
    await openOrdersNested();
    await pressLabel(shell.tabs.more);

    const { past, present } = useNavigationHistory.getState();
    expect(present?.tab).toBeTruthy();
    expect(past.some(entry => entry.tab && entry.screen)).toBe(true);
  });

  it('backs out of a screen to the one it was opened from', async () => {
    await renderShell();
    await openOrdersNested();
    expect(screen.getByText(strings.businessPos.title)).toBeTruthy();

    // Leave the Orders tab mid-flow, then open a screen from the More tab.
    await pressLabel(shell.tabs.more);
    await pressLabel(strings.businessMore.switchToCustomer);
    expect(screen.getByText(strings.switchToCustomer.title)).toBeTruthy();

    // Back returns to the More hub — the screen the row was tapped from — even
    // though the Orders stack is still parked on the POS screen behind it.
    await pressLabel('Go back');
    expect(screen.getAllByText(strings.businessMore.title).length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(screen.queryByText(strings.switchToCustomer.title)).toBeNull(),
    );

    // The Orders tab is untouched by all of that.
    await pressLabel(shell.tabs.orders);
    expect(screen.getByText(strings.businessPos.title)).toBeTruthy();
  });

  it('navigates without the deprecated object form', async () => {
    // `CommonActions.navigate({ name, params })` is the old signature: React
    // Navigation logs "Passing an object as the argument to 'navigate' is
    // deprecated" for it on every cross-tab back, so the warning is asserted
    // against rather than trusted.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await renderShell();
    await openOrdersNested();
    await pressLabel(shell.tabs.more);
    await pressLabel(strings.businessMore.switchToCustomer);
    await pressLabel('Go back');

    const deprecations = warn.mock.calls.filter(call =>
      String(call[0]).includes("argument to 'navigate'"),
    );
    expect(deprecations).toEqual([]);
    warn.mockRestore();
  });

  it('falls back to an ordinary pop when nothing is recorded', async () => {
    await renderShell();
    useNavigationHistory.getState().reset();

    await pressLabel(shell.tabs.more);
    await pressLabel(strings.businessMore.switchToCustomer);
    expect(screen.getByText(strings.switchToCustomer.title)).toBeTruthy();

    // With an empty history the navigator's own goBack() takes over, so the
    // screen still closes instead of the press doing nothing.
    await pressLabel('Go back');
    await waitFor(() =>
      expect(screen.queryByText(strings.switchToCustomer.title)).toBeNull(),
    );
  });

  it('never lets a visited tab hijack an in-stack back', async () => {
    // The reported bug: on a nested Orders screen, visit another tab, come back
    // to Orders (you are still on the nested screen, which is correct), and
    // press back. The navigator can pop that stack, so it must pop back to the
    // Orders hub — landing on the tab you visited in between is the bug.
    await renderShell();
    await openOrdersNested();
    expect(screen.getByText(strings.businessPos.title)).toBeTruthy();

    await pressLabel(shell.tabs.more);
    await pressLabel(shell.tabs.orders);
    expect(screen.getByText(strings.businessPos.title)).toBeTruthy();

    await pressLabel('Go back');

    // Back to the Orders hub (the alert card is its own content again), and NOT
    // left on the More tab we visited in between.
    await waitFor(() => expect(screen.queryByText(strings.businessPos.title)).toBeNull());
    expect(
      screen.getByLabelText(
        screen.queryByLabelText(strings.businessOrders.alertTitle)
          ? strings.businessOrders.alertTitle
          : strings.businessOrders.alertTitleFor(0),
      ),
    ).toBeTruthy();
  });

  it('pops the in-stack back even when a foreign tab sits at the top of history', async () => {
    // Belt and braces for the same rule, forced deterministically: the recorded
    // history is seeded so its newest entry belongs to another tab, exactly the
    // stale state the bug produced. A live navigator that can pop outranks it.
    await renderShell();
    await openOrdersNested();
    expect(screen.getByText(strings.businessPos.title)).toBeTruthy();

    // present is the Orders POS screen we are actually looking at; the newest
    // past entry belongs to another tab, so old code would jump to it.
    useNavigationHistory.setState({
      past: [{ tab: shell.tabs.more, screen: 'BusinessMoreHome', stackKey: 'more' }],
      present: {
        tab: shell.tabs.orders,
        screen: 'BusinessPosOrders',
        stackKey: 'orders',
      },
    });

    await pressLabel('Go back');

    // The pop won: we are on the Orders hub, not the seeded More entry.
    await waitFor(() => expect(screen.queryByText(strings.businessPos.title)).toBeNull());
    expect(
      screen.getByLabelText(
        screen.queryByLabelText(strings.businessOrders.alertTitle)
          ? strings.businessOrders.alertTitle
          : strings.businessOrders.alertTitleFor(0),
      ),
    ).toBeTruthy();
  });

  it('unwinds a tab whose nested screen arrived through a cross-tab hop', async () => {
    // A screen inside one stack hops to a route in a sibling stack the way
    // `useBusinessNavigation` does: through the tab navigator, which parks the
    // target screen as params on the tab route. The Orders tab is then sitting
    // on a POS screen with nothing underneath it, so re-tapping it has to
    // rebuild the tab rather than pop to a base that never existed.
    await renderShell();
    await pressLabel(shell.tabs.more);
    await pressLabel(strings.businessMore.switchToCustomer);
    expect(screen.getByText(strings.switchToCustomer.title)).toBeTruthy();

    await act(async () => {
      // BusinessPosOrders lives in the Orders stack, we are pressed into More:
      // the hop addresses the tab and names the screen inside it, which is what
      // leaves the screen parked as params on the tab route.
      const { navigate } = navigationRef as {
        navigate: (name: string, params?: object) => void;
      };
      navigate('BusinessOrders', { screen: 'BusinessPosOrders' });
    });
    await waitFor(() => expect(screen.getByText(strings.businessPos.title)).toBeTruthy());

    await pressLabel(shell.tabs.orders);

    await waitFor(() => expect(screen.queryByText(strings.businessPos.title)).toBeNull());
    expect(
      screen.getByLabelText(
        screen.queryByLabelText(strings.businessOrders.alertTitle)
          ? strings.businessOrders.alertTitle
          : strings.businessOrders.alertTitleFor(0),
      ),
    ).toBeTruthy();
  });
});
