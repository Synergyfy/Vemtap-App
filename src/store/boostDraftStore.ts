import { create } from 'zustand';
import type { PromotionAssetType } from '@api/promotionsApi';

/**
 * Accumulates the Boost wizard (`/boosts`): the Boost Engine picks the asset,
 * radius, daily tier and duration; Goal & Audience, Budget & Schedule and
 * Preview & Payment refine it, and Preview launches it. Ids are the wizard's
 * own, which the API shares (goals, audience scopes, placements, budget tiers).
 */

export interface BoostDraftAsset {
  type: PromotionAssetType;
  id: string;
  title: string;
  price?: number | null;
  wasPrice?: number | null;
  priorClaims?: number | null;
}

export interface BoostDraft {
  /** Set once the boost exists server-side; later saves patch it. */
  boostId?: string;
  asset?: BoostDraftAsset;
  goalId: string;
  /** `nearby` | `districts` | `clusters`. */
  audienceScope: string;
  radiusKm: number;
  placements: string[];
  durationDays: number;
  /** Lunch-rush only (11:30–15:30). */
  dayparting: boolean;
  /** Total budget (₦) for the whole run. */
  budget: number;
  funding: 'wallet' | 'card';
}

const initialDraft: BoostDraft = {
  goalId: 'claims',
  audienceScope: 'nearby',
  radiusKm: 3,
  placements: ['feed', 'home', 'push', 'search'],
  durationDays: 5,
  dayparting: true,
  budget: 20_000,
  funding: 'wallet',
};

interface BoostDraftState {
  draft: BoostDraft;
  update: (patch: Partial<BoostDraft>) => void;
  reset: () => void;
}

export const useBoostDraftStore = create<BoostDraftState>(set => ({
  draft: initialDraft,
  update: patch => set(state => ({ draft: { ...state.draft, ...patch } })),
  reset: () => set({ draft: initialDraft }),
}));
