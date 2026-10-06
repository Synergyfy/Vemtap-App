import { useQuery } from '@tanstack/react-query';
import { catalogueApi, type CatalogueItem } from '@api/catalogueApi';
import { formatCurrency } from '@utils/formatters';
import { toAmount } from '@features/deals/utils/offerMapper';
import type { PopularProduct } from '@features/home/data/homeFeed';

/**
 * Products near the reader, from the public catalogue.
 *
 * `GET /products` is public and paginated. **It currently returns an empty list
 * on the test API**, so this section legitimately has nothing to show and renders
 * the empty state rather than the bundled products that used to stand in for it.
 *
 * The mapping is honest about what a catalogue item is not:
 *
 *  - It carries `businessId`, not a merchant **name**, so the row shows no
 *    merchant label rather than inventing one.
 *  - It has no original price, so there is nothing to strike through.
 *  - `discountValue` is present but only meaningful alongside a discount type,
 *    so a badge is shown only when the API actually describes a discount.
 */

/** Neutral mark for a product with no image. */
const FALLBACK_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

export const homeProductKeys = {
  published: (limit: number) => ['products', 'public', limit] as const,
};

export function useNearbyProducts(limit = 8) {
  return useQuery<{ data: CatalogueItem[]; total: number }, Error, PopularProduct[]>({
    queryKey: homeProductKeys.published(limit),
    queryFn: () => catalogueApi.listPublishedProducts({ limit }),
    select: feed => feed.data.slice(0, limit).map(toPopularProduct),
    staleTime: 300_000,
  });
}

export function toPopularProduct(item: CatalogueItem): PopularProduct {
  const discounted =
    item.discountType !== null &&
    item.discountType !== undefined &&
    (toAmount(item.discountValue) ?? 0) > 0;

  return {
    id: item.id,
    image: { uri: item.mainImage ?? FALLBACK_IMAGE },
    // No merchant name on a catalogue item, so the row shows none.
    merchant: '',
    title: item.name,
    price:
      toAmount(item.price) === null ? '' : formatCurrency(toAmount(item.price) as number),
    // No original price exists on the item, so nothing is struck through.
    priceWas: '',
    badge: discounted
      ? { label: `${item.discountType} off`, tone: 'discount' as const }
      : undefined,
  };
}
