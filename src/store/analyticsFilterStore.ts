import { create } from 'zustand';
import type { AnalyticsQuery } from '@api/businessAnalyticsApi';

/**
 * The period and branch every analytics screen reads, so switching from the
 * Business view to Customers keeps the same window. Session-only on purpose:
 * analytics reopen on the default 30 days.
 */
export type AnalyticsPreset = 'today' | '7d' | '30d' | '90d' | 'year' | 'custom';

export interface AnalyticsFilterState {
  preset: AnalyticsPreset;
  /** `YYYY-MM-DD`, inclusive — only read for the `custom` preset. */
  customFrom: string | null;
  customTo: string | null;
  /** `null` = every branch. */
  branchId: string | null;
  apply: (filters: {
    preset: AnalyticsPreset;
    customFrom?: string | null;
    customTo?: string | null;
    branchId?: string | null;
  }) => void;
  setPreset: (preset: AnalyticsPreset) => void;
  reset: () => void;
}

const DEFAULTS = {
  preset: '30d' as AnalyticsPreset,
  customFrom: null,
  customTo: null,
  branchId: null,
};

export const useAnalyticsFilterStore = create<AnalyticsFilterState>()(set => ({
  ...DEFAULTS,
  apply: filters =>
    set(state => ({
      preset: filters.preset,
      customFrom: filters.customFrom ?? state.customFrom,
      customTo: filters.customTo ?? state.customTo,
      branchId: filters.branchId === undefined ? state.branchId : filters.branchId,
    })),
  setPreset: preset => set({ preset }),
  reset: () => set({ ...DEFAULTS }),
}));

const startOfDay = (date: Date) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
};
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** `2026-10-01` → local midnight; `null` for anything that is not a real date. */
export function parseLocalDate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value?.trim() ?? '');
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
    ? date
    : null;
}

/**
 * The request window for a preset, in whole local days ending at the next
 * midnight — so the query key stays the same all day instead of changing with
 * every render's `now`.
 */
export function analyticsRange(
  filters: Pick<AnalyticsFilterState, 'preset' | 'customFrom' | 'customTo'>,
  now: Date = new Date(),
): { from: Date; to: Date } {
  const tomorrow = addDays(startOfDay(now), 1);
  switch (filters.preset) {
    case 'today':
      return { from: startOfDay(now), to: tomorrow };
    case '7d':
      return { from: addDays(tomorrow, -7), to: tomorrow };
    case '90d':
      return { from: addDays(tomorrow, -90), to: tomorrow };
    case 'year':
      return { from: new Date(now.getFullYear(), 0, 1), to: tomorrow };
    case 'custom': {
      const from = parseLocalDate(filters.customFrom);
      const to = parseLocalDate(filters.customTo);
      if (from && to && from <= to) return { from, to: addDays(to, 1) };
      return { from: addDays(tomorrow, -30), to: tomorrow };
    }
    case '30d':
    default:
      return { from: addDays(tomorrow, -30), to: tomorrow };
  }
}

export function analyticsQuery(
  filters: Pick<AnalyticsFilterState, 'preset' | 'customFrom' | 'customTo' | 'branchId'>,
  now: Date = new Date(),
): AnalyticsQuery {
  const { from, to } = analyticsRange(filters, now);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    ...(filters.branchId ? { branchId: filters.branchId } : {}),
  };
}
