import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ProfileSetupScreen } from '@features/auth/screens/ProfileSetupScreen';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: { email: 'user@example.com', code: '123456' } }),
}));

const mockVerifyAndSetPin = jest.fn();
jest.mock('@features/auth/hooks/useCustomerRegister', () => ({
  useVerifyAndSetPin: () => ({
    mutate: mockVerifyAndSetPin,
    isPending: false,
    error: null,
  }),
  useRequestSignupOtp: () => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  }),
}));

test('toggles PIN visibility and restores filled dots when hidden', async () => {
  const screen = await render(<ProfileSetupScreen />);

  const createPin = screen.getByLabelText('Create 6-digit PIN');
  await fireEvent.changeText(createPin, '1234');

  expect(screen.queryByText('1')).toBeNull();
  expect(screen.queryByText('4')).toBeNull();

  await fireEvent.press(screen.getAllByLabelText('Show PIN')[0]);
  expect(screen.getByText('1')).toBeTruthy();
  expect(screen.getByText('4')).toBeTruthy();

  await fireEvent.press(screen.getAllByLabelText('Hide PIN')[0]);
  expect(screen.queryByText('1')).toBeNull();
});

test('shows a caret on the slot that is being typed into', async () => {
  const screen = await render(<ProfileSetupScreen />);
  const createPin = screen.getByLabelText('Create 6-digit PIN');

  expect(screen.queryByTestId('pin-caret-pin-1')).toBeNull();

  await fireEvent(createPin, 'focus');
  expect(screen.getByTestId('pin-caret-pin-1')).toBeTruthy();

  await fireEvent.changeText(createPin, '12');
  expect(screen.queryByTestId('pin-caret-pin-1')).toBeNull();
  expect(screen.getByTestId('pin-caret-pin-3')).toBeTruthy();

  await fireEvent.changeText(createPin, '123456');
  expect(screen.queryByTestId('pin-caret-pin-7')).toBeNull();

  await fireEvent(createPin, 'blur');
  expect(screen.queryByTestId('pin-caret-pin-7')).toBeNull();
  expect(screen.queryByTestId('pin-caret-pin-1')).toBeNull();
});
