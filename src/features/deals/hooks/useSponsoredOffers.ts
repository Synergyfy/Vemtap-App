import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sponsoredApi, type SponsoredPlacement } from '@api/sponsoredApi';
import { discoveryOrigin } from '@utils/geo';
import { useLocationStore } from '@store/locationStore';

/**
 * Promoted deals (live boosts and campaigns) for one placement, near the same
 * origin the public feed uses. Promotion is a bonus: a failure or an older
 * server just means no promoted deals.
 */
export function useSponsoredOffers(placement: SponsoredPlacement, limit = 3) {
  const area = useLocationStore(state => state.area);
  const coords = useLocationStore(state => state.coords);
  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  const query = useQuery({
    queryKey: ['sponsored', placement, origin.latitude, origin.longitude, limit],
    queryFn: () =>
      sponsoredApi
        .list(placement, { lat: origin.latitude, lng: origin.longitude, limit })
        .catch(() => []),
    staleTime: 5 * 60_000,
  });
  return query.data ?? [];
}
