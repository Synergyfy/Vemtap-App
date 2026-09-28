import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AccountStackNavigator } from '@navigation/TabNavigator';
import {
  compactTypeScale,
  comfortableTypeScale,
  denseTypeScale,
  typeScale,
} from '@theme/typography';

jest.mock('@store/authStore', () => ({
  useAuthStore: { getState: () => ({ markUnauthenticated: jest.fn() }) },
}));

async function renderAccountStack() {
  return render(
    <NavigationContainer>
      <AccountStackNavigator />
    </NavigationContainer>,
  );
}

/** The Account tab now lands on the account hub, which opens the dashboard. */
async function renderDashboard() {
  const screen = await renderAccountStack();
  await fireEvent.press(screen.getByText('Go to Customer Dashboard'));
  return screen;
}

test('Account tab opens the account hub and links to the customer dashboard', async () => {
  const screen = await renderAccountStack();

  expect(screen.getByText('Go to Customer Dashboard')).toBeTruthy();
  expect(screen.getByText('My Deals')).toBeTruthy();
  expect(screen.getByText('Activity & Deals')).toBeTruthy();

  await fireEvent.press(screen.getByText('Go to Customer Dashboard'));
  expect(screen.getByText('Hello, Zainab 👋')).toBeTruthy();
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
  expect(screen.getByText('More')).toBeTruthy();

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
