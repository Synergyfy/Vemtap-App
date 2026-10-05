import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAccountStatus,
  useRegisterOwner,
  useRequestOwnerOtp,
  useVerifyOwnerOtp,
} from '@features/business/hooks/useOwnerRegistration';

const mockSetTokenPair = jest.fn();
const mockBeginOnboarding = jest.fn();

jest.mock('@utils/secureStorage', () => ({
  setTokenPair: (...args: unknown[]) => mockSetTokenPair(...args),
}));

jest.mock('@store/authStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ beginOnboarding: mockBeginOnboarding }),
}));

jest.mock('@utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const mockRequestOwnerOtp = jest.fn();
const mockVerifyOwnerOtp = jest.fn();
const mockRegisterOwner = jest.fn();
const mockCheckStatus = jest.fn();

// The factory runs while this file's imports are still being evaluated, so the
// mocks are only ever *called* through a delegate — never read eagerly.
jest.mock('@api/ownerAuthApi', () => ({
  ownerAuthApi: {
    requestOwnerOtp: (...args: unknown[]) => mockRequestOwnerOtp(...args),
    verifyOtp: (...args: unknown[]) => mockVerifyOwnerOtp(...args),
    registerOwner: (...args: unknown[]) => mockRegisterOwner(...args),
    checkStatus: (...args: unknown[]) => mockCheckStatus(...args),
  },
  isOtpVerifiedError: (error: unknown) =>
    (error as { message?: string })?.message ===
    'OTP must be verified before completing registration',
}));

let lastRequestOtp: unknown;
let lastVerify: unknown;
let lastRegister: unknown;

function Probe() {
  const requestOtp = useRequestOwnerOtp();
  const verifyOtp = useVerifyOwnerOtp();
  const register = useRegisterOwner();
  const status = useAccountStatus('owner@vemtap-test.dev');

  return (
    <>
      <Text testID="exists">{String(status.data?.exists)}</Text>
      <Pressable
        testID="requestOtp"
        accessibilityRole="button"
        accessibilityLabel="request"
        onPress={() =>
          requestOtp.mutate({ email: 'owner@vemtap-test.dev', role: 'Owner' })
        }
      />
      <Pressable
        testID="verify"
        accessibilityRole="button"
        accessibilityLabel="verify"
        onPress={() => verifyOtp.mutate({ email: 'owner@vemtap-test.dev', code: '1234' })}
      />
      <Pressable
        testID="register"
        accessibilityRole="button"
        accessibilityLabel="register"
        onPress={() =>
          register.mutate({
            email: 'owner@vemtap-test.dev',
            password: 'ProbePass123!',
            businessName: 'Probe Store',
            goals: ['Capture Leads'],
          })
        }
      />
    </>
  );
}

const clients: QueryClient[] = [];

async function renderProbe() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);

  const screen = await render(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  );
  return screen;
}

/** Capture each mutation input so ordering and payloads can be asserted. */
function captureInputs() {
  mockRequestOwnerOtp.mockImplementation(async input => {
    lastRequestOtp = input;
  });
  mockVerifyOwnerOtp.mockImplementation(async input => {
    lastVerify = input;
  });
  mockRegisterOwner.mockImplementation(async input => {
    lastRegister = input;
    return { access_token: 'owner-token', user: { uniqueCode: 'OWNER12345' } };
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  lastRequestOtp = undefined;
  lastVerify = undefined;
  lastRegister = undefined;
  captureInputs();
  mockCheckStatus.mockResolvedValue({ exists: true });
});

afterEach(() => {
  while (clients.length) clients.pop()?.clear();
});

describe('owner registration, step by step', () => {
  it('step 1 sends the email with an Owner role', async () => {
    const screen = await renderProbe();

    await act(async () => fireEvent.press(screen.getByTestId('requestOtp')));
    await waitFor(() => expect(lastRequestOtp).toBeDefined());

    expect(lastRequestOtp).toEqual({ email: 'owner@vemtap-test.dev', role: 'Owner' });
  });

  it('step 2 verifies a 4-character code and does not create the account', async () => {
    const screen = await renderProbe();

    await act(async () => fireEvent.press(screen.getByTestId('verify')));
    await waitFor(() => expect(lastVerify).toBeDefined());

    expect(lastVerify).toEqual({ email: 'owner@vemtap-test.dev', code: '1234' });
    // Verifying the code must never create the owner.
    expect(mockRegisterOwner).not.toHaveBeenCalled();
  });

  it('step 3 persists the session and begins onboarding', async () => {
    const screen = await renderProbe();

    await act(async () => fireEvent.press(screen.getByTestId('register')));
    await waitFor(() => expect(mockSetTokenPair).toHaveBeenCalled());

    expect(mockSetTokenPair).toHaveBeenCalledWith({ accessToken: 'owner-token' });
    expect(mockBeginOnboarding).toHaveBeenCalledWith({
      access_token: 'owner-token',
      user: { uniqueCode: 'OWNER12345' },
    });
  });

  it('step 3 sends the whole business profile collected by the setup screens', async () => {
    const screen = await renderProbe();

    await act(async () => fireEvent.press(screen.getByTestId('register')));
    await waitFor(() => expect(lastRegister).toBeDefined());

    expect(lastRegister).toEqual(
      expect.objectContaining({
        businessName: 'Probe Store',
        goals: ['Capture Leads'],
        email: 'owner@vemtap-test.dev',
      }),
    );
  });

  it('the three steps stay separate — requesting an OTP does not register', async () => {
    const screen = await renderProbe();

    await act(async () => fireEvent.press(screen.getByTestId('requestOtp')));
    await waitFor(() => expect(lastRequestOtp).toBeDefined());

    expect(mockRegisterOwner).not.toHaveBeenCalled();
  });
});

describe('account status polling', () => {
  it('returns the exists flag for the identifier', async () => {
    const screen = await renderProbe();

    await waitFor(() => expect(mockCheckStatus).toHaveBeenCalled());
    expect(mockCheckStatus).toHaveBeenCalledWith('owner@vemtap-test.dev');
    await waitFor(() => expect(screen.getByTestId('exists')).toHaveTextContent('true'));
  });
});
