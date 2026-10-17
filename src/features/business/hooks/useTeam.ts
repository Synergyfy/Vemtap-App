import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  teamApi,
  type InviteStaffInput,
  type TeamMember,
  type TeamQuery,
} from '@api/teamApi';

/**
 * Team directory queries and the writes behind the staff screens.
 *
 * Every mutation invalidates `['team']` as a whole rather than one key: a
 * branch-scoped list and the owner's business-wide list are the same rows under
 * two scopes, and an invite created in one must not sit undiscovered in the
 * other until its staleTime lapses.
 */
export const teamKeys = {
  all: ['team'] as const,
  members: (query: TeamQuery) =>
    ['team', 'members', query.branchId ?? 'all', query.allBranches ?? false] as const,
};

/** `GET /users/team` — enabled while a scope exists to ask for. */
export function useTeamMembers(query: TeamQuery, enabled = true) {
  return useQuery<TeamMember[]>({
    queryKey: teamKeys.members(query),
    queryFn: () => teamApi.list(query),
    enabled: enabled && (Boolean(query.branchId) || query.allBranches === true),
    staleTime: 60_000,
  });
}

/** `POST /users/team/invite` — plan-gated (`teamMembers`) server-side. */
export function useInviteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteStaffInput) => teamApi.invite(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** `POST /users/team/:id/resend-invite` — re-issues the invitation email. */
export function useResendTeamInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { memberId: string; branchId: string }) =>
      teamApi.resendInvite(input.memberId, input.branchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** `DELETE /users/team/:id` — also how a pending invitation is cancelled. */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { memberId: string; branchId: string }) =>
      teamApi.remove(input.memberId, input.branchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** `PATCH /users/team/:id` — role, permissions, job title, status. */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: { memberId: string; branchId: string } & Parameters<
        typeof teamApi.update
      >[2],
    ) => teamApi.update(input.memberId, input.branchId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}
