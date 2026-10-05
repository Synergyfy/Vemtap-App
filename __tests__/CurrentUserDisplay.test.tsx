import React from 'react';
import { render } from '@testing-library/react-native';
import { userSchema } from '@api/authApi';
import { strings } from '@constants/strings';
import { useAuthStore } from '@store/authStore';
import { AccountSettingsSecurityScreen } from '@features/accountHub/screens/AccountSettingsSecurityScreen';
import { AccountHomeScreen } from '@features/accountHub/screens/AccountHomeScreen';
import { CustomerDashboardScreen } from '@features/accountHub/screens/CustomerDashboardScreen';
import { EditProfileScreen } from '@features/accountHub/screens/EditProfileScreen';
import { MoreHubScreen } from '@features/accountHub/screens/MoreHubScreen';

/** The account the signup flow created — first/last name, phone, email. */
const signedInUser = userSchema.parse({
  email: 'ada.okon@example.com',
  firstName: 'Ada',
  lastName: 'Okon',
  phone: '0801 111 2222',
});

beforeEach(() => {
  useAuthStore.setState({ user: signedInUser, status: 'authenticated' });
});

afterEach(() => {
  useAuthStore.setState({ user: null, status: 'unauthenticated' });
});

test('the dashboard navbar greets the signed-in customer by first name', async () => {
  const screen = await render(<CustomerDashboardScreen />);

  expect(screen.getByText('Hello, Ada 👋')).toBeTruthy();
  expect(screen.queryByText(strings.customerDashboard.greeting)).toBeNull();
});

test('the More hub prints the real name, initials, email and phone', async () => {
  const screen = await render(<MoreHubScreen />);

  expect(screen.getByText('AO')).toBeTruthy();
  expect(screen.getByText('Ada Okon')).toBeTruthy();
  expect(screen.getByText('ada.okon@example.com')).toBeTruthy();
  expect(screen.getByText('0801 111 2222')).toBeTruthy();
});

test('edit profile starts from the signup values', async () => {
  const screen = await render(<EditProfileScreen />);

  expect(screen.getByLabelText('First Name').props.value).toBe('Ada');
  expect(screen.getByLabelText('Last Name').props.value).toBe('Okon');
  expect(screen.getByLabelText('Email Address').props.value).toBe('ada.okon@example.com');
  expect(screen.getByLabelText('Phone Number').props.value).toBe('0801 111 2222');
  expect(screen.getByText('AO')).toBeTruthy();
});

test('settings composes its account, SMS and email lines from the user', async () => {
  const screen = await render(<AccountSettingsSecurityScreen />);

  expect(screen.getByText('Ada Okon • 0801 111 2222 • Verified')).toBeTruthy();
  expect(screen.getByText('Codes for sign-ins to 0801 111 2222')).toBeTruthy();
  expect(screen.getByText('Sent to ada.okon@example.com')).toBeTruthy();
});

test('the marketplace account hub prints the real name, initials, email and phone', async () => {
  const screen = await render(<AccountHomeScreen />);

  expect(screen.getByText('AO')).toBeTruthy();
  expect(screen.getByText('Ada Okon')).toBeTruthy();
  expect(screen.getByText('ada.okon@example.com')).toBeTruthy();
  expect(screen.getByText('0801 111 2222')).toBeTruthy();
});

test('with no stored user the design placeholder still fills every slot', async () => {
  useAuthStore.setState({ user: null, status: 'unauthenticated' });

  const dashboard = await render(<CustomerDashboardScreen />);
  expect(dashboard.getByText('Hello, Zainab 👋')).toBeTruthy();

  const more = await render(<MoreHubScreen />);
  expect(more.getByText('ZA')).toBeTruthy();
  expect(more.getByText('Zainab Ahmed')).toBeTruthy();
  expect(more.getByText('zainab.ahmed@example.com')).toBeTruthy();
  expect(more.getByText('+234 803 555 0192')).toBeTruthy();

  const account = await render(<AccountHomeScreen />);
  expect(account.getByText('ZA')).toBeTruthy();
  expect(account.getByText('Zainab Ahmed')).toBeTruthy();
  expect(account.getByText('zainab.ahmed@example.com')).toBeTruthy();
  expect(account.getByText('+234 803 555 0192')).toBeTruthy();
});
