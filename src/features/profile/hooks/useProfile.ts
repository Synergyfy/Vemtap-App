import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@api/userApi';
import { useAuthStore } from '@store/authStore';

export function useProfile() {
  const user = useAuthStore(state => state.user);

  const query = useQuery({
    queryKey: ['users', 'me', user?.id],
    enabled: Boolean(user?.id),
    queryFn: ({ signal }) => userApi.fetchUserById(user!.id, { signal }),
    staleTime: 60_000,
  });

  const refresh = useCallback(() => query.refetch(), [query]);

  return { ...query, refresh };
}
