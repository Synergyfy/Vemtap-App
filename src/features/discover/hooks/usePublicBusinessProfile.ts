import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicBusinessApi, type PublicBusinessDetail } from '@api/publicBusinessApi';
import { ApiError } from '@api/ApiError';
import { discoveryOrigin } from '@utils/geo';
import { useLocationStore } from '@store/locationStore';
import {
  mapPublicBusinessToProfile,
  withReaderDistance,
  type LiveBusinessProfile,
} from '@features/discover/utils/liveBusinessMapper';

/**
 * A real merchant's profile, by the 9-character code a live offer carries.
 *
 * This is the public path into the profile screen: a real offer knows its
 * merchant's code, and `GET /public/businesses/code/:code` resolves it without
 * credentials. The bundled Discover businesses never come through here.
 *
 * Distance from the reader is added only when the reader has a position — a
 * merchant profile with no location context should not claim to know how far
 * away it is.
 */
export type PublicBusinessState =
  | { status: 'resolved'; business: LiveBusinessProfile }
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' };

export const publicBusinessKeys = {
  byCode: (code: string) => ['business', 'public', code] as const,
};

export function usePublicBusinessProfile(
  code: string | undefined,
): PublicBusinessState & {
  retry: () => void;
} {
  const area = useLocationStore(state => state.area);
  const coords = useLocationStore(state => state.coords);
  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  const query = useQuery<PublicBusinessDetail>({
    queryKey: publicBusinessKeys.byCode(code ?? ''),
    queryFn: () => publicBusinessApi.getByCode(code as string),
    enabled: Boolean(code),
    staleTime: 300_000,
    retry: false,
  });

  const retry = () => {
    void query.refetch();
  };

  if (!code || query.isPending) {
    return { status: 'loading', retry };
  }

  if (query.isError) {
    const status = (query.error as ApiError | undefined)?.status;
    return { status: status === 404 ? 'notFound' : 'error', retry };
  }

  if (query.data) {
    return {
      status: 'resolved',
      business: withReaderDistance(mapPublicBusinessToProfile(query.data), origin),
      retry,
    };
  }

  return { status: 'notFound', retry };
}
