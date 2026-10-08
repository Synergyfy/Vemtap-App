export type RewardTier = {
  rank: number;
  name: string;
  points: number;
};

/**
 * Client-side tier thresholds. The backend has no tier concept yet
 * (`GET /loyalty/points/tier` is logged in backend-fixies.md §9), so the
 * dashboard resolves tiers locally until that endpoint lands. Moving a
 * threshold here changes every consumer — never fork per screen.
 */
export const rewardTiers: readonly RewardTier[] = [
  { rank: 1, name: 'Bronze', points: 0 },
  { rank: 2, name: 'Silver', points: 1000 },
  { rank: 3, name: 'Gold', points: 2000 },
  { rank: 4, name: 'Platinum', points: 3000 },
  { rank: 5, name: 'Diamond', points: 6000 },
];

export type TierStatus = {
  tier: RewardTier;
  /** The tier being climbed toward, or `null` once the top tier is reached. */
  next: RewardTier | null;
  /** 0..1 progress toward `next`; always 1 at the top tier. */
  progress: number;
};

export function resolveTier(points: number): TierStatus {
  const safePoints = Number.isFinite(points) ? Math.max(0, points) : 0;
  let tier = rewardTiers[0];
  for (const candidate of rewardTiers) {
    if (safePoints >= candidate.points) {
      tier = candidate;
    }
  }
  const next = rewardTiers[rewardTiers.indexOf(tier) + 1] ?? null;
  const progress = next ? Math.min(safePoints / next.points, 1) : 1;
  return { tier, next, progress };
}
