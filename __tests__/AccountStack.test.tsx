import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AccountStackNavigator } from '@navigation/TabNavigator';

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

test('Account stack opens on the customer dashboard', async () => {
  const screen = await renderAccountStack();

  expect(screen.getByText('Hello, Zainab 👋')).toBeTruthy();
  expect(screen.getByText('Saved Total')).toBeTruthy();
  expect(screen.getByText('Quick Actions')).toBeTruthy();
});

test('dashboard pushes the rewards screen', async () => {
  const screen = await renderAccountStack();

  await fireEvent.press(screen.getByText('Rewards'));

  expect(screen.getByText('Rewards & Loyalty')).toBeTruthy();
  expect(screen.queryByText('Hello, Zainab 👋')).toBeNull();
});

test('dashboard pushes my deals', async () => {
  const screen = await renderAccountStack();

  await fireEvent.press(screen.getByText('View All My Deals'));

  expect(screen.getByText('Total Savings to Date')).toBeTruthy();
  expect(screen.queryByText('Hello, Zainab 👋')).toBeNull();
});

test('dashboard opens notifications from the header', async () => {
  const screen = await renderAccountStack();

  await fireEvent.press(screen.getByLabelText('Notifications'));

  expect(screen.getByText('Notification Preferences')).toBeTruthy();
  expect(screen.getByText('Mark all as read')).toBeTruthy();
});

test('account menu pushes settings and activity', async () => {
  const screen = await renderAccountStack();

  await fireEvent.press(screen.getByLabelText('Open account menu'));
  expect(screen.getByText('More')).toBeTruthy();

  await fireEvent.press(screen.getByText('My Activity'));
  expect(screen.getByText('User Activity')).toBeTruthy();
});
