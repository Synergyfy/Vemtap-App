import { create } from 'zustand';
import type { PromotionAssetType } from '@api/promotionsApi';

/**
 * Accumulates the Create Campaign wizard (`/promotions`) across its six steps,
 * so any step can save a draft and the review step launches what was chosen.
 * Option ids are the wizard's own (the API uses the same ids for objectives,
 * cohorts, dayparting windows and budget tiers).
 */

export interface CampaignDraftAsset {
  type: PromotionAssetType;
  id: string;
  title: string;
}

export interface CampaignDraft {
  /** Set once the draft exists server-side; later saves patch it. */
  promotionId?: string;
  objectiveId?: string;
  assets: CampaignDraftAsset[];
  strategy: 'nearby' | 'segments';
  cohorts: string[];
  segmentIds: string[];
  branchIds: string[];
  /** Districts the campaign is shown in; empty = within `radiusKm`. */
  districtIds: string[];
  radiusKm: number;
  durationDays: number;
  instantLaunch: boolean;
  dayparting: boolean;
  windows: string[];
  /** Wizard weekday ids (`mon` … `sun`). */
  weekdays: string[];
  autoRenew: boolean;
  budgetMode: 'total' | 'daily';
  /** Total budget (₦) for the whole run. */
  total: number;
  funding: 'wallet' | 'card';
  /** Card checkout: keep the card for one-tap payments (owner consent). */
  saveCard: boolean;
}

const initialDraft: CampaignDraft = {
  assets: [],
  strategy: 'nearby',
  cohorts: [],
  segmentIds: [],
  branchIds: [],
  districtIds: [],
  radiusKm: 3,
  durationDays: 7,
  instantLaunch: true,
  dayparting: false,
  windows: [],
  weekdays: [],
  autoRenew: false,
  budgetMode: 'total',
  total: 35_000,
  funding: 'wallet',
  saveCard: false,
};

interface CampaignDraftState {
  draft: CampaignDraft;
  update: (patch: Partial<CampaignDraft>) => void;
  /** Start a new campaign, optionally aimed at a saved segment. */
  start: (preset?: { segmentId?: string }) => void;
  reset: () => void;
}

export const useCampaignDraftStore = create<CampaignDraftState>(set => ({
  draft: initialDraft,
  update: patch => set(state => ({ draft: { ...state.draft, ...patch } })),
  start: preset =>
    set({
      draft: preset?.segmentId
        ? { ...initialDraft, strategy: 'segments', segmentIds: [preset.segmentId] }
        : initialDraft,
    }),
  reset: () => set({ draft: initialDraft }),
}));
