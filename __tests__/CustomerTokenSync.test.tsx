import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCustomerTokenSync } from '@features/auth/hooks/useCustomerTokenSync';

/**
 * The self-heal that keeps customer mode behind a customer token.
 *
 * A token that reverts to its owner side while the app still shows the customer
 * shell turns every CUSTOMER-scoped endpoint into a 403 — bookmarks look inert
 * and the Saved Hub serves whatever the last customer fetch cached. These pin
 * down that a mismatched token is reissued, and that a matching one is left
 * alone (no pointless switch on every foreground).
 */

const mockSwitchRole = jest.fn(async () => ({
  access_token: 'customer-token',
  user: { role: 'Customer', uniqueCode: 'ABC123XYZ' },
}));
const mockSetTokenPair = jest.fn(async () => undefined);
const mockApplyRoleSwitch = jest.fn();

let mockState: Record<string, unknown> = {
  activeMode: 'customer',
  ownerAccount: true,
  user: { uniqueCode: 'ABC123XYZ' },
  tokenRole: null,
  applyRoleSwitch: mockApplyRoleSwitch,
};

jest.mock('@api/authApi', () => ({
  authApi: {
    switchRole: (...args: unknown[]) => mockSwitchRole(...(args as [])),
  },
}));
jest.mock('@utils/secureStorage', () => ({
  getSecureItem: jest.fn(async () => 'owner-token'),
  setTokenPair: (...args: unknown[]) => mockSetTokenPair(...(args as [])),
}));
jest.mock('@store/authStore', () => ({
  useAuthStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) => selector(mockState),
    { getState: () => mockState },
  ),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
    }
  >
    {children}
  </QueryClientProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockState = {
    activeMode: 'customer',
    ownerAccount: true,
    user: { uniqueCode: 'ABC123XYZ' },
    tokenRole: null,
    applyRoleSwitch: mockApplyRoleSwitch,
  };
});

test('reissues a customer token when the stored one is not customer-scoped', async () => {
  mockState.tokenRole = 'Owner';

  await act(async () => {
    renderHook(() => useCustomerTokenSync(), { wrapper });
  });

  await waitFor(() => expect(mockSwitchRole).toHaveBeenCalledWith({ role: 'Customer' }));
  expect(mockSetTokenPair).toHaveBeenCalledWith({ accessToken: 'customer-token' });
  expect(mockApplyRoleSwitch).toHaveBeenCalledWith(
    { role: 'Customer', uniqueCode: 'ABC123XYZ' },
    'customer',
  );
});

test('leaves an already-customer token alone', async () => {
  mockState.tokenRole = 'Customer';

  await act(async () => {
    renderHook(() => useCustomerTokenSync(), { wrapper });
  });

  // No switch on every mount — only when something is actually wrong.
  expect(mockSwitchRole).not.toHaveBeenCalled();
});

test('does nothing while the app is on the business side', async () => {
  mockState.activeMode = 'business';
  mockState.tokenRole = null;

  await act(async () => {
    renderHook(() => useCustomerTokenSync(), { wrapper });
  });

  expect(mockSwitchRole).not.toHaveBeenCalled();
});

test('survives a failed reissue without signing the user out', async () => {
  mockSwitchRole.mockRejectedValueOnce(new Error('network'));
  mockState.tokenRole = 'Owner';

  await act(async () => {
    renderHook(() => useCustomerTokenSync(), { wrapper });
  });

  await waitFor(() => expect(mockSwitchRole).toHaveBeenCalled());
  // The failure is logged and swallowed; the session is untouched.
  expect(mockApplyRoleSwitch).not.toHaveBeenCalled();
});
