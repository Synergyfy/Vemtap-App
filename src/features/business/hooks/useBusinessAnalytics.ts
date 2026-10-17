import { useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  businessAnalyticsApi,
  type AnalyticsExportInput,
  type AnalyticsQuery,
} from '@api/businessAnalyticsApi';
import { analyticsQuery, useAnalyticsFilterStore } from '@store/analyticsFilterStore';

/**
 * Analytics queries keyed by surface and window. Each surface is its own
 * request so a screen only waits for what it renders.
 */
export const businessAnalyticsKeys = {
  all: ['business-analytics'] as const,
  surface: (surface: string, query: AnalyticsQuery) =>
    [
      'business-analytics',
      surface,
      query.from,
      query.to,
      query.branchId ?? 'all',
    ] as const,
};

/** The current filter window as a request query, stable for the day. */
export function useAnalyticsQuery(): AnalyticsQuery {
  const preset = useAnalyticsFilterStore(state => state.preset);
  const customFrom = useAnalyticsFilterStore(state => state.customFrom);
  const customTo = useAnalyticsFilterStore(state => state.customTo);
  const branchId = useAnalyticsFilterStore(state => state.branchId);
  return useMemo(
    () => analyticsQuery({ preset, customFrom, customTo, branchId }),
    [preset, customFrom, customTo, branchId],
  );
}

const STALE_MS = 60_000;

export function useAnalyticsOverview(query: AnalyticsQuery) {
  return useQuery({
    queryKey: businessAnalyticsKeys.surface('overview', query),
    queryFn: () => businessAnalyticsApi.overview(query),
    staleTime: STALE_MS,
  });
}

export function useAnalyticsCustomers(query: AnalyticsQuery) {
  return useQuery({
    queryKey: businessAnalyticsKeys.surface('customers', query),
    queryFn: () => businessAnalyticsApi.customers(query),
    staleTime: STALE_MS,
  });
}

export function useAnalyticsDeals(query: AnalyticsQuery) {
  return useQuery({
    queryKey: businessAnalyticsKeys.surface('deals', query),
    queryFn: () => businessAnalyticsApi.deals(query),
    staleTime: STALE_MS,
  });
}

export function useAnalyticsPos(query: AnalyticsQuery) {
  return useQuery({
    queryKey: businessAnalyticsKeys.surface('pos', query),
    queryFn: () => businessAnalyticsApi.pos(query),
    staleTime: STALE_MS,
  });
}

export function useAnalyticsLocations(query: AnalyticsQuery) {
  return useQuery({
    queryKey: businessAnalyticsKeys.surface('locations', query),
    queryFn: () => businessAnalyticsApi.locations(query),
    staleTime: STALE_MS,
  });
}

/** `POST /business-analytics/export` — returns the file to share. */
export function useExportAnalytics() {
  return useMutation({
    mutationFn: (input: AnalyticsExportInput) => businessAnalyticsApi.export(input),
  });
}
