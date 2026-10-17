import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { linkedDevicesApi, type LinkedDevice } from '@api/linkedDevicesApi';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

export const linkedDeviceKeys = { all: ['me', 'linked-devices'] as const };

/** A readable name for this phone, from what React Native exposes. */
export function currentDeviceName(): string {
  const constants = Platform.constants as Record<string, unknown>;
  if (Platform.OS === 'android') {
    const brand = typeof constants.Brand === 'string' ? constants.Brand : '';
    const model = typeof constants.Model === 'string' ? constants.Model : '';
    const name = [brand, model].filter(Boolean).join(' ').trim();
    return name || 'Android phone';
  }
  if (Platform.OS === 'ios') return Platform.isPad ? 'iPad' : 'iPhone';
  return 'Web browser';
}

/**
 * Tells the server which device this sign-in is on, once per account per app
 * run. Sign-in itself only records a default name, so without this every
 * session in "Your devices" would read "Web browser".
 */
export function useDescribeCurrentDevice(): void {
  const accountKey = useAuthStore(state => state.user?.uniqueCode ?? state.user?.id);
  const describedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!accountKey || describedFor.current === accountKey) return;
    describedFor.current = accountKey;
    linkedDevicesApi
      .describeCurrent({
        deviceName: currentDeviceName(),
        platform:
          Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
      })
      .catch(error => {
        describedFor.current = null;
        logger.warn('auth', 'Could not describe the current device', error);
      });
  }, [accountKey]);
}

export function useLinkedDevices() {
  const signedIn = useAuthStore(state => Boolean(state.user));
  return useQuery<LinkedDevice[]>({
    queryKey: linkedDeviceKeys.all,
    queryFn: () => linkedDevicesApi.list(),
    enabled: signedIn,
    staleTime: 30_000,
  });
}

export function useRevokeLinkedDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => linkedDevicesApi.revoke(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: linkedDeviceKeys.all }),
  });
}
