import type { SponsoredCampaignOptions } from '@api/promotionsApi';
import {
  useSponsoredOptions,
  type SponsoredKind,
} from '@features/business/hooks/useCampaigns';

/** One budget tier as `/boosts/options` and `/promotions/options` serve it. */
export type BudgetTier = SponsoredCampaignOptions['budgetTiers'][number];

/**
 * The API's tiers and floor (`BOOST_BUDGET_TIERS`, `PROMOTION_BUDGET_TIERS`,
 * `MIN_CAMPAIGN_BUDGET`), shown only until the options call answers so the
 * budget step is usable on a slow network. The server's values replace them.
 */
export const DEFAULT_BUDGET_TIERS: Record<SponsoredKind, readonly BudgetTier[]> = {
  boost: [
    { id: '10', amount: 10_000, label: 'Starter' },
    { id: '20', amount: 20_000, label: 'Best Value' },
    { id: '40', amount: 40_000, label: 'Growth' },
  ],
  promotion: [
    { id: 'starter', amount: 15_000, label: 'Starter Booster' },
    { id: 'growth', amount: 35_000, label: 'Growth Accelerator' },
    { id: 'surge', amount: 70_000, label: 'Market Leader Surge' },
  ],
};

export const DEFAULT_MIN_BUDGET = 2_000;

/** Budget tiers and the smallest budget the API accepts for a boost or campaign. */
export function useBudgetTiers(kind: SponsoredKind) {
  const options = useSponsoredOptions(kind);
  const tiers = options.data?.budgetTiers?.length
    ? options.data.budgetTiers
    : DEFAULT_BUDGET_TIERS[kind];
  return { tiers, minBudget: options.data?.minBudget ?? DEFAULT_MIN_BUDGET };
}
