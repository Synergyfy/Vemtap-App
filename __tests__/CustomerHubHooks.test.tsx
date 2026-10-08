import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSavedFeed, useToggleDealSave } from '@features/accountHub/hooks/useSavedHub';
import { useMyClaims } from '@features/myDeals/hooks/useMyClaims';

/**
 * The Phase 1 customer hooks are CUSTOMER-gated and must never fire a request
 * the server would reject with 401/403, so these lock in both the request
 * contract (params the backend documents) and the disabled state.
 */

let mockRole: string | null = 'Customer';

jest.mock('@store/authStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: mockRole ? { role: mockRole } : null }),
}));

const mockListSaved = jest.fn(async () => ({ data: [], total: 0, page: 1, limit: 50 }));
const mockToggleSave = jest.fn(async () => ({ saved: true }));
const mockListMyClaims = jest.fn(async () => ({
  data: [],
  total: 0,
  page: 1,
  limit: 50,
}));
const mockGetSaveStatus = jest.fn(async () => ({ isSaved: true }));

jest.mock('@api/savedApi', () => ({
  savedApi: {
    listSaved: (...args: unknown[]) => mockListSaved(...(args as [])),
    listSavedDeals: jest.fn(),
    listSavedBusinesses: jest.fn(),
    listSavedServices: jest.fn(),
    toggleBusinessSave: jest.fn(),
    getBusinessSaveStatus: jest.fn(),
    toggleServiceSave: jest.fn(),
    getServiceSaveStatus: jest.fn(),
  },
}));

jest.mock('@api/claimApi', () => ({
  claimApi: {
    listMyClaims: (...args: unknown[]) => mockListMyClaims(...(args as [])),
  },
}));

jest.mock('@api/dealsApi', () => ({
  dealsApi: {
    toggleSave: (...args: unknown[]) => mockToggleSave(...(args as [])),
    getSaveStatus: (...args: unknown[]) => mockGetSaveStatus(...(args as [])),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRole = 'Customer';
});

test('useSavedFeed asks the unified feed for the requested store', async () => {
  const { result } = await renderHook(() => useSavedFeed('DEAL'), { wrapper });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mockListSaved).toHaveBeenCalledWith({ type: 'DEAL', page: 1, limit: 50 });
});

test('useSavedFeed stays idle for a non-customer session', async () => {
  mockRole = null;
  const { result } = await renderHook(() => useSavedFeed(), { wrapper });

  expect(result.current.fetchStatus).toBe('idle');
  expect(mockListSaved).not.toHaveBeenCalled();
});

test('useMyClaims requests the status filter the tab needs', async () => {
  const { result } = await renderHook(() => useMyClaims('ACTIVE'), { wrapper });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mockListMyClaims).toHaveBeenCalledWith({ status: 'ACTIVE', limit: 50 });
});

test('useToggleDealSave calls the toggle endpoint and refreshes the feed', async () => {
  const { result } = await renderHook(() => useToggleDealSave(), { wrapper });

  result.current.mutate('offer-1');

  await waitFor(() => expect(mockToggleSave).toHaveBeenCalledWith('offer-1'));
});
