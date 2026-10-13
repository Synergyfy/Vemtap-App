import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dealsApi, type PublicBusiness } from '@api/dealsApi';
import { useLocationStore } from '@store/locationStore';
import { discoveryOrigin } from '@utils/geo';
import type { NearbyBusiness } from '@features/home/data/homeFeed';
import { strings } from '@constants/strings';

/**
 * Businesses near the reader, from the public discovery list.
 *
 * The list endpoint now accepts `lat`/`lng`/`radius`, so "nearby" is a server
 * query over the same discovery origin the offer feed uses — the section no
 * longer shows businesses from an arbitrary global page. Setting a district or
 * widening the radius refetches, because both are part of the query key.
 *
 * Two honesty notes about the live data:
 *
 *  - `GET /public/businesses` returns no coordinates, so **distance cannot be
 *    computed** and the row omits it rather than guessing from the address. The
 *    offer feed does carry coordinates, so a business can still be reached from
 *    the offer that belongs to it.
 *  - It exposes no rating or review count either, so no score is shown. What it
 *    does report is `isVerified`, which is used for the row's trailing badge.
 */

/** Neutral mark for a business that has not uploaded a logo. */
const FALLBACK_LOGO_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg_httfgNB7CfMJOzfjKekJGnxgvueamRqqNg-Qyw7QV2HTVvlh6rZ845BYSp5dsQClaPlSKNd4B0_3aYGUcjlu-OUBeq56PilIeD6B9e1a0GFgvTtnkB0d8i16nw-kagt5rZUqAHNUNQUsH0WcGsyf8zaqNe1yx2Go9tQcdI6QPEzXRp2aZLqYGswotDnV391PXTZI3oVx9jzWC_ZogeqCUxsw3wWsr-xRkh4q33Ljntdo0P9MsadSA';

export const homeBusinessKeys = {
  nearby: (lat: number, lng: number, radius: number) =>
    ['businesses', 'public', lat, lng, radius] as const,
};

/**
 * `select` maps the API payload to the card view model in the cache, so the
 * transformation runs once per fetch rather than on every render.
 */
export function useNearbyBusinesses(limit = 8) {
  const area = useLocationStore(state => state.area);
  const coords = useLocationStore(state => state.coords);
  const radiusKm = useLocationStore(state => state.radiusKm);
  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  return useQuery<PublicBusiness[], Error, NearbyBusiness[]>({
    queryKey: homeBusinessKeys.nearby(origin.latitude, origin.longitude, radiusKm),
    queryFn: () =>
      dealsApi.listPublicBusinesses({
        lat: origin.latitude,
        lng: origin.longitude,
        radius: radiusKm,
      }),
    select: businesses => businesses.slice(0, limit).map(toNearbyBusiness),
    staleTime: 300_000,
  });
}

export function toNearbyBusiness(business: PublicBusiness): NearbyBusiness {
  return {
    id: business.id,
    image: business.logoUrl ? { uri: business.logoUrl } : { uri: FALLBACK_LOGO_URI },
    name: business.name,
    category: business.categoryName ?? '',
    // Not reported by the endpoint; the card omits the row.
    distance: '',
    rating: '',
    ratingCount: '',
    meta: business.isVerified
      ? strings.businessProfile.verified
      : [business.city, business.state].filter(Boolean).join(', '),
  };
}
