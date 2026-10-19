import { useMemo } from 'react';
import { productCommentsApi } from '@api/productCommentsApi';
import { useLikeToggle, type UseLikeToggleOptions } from '@hooks/useLikeToggle';

export const catalogueLikeKeys = {
  item: (itemId: string) => ['catalogue', 'likes', itemId] as const,
};

/**
 * Like a catalogue product or service. The count is public; `liked` is the
 * signed-in viewer's own. Like and unlike are idempotent on the server, so
 * the sync loop just sends the state the customer wants.
 */
export function useCatalogueItemLike(itemId: string | undefined) {
  const options = useMemo<UseLikeToggleOptions>(
    () => ({
      queryKey: catalogueLikeKeys.item(itemId ?? ''),
      fetchStatus: () => productCommentsApi.getLikeStatus(itemId as string),
      send: liked => productCommentsApi.setLiked(itemId as string, liked),
      publicStatus: true,
      enabled: Boolean(itemId),
    }),
    [itemId],
  );
  return useLikeToggle(options);
}
