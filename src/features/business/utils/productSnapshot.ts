import type { ProductDraft } from '@store/catalogueDraftStore';

/** What the publish / make-a-deal screens show about the product just saved. */
export interface ProductSnapshot {
  name: string;
  image?: string;
  /** Lowest and highest price across the base price and its options. */
  priceMin: number | null;
  priceMax: number | null;
  /** Units across the options; null when the product has none. */
  stock: number | null;
  branchNames: string[];
  inStock: boolean;
  itemId?: string;
}

const toAmount = (value: string | undefined) => {
  const parsed = Number((value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export function productSnapshot(
  draft: ProductDraft,
  branches: ReadonlyArray<{ id: string; name: string }>,
): ProductSnapshot {
  const prices = [
    toAmount(draft.regularPrice),
    ...draft.variants.map(variant => toAmount(variant.price)),
  ].filter((price): price is number => price !== null);
  return {
    name: draft.name,
    image: draft.mainImage ?? draft.galleryImages[0],
    priceMin: prices.length ? Math.min(...prices) : null,
    priceMax: prices.length ? Math.max(...prices) : null,
    stock: draft.variants.length
      ? draft.variants.reduce((total, variant) => total + variant.inventory, 0)
      : null,
    branchNames: branches
      .filter(branch => draft.branchIds.includes(branch.id))
      .map(branch => branch.name),
    inStock: draft.inStock,
    itemId: draft.publishedItemId,
  };
}

const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`;

/** "₦12,000" or "₦12,000 – ₦19,500"; null when no price is set. */
export function priceRangeLabel(snapshot: ProductSnapshot): string | null {
  const { priceMin, priceMax } = snapshot;
  if (priceMin === null || priceMax === null) return null;
  return priceMin === priceMax
    ? naira(priceMin)
    : `${naira(priceMin)} – ${naira(priceMax)}`;
}

export function branchesLabel(snapshot: ProductSnapshot): string {
  const names = snapshot.branchNames;
  if (!names.length) return 'No branch selected';
  if (names.length <= 2) return names.join(' & ');
  return `${names.length} branches`;
}

export { naira as formatNairaWhole };
