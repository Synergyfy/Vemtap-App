import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type UpdateProfileInput } from '@api/authApi';
import { uploadFile } from '@api/uploadClient';
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

/**
 * Uploads the user's avatar to Cloudinary under `vemtap/avatars/{userId}`.
 * On success, updates the auth store with the new avatar URL.
 */
export function useUploadAvatar() {
  const setUser = useAuthStore(state => state.setUser);
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileUri: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const fileName = `avatar-${user.id}.jpg`;
      const result = await uploadFile<{ url?: string; data?: { url?: string } }>({
        url: '/uploads',
        fileUri,
        fileName,
        mimeType: 'image/jpeg',
        additionalFields: {
          folderOverride: `vemtap/avatars/${user.id}`,
        },
      });

      const url = result.data?.url ?? result.data?.data?.url;
      if (!url) throw new Error('Upload succeeded but no URL returned');

      return url;
    },
    onSuccess: avatarUrl => {
      if (user) {
        setUser({ ...user, avatar: avatarUrl });
      }
      queryClient.setQueryData(PROFILE_QUERY_KEY, old => {
        if (!old) return old;
        return { ...old, avatar: avatarUrl };
      });
    },
  });
}
