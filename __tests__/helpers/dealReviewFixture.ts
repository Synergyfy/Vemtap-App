import type { DealDraft } from '@store/catalogueDraftStore';
import { dealDraftToReview } from '@features/business/utils/dealPresentation';

/** A ready-to-launch deal review, built the way the routes build it. */
export function reviewFixture(overrides: Partial<DealDraft> = {}) {
  return dealDraftToReview(
    {
      itemIds: ['item-1'],
      name: 'Lunch for Two',
      description: 'Two mains and drinks',
      strategy: 'percentage',
      discountRate: 20,
      claimFrequency: 'once',
      maxClaimsPerMonth: 1,
      acceptGifting: false,
      terms: ['Show your code before ordering.'],
      claimSteps: [],
      branchIds: ['br-1'],
      ...overrides,
    },
    [{ id: 'br-1', name: 'Aurora Wuse', address: '1 Wuse Road' }],
  );
}
