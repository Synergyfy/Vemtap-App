import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ProfileSetupScreen } from '@features/auth/screens/ProfileSetupScreen';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
};

const mockMutate = jest.fn();
const mockSetSession = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: { email: 'jo@example.com', code: '123456' } }),
}));

jest.mock('@store/authStore', () => ({
  useAuthStore: (selector: (state: { setSession: jest.Mock }) => unknown) =>
    selector({ setSession: mockSetSession }),
}));

jest.mock('@utils/secureStorage', () => ({
  setTokenPair: jest.fn().mockResolvedValue(undefined),
  getSecureItem: jest.fn().mockResolvedValue(null),
  deleteSecureItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@features/auth/hooks/useCustomerRegister', () => ({
  useVerifyAndSetPin: () => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
  }),
  useRequestSignupOtp: () => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  }),
}));

async function fillAndSubmit() {
  const screen = await render(<ProfileSetupScreen />);

  await fireEvent.changeText(screen.getByLabelText('First name'), 'Jo');
  await fireEvent.changeText(screen.getByLabelText('Last name'), 'Ade');
  await fireEvent.changeText(screen.getByLabelText('Phone number'), '8012345678');
  await fireEvent.changeText(screen.getByLabelText('Create 6-digit PIN'), '112233');
  await fireEvent.changeText(screen.getByLabelText('Confirm your 6-digit PIN'), '112233');
  await fireEvent.press(
    screen.getByLabelText('I agree to the VEMTAP Privacy Policy and Terms of Service.'),
  );

  await fireEvent.press(screen.getByText('Complete Setup'));
  return screen;
}

beforeEach(() => {
  mockMutate.mockClear();
  mockNavigation.reset.mockClear();
});

test('verifies the emailed code with the new PIN and profile details', async () => {
  await fillAndSubmit();

  expect(mockMutate).toHaveBeenCalledTimes(1);
  expect(mockMutate.mock.calls[0][0]).toEqual({
    email: 'jo@example.com',
    code: '123456',
    pin: '112233',
    firstName: 'Jo',
    lastName: 'Ade',
    phone: '8012345678',
  });
});

test('continues to location only after the API accepts the registration', async () => {
  await fillAndSubmit();

  expect(mockNavigation.reset).not.toHaveBeenCalled();

  mockMutate.mock.calls[0][1].onSuccess();

  expect(mockNavigation.reset).toHaveBeenCalledWith({
    index: 0,
    routes: [{ name: 'LocationPermission' }],
  });
});

test('blocks submission until the PINs match and consent is given', async () => {
  const screen = await render(<ProfileSetupScreen />);

  await fireEvent.changeText(screen.getByLabelText('First name'), 'Jo');
  await fireEvent.changeText(screen.getByLabelText('Last name'), 'Ade');
  await fireEvent.changeText(screen.getByLabelText('Phone number'), '8012345678');
  await fireEvent.changeText(screen.getByLabelText('Create 6-digit PIN'), '112233');
  await fireEvent.changeText(screen.getByLabelText('Confirm your 6-digit PIN'), '999999');
  await fireEvent.press(
    screen.getByLabelText('I agree to the VEMTAP Privacy Policy and Terms of Service.'),
  );

  await fireEvent.press(screen.getByText('Complete Setup'));

  expect(mockMutate).not.toHaveBeenCalled();
});
