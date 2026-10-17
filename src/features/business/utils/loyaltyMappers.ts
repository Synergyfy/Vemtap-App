import { strings, type LoyaltyRuleValues } from '@constants/strings';
import type {
  BusinessPointLog,
  LoyaltyBusinessStats,
  LoyaltyRule,
  LoyaltyRuleFieldKey,
  Reward,
} from '@api/loyaltyApi';
import type { BusinessBranch } from '@features/business/components/BusinessBranchSwitcher';
import type { BusinessPillTone } from '@features/business/components/BusinessPrimitives';
import type { IconName } from '@components/ui/Icon';
import { formatCount, formatDate, relativeTime } from '@features/business/utils/datetime';

const copy = strings.loyaltyProgramme;
const rewardCopy = strings.loyaltyRewards;

// ---------------------------------------------------------------------------
// Programme configuration
// ---------------------------------------------------------------------------

export interface LoyaltyRuleCardView {
  id: string;
  icon: IconName;
  title: string;
  tag: string;
  /** Formatted straight from the live row — never a stored figure. */
  value: string;
  footnote: string;
  footnoteIcon: IconName;
  /** Which editor inputs this card owns; every key is a column of the row. */
  fields: LoyaltyRuleFieldKey[];
}

export interface LoyaltyStatView {
  label: string;
  value: string;
  /** Signed period change the stats payload reports, e.g. `+14%`. */
  delta: string;
  trendUp: boolean;
}

export interface LoyaltyBranchChipView {
  id: string;
  label: string;
  /** Empty for a live branch; the paused copy for an inactive one. */
  suffix: string;
  active: boolean;
}

export interface LoyaltyProgrammeView {
  /** The business's own name — the API has no separate "programme name". */
  name: string;
  statusLabel: string;
  statusTone: BusinessPillTone;
  /** Master switch position: the rules row's single `isActive`. */
  enabled: boolean;
  badge: string;
  badgeTone: BusinessPillTone;
  /** At most two tiles; empty while the stats query has nothing to say. */
  stats: LoyaltyStatView[];
  cards: LoyaltyRuleCardView[];
  /** Raw numbers behind the cards so the editor opens on them. */
  values: LoyaltyRuleValues;
  branches: LoyaltyBranchChipView[];
  /** Point-ledger rows for the Activity tab; empty while unreadable or empty. */
  activity: RedemptionFeedRowView[];
}

export function presentLoyaltyProgramme(input: {
  rule: LoyaltyRule;
  businessName?: string | null;
  stats?: LoyaltyBusinessStats;
  branches: readonly BusinessBranch[];
  logs?: readonly BusinessPointLog[] | null;
}): LoyaltyProgrammeView {
  const { rule } = input;

  // The endpoint returns the tier/period set; the panel has room for two tiles,
  // so unlabelled or valueless entries are dropped rather than rendered blank.
  const stats = (input.stats?.stats ?? [])
    .filter(
      (stat): stat is { label: string; value: string; change: number | null } =>
        Boolean(stat.label) && Boolean(stat.value),
    )
    .slice(0, 2)
    .map(stat => {
      const change = stat.change ?? 0;
      return {
        label: stat.label,
        value: stat.value,
        delta: `${change > 0 ? '+' : ''}${change}%`,
        trendUp: change >= 0,
      };
    });

  const cards = copy.rules.map((template, index) => ({
    id: `earning-rule-${index}`,
    icon: template.icon as IconName,
    title: template.title,
    tag: template.tag,
    value: template.value(rule),
    footnote: template.footnote(rule),
    footnoteIcon: template.footnoteIcon as IconName,
    fields: [...template.fields],
  }));

  const values: LoyaltyRuleValues = {
    spendingBaseAmount: rule.spendingBaseAmount,
    spendingBasePoints: rule.spendingBasePoints,
    visitPoints: rule.visitPoints,
    visitCooldownHours: rule.visitCooldownHours,
    firstVisitBonus: rule.firstVisitBonus,
    birthdayBonus: rule.birthdayBonus,
    referralBonus: rule.referralBonus,
  };

  const branches = input.branches.map(branch => ({
    id: branch.id,
    label: branch.name,
    suffix: branch.active ? '' : copy.pausedSuffix,
    active: Boolean(branch.active),
  }));

  return {
    name: input.businessName?.trim() || copy.title,
    statusLabel: rule.isActive ? copy.statusActive : copy.statusPaused,
    statusTone: rule.isActive ? 'success' : 'warning',
    enabled: rule.isActive,
    badge: rule.isActive ? copy.rulesActive : copy.rulesInactive,
    badgeTone: rule.isActive ? 'brand' : 'neutral',
    stats,
    cards,
    values,
    branches,
    activity: (input.logs ?? []).map(feedRow),
  };
}

// ---------------------------------------------------------------------------
// Rewards catalogue
// ---------------------------------------------------------------------------

export type RewardTabKey = 'active' | 'paused' | 'expired';

/** Tab order as the screen renders them; also the grouping key of `cards`. */
export const REWARD_TAB_KEYS: RewardTabKey[] = ['active', 'paused', 'expired'];

export interface RewardCardView {
  id: string;
  title: string;
  cost: string;
  kind: string;
  scope: string;
  cap: string;
  metric: string;
  statusLabel: string;
  statusTone: BusinessPillTone;
  /** Which tab this card lands in — see `rewardStatus`. */
  status: RewardTabKey;
  /** Drives the Pause/Resume tile; an expired reward offers neither. */
  paused: boolean;
  canToggle: boolean;
  image: { uri: string; alt: string } | null;
  /** Raw values for the constraint editor. */
  pointsRequired: number;
  totalQuantity: number | null;
  expiryDate: string | null;
}

export interface RedemptionFeedRowView {
  id: string;
  initials: string;
  name: string;
  detail: string;
  when: string;
  positive: boolean;
}

export interface LoyaltyRewardsView {
  tabs: { key: RewardTabKey; label: string; count: number }[];
  activeCountLabel: string;
  cards: Record<RewardTabKey, RewardCardView[]>;
  feed: RedemptionFeedRowView[];
  /** Options for the create sheet's outlet selector. */
  branchOptions: { id: string; label: string }[];
  /** Outlet the create sheet preselects — the branch the list was read for. */
  activeBranchId: string;
}

/**
 * Expiry wins over `isActive`: a reward that ran out of time is Expired whether
 * or not it is still toggled on, and offering "Resume" for it would silently
 * do nothing.
 */
function rewardStatus(reward: Reward, now: number): RewardTabKey {
  const expiry = reward.expiryDate ? Date.parse(reward.expiryDate) : Number.NaN;
  if (!Number.isNaN(expiry) && expiry < now) return 'expired';
  return reward.isActive ? 'active' : 'paused';
}

const statusCopy: Record<RewardTabKey, { label: string; tone: BusinessPillTone }> = {
  active: { label: rewardCopy.statusActive, tone: 'success' },
  paused: { label: rewardCopy.statusPaused, tone: 'warning' },
  expired: { label: rewardCopy.statusExpired, tone: 'neutral' },
};

/**
 * Recent-movement wording for the feed: `+400 pts · Purchased coffee`, with the
 * sign following the transaction type. The type is stored lowercase but the
 * OpenAPI example shouts it, so it is compared case-insensitively.
 */
function feedDetail(log: BusinessPointLog): { detail: string; positive: boolean } {
  const positive = log.type.trim().toLowerCase() === 'earned';
  const amount = formatCount(Math.abs(Number(log.amount) || 0));
  const points = `${positive ? '+' : '-'}${amount} pts`;
  return {
    detail: log.reason ? `${points} · ${log.reason}` : points,
    positive,
  };
}

function feedRow(log: BusinessPointLog, index: number): RedemptionFeedRowView {
  const first = log.customer?.firstName?.trim() ?? '';
  const last = log.customer?.lastName?.trim() ?? '';
  const name = `${first} ${last}`.trim() || rewardCopy.feedMember;
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase().slice(0, 2);

  return {
    id: log.id || `point-log-${index}`,
    initials: initials || name.slice(0, 2).toUpperCase(),
    name,
    ...feedDetail(log),
    when: relativeTime(log.createdAt),
  };
}

export function presentRewards(input: {
  rewards: readonly Reward[];
  logs?: readonly BusinessPointLog[] | null;
  branches: readonly BusinessBranch[];
  activeBranchId: string | null;
}): LoyaltyRewardsView {
  const now = Date.now();
  const branchLabel = (branchId?: string | null) =>
    input.branches.find(branch => branch.id === branchId)?.name ??
    rewardCopy.scopeFallback;

  const cards = input.rewards.map<RewardCardView>(reward => {
    const status = rewardStatus(reward, now);
    const meta = statusCopy[status];
    const total = reward.totalQuantity;
    const cap =
      total == null || total === -1
        ? rewardCopy.unlimited
        : rewardCopy.stockLeft(reward.remainingQuantity ?? total, total);

    return {
      id: reward.id,
      title: reward.name,
      cost: `${formatCount(reward.pointsRequired)} Points`,
      kind:
        rewardCopy.categories.find(category => category.value === reward.category)
          ?.label ?? reward.category,
      scope: branchLabel(reward.branchId),
      cap,
      metric: reward.expiryDate
        ? rewardCopy.expiresOn(formatDate(reward.expiryDate))
        : rewardCopy.noExpiry,
      statusLabel: meta.label,
      statusTone: meta.tone,
      status,
      paused: status === 'paused',
      canToggle: status !== 'expired',
      image: reward.coverImage ? { uri: reward.coverImage, alt: reward.name } : null,
      pointsRequired: reward.pointsRequired,
      totalQuantity: total ?? null,
      expiryDate: reward.expiryDate ?? null,
    };
  });

  const grouped: Record<RewardTabKey, RewardCardView[]> = {
    active: [],
    paused: [],
    expired: [],
  };
  for (const card of cards) grouped[card.status].push(card);

  return {
    tabs: REWARD_TAB_KEYS.map(key => ({
      key,
      label: rewardCopy.tabs.find(tab => tab.key === key)?.label ?? key,
      count: grouped[key].length,
    })),
    activeCountLabel: rewardCopy.activePerks(grouped.active.length),
    cards: grouped,
    feed: (input.logs ?? []).map(feedRow),
    branchOptions: input.branches.map(branch => ({ id: branch.id, label: branch.name })),
    activeBranchId: input.activeBranchId ?? input.branches[0]?.id ?? '',
  };
}
