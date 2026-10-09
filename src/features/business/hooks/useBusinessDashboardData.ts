import { useQuery } from '@tanstack/react-query';
import {
  businessDashboardApi,
  type ActiveSubscription,
  type BusinessDashboard,
  type MyBusiness,
  type PendingClaim,
  type PosDashboard,
} from '@api/businessDashboardApi';
import type { BusinessBranch } from '@features/business/components/BusinessBranchSwitcher';

/**
 * Owner-side Overview data: business + branches, per-branch dashboard stats,
 * POS takings, unread notifications, and the counts behind "Today's Activity".
 *
 * `branchId` for the dashboard and POS calls comes from `useMyBusiness`, so
 * both queries stay disabled until the branch list is known — without it the
 * API rejects the request (`branchId` is required and must be a UUID).
 *
 * The pure mappers at the bottom are exported because the response shapes for
 * `stats` and `activityData` are only half-documented (backend-fixies §10):
 * the screen reads them through candidate keys, and the candidates are unit
 * tested directly rather than through a rendered tree.
 */

export const businessDashboardKeys = {
  myBusiness: () => ['business', 'my-business'] as const,
  dashboard: (branchId: string) => ['business', 'dashboard', branchId] as const,
  posDashboard: (branchId: string) => ['business', 'pos-dashboard', branchId] as const,
  unreadCount: () => ['business', 'unread-count'] as const,
  newOrdersCount: () => ['business', 'new-orders-count'] as const,
  claims: () => ['business', 'claims'] as const,
  subscription: () => ['business', 'subscription', 'active'] as const,
};

/** The caller's business (name, verification, branches). */
export function useMyBusiness() {
  return useQuery<MyBusiness>({
    queryKey: businessDashboardKeys.myBusiness(),
    queryFn: () => businessDashboardApi.getMyBusiness(),
    staleTime: 300_000,
  });
}

/** Active subscription for the current business (plan name + trial window). */
export function useBusinessSubscription() {
  return useQuery<ActiveSubscription>({
    queryKey: businessDashboardKeys.subscription(),
    queryFn: () => businessDashboardApi.getActiveSubscription(),
    staleTime: 300_000,
  });
}

/** Overview stats for one branch. Pass `null` while the branch is unknown. */
export function useBusinessDashboard(branchId: string | null, enabled = true) {
  return useQuery<BusinessDashboard>({
    queryKey: businessDashboardKeys.dashboard(branchId ?? ''),
    queryFn: () => businessDashboardApi.getBusinessDashboard(branchId as string),
    enabled: Boolean(branchId) && enabled,
    staleTime: 60_000,
  });
}

/** POS revenue and transaction count for one branch (or the whole business). */
export function usePosDashboard(branchId: string | null, enabled = true) {
  return useQuery<PosDashboard>({
    queryKey: businessDashboardKeys.posDashboard(branchId ?? ''),
    queryFn: () => businessDashboardApi.getPosDashboard(branchId),
    enabled: Boolean(branchId) && enabled,
    staleTime: 60_000,
  });
}

/** Unread notification count for the signed-in user. */
export function useUnreadNotificationsCount() {
  return useQuery<number>({
    queryKey: businessDashboardKeys.unreadCount(),
    queryFn: () => businessDashboardApi.getUnreadCount(),
    staleTime: 60_000,
  });
}

/** Orders waiting on the business (`status=new`). */
export function useNewOrdersCount() {
  return useQuery<number>({
    queryKey: businessDashboardKeys.newOrdersCount(),
    queryFn: () => businessDashboardApi.getNewOrdersCount(),
    staleTime: 60_000,
  });
}

/** Promotion claims for the business (shape undocumented — see §10). */
export function usePendingClaims() {
  return useQuery<PendingClaim[]>({
    queryKey: businessDashboardKeys.claims(),
    queryFn: () => businessDashboardApi.getClaims(),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

/** Branch rows for the shared switcher, marking the main branch active. */
export function toBranchList(business?: MyBusiness): BusinessBranch[] {
  return (business?.branches ?? [])
    .filter(branch => branch.id && branch.isActive !== false)
    .map(branch => ({
      id: branch.id,
      name: branch.name,
      address: branch.address ?? '',
      active: branch.isMainBranch === true,
    }));
}

/**
 * Coerce one loosely-typed stat (number or numeric string) to a number.
 * Returns `undefined` for anything unreadable so callers show "—" rather
 * than `NaN`.
 */
export function toStatNumber(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const cleaned = raw.replace(/[^0-9.-]/g, '');
    // `Number('')` is 0, so an unparseable string ("n/a") must not become 0.
    if (cleaned !== '') {
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

/**
 * Read a numeric stat from `DashboardStatsDto`, trying documented-adjacent
 * key names because the DTO's own fields are not published. Returns
 * `undefined` when nothing matches so the screen can show "—" instead of a
 * placeholder number.
 */
export function pickStat(
  stats: Record<string, unknown> | undefined,
  keys: readonly string[],
): number | undefined {
  if (!stats) return undefined;
  for (const key of keys) {
    const value = toStatNumber(stats[key]);
    if (value !== undefined) return value;
  }
  return undefined;
}

/** `₦312,400` style, for the POS takings card. */
export function formatNaira(value: number): string {
  return `₦${value.toLocaleString('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;
}

/** `₦48.2k` / `₦1.2m` style, for the compact volume tile. */
export function formatCompactNaira(value: number): string {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(1)}k`;
  return `₦${value}`;
}

/**
 * Human age of the dashboard payload (`generatedAt`): "Just now", "5m ago",
 * "2h ago". Returns null when the timestamp is missing/unparseable so the
 * screen keeps its design copy.
 */
export function formatUpdatedAgo(
  iso: string | null | undefined,
  now: number = Date.now(),
): string | null {
  if (!iso) return null;
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) return null;

  const minutes = Math.floor(Math.max(0, now - timestamp) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

const countKeys = ['value', 'count', 'visits', 'total', 'amount'] as const;

/** One chart point's numeric value, or `undefined` when unreadable. */
export function activityPointValue(point: Record<string, unknown>): number | undefined {
  return pickStat(point, countKeys);
}

/**
 * Normalise the dashboard's activity series to 0–100 bar heights.
 * Returns `null` when fewer than three points are readable, so the screen can
 * keep the designed chart instead of drawing a broken one.
 */
export function activityPercents(
  points: readonly Record<string, unknown>[] | undefined,
): number[] | null {
  if (!points || points.length < 3) return null;
  const values = points.map(point => activityPointValue(point));
  if (values.some(value => value === undefined)) return null;
  const max = Math.max(...(values as number[]), 1);
  return (values as number[]).map(value => Math.round((value / max) * 100));
}

/** Weekday labels for the chart, when the series ships readable ones. */
export function activityPointLabels(
  points: readonly Record<string, unknown>[] | undefined,
): string[] | null {
  if (!points || points.length < 3) return null;
  const labels = points.map(point => {
    for (const key of ['day', 'date', 'label', 'name']) {
      const raw = point[key];
      // Only short labels ("Mon", "Monday"); ISO dates would read as "202".
      if (typeof raw === 'string' && raw.trim() !== '' && raw.length <= 8) {
        return raw.slice(0, 3);
      }
    }
    return null;
  });
  return labels.some(label => label === null) ? null : (labels as string[]);
}

/**
 * How many messages are unread. If the payload carries read state we count
 * the unread ones; if it does not, every returned message counts — a list
 * endpoint that returns only threads is assumed to return the unread set.
 */
export function countUnreadMessages(
  messages: readonly Record<string, unknown>[],
): number {
  const withState = messages.filter(
    message =>
      typeof message.read === 'boolean' ||
      typeof message.isRead === 'boolean' ||
      typeof message.unread === 'boolean',
  );
  if (withState.length === 0) return messages.length;
  return withState.filter(message => {
    if (typeof message.unread === 'boolean') return message.unread;
    if (typeof message.read === 'boolean') return !message.read;
    return message.isRead === false;
  }).length;
}

/**
 * How many claims still need verification. Claims without a `status` field
 * count as pending (the endpoint's response is undocumented — §10).
 */
export function countPendingClaims(claims: readonly Record<string, unknown>[]): number {
  const withStatus = claims.filter(claim => typeof claim.status === 'string');
  if (withStatus.length === 0) return claims.length;
  return withStatus.filter(claim => /pending|awaiting|new/i.test(claim.status as string))
    .length;
}
