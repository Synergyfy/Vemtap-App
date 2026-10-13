import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ProfileSetupScreen } from '@features/auth/screens/ProfileSetupScreen';
import { RegisterScreen } from '@features/auth/screens/RegisterScreen';
import { SignInScreen } from '@features/auth/screens/SignInScreen';
import { useAuthStore } from '@store/authStore';
import { strings } from '@constants/strings';

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), reset: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: { email: 'user@example.com', code: '123456' } }),
}));

const mockMutate = jest.fn();
const mockRequestOtpError = { current: null as { message: string } | null };
jest.mock('@features/auth/hooks/useCustomerRegister', () => ({
  useVerifyAndSetPin: () => ({
    mutate: mockMutate,
    isPending: false,
    error: mockRequestOtpError.current,
  }),
  useRequestSignupOtp: () => ({
    mutate: jest.fn(),
    isPending: false,
    error: mockRequestOtpError.current,
  }),
}));

beforeEach(() => {
  mockMutate.mockReset();
  mockNavigation.navigate.mockReset();
  mockNavigation.goBack.mockReset();
  mockNavigation.reset.mockReset();
  mockRequestOtpError.current = null;
  useAuthStore.setState({ user: null, status: 'unknown', pendingOnboarding: false });
});

async function fillEverything() {
  await act(async () => {
    fireEvent.changeText(screen.getByLabelText(strings.auth.profileFirstName), 'Ada');
    fireEvent.changeText(screen.getByLabelText(strings.auth.profileLastName), 'Test');
    fireEvent.changeText(screen.getByLabelText(strings.auth.profilePhone), '08012345678');
    fireEvent.changeText(screen.getByLabelText(strings.auth.profileCreatePin), '123456');
    fireEvent.changeText(screen.getByLabelText(strings.auth.profileConfirmPin), '123456');
    fireEvent.press(screen.getByLabelText(strings.auth.profileConsent));
  });
}

describe('ProfileSetup "Complete Setup" always explains itself', () => {
  // This is the reported symptom: pressing a disabled button is indistinguishable
  // from a broken tap, because nothing on screen said why it was disabled.
  it('names the first missing requirement instead of failing silently', async () => {
    await render(<ProfileSetupScreen />);
    expect(screen.getByText(strings.auth.profileNeedsFirstName)).toBeTruthy();
  });

  it('advances the requirement message as fields are filled', async () => {
    await render(<ProfileSetupScreen />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText(strings.auth.profileFirstName), 'Ada');
    });
    expect(screen.getByText(strings.auth.profileNeedsLastName)).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText(strings.auth.profileLastName), 'Test');
    });
    expect(screen.getByText(strings.auth.profileNeedsPhone)).toBeTruthy();

    // Still too short: the phone requirement is reported until it is satisfied.
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText(strings.auth.profilePhone), '080');
    });
    expect(screen.getByText(strings.auth.profileNeedsPhone)).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(
        screen.getByLabelText(strings.auth.profilePhone),
        '08012345678',
      );
    });
    expect(screen.getByText(strings.auth.profileNeedsPin)).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(
        screen.getByLabelText(strings.auth.profileCreatePin),
        '123456',
      );
      fireEvent.changeText(
        screen.getByLabelText(strings.auth.profileConfirmPin),
        '654321',
      );
    });
    // PinInput owns the mismatch message, so it appears exactly once.
    expect(screen.getAllByText(strings.auth.profilePinMismatch)).toHaveLength(1);

    await act(async () => {
      fireEvent.changeText(
        screen.getByLabelText(strings.auth.profileConfirmPin),
        '123456',
      );
    });
    expect(screen.getByText(strings.auth.profileNeedsConsent)).toBeTruthy();
  });

  it('clears the requirement message once everything is satisfied', async () => {
    await render(<ProfileSetupScreen />);
    await fillEverything();
    expect(screen.queryByText(strings.auth.profileNeedsConsent)).toBeNull();
    expect(screen.queryByText(strings.auth.profileNeedsPin)).toBeNull();
  });

  it('submits once the form is complete', async () => {
    await render(<ProfileSetupScreen />);
    await fillEverything();

    await act(async () => {
      fireEvent.press(screen.getByText(strings.auth.profileCompleteSetup));
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0]).toMatchObject({
      email: 'user@example.com',
      code: '123456',
      pin: '123456',
      firstName: 'Ada',
      lastName: 'Test',
      phone: '08012345678',
    });
  });

  it('shows the server message when the code or PIN is rejected', async () => {
    mockRequestOtpError.current = new Error('Invalid OTP code');
    await render(<ProfileSetupScreen />);
    // The server's own wording reaches the user rather than a generic fallback.
    expect(screen.getByText('Invalid OTP code')).toBeTruthy();
  });
});

describe('Register screen', () => {
  it('surfaces a failed code request instead of silently resetting the button', async () => {
    mockRequestOtpError.current = new Error('Email already registered');
    await render(<RegisterScreen />);
    expect(screen.getByText('Email already registered')).toBeTruthy();
  });

  it('links to Sign In', async () => {
    await render(<RegisterScreen />);
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.common.signIn));
    });
    expect(mockNavigation.navigate).toHaveBeenCalledWith('SignIn');
  });

  it('has no dead social-auth CTA', async () => {
    await render(<RegisterScreen />);
    // No auth SDK is installed, so the button used to be inert.
    expect(screen.queryByLabelText('Continue with Google')).toBeNull();
  });
});

describe('action buttons enable as the user types', () => {
  const continueDisabled = () =>
    screen.getByRole('button', { name: strings.auth.registerContinue }).props
      .accessibilityState?.disabled;

  it('enables Continue on the register screen while the email input is still focused', async () => {
    await render(<RegisterScreen />);
    expect(continueDisabled()).toBe(true);

    fireEvent.changeText(
      screen.getByLabelText(strings.auth.registerEmailLabel),
      'ada@example.com',
    );

    await waitFor(() => expect(continueDisabled()).toBe(false));
  });

  it('disables Continue again when the email is cleared', async () => {
    await render(<RegisterScreen />);
    const input = screen.getByLabelText(strings.auth.registerEmailLabel);
    fireEvent.changeText(input, 'ada@example.com');
    await waitFor(() => expect(continueDisabled()).toBe(false));

    fireEvent.changeText(input, '');
    await waitFor(() => expect(continueDisabled()).toBe(true));
  });

  it('enables Sign In once credentials are valid, without blurring first', async () => {
    await render(<SignInScreen />);
    const signInDisabled = () =>
      screen.getByRole('button', { name: strings.common.signIn }).props.accessibilityState
        ?.disabled;
    expect(signInDisabled()).toBe(true);

    fireEvent.changeText(
      screen.getByLabelText(strings.auth.signInIdentifierLabel),
      'ada@example.com',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(strings.auth.signInCredentialPlaceholder),
      'secret123',
    );

    await waitFor(() => expect(signInDisabled()).toBe(false));
  });
});

describe('auth store onboarding state', () => {
  const session = {
    access_token: 'tok',
    user: { email: 'a@b.com', firstName: 'A', lastName: 'B' },
    isNewUser: true,
  } as never;

  it('holds a registered account in onboarding until the location step runs', () => {
    useAuthStore.getState().beginOnboarding(session);
    const state = useAuthStore.getState();
    expect(state.status).toBe('onboarding');
    expect(state.pendingOnboarding).toBe(true);
  });

  it('signs in immediately, even when the API flags the user as new', () => {
    // Sign-in must never re-trigger onboarding: a returning customer carrying
    // `isNewUser` would otherwise be pushed back into the signup flow.
    useAuthStore.getState().setSession(session);
    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.pendingOnboarding).toBe(false);
  });

  it('promotes to authenticated only when onboarding completes', () => {
    useAuthStore.getState().beginOnboarding(session);
    expect(useAuthStore.getState().status).toBe('onboarding');

    useAuthStore.getState().completeOnboarding();
    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.pendingOnboarding).toBe(false);
    // The real user survives the promotion.
    expect(state.user).toEqual((session as { user: unknown }).user);
  });

  it('clears onboarding state on sign-out', () => {
    useAuthStore.getState().beginOnboarding(session);
    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState()).toMatchObject({
      status: 'unauthenticated',
      user: null,
      pendingOnboarding: false,
    });
  });
});
