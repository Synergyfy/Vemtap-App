import { z } from 'zod';
import { request, requestValidated } from '@api/client';
import {
  nullableFlag,
  nullableStringArray,
  nullableText,
  nullableTimestamp,
} from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Owner/manager side team management (`/users/team`).
 *
 * The backend returns `User` entity rows (never a dedicated DTO), so the
 * schema is loose: only the fields the directory actually renders are pinned,
 * everything else the serializer adds or omits without breaking the parse.
 * Nullable columns are the norm here — `phone`, `jobTitle`, `avatar`,
 * `branchId` and `permissions` are all genuinely null for a fresh account.
 *
 * Write endpoints scope by branch (`?branchId=`), which is the member's own
 * branch rather than the viewer's scope: `PATCH`/`DELETE` look the row up with
 * `{ id, branchId }`, so an owner looking at "All Locations" has to pass the
 * branch the row belongs to or the backend answers 404.
 */
export const teamMemberSchema = z.looseObject({
  id: z.string(),
  firstName: nullableText(),
  lastName: nullableText(),
  email: nullableText(),
  phone: nullableText(),
  jobTitle: nullableText(),
  avatar: nullableText(),
  /** Display tag — free text ("Cashier"), unlike the role enum below. */
  roleTag: nullableText(),
  /** `Owner | Manager | Staff | Admin | …`, as the enum is stored. */
  role: nullableText(),
  status: nullableText(),
  permissions: nullableStringArray(),
  branchId: nullableText(),
  businessId: nullableText(),
  isOnline: nullableFlag(false),
  lastActive: nullableTimestamp(),
  createdAt: nullableTimestamp(),
});
export type TeamMember = z.infer<typeof teamMemberSchema>;

/** `GET /users/team` answers with a bare array; some list routes wrap in `{data}`. */
const teamListResponse = z.union([
  z.array(teamMemberSchema),
  z.object({ data: z.array(teamMemberSchema) }).transform(payload => payload.data),
]);

export interface TeamQuery {
  /** Omit when `allBranches` is set — the backend then resolves its own scope. */
  branchId?: string;
  /** Owner/Admin only; ignored for other roles, which fall back to their branch. */
  allBranches?: boolean;
}

/**
 * Invite payload — mirrors `InviteStaffDto`, whose backend runs
 * `forbidNonWhitelisted`, so every key here is declared server-side and nothing
 * extra may be sent.
 *
 * `branchId` is required in practice: the controller resolves the invite's
 * branch from the body, then the caller's own branch, and errors when neither
 * exists — which is the common case for an owner whose own record has no branch.
 */
export const inviteStaffInput = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().min(7, 'Enter a valid phone number').optional(),
  /** Free text: the backend maps `manager` → MANAGER and everything else → STAFF. */
  role: z.string().trim().min(1),
  jobTitle: z.string().trim().min(1).optional(),
  /** Values must be members of the backend's `StaffPermission` enum. */
  permissions: z.array(z.string()).min(1).optional(),
  branchId: z.string().min(1),
});
export type InviteStaffInput = z.infer<typeof inviteStaffInput>;

export const updateStaffInput = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email('Enter a valid email address').optional(),
  role: z.string().trim().min(1).optional(),
  jobTitle: z.string().trim().min(1).optional(),
  permissions: z.array(z.string()).min(1).optional(),
});
export type UpdateStaffInput = z.infer<typeof updateStaffInput>;

export const teamApi = {
  /** Team members for one branch, or for the whole business with `allBranches`. */
  async list(
    query: TeamQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<TeamMember[]> {
    return requestValidated<TeamMember[]>(
      { method: 'GET', url: '/users/team', params: query, ...options },
      teamListResponse,
    );
  },

  /** `POST /users/team/invite` — creates the row as `Invited` and emails credentials. */
  async invite(
    input: InviteStaffInput,
    options: ApiRequestOptions = {},
  ): Promise<TeamMember> {
    return requestValidated<TeamMember>(
      {
        method: 'POST',
        url: '/users/team/invite',
        data: inviteStaffInput.parse(input),
        ...options,
      },
      teamMemberSchema,
    );
  },

  /** `PATCH /users/team/:id` — role, permissions, job title, status. */
  async update(
    memberId: string,
    branchId: string,
    payload: UpdateStaffInput,
    options: ApiRequestOptions = {},
  ): Promise<TeamMember> {
    return requestValidated<TeamMember>(
      {
        method: 'PATCH',
        url: `/users/team/${memberId}`,
        params: { branchId },
        data: updateStaffInput.parse(payload),
        ...options,
      },
      teamMemberSchema,
    );
  },

  /** `DELETE /users/team/:id` — answers 200 with no body, so nothing to parse. */
  async remove(
    memberId: string,
    branchId: string,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await request<unknown>({
      method: 'DELETE',
      url: `/users/team/${memberId}`,
      params: { branchId },
      ...options,
    });
  },

  /**
   * `POST /users/team/:id/resend-invite` — re-issues the invitation email with
   * a fresh temporary password. Only rows still in `Invited` are accepted.
   */
  async resendInvite(
    memberId: string,
    branchId: string,
    options: ApiRequestOptions = {},
  ): Promise<TeamMember> {
    return requestValidated<TeamMember>(
      {
        method: 'POST',
        url: `/users/team/${memberId}/resend-invite`,
        params: { branchId },
        ...options,
      },
      teamMemberSchema,
    );
  },
};
