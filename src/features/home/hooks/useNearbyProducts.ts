import { useQuery } from '@tanstack/react-query';
import { catalogueApi, type CatalogueItem } from '@api/catalogueApi';
import { toPopularProduct } from '@features/home/utils/productMapper';
import type { PopularProduct } from '@features/home/data/homeFeed';

/**
 * Products near the reader, from the public catalogue.
 *
 * `GET /products` is public and paginated. It is backed by catalogue items
 * (active, non-suspended, across all branches) — including services — so the
 * request pins `itemType: 'product'`: this section is the products grid, and a
 * bookable service would render wrong through the product card.
 *
 * The card mapping (and its honesty notes about merchant/price fields) lives in
 * `@features/home/utils/productMapper`, shared with public search.
 */

export const homeProductKeys = {
  published: (limit: number) => ['products', 'public', limit] as const,
};

export function useNearbyProducts(limit = 8) {
  return useQuery<{ data: CatalogueItem[]; total: number }, Error, PopularProduct[]>({
    queryKey: homeProductKeys.published(limit),
    queryFn: () => catalogueApi.listPublishedProducts({ limit, itemType: 'product' }),
    select: feed => feed.data.slice(0, limit).map(toPopularProduct),
    staleTime: 300_000,
  });
}
