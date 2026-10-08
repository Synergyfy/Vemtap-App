import { useQuery } from '@tanstack/react-query';
import { categoriesApi, type Category } from '@api/categoriesApi';

export type { Category };

/**
 * The real category taxonomy, used wherever a business picks its category or
 * specialty.
 *
 * Replaces the invented labels that used to live in `businessData.ts`. Those
 * shared no names with the API's seeded categories, so a selection could never
 * become the `categoryId` that `register/owner` requires.
 *
 * The API caps `limit` at 100, so one request returns the whole taxonomy; the
 * loop exists to be correct if that cap ever changes rather than to handle a
 * known case.
 */
export const taxonomyQueryKey = ['categories', 'global'] as const;

const MAX_LIMIT = 100;

export async function fetchAllCategories(signal?: AbortSignal): Promise<Category[]> {
  const first = await categoriesApi.list({ page: 1, limit: MAX_LIMIT }, { signal });

  if (first.meta.totalPages <= 1) return first.items;

  // Pages are requested together rather than in a loop: sequential awaits here
  // would serialise requests the API is happy to serve in parallel.
  const rest = await Promise.all(
    Array.from({ length: first.meta.totalPages - 1 }, (_, index) =>
      categoriesApi.list({ page: index + 2, limit: MAX_LIMIT }, { signal }),
    ),
  );

  return [first.items, ...rest.map(page => page.items)].flat();
}

/**
 * @param enabled Pass `false` while the picker is closed so the taxonomy is not
 * fetched on mount — the sheet is hidden until the user asks for it.
 */
export function useCategoryTaxonomy(enabled = true) {
  return useQuery({
    queryKey: taxonomyQueryKey,
    queryFn: ({ signal }) => fetchAllCategories(signal),
    enabled,
    // The taxonomy is effectively static; re-fetching it on every focus is noise.
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Pick a category and subcategory by id, so a screen holds the ids the API needs
 * rather than re-resolving a name on every render.
 */
export function resolveCategorySelection(
  categories: Category[],
  categoryId: string | undefined,
  subcategoryId: string | undefined,
): { category?: Category; subcategoryName?: string } {
  const category = categories.find(item => item.id === categoryId);
  const subcategory = category?.subcategories.find(item => item.id === subcategoryId);

  return { category, subcategoryName: subcategory?.name };
}
