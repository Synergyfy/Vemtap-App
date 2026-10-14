import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from '@navigation/TabNavigator';
import { navigationRef } from '@navigation/navigationRef';
import {
  compactTypeScale,
  comfortableTypeScale,
  denseTypeScale,
  typeScale,
} from '@theme/typography';

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
// The notifications screen reads its rows from the API rather than a fixture,
// so without this the real hook fires and the dashboard lands on the screen's
// error state instead of the inbox this test is about.
jest.mock('@features/accountHub/hooks/useNotifications', () => ({
  useNotifications: () => ({
    isLoading: false,
    isError: false,
    data: [
      {
        id: 'acct-1',
        title: 'AccountRow',
        message: 'Something happened',
        type: 'system.welcome',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ],
    refetch: jest.fn(),
  }),
  useMarkNotificationRead: () => ({ mutate: jest.fn() }),
  useMarkAllNotificationsRead: () => ({ mutate: jest.fn() }),
  useUnreadNotificationsCount: () => ({ data: 0 }),
}));

// Selector-capable so screens can read the signed-in user, plus `getState` for
// the sign-out path that reads the store outside a component.
jest.mock('@store/authStore', () => ({
  useAuthStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({ user: null, status: 'authenticated', markUnauthenticated: jest.fn() }),
    { getState: () => ({ markUnauthenticated: jest.fn() }) },
  ),
}));

/**
 * Renders the real consumer shell. The personal flow is nested inside the
 * Account tab, so this is the only harness that can prove the bottom navigation
 * is still on screen while a personal page is open.
 */
async function renderAccountStack() {
  const screen = await render(
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>,
  );
  await pressAccountTab(screen);
  return screen;
}

/** Presses the consumer bar's Account tab, wherever its label lives. */
async function pressAccountTab(screen: Awaited<ReturnType<typeof render>>) {
  const accountTab =
    screen.queryAllByLabelText('Account').slice(-1)[0] ??
    screen.queryAllByText('Account').slice(-1)[0];
  await fireEvent.press(accountTab);
}

/**
 * The consumer shell with a handle on its state, so what a tab press actually
 * did — remounted a screen or left it alone — is observable.
 *
 * The app's own container ref is attached rather than a local one, because the
 * re-press rule reads the tree through it: it is the only handle that carries a
 * tab's nested stack, and standing the ref in would test a different wiring than
 * the app ships.
 */
async function renderAccountTabShell() {
  const screen = await render(
    <NavigationContainer ref={navigationRef}>
      <TabNavigator />
    </NavigationContainer>,
  );
  await pressAccountTab(screen);
  return { screen, navigationRef };
}

/** Enough of the navigation tree to walk to a named route's own stack. */
type NavState = {
  index?: number;
  key?: string;
  name?: string;
  routes?: NavState[];
  state?: NavState;
};

function findRoute(state: NavState | undefined, name: string): NavState | undefined {
  const match = state?.routes?.find(route => route.name === name);
  if (match) return match;
  for (const route of state?.routes ?? []) {
    const nested = findRoute(route.state, name);
    if (nested) return nested;
  }
  return undefined;
}

/** The screen the Account tab is showing, with the key proving its identity. */
function accountStackTop(ref: typeof navigationRef) {
  const stack = findRoute(ref?.getRootState() as NavState | undefined, 'Account')?.state;
  const top = stack?.routes?.[stack?.index ?? 0];
  return { name: top?.name, key: top?.key };
}

/** The consumer shell's tab labels. `Account` is omitted — it collides with the
 * hub's own title, so its presence proves nothing. */
const consumerNavLabels = ['Home', 'Deals', 'Business'];

/** True when every consumer tab label is on screen. */
function consumerBarVisible(screen: Awaited<ReturnType<typeof renderAccountStack>>) {
  return consumerNavLabels.every(
    label =>
      screen.queryAllByLabelText(label).length > 0 ||
      screen.queryAllByText(label).length > 0,
  );
}

/** The Activity & Deals Dashboard row pushes the personal overview. */
async function renderDashboard() {
  const screen = await renderAccountStack();
  await fireEvent.press(screen.getByText('Dashboard'));
  return screen;
}

test('Account tab opens the account hub and links to the customer dashboard', async () => {
  const screen = await renderAccountStack();

  expect(screen.getByText('Dashboard')).toBeTruthy();
  expect(screen.getByText('My Deals')).toBeTruthy();
  expect(screen.getByText('Activity & Deals')).toBeTruthy();

  await fireEvent.press(screen.getByText('Dashboard'));
  expect(screen.getByText('Hello, Zainab 👋')).toBeTruthy();
  // The consumer bar stays on screen while the personal page is open.
  expect(consumerBarVisible(screen)).toBe(true);
});

test('a personal page keeps the consumer bar and backs out to Account', async () => {
  const screen = await renderDashboard();

  await fireEvent.press(screen.getByText('Rewards'));
  expect(screen.getByText('Rewards & Loyalty')).toBeTruthy();
  expect(consumerBarVisible(screen)).toBe(true);

  await fireEvent.press(screen.getByLabelText('Go back'));
  expect(screen.getByText('Hello, Zainab 👋')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Go back'));
  expect(screen.getByText('Activity & Deals')).toBeTruthy();
});

test('account hub rows route to their hubs', async () => {
  const screen = await renderAccountStack();

  await fireEvent.press(screen.getByText('Orders & Bookings'));
  expect(screen.getByText('Orders And Bookings')).toBeTruthy();
});

test('Account stack opens on the customer dashboard', async () => {
  const screen = await renderDashboard();

  expect(screen.getByText('Hello, Zainab 👋')).toBeTruthy();
  expect(screen.getByText('Saved Total')).toBeTruthy();
  expect(screen.getByText('Quick Actions')).toBeTruthy();
});

test('dashboard pushes the rewards screen', async () => {
  const screen = await renderDashboard();

  await fireEvent.press(screen.getByText('Rewards'));

  expect(screen.getByText('Rewards & Loyalty')).toBeTruthy();
  expect(screen.queryByText('Hello, Zainab 👋')).toBeNull();
});

test('dashboard pushes my deals', async () => {
  const screen = await renderDashboard();

  await fireEvent.press(screen.getByText('View All My Deals'));

  expect(screen.getByText('Total Savings to Date')).toBeTruthy();
  expect(screen.queryByText('Hello, Zainab 👋')).toBeNull();
});

test('dashboard opens notifications from the header', async () => {
  const screen = await renderDashboard();

  await fireEvent.press(screen.getByLabelText('Notifications'));

  expect(screen.getByText('Notification Preferences')).toBeTruthy();
  expect(screen.getByText('Mark all as read')).toBeTruthy();
});

test('account menu pushes settings and activity', async () => {
  const screen = await renderDashboard();

  await fireEvent.press(screen.getByLabelText('Open account menu'));
  // "More" is both the personal nav tab and the hub heading once the bar is present.
  expect(screen.getAllByText('More').length).toBeGreaterThan(0);

  await fireEvent.press(screen.getByText('My Activity'));
  expect(screen.getByText('User Activity')).toBeTruthy();
});

test('account screens render the comfortable type density', async () => {
  const screen = await renderDashboard();

  const greeting = screen.getByText('Hello, Zainab 👋');
  const styles = Array.isArray(greeting.props.style)
    ? Object.assign({}, ...greeting.props.style.filter(Boolean))
    : (greeting.props.style ?? {});

  expect(styles.fontSize).toBe(comfortableTypeScale['heading-sm'].size);
  expect(styles.lineHeight).toBe(comfortableTypeScale['heading-sm'].lineHeight);
  expect(styles.lineHeight).toBeGreaterThan(compactTypeScale['heading-sm'].lineHeight);
  expect(styles.fontSize).toBeLessThan(typeScale['heading-sm'].size + 1);
});

test('rewards screen tightens one step further than the rest of Account', async () => {
  const screen = await renderDashboard();

  await fireEvent.press(screen.getByText('Rewards'));

  const title = screen.getByText('Rewards & Loyalty');
  const styles = Array.isArray(title.props.style)
    ? Object.assign({}, ...title.props.style.filter(Boolean))
    : (title.props.style ?? {});

  expect(styles.fontSize).toBe(denseTypeScale['heading-sm'].size);
  expect(styles.lineHeight).toBe(denseTypeScale['heading-sm'].lineHeight);
  expect(styles.lineHeight).toBeLessThan(compactTypeScale['heading-sm'].lineHeight);
});

test('rewards balance hero is not oversized', async () => {
  const screen = await renderDashboard();

  await fireEvent.press(screen.getByText('Rewards'));

  const balance = screen.getByText('1,450');
  const styles = Array.isArray(balance.props.style)
    ? Object.assign({}, ...balance.props.style.filter(Boolean))
    : (balance.props.style ?? {});

  expect(styles.fontSize).toBe(denseTypeScale['heading-lg'].size);
  expect(styles.fontSize).toBeLessThan(denseTypeScale['display-mobile'].size);
});

test('rewards card price text is reduced', async () => {
  const screen = await renderDashboard();

  await fireEvent.press(screen.getByText('Rewards'));

  const price = screen.getByText('500 VEM pts');
  const styles = Array.isArray(price.props.style)
    ? Object.assign({}, ...price.props.style.filter(Boolean))
    : (price.props.style ?? {});

  expect(styles.fontSize).toBe(denseTypeScale.caption.size);
  expect(styles.fontSize).toBeLessThan(denseTypeScale['label-sm'].size);
});

test('personal-flow rows keep the consumer bar and back out to Account', async () => {
  const screen = await renderAccountStack();

  // Account hub → My Deals.
  await fireEvent.press(screen.getByText('My Deals'));
  expect(screen.getByText('Total Savings to Date')).toBeTruthy();
  expect(consumerBarVisible(screen)).toBe(true);

  await fireEvent.press(screen.getByLabelText('Go back'));
  expect(screen.getByText('Activity & Deals')).toBeTruthy();
});

test('nested personal pages pop one level at a time, then back to Account', async () => {
  const screen = await renderDashboard();

  // Overview → More → Activity.
  await fireEvent.press(screen.getByLabelText('Open account menu'));
  await fireEvent.press(screen.getByText('My Activity'));
  expect(screen.getByText('User Activity')).toBeTruthy();
  expect(consumerBarVisible(screen)).toBe(true);

  // Activity → More → Overview, then Overview → Account.
  await fireEvent.press(screen.getByLabelText('Go back'));
  expect(screen.queryByText('User Activity')).toBeNull();
  await fireEvent.press(screen.getByLabelText('Go back'));
  expect(screen.getByText('Hello, Zainab 👋')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Go back'));
  expect(screen.getByText('Activity & Deals')).toBeTruthy();
});

test('the Activity & Deals Dashboard row opens the personal overview', async () => {
  const screen = await renderAccountStack();

  await fireEvent.press(screen.getByText('Dashboard'));

  expect(screen.getByText('Hello, Zainab 👋')).toBeTruthy();
  expect(consumerBarVisible(screen)).toBe(true);
});

test('the Activity & Deals Messages row opens the personal inbox', async () => {
  const screen = await renderAccountStack();

  await fireEvent.press(screen.getByText('Messages'));

  expect(screen.getByPlaceholderText('Search conversations, businesses...')).toBeTruthy();
  expect(consumerBarVisible(screen)).toBe(true);

  // Back returns to the Account hub, not the personal overview.
  await fireEvent.press(screen.getByLabelText('Go back'));
  expect(screen.getByText('Activity & Deals')).toBeTruthy();
});

test('re-tapping the focused Account tab on its hub does not reload it', async () => {
  const { screen } = await renderAccountTabShell();

  // The tab opens on the account hub, the base of its own stack.
  expect(screen.getByText('Activity & Deals')).toBeTruthy();
  const before = accountStackTop(navigationRef);
  expect(before.name).toBe('AccountHome');

  await pressAccountTab(screen);

  // Same route key, so the screen was left mounted rather than rebuilt.
  const after = accountStackTop(navigationRef);
  expect(after.name).toBe('AccountHome');
  expect(after.key).toBe(before.key);
});

test('re-tapping the Account tab from a nested screen unwinds to its hub', async () => {
  const { screen } = await renderAccountTabShell();

  await fireEvent.press(screen.getByText('Dashboard'));
  expect(accountStackTop(navigationRef).name).toBe('PersonalHub');

  await pressAccountTab(screen);

  expect(accountStackTop(navigationRef).name).toBe('AccountHome');
});

test('re-tapping a first-time tab still switches onto it', async () => {
  const screen = await render(
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>,
  );

  // Home is the initial tab, so Account has not been opened yet.
  expect(screen.queryByText('Activity & Deals')).toBeNull();
  await pressAccountTab(screen);
  expect(screen.getByText('Activity & Deals')).toBeTruthy();
});
