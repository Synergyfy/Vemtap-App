import React, { useMemo } from 'react';
import { NearbyDealListCard } from '@components/home/NearbyDealListCard';
import { useDealEngagement } from '@features/deals/hooks/usePublicOffers';
import {
  useDealReaction,
  useDealSave,
} from '@features/deals/hooks/useDealEngagementActions';
import type { NearbyDeal } from '@features/home/data/homeFeed';

/**
 * A Home list row wired to the real engagement endpoints, shared by Home's
 * "Deals Near You" section and the search results that reuse the same card.
 *
 * Like and save are authenticated and optimistic, and the counts come from the
 * per-offer engagement endpoint — the same wiring the Deals feed uses, so a like
 * tapped here is the same like as on the Deals tab rather than a second opinion
 * held in local state. The hooks are per-offer, so this is a component rather
 * than a plain render function.
 */
export function useEnriched<T extends { id: string; likes: number; comments: number }>(
  deal: T,
) {
  const { data } = useDealEngagement(deal.id);
  const reaction = useDealReaction(deal.id);
  const saved = useDealSave(deal.id);

  return {
    deal: useMemo(
      () =>
        data ? { ...deal, likes: data.likesCount, comments: data.reviewsCount } : deal,
      [data, deal],
    ),
    liked: reaction.liked,
    saved: saved.saved,
    toggleLike: reaction.toggle,
    toggleSave: saved.toggle,
  };
}

export interface LiveNearbyListCardProps {
  deal: NearbyDeal;
  onOpenComments?: (id: string) => void;
  onShare?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
}

export function LiveNearbyListCard({
  deal,
  onOpenComments,
  onShare,
  onOpenDetail,
}: LiveNearbyListCardProps) {
  const { deal: enriched, liked, toggleLike } = useEnriched(deal);

  return (
    <NearbyDealListCard
      deal={{ ...enriched, liked }}
      onToggleLike={toggleLike}
      onOpenComments={onOpenComments}
      onShare={onShare}
      onOpenDetail={onOpenDetail}
    />
  );
}
