import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, type Category } from '@api/categoriesApi';
import type { IconName } from '@components/ui/Icon';

/**
 * The category chips on the filter page, from the real taxonomy.
 *
 * The design's eight labels ("Food & Drinks", "Beauty & Spa", …) are display copy
 * that shares no names with the API's 24-entry taxonomy, and the offers feed
 * accepts only a single `categoryId` — so the chips are fetched rather than
 * hardcoded, and matched against an offer's `categoryName`, which is the same
 * string on both sides (verified live).
 *
 * Two things about the live taxonomy are handled rather than shown:
 *
 *  - It contains seed junk (`Frank`, `Zejab`, `test`, `txxhhh`) that would read
 *    as broken categories on a consumer filter page. They are dropped by name;
 *    cleaning the seed is a backend ask so this list can be deleted.
 *  - Names arrive untrimmed (`Agriculture `), which would silently fail the exact
 *    match against an offer's `categoryName`, so they are trimmed here.
 *
 * Icons are not part of the taxonomy, so they are resolved from the category
 * name against the icons that already exist, with a neutral fallback.
 */

/** Seed entries that are test data rather than consumer categories. */
const SEED_JUNK = new Set(['Frank', 'Zejab', 'test', 'txxhhh']);

const CATEGORY_ICONS: readonly (readonly [needle: string, icon: IconName])[] = [
  ['food', 'restaurant'],
  ['hospitality', 'restaurant'],
  ['beauty', 'spa'],
  ['fashion', 'fashion'],
  ['apparel', 'fashion'],
  ['electronic', 'devices'],
  ['technology', 'devices'],
  ['digital', 'devices'],
  ['health', 'fitness'],
  ['fitness', 'fitness'],
  ['gym', 'fitness'],
  ['grocery', 'groceries'],
  ['retail', 'groceries'],
  ['shop', 'storefront'],
  ['home', 'homeLiving'],
  ['living', 'homeLiving'],
  ['construction', 'homeLiving'],
  ['automotive', 'automotive'],
  ['finance', 'payments'],
  ['financial', 'payments'],
  ['education', 'book'],
  ['event', 'eventAvailable'],
  ['agriculture', 'loyalty'],
  ['logistics', 'delivery'],
  ['transport', 'delivery'],
  ['real estate', 'home'],
  ['property', 'home'],
  ['professional', 'officeBuilding'],
  ['government', 'officeBuilding'],
  ['manufacturing', 'productionLimits'],
  ['production', 'productionLimits'],
];

export interface CategoryOption {
  /** Taxonomy UUID — the only value the server-side `categoryId` filter takes. */
  id: string;
  name: string;
  icon: IconName;
}

export function categoryIcon(name: string): IconName {
  const lower = name.toLowerCase();
  for (const [needle, icon] of CATEGORY_ICONS) {
    if (lower.includes(needle)) return icon;
  }
  return 'category';
}

export const filterCategoryKeys = {
  options: () => ['categories', 'filter-options'] as const,
};

export function useFilterCategories() {
  const query = useQuery({
    queryKey: filterCategoryKeys.options(),
    queryFn: () => categoriesApi.list({ limit: 100 }),
    staleTime: 300_000,
  });

  const options = useMemo<CategoryOption[]>(() => {
    const items: Category[] = query.data?.items ?? [];
    const seen = new Set<string>();
    const result: CategoryOption[] = [];
    for (const category of items) {
      const name = category.name.trim();
      // Junk entries and duplicates (the seed has both `Technology` and
      // `Technology & Digital Services`) would otherwise render as chips.
      const keep = name.length > 0 && !SEED_JUNK.has(name) && !seen.has(name);
      if (keep) {
        seen.add(name);
        result.push({ id: category.id, name, icon: categoryIcon(name) });
      }
    }
    return result;
  }, [query.data]);

  return { ...query, options };
}
