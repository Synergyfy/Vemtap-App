import { createSponsoredCampaignApi } from '@api/promotionsApi';

/**
 * Boosts (`/boosts`): one asset pushed to nearby customers, funded from the ad
 * wallet. Same lifecycle and shapes as promotion campaigns (see
 * `promotionsApi`); launch needs a `goalId` and exactly one asset.
 */
export const boostsApi = createSponsoredCampaignApi('/boosts');
