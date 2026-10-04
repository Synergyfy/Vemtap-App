import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { ForgotPinScreen } from '@features/auth/screens/ForgotPinScreen';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRequestPinReset = jest.fn();
const mockResetPin = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('@features/auth/hooks/useCustomerRegister', () => ({
  useRequestPinReset: () => ({
    mutate: mockRequestPinReset,
    isPending: false,
    error: null,
  }),
  useResetPin: () => ({
    mutate: mockResetPin,
    isPending: false,
    error: null,
  }),
}));

beforeEach(() => {
  mockRequestPinReset.mockClear();
  mockResetPin.mockClear();
  mockNavigation.goBack.mockClear();
});

test('rejects an invalid email before calling the API', async () => {
  const screen = await render(<ForgotPinScreen />);

  await fireEvent.changeText(screen.getByTestId('forgot-pin-email'), 'not-an-email');
  await fireEvent.press(screen.getByText('Send reset code'));

  expect(mockRequestPinReset).not.toHaveBeenCalled();
  expect(screen.getByText('Enter a valid email address')).toBeTruthy();
});

test('requests the reset code and moves to the code phase on success', async () => {
  const screen = await render(<ForgotPinScreen />);

  await fireEvent.changeText(screen.getByTestId('forgot-pin-email'), 'jo@example.com');
  await fireEvent.press(screen.getByText('Send reset code'));

  expect(mockRequestPinReset).toHaveBeenCalledTimes(1);
  expect(mockRequestPinReset.mock.calls[0][0]).toEqual({ email: 'jo@example.com' });

  await act(async () => mockRequestPinReset.mock.calls[0][1].onSuccess());

  expect(screen.getByLabelText('New 6-digit PIN')).toBeTruthy();
  expect(screen.getByLabelText('Confirm new 6-digit PIN')).toBeTruthy();
});

test('submits the code and new PIN, then unlocks sign in', async () => {
  const screen = await render(<ForgotPinScreen />);

  await fireEvent.changeText(screen.getByTestId('forgot-pin-email'), 'jo@example.com');
  await fireEvent.press(screen.getByText('Send reset code'));
  await act(async () => mockRequestPinReset.mock.calls[0][1].onSuccess());

  await fireEvent.changeText(screen.getByLabelText('Reset code'), '123456');
  await fireEvent.changeText(screen.getByLabelText('New 6-digit PIN'), '445566');
  await fireEvent.changeText(screen.getByLabelText('Confirm new 6-digit PIN'), '445566');
  await fireEvent.press(screen.getByRole('button', { name: 'Reset PIN' }));

  expect(mockResetPin).toHaveBeenCalledTimes(1);
  expect(mockResetPin.mock.calls[0][0]).toEqual({
    email: 'jo@example.com',
    otp: '123456',
    newPin: '445566',
  });
  expect(mockNavigation.goBack).not.toHaveBeenCalled();

  await act(async () => mockResetPin.mock.calls[0][1].onSuccess());

  expect(
    screen.getByText('Your PIN has been reset. Sign in with your new PIN.'),
  ).toBeTruthy();
});

test('blocks the reset until both PINs match', async () => {
  const screen = await render(<ForgotPinScreen />);

  await fireEvent.changeText(screen.getByTestId('forgot-pin-email'), 'jo@example.com');
  await fireEvent.press(screen.getByText('Send reset code'));
  await act(async () => mockRequestPinReset.mock.calls[0][1].onSuccess());

  await fireEvent.changeText(screen.getByLabelText('Reset code'), '123456');
  await fireEvent.changeText(screen.getByLabelText('New 6-digit PIN'), '445566');
  await fireEvent.changeText(screen.getByLabelText('Confirm new 6-digit PIN'), '999999');
  await fireEvent.press(screen.getByRole('button', { name: 'Reset PIN' }));

  expect(mockResetPin).not.toHaveBeenCalled();
});
