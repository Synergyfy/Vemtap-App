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
 * Fetches a page of public businesses from the shared `/public/businesses` endpoint.
 * The hook handles the mapper, so the screen always receives `BusinessProfileSummary`
 * shape (rating/reviews/distance blank when the list endpoint has no coordinates).
 */
export const discoverBusinessKeys = {
  list: (limit: number = 8) => ['businesses', 'discover', limit] as const,
};

export function useDiscoverBusinesses(limit: number = 8) {
  return useQuery<PublicBusiness[], Error, BusinessProfileSummary[]>({
    queryKey: discoverBusinessKeys.list(limit),
    queryFn: () => dealsApi.listPublicBusinesses({ limit } as any),
    select: businesses => businesses.map(toDiscoverBusiness),
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
function mapDiscoverCategory(
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
