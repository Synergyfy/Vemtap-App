import { useQuery } from '@tanstack/react-query';
import { catalogueApi } from '@api/catalogueApi';

export const serviceItemKeys = {
  /** Keyed by branch too: the same item prices differently per branch. */
  item: (itemId: string, branchId?: string) =>
    ['catalogue', 'item', itemId, branchId ?? 'no-branch'] as const,
};

/**
 * One bookable service, by uuid.
 *
 * Disabled until an id is known. `branchId` is optional only because the
 * endpoint treats it as such — pass it whenever it is known, so the screen
 * shows the price the branch actually charges rather than the base price.
 *
 * This is also how a 400 from a non-uuid id (the bundled Glow & Serenity mock
 * service ids) surfaces: as an error the screen renders, not as a blank page.
 */
export function useServiceItem(itemId?: string, branchId?: string) {
  return useQuery({
    queryKey: serviceItemKeys.item(itemId ?? '', branchId),
    queryFn: () => catalogueApi.getItem(itemId as string, branchId),
    enabled: Boolean(itemId),
    staleTime: 60_000,
    retry: false,
  });
}
