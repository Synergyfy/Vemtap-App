import { useQuery } from '@tanstack/react-query';
import { dealsApi, type PublicBusiness } from '@api/dealsApi';
import { strings } from '@constants/strings';
import type { BusinessProfileSummary } from '@features/discover/data/discoverData';

/** Fallback logo URI used when a business has no logo URL. */
const FALLBACK_LOGO_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg_httfgNB7CfMJOzfjKekJGnxgvueamRqqNg-Qyw7QV2HTVvlh6rZ845BYSp5dsQClaPlSKNd4B0_3aYGUcjlu-OUBeq56PilIeD6B9e1a0GFgvTtnkB0d8i16nw-kagt5rZUqAHNUNQUsH0WcGsyf8zaqNe1yx2Go9tQcdI6QPEzXRp2aZLqYGswotDnV391PXTZI3oVx9jzWC_ZogeqCUxsw3wWsr-xRkh4q33Ljntdo0P9MsadSA';

/** Simple lookup table: live categoryName → DiscoverCategory. */
const DISCOVER_CATEGORY_MAP: Record<string, string> = {
  'Food & Hospitality': 'Food & Dining',
  Cafe: 'Food & Dining',
  Food: 'Food & Dining',
  'Beauty & Personal Care': 'Beauty & Wellness',
  'Massage & Body Care': 'Beauty & Wellness',
  'Spas & Saunas': 'Beauty & Wellness',
  'Technology & Digital Services': 'Electronics',
} as const;

/**
 * Fetches public businesses from the shared `/public/businesses` endpoint.
 *
 * Phase 2 gave the endpoint `search` and `categoryId` filters, so this hook now
 * forwards the Discover screen's controls instead of filtering a single global
 * page client-side. Both params are part of the query key: changing the query
 * or the mapped category refetches.
 *
 * The endpoint has no `limit`/`page` params (the response is the full list), so
 * `limit` stays a client-side slice of whatever the server returns.
 */
export const discoverBusinessKeys = {
  list: (search: string, categoryId: string, limit: number) =>
    ['businesses', 'discover', search, categoryId, limit] as const,
};

export function useDiscoverBusinesses(
  params: { search?: string; categoryId?: string } = {},
  limit: number = 8,
) {
  const search = params.search?.trim() ?? '';
  const categoryId = params.categoryId ?? '';

  return useQuery<PublicBusiness[], Error, BusinessProfileSummary[]>({
    queryKey: discoverBusinessKeys.list(search, categoryId, limit),
    queryFn: () =>
      dealsApi.listPublicBusinesses({
        search: search || undefined,
        categoryId: categoryId || undefined,
      }),
    select: businesses => businesses.slice(0, limit).map(toDiscoverBusiness),
    staleTime: 300_000,
  });
}

/**
 * Maps a `PublicBusiness` (from the list endpoint) to `BusinessProfileSummary`.
 * Fields not present in the list payload (rating, reviews, distance, active deal)
 * are set to their "blank" values so the `BusinessDiscoveryCard` can conditionally
 * hide those rows — exactly as `BusinessRow` does for Home's nearby businesses.
 */
export function toDiscoverBusiness(business: PublicBusiness): BusinessProfileSummary {
  return {
    id: business.id,
    name: business.name,
    // Map the API's categoryName to a DiscoverCategory via a lookup table.
    // Unknown categoryNames fallback to 'Services'.
    category: mapDiscoverCategory(business.categoryName ?? ''),
    categoryFilter: mapDiscoverCategory(business.categoryName ?? ''),
    imageUri: business.logoUrl ?? FALLBACK_LOGO_URI,
    imageAlt: strings.businessProfile.imageAlt(
      business.name,
      business.categoryName ?? '',
    ),
    rating: '',
    reviews: 0,
    distance: '',
    location:
      [business.city, business.state].filter(Boolean).join(', ') ||
      business.address ||
      '',
    activeDealLabel: '',
    status: business.isVerified
      ? { label: strings.businessProfile.verified, icon: 'verified' }
      : { label: strings.businessProfile.active, icon: 'featured' },
    branchCode: business.slug ?? business.branchCode ?? '',
  };
}

/** Simple lookup table: live categoryName → DiscoverCategory. */
export function mapDiscoverCategory(
  categoryName?: string | null,
):
  | 'Food & Dining'
  | 'Beauty & Wellness'
  | 'Fashion & Apparel'
  | 'Electronics'
  | 'Fitness & Health'
  | 'Supermarkets'
  | 'Services' {
  return (DISCOVER_CATEGORY_MAP[categoryName ?? ''] ?? 'Services') as
    | 'Food & Dining'
    | 'Beauty & Wellness'
    | 'Fashion & Apparel'
    | 'Electronics'
    | 'Fitness & Health'
    | 'Supermarkets'
    | 'Services';
}
