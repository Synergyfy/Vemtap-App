import { formatCurrency } from '@utils/formatters';
import { toAmount } from '@features/deals/utils/offerMapper';
import type { PopularProduct } from '@features/home/data/homeFeed';

/**
 * Catalogue/search product → the Home product card view model.
 *
 * Shared by Home's `GET /products` section and the public search `products`
 * group, which carry the same fields under different envelopes. Keeping the
 * discount/price rules here means the two surfaces cannot disagree about what
 * a product card shows.
 *
 * The mapping is honest about what a catalogue item is not:
 *
 *  - The catalogue feed carries `businessId`, not a merchant **name**, so the
 *    card shows no merchant label there rather than inventing one. The search
 *    payload does carry `businessName`, which passes straight through.
 *  - It has no original price, so there is nothing to strike through.
 *  - `discountValue` is present but only meaningful alongside a discount type,
 *    so a badge is shown only when the API actually describes a discount.
 */

/** Neutral mark for a product with no image. */
export const PRODUCT_FALLBACK_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/** The structural subset both product payloads share. */
export interface ProductCardInput {
  id: string;
  name: string;
  mainImage?: string | null;
  price?: string | number | null;
  discountType?: string | null;
  discountValue?: string | number | null;
  /** Present on search results, absent on the catalogue feed. */
  businessName?: string | null;
}

export function toPopularProduct(item: ProductCardInput): PopularProduct {
  const discounted =
    item.discountType !== null &&
    item.discountType !== undefined &&
    (toAmount(item.discountValue) ?? 0) > 0;

  return {
    id: item.id,
    image: { uri: item.mainImage ?? PRODUCT_FALLBACK_IMAGE },
    merchant: item.businessName ?? '',
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
