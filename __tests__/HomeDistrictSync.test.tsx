import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { authApi } from '@api/authApi';
import { districtsApi } from '@api/districtsApi';
import { useHomeDistrictSync } from '@features/home/hooks/useHomeDistrictSync';
import { useAuthStore } from '@store/authStore';
import { useLocationStore } from '@store/locationStore';

const DISTRICTS = [
  { id: 'd-apo', name: 'Apo', latitude: 9.0765, longitude: 7.5186, radiusMeters: 2500 },
  {
    id: 'd-wuse',
    name: 'Wuse 2',
    latitude: 9.087,
    longitude: 7.4805,
    radiusMeters: 2500,
  },
];

function renderSync() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useHomeDistrictSync(), { wrapper });
}

function signIn(tokenRole: string | null) {
  useAuthStore.setState({
    tokenRole,
    user: { id: '3f0c8a4e-6b1d-4c2a-9e7f-1a2b3c4d5e6f' } as never,
  });
}

describe('home district sync', () => {
  let update: jest.SpyInstance;
  let list: jest.SpyInstance;

  beforeEach(() => {
    useLocationStore.getState().setArea('Apo');
    list = jest.spyOn(districtsApi, 'list').mockResolvedValue(DISTRICTS);
    update = jest.spyOn(authApi, 'updateProfile').mockResolvedValue({} as never);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    useAuthStore.setState({ tokenRole: null, user: null });
  });

  it('saves the chosen area as the signed-in customer’s home district', async () => {
    signIn('Customer');
    await renderSync();
    await waitFor(() => expect(update).toHaveBeenCalledWith({ homeDistrictId: 'd-apo' }));

    await act(async () => useLocationStore.getState().setArea('Wuse 2'));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({ homeDistrictId: 'd-wuse' }),
    );
    expect(update).toHaveBeenCalledTimes(2);
  });

  it('does not save the same district twice', async () => {
    signIn('Customer');
    await renderSync();
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));

    await act(async () => useLocationStore.getState().setRadiusKm(10));
    await act(async () => useLocationStore.getState().setArea('Apo'));
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('does nothing when signed out or holding an owner token', async () => {
    signIn(null);
    await renderSync();
    signIn('Owner');
    await renderSync();
    await act(async () => undefined);
    expect(list).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('skips an area that has no district', async () => {
    signIn('Customer');
    list.mockResolvedValue([DISTRICTS[1]]);
    await renderSync();
    await waitFor(() => expect(list).toHaveBeenCalled());
    await act(async () => undefined);
    expect(update).not.toHaveBeenCalled();
  });
});
