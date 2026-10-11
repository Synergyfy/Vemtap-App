import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type UpdateProfileInput } from '@api/authApi';
import { useAuthStore } from '@store/authStore';

export const PROFILE_QUERY_KEY = ['users', 'me'] as const;

export function useProfile() {
  const status = useAuthStore(state => state.status);

  const query = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    enabled: status === 'authenticated',
    queryFn: ({ signal }) => authApi.fetchProfile({ signal }),
    staleTime: 60_000,
  });

  const refresh = useCallback(() => query.refetch(), [query]);

  return { ...query, refresh };
}

/**
 * Saves the editable profile fields.
 *
 * A save that only closed the screen left every header, avatar and greeting in
 * the app showing the old name until the next cold start, because the session
 * user is what those read. So the response is pushed straight into the auth
 * store — that is the copy the whole app renders from — and the cached profile
 * is invalidated for the components that query it directly.
 *
 * The mutation owns this rather than the caller: two routes mount the same
 * screen (the Account stack and the personal hub), so wiring it in either one
 * would leave the other half saving silently.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore(state => state.setUser);

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => authApi.updateProfile(input),
    onSuccess: user => {
      setUser(user);
      queryClient.setQueryData(PROFILE_QUERY_KEY, user);
    },
  });
}