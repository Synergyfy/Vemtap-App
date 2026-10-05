import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileSetupScreen } from '@features/auth/screens/ProfileSetupScreen';
import { useAuthStore } from '@store/authStore';
import { strings } from '@constants/strings';
import { ApiError } from '@api/ApiError';
import { setTokenPair } from '@utils/secureStorage';

const mockNav = { navigate: jest.fn(), goBack: jest.fn(), reset: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNav,
  useRoute: () => ({ params: { email: 'user@example.com', code: '123456' } }),
}));

// Only the network boundary is faked — the real mutation, store and navigation
// all run, so this exercises the actual signup hand-off.
const mockVerifyAndSetPin = jest.fn();
jest.mock('@api/authApi', () => ({
  customerAuthApi: {
    verifyAndSetPin: (...args: unknown[]) => mockVerifyAndSetPin(...args),
    requestSignupOtp: jest.fn(),
    requestPinReset: jest.fn(),
  },
}));

jest.mock('@utils/secureStorage', () => ({
  setTokenPair: jest.fn(async () => undefined),
  getSecureItem: jest.fn(async () => null),
  clearSecureStorage: jest.fn(async () => undefined),
}));

const SESSION = {
  access_token: 'tok_real',
  user: {
    email: 'user@example.com',
    firstName: 'Ada',
    lastName: 'Test',
    role: 'customer',
    roleTag: '',
    status: 'active',
    uniqueCode: 'CUS-77',
    referralCode: '',
    avatar: '',
    phone: '08012345678',
    jobTitle: '',
    authProvider: 'password',
    googleId: '',
    businessId: '',
    branchId: '',
    lastActive: '',
    isPasswordChanged: false,
    twoFactorEnabled: false,
    optOut: false,
    permissions: [],
    optInChannels: [],
  },
  isNewUser: true,
};

let queryClient: QueryClient;

beforeEach(() => {
  mockVerifyAndSetPin.mockReset();
  mockNav.reset.mockReset();
  mockNav.navigate.mockReset();
  useAuthStore.setState({ user: null, status: 'unknown', pendingOnboarding: false });
});

afterEach(() => {
  cleanup();
  // Each test owns a QueryClient; clearing it releases its retry timers so the
  // file does not hang at teardown.
  queryClient?.clear();
});

async function submitCompleteSetup() {
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  await render(
    <QueryClientProvider client={queryClient}>
      <ProfileSetupScreen />
    </QueryClientProvider>,
  );

  await act(async () => {
    fireEvent.changeText(screen.getByLabelText(strings.auth.profileFirstName), 'Ada');
    fireEvent.changeText(screen.getByLabelText(strings.auth.profileLastName), 'Test');
    fireEvent.changeText(screen.getByLabelText(strings.auth.profilePhone), '08012345678');
    fireEvent.changeText(screen.getByLabelText(strings.auth.profileCreatePin), '123456');
    fireEvent.changeText(screen.getByLabelText(strings.auth.profileConfirmPin), '123456');
    fireEvent.press(screen.getByLabelText(strings.auth.profileConsent));
  });
  await act(async () => {
    fireEvent.press(screen.getByText(strings.auth.profileCompleteSetup));
  });
}

describe('signup hand-off keeps the location step reachable', () => {
  it('does NOT authenticate before the location step runs', async () => {
    mockVerifyAndSetPin.mockResolvedValue(SESSION);
    await submitCompleteSetup();

    await waitFor(() => expect(mockVerifyAndSetPin).toHaveBeenCalled());
    await act(async () => {
      await Promise.resolve();
    });

    const state = useAuthStore.getState();
    // Before: this flipped to 'authenticated' inside the mutation's onSuccess,
    // which unmounted AuthStack and made LocationPermission unreachable.
    expect(state.status).toBe('onboarding');
    expect(state.status).not.toBe('authenticated');
    // The real API user is kept, not a fabricated placeholder.
    expect(state.user?.uniqueCode).toBe('CUS-77');
    expect(state.user?.email).toBe('user@example.com');
  });

  it('navigates to LocationPermission after a successful registration', async () => {
    mockVerifyAndSetPin.mockResolvedValue(SESSION);
    await submitCompleteSetup();

    await waitFor(() =>
      expect(mockNav.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'LocationPermission' }],
      }),
    );
  });

  it('stores the token so requests stay authenticated during onboarding', async () => {
    mockVerifyAndSetPin.mockResolvedValue(SESSION);
    await submitCompleteSetup();
    await waitFor(() =>
      expect(setTokenPair).toHaveBeenCalledWith({ accessToken: 'tok_real' }),
    );
  });

  it('stays signed out and surfaces the server message when the code is wrong', async () => {
    mockVerifyAndSetPin.mockRejectedValue(
      new ApiError('Invalid OTP code', { code: 'Bad Request', status: 400 }),
    );
    await submitCompleteSetup();

    await waitFor(() => expect(screen.getByText('Invalid OTP code')).toBeTruthy());
    expect(useAuthStore.getState().status).not.toBe('authenticated');
    expect(mockNav.reset).not.toHaveBeenCalled();
  });
});
