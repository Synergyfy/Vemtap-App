import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ProfileSetupScreen } from '@features/auth/screens/ProfileSetupScreen';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: {} }),
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
