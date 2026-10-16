import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  segmentsApi,
  type CreateSegmentInput,
  type SegmentCriteria,
  type SegmentScope,
} from '@api/segmentsApi';
import { useActiveBranch } from '@features/business/hooks/useActiveBranch';
import { useDebounce } from '@hooks/useDebounce';

/**
 * Customer segments for the active branch. The API scopes every segment read
 * and write to one branch, so all of these use the same scope; an offline
 * (designed) branch list has no real ids, so nothing is sent until it is live.
 */
function useSegmentScope(): { scope: SegmentScope; ready: boolean; key: string } {
  const { activeBranchId, isLive } = useActiveBranch();
  const branchId = isLive ? (activeBranchId ?? undefined) : undefined;
  return { scope: branchId ? { branchId } : {}, ready: isLive, key: branchId ?? 'own' };
}

export const segmentKeys = {
  all: ['segments'] as const,
  list: (scope: string) => ['segments', 'list', scope] as const,
  detail: (scope: string, id: string) => ['segments', 'detail', scope, id] as const,
  insights: (scope: string, id: string) => ['segments', 'insights', scope, id] as const,
  options: ['segments', 'criteria-options'] as const,
  preview: (criteria: SegmentCriteria) => ['segments', 'preview', criteria] as const,
};

export function useSegments() {
  const { scope, ready, key } = useSegmentScope();
  return useQuery({
    queryKey: segmentKeys.list(key),
    queryFn: () => segmentsApi.listSegments(scope),
    enabled: ready,
    staleTime: 60_000,
  });
}

export function useSegment(segmentId: string | undefined) {
  const { scope, ready, key } = useSegmentScope();
  return useQuery({
    queryKey: segmentKeys.detail(key, segmentId ?? ''),
    queryFn: () => segmentsApi.getSegment(segmentId!, scope),
    enabled: ready && Boolean(segmentId),
    staleTime: 60_000,
  });
}

export function useSegmentInsights(segmentId: string | undefined) {
  const { scope, ready, key } = useSegmentScope();
  return useQuery({
    queryKey: segmentKeys.insights(key, segmentId ?? ''),
    queryFn: () => segmentsApi.getSegmentInsights(segmentId!, scope),
    enabled: ready && Boolean(segmentId),
    staleTime: 60_000,
  });
}

/** Deals, menu items and branches the builder's pickers offer. */
export function useSegmentCriteriaOptions() {
  const { ready } = useSegmentScope();
  return useQuery({
    queryKey: segmentKeys.options,
    queryFn: () => segmentsApi.getSegmentCriteriaOptions(),
    enabled: ready,
    staleTime: 5 * 60_000,
  });
}

/**
 * Live size and channel reach for a rule set, debounced so ticking several
 * criteria in a row sends one request. `{}` sizes every customer seen.
 */
export function useSegmentPreview(criteria: SegmentCriteria, enabled = true) {
  const { ready } = useSegmentScope();
  const debounced = useDebounce(criteria, 350);
  return useQuery({
    queryKey: segmentKeys.preview(debounced),
    queryFn: () => segmentsApi.previewSegment(debounced),
    enabled: ready && enabled,
    staleTime: 60_000,
    placeholderData: previous => previous,
  });
}

/** Create a dynamic segment, or update one when `segmentId` is given. */
export function useSaveSegment() {
  const queryClient = useQueryClient();
  const { scope } = useSegmentScope();
  return useMutation({
    mutationFn: ({
      segmentId,
      input,
    }: {
      segmentId?: string;
      input: Omit<CreateSegmentInput, 'branchId' | 'type'>;
    }) =>
      segmentId
        ? segmentsApi.updateSegment(segmentId, { ...input, type: 'dynamic' }, scope)
        : segmentsApi.createSegment({ ...input, ...scope, type: 'dynamic' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: segmentKeys.all }),
  });
}
