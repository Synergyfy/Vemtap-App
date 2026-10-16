import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';
import { offerSchema } from '@api/dealsApi';

/**
 * Promoted deals (live boosts and promotion campaigns) for consumers, and the
 * views and taps that measure them (`/sponsored`). Shapes follow
 * `apps/backend/src/modules/promotions/sponsored.*`: each offer row is the
 * same as the public offers feed's.
 */

/** `home` = Home Featured rail; `feed` = Featured Deals page. */
export type SponsoredPlacement = 'home' | 'feed';

export const sponsoredOfferSchema = z.object({
  campaignId: z.string(),
  offer: offerSchema,
});
export type SponsoredOffer = z.infer<typeof sponsoredOfferSchema>;

export const sponsoredOffersSchema = z.object({ data: z.array(sponsoredOfferSchema) });

export type SponsoredEventType = 'impression' | 'tap';

export interface SponsoredEvent {
  campaignId: string;
  offerId: string;
  type: SponsoredEventType;
}

export const sponsoredApi = {
  async list(
    placement: SponsoredPlacement,
    params: { lat?: number; lng?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<SponsoredOffer[]> {
    const page = await requestValidated<z.infer<typeof sponsoredOffersSchema>>(
      { method: 'GET', url: '/sponsored', params: { placement, ...params }, ...options },
      sponsoredOffersSchema,
    );
    return page.data;
  },

  /** Views and taps; the API counts each viewer once per hour. */
  async recordEvents(
    viewerKey: string,
    events: SponsoredEvent[],
    options: ApiRequestOptions = {},
  ): Promise<{ recorded: number }> {
    return requestValidated<{ recorded: number }>(
      {
        method: 'POST',
        url: '/sponsored/events',
        data: { viewerKey, events },
        ...options,
      },
      z.object({ recorded: z.number() }),
    );
  },
};
