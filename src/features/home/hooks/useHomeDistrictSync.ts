import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@api/authApi';
import { districtsApi } from '@api/districtsApi';
import { useAuthStore } from '@store/authStore';
import { useLocationStore } from '@store/locationStore';

export const districtsQueryKey = ['districts'] as const;

/**
 * Saves the area a signed-in consumer browses (Apo, Wuse 2…) to their account
 * as their home district, so a business's "customers residing in this
 * district" segment can find them. Every way of picking an area (the radius
 * sheet, the district page, the location confirmation) writes the location
 * store, so watching the store is the one place this needs to happen.
 *
 * Best effort: never blocks the picker, stays quiet on failure, and skips
 * areas with no matching district.
 */
export function useHomeDistrictSync(): void {
  // The token decides what the API allows (see `useSavedHub`).
  const isCustomer = Boolean(useAuthStore(state => state.tokenRole === 'Customer'));
  const userId = useAuthStore(state => state.user?.id);
  const area = useLocationStore(state => state.area);
  const lastSaved = useRef<string | null>(null);

  const districts = useQuery({
    queryKey: districtsQueryKey,
    queryFn: () => districtsApi.list(),
    enabled: isCustomer,
    staleTime: 24 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (!isCustomer || !userId || !districts.data) return;
    const district = districts.data.find(candidate => candidate.name === area);
    if (!district) return;
    const key = `${userId}:${district.id}`;
    if (lastSaved.current === key) return;
    lastSaved.current = key;
    authApi.updateProfile({ homeDistrictId: district.id }).catch(() => {
      // Retried on the next area change or launch.
      lastSaved.current = null;
    });
  }, [isCustomer, userId, area, districts.data]);
}
