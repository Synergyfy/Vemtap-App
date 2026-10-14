import type { ActiveSubscription } from '@api/subscriptionsApi';
import { formatDay } from '@features/business/verificationDisplay';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface TrialProgress {
  daysRemaining: number;
  totalDays: number;
  daysUsed: number;
  /** 0–100. */
  percentElapsed: number;
  startedOn: string | null;
  endsOn: string | null;
}

/** Day counts and dates for a trial, from `GET /subscriptions/active`. */
export function trialProgress(
  subscription: ActiveSubscription | undefined,
): TrialProgress {
  const start = subscription?.startDate ? new Date(subscription.startDate) : null;
  const endIso = subscription?.trialEndsAt ?? subscription?.endDate ?? null;
  const end = endIso ? new Date(endIso) : null;
  const totalDays =
    start && end
      ? Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS))
      : (subscription?.plan?.trialDurationDays ?? 30);
  const daysRemaining = Math.max(
    0,
    subscription?.daysRemaining ??
      (end ? Math.ceil((end.getTime() - Date.now()) / DAY_MS) : totalDays),
  );
  const daysUsed = Math.min(totalDays, Math.max(0, totalDays - daysRemaining));
  return {
    daysRemaining,
    totalDays,
    daysUsed,
    percentElapsed: Math.round((daysUsed / totalDays) * 100),
    startedOn: formatDay(subscription?.startDate),
    endsOn: formatDay(endIso),
  };
}

/** Short reference shown on plan cards, e.g. "#VEM-1A2B3C". */
export function subscriptionRef(id: string | null | undefined): string | null {
  return id ? `#VEM-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}` : null;
}
