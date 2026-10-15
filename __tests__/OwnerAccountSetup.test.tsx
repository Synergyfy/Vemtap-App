import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ownerAuthApi } from '@api/ownerAuthApi';
import {
  useRegisterOwnerAccount,
  useUpgradeToOwnerAccount,
} from '@features/business/hooks/useOwnerAccountSetup';
import { useAuthStore } from '@store/authStore';
import { useBusinessOnboardingStore } from '@store/businessOnboardingStore';

/**
 * The setup gate creates/upgrades the account before the profile screens run,
 * so it must send no business fields: sending the empty draft is what failed
 * with 'No API category matches ""'. The business is created after Contact.
 */

const session = {
  access_token: 'token-1',
  user: { id: 'user-1', email: 'new@biz.co', role: 'Owner', uniqueCode: 'U1' },
} as never;

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

afterEach(() => {
  jest.restoreAllMocks();
  useAuthStore.setState({ status: 'unauthenticated', user: null } as never);
  useBusinessOnboardingStore.getState().reset();
});

it('registers a new owner account with only email and password', async () => {
  const registerOwner = jest
    .spyOn(ownerAuthApi, 'registerOwner')
    .mockResolvedValue(session);
  useBusinessOnboardingStore
    .getState()
    .setCredentials({ email: 'new@biz.co', password: 'Secret123!' });

  const { result } = await renderHook(() => useRegisterOwnerAccount(), { wrapper });
  await act(async () => {
    await result.current.register({ email: 'new@biz.co', password: 'Secret123!' });
  });

  expect(registerOwner).toHaveBeenCalledWith({
    email: 'new@biz.co',
    password: 'Secret123!',
  });
  // Signed in for the rest of the wizard, and the password is no longer kept.
  expect(useAuthStore.getState().status).toBe('onboarding');
  expect(useBusinessOnboardingStore.getState().credentials.password).toBeUndefined();
});

it('upgrades a customer with only their password', async () => {
  const upgradeToOwner = jest
    .spyOn(ownerAuthApi, 'upgradeToOwner')
    .mockResolvedValue(session);

  const { result } = await renderHook(() => useUpgradeToOwnerAccount(), { wrapper });
  await act(async () => {
    await result.current.mutateAsync({ password: 'Secret123!' });
  });

  expect(upgradeToOwner).toHaveBeenCalledWith({ password: 'Secret123!' });
  expect(useAuthStore.getState().status).toBe('authenticated');
});

it('upgrades a Google-only customer with no password at all', async () => {
  const upgradeToOwner = jest
    .spyOn(ownerAuthApi, 'upgradeToOwner')
    .mockResolvedValue(session);

  const { result } = await renderHook(() => useUpgradeToOwnerAccount(), { wrapper });
  await act(async () => {
    await result.current.mutateAsync({});
  });

  expect(upgradeToOwner).toHaveBeenCalledWith({});
});
