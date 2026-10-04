import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@api/authApi';
import { useAuthStore } from '@store/authStore';

export function useProfile() {
  const status = useAuthStore(state => state.status);

  const query = useQuery({
    queryKey: ['users', 'me'],
    enabled: status === 'authenticated',
    queryFn: ({ signal }) => authApi.fetchProfile({ signal }),
    staleTime: 60_000,
  });

  const refresh = useCallback(() => query.refetch(), [query]);

  return { ...query, refresh };
}
