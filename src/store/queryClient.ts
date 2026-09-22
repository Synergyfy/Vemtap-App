import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { createMMKV } from 'react-native-mmkv';
import { API_TIMEOUT_MS, IS_PRODUCTION } from '@constants/config';

const cacheMmkv = createMMKV({ id: 'vemtap-query-cache' });

/**
 * Async-storage-shaped adapter over MMKV for React Query persistence.
 * Non-sensitive cache only — auth tokens never enter this store.
 */
export const queryCachePersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key: string) => cacheMmkv.getString(key) ?? null,
    setItem: async (key: string, value: string) => {
      cacheMmkv.set(key, value);
    },
    removeItem: async (key: string) => {
      cacheMmkv.remove(key);
    },
  },
  key: 'vemtap-query-cache-v1',
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 1000 * 60 * 60 * 24,
      retry: (failureCount, error: unknown) => {
        const status = (error as { status?: number }).status ?? 0;
        if (status >= 400 && status < 500 && status !== 408) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
      networkMode: 'online',
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

export const PERSIST_BUSTER = `vemtap-query-${API_TIMEOUT_MS}-${
  IS_PRODUCTION ? 'prod' : 'dev'
}`;
