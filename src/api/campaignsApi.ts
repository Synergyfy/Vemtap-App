import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * One promotional banner from `GET /campaigns/featured`.
 *
 * The endpoint is backed by the banners module and returns active banners for
 * the `customer` placement, ordered by `sortOrder` — created from the admin
 * banners screens, not by customers. Field notes verified against the `banners`
 * table:
 *
 *  - There is **no image field**. A banner is copy (`title`, `description`), an
 *    icon name and an optional CTA (`actionLabel` + `actionUrl`), plus a
 *    Tailwind gradient class in `color` that has no React Native equivalent.
 *    Clients that want artwork on a banner keep their own artwork.
 *  - `actionLabel`/`actionUrl` are nullable: a banner without a URL is a
 *    headline, not a link, so callers must not render a dead button.
 */
export const campaignBannerSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  iconName: z.string().nullish(),
  actionLabel: z.string().nullish(),
  actionUrl: z.string().nullish(),
  color: z.string().nullish(),
  sortOrder: z.number().nullish(),
  isActive: z.boolean().nullish(),
  placement: z.string().nullish(),
});
export type CampaignBanner = z.infer<typeof campaignBannerSchema>;

export const campaignBannerListSchema = z.array(campaignBannerSchema);
export type CampaignBannerList = z.infer<typeof campaignBannerListSchema>;

/**
 * Featured campaign banners for the customer app. Any authenticated user; the
 * list is empty when no customer banner is active, which is a valid state and
 * not an error.
 */
export async function getFeaturedCampaigns(
  options: ApiRequestOptions = {},
): Promise<CampaignBannerList> {
  return requestValidated<CampaignBannerList>(
    { method: 'GET', url: '/campaigns/featured', ...options },
    campaignBannerListSchema,
  );
}

export const campaignsApi = { getFeaturedCampaigns };
