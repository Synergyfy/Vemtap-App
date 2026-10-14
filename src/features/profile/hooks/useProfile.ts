import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type UpdateProfileInput } from '@api/authApi';
import { uploadFile, extensionForMimeType } from '@api/uploadClient';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

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
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

export interface AvatarUploadInput {
  uri: string;
  /** Picker name/type when available — keeps PNG/WebP/HEIC honest on the CDN. */
  fileName?: string | null;
  mimeType?: string | null;
}

/**
 * Uploads the user's avatar to Cloudinary under `vemtap/avatars/{userId}` and
 * persists the hosted URL on the profile.
 *
 * The persist is what makes the picture durable. Held only in the client store
 * it was silently dropped whenever the session user was rebuilt from the API —
 * switching between the business and customer dashboards rehydrates the store
 * from the `/auth/switch-role` response, which had no avatar on it. Storing the
 * URL server-side means every rehydration path carries it.
 */
export function useUploadAvatar() {
  const setUser = useAuthStore(state => state.setUser);
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uri, fileName, mimeType }: AvatarUploadInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Normalise mimeType — backend only accepts jpeg/png/webp/pdf.
      // iOS ImagePicker can return image/heic, which the backend rejects.
      const normalizedMimeType =
        mimeType === 'image/heic' ? 'image/jpeg' : (mimeType ?? 'image/jpeg');

      const resolvedName =
        fileName ?? `avatar-${user.id}.${extensionForMimeType(normalizedMimeType)}`;
      const result = await uploadFile<{ url?: string; data?: { url?: string } }>({
        url: '/uploads',
        fileUri: uri,
        fileName: resolvedName,
        mimeType: mimeType ?? 'image/jpeg',
        additionalFields: {
          folderOverride: `vemtap/avatars/${user.id}`,
        },
      });

      const url = result.data?.url ?? result.data?.data?.url;
      if (!url) throw new Error('Upload succeeded but no URL returned');

      try {
        return await authApi.updateProfile({ avatar: url });
      } catch (error) {
        // The upload succeeded on the server but the PATCH to persist the avatar
        // failed.  Surface the error so EditProfileScreen shows the "photo upload
        // failed" toast rather than silently returning a fake user.
        logger.warn('upload', 'Avatar uploaded but not persisted', {
          message: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    onSuccess: updatedUser => {
      setUser(updatedUser);
      queryClient.setQueryData(PROFILE_QUERY_KEY, updatedUser);
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
