import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  branchApi,
  type Branch,
  type CreateBranchInput,
  type UpdateBranchInput,
} from '@api/branchApi';

/**
 * Branch writes and the caches that hold branch data.
 *
 * The Business Hub, the shared branch switcher and every `branchId`-scoped
 * query (dashboard, POS, offers, loyalty) all read the branches embedded in
 * `GET /businesses/my-business`. Creating or pausing a location therefore has to
 * invalidate that one query or the app keeps showing the old list — and a
 * location that was just created would have no id to scope the others to.
 */
const BRANCH_QUERY_PREFIX = ['business'] as const;

export const branchDetailKey = (branchId: string) =>
  ['branch', 'detail', branchId] as const;

/**
 * One branch in full, for the details screen.
 *
 * Disabled while the id is unknown so navigating without one cannot fire a
 * request against `undefined`. `placeholderData` keeps the previous branch's
 * payload on screen while a new one loads, so the dossier never blanks.
 */
export function useBranchDetail(branchId: string | null) {
  return useQuery<Branch>({
    queryKey: branchDetailKey(branchId ?? ''),
    queryFn: () => branchApi.getOne(branchId as string),
    enabled: Boolean(branchId),
  });
}

/** `POST /branches`. The backend enforces plan limits and rejects duplicates. */
export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBranchInput) => branchApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCH_QUERY_PREFIX });
    },
  });
}

/**
 * `PATCH /branches/:id`.
 *
 * `isActive: true` reactivates a paused location. `isActive: false` pauses it,
 * and the backend refuses to pause a business's last active location — that
 * rejection surfaces here as an error the screen reports rather than an
 * optimistic state the server never accepted.
 */
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { branchId: string } & UpdateBranchInput) =>
      branchApi.update(input.branchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCH_QUERY_PREFIX });
    },
  });
}
