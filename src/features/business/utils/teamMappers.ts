import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';
import { inviteStaffInput, type InviteStaffInput, type TeamMember } from '@api/teamApi';

/**
 * `GET /users/team` payload → the directory's cards, filters and scope picker.
 *
 * The screen renders nothing but this view, so every value here is derived from
 * the API row: names, contact, status, branch and permission counts are live,
 * while the sentences describing what a role may do are the static copy block —
 * explanatory text, not data.
 */

const copy = strings.staffDirectory;

export type StaffFilterKey = 'all' | 'owners' | 'managers' | 'staff';

export interface StaffMemberView {
  id: string;
  name: string;
  /** `(You)` badge on the signed-in account's own card. */
  self?: string;
  contact: string;
  contactIcon: IconName;
  avatarUri?: string;
  initials: string;
  role: string;
  roleTone: 'inverse' | 'brand' | 'secondary' | 'neutral';
  roleIcon: IconName;
  scopeIcon: IconName;
  scope: string;
  status: string;
  blurb: string;
  /** Which filter chip this card belongs to. */
  group: Exclude<StaffFilterKey, 'all'>;
  pending: boolean;
  pendingTitle?: string;
  pendingBody?: string;
  pendingExpiry?: string;
  resend: string;
  resendDone: string;
  cancel: string;
  protected?: string;
  payout?: string;
  /** The member's own branch — writes are scoped to it, not to the viewer's scope. */
  branchId: string;
}

export interface StaffDirectoryView {
  scopeOptions: { label: string; value: string }[];
  filters: { key: StaffFilterKey; label: string; count: number }[];
  onlineLine: string;
  members: StaffMemberView[];
}

export interface StaffDirectoryBranch {
  id: string;
  name: string;
}

export interface PresentStaffDirectoryInput {
  members: TeamMember[];
  branches: readonly StaffDirectoryBranch[];
  /** Signed-in user, for the `(You)` badge. */
  currentUserId?: string;
}

function groupOf(member: TeamMember): Exclude<StaffFilterKey, 'all'> {
  const role = member.role.toLowerCase();
  const tag = member.roleTag.toLowerCase();
  if (role === 'owner') return 'owners';
  if (role === 'manager' || tag === 'manager') return 'managers';
  return 'staff';
}

function isPending(member: TeamMember): boolean {
  return member.status === 'Invited' || member.status === 'Pending';
}

function fullName(member: TeamMember): string {
  return [member.firstName, member.lastName].filter(Boolean).join(' ').trim();
}

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0].charAt(0);
  const second = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + second).toUpperCase();
}

function presentMember(
  member: TeamMember,
  branchName: string | undefined,
  currentUserId: string | undefined,
): StaffMemberView {
  const group = groupOf(member);
  const pending = isPending(member);
  const owner = group === 'owners';
  const name = fullName(member) || member.email || 'Unnamed teammate';
  const contact = member.email || member.phone || member.jobTitle || copy.noContact;

  const roleTone: StaffMemberView['roleTone'] = owner
    ? 'inverse'
    : group === 'managers'
      ? 'brand'
      : member.roleTag.toLowerCase().includes('cash')
        ? 'secondary'
        : 'neutral';

  const roleIcon: StaffMemberView['roleIcon'] = owner
    ? 'crown'
    : group === 'managers'
      ? 'shieldPerson'
      : member.roleTag.toLowerCase().includes('cash')
        ? 'qrScan'
        : 'group';

  const { governance } = copy;
  const blurb =
    group === 'owners'
      ? (governance[0]?.body ?? '')
      : group === 'managers'
        ? (governance[1]?.body ?? '')
        : (governance[2]?.body ?? '');

  return {
    id: member.id,
    name,
    ...(currentUserId && member.id === currentUserId ? { self: '(You)' } : {}),
    contact,
    contactIcon: member.email ? 'mail' : member.phone ? 'call' : 'badge',
    ...(member.avatar ? { avatarUri: member.avatar } : {}),
    initials: initialsOf(name),
    role: owner ? copy.ownerRole : member.roleTag || member.role || 'Staff',
    roleTone,
    roleIcon,
    scopeIcon: owner ? 'hub' : 'storefront',
    scope: owner ? copy.ownerScope : (branchName ?? copy.unassignedScope),
    status: owner
      ? `${copy.statusActive} · Primary`
      : member.isOnline
        ? `${copy.statusActive} · Online`
        : copy.statusActive,
    blurb,
    group,
    pending,
    ...(pending
      ? {
          pendingTitle: copy.pendingTitle,
          pendingBody: member.email
            ? `${copy.pendingBodyPrefix} ${member.email}${
                branchName ? ` ${copy.pendingBodySuffix} ${branchName}` : ''
              }.`
            : copy.pendingBodyFallback,
        }
      : {}),
    resend: copy.resendLabel,
    resendDone: copy.resendDone,
    cancel: copy.cancelLabel,
    ...(owner ? { protected: copy.ownerProtected, payout: copy.ownerPayout } : {}),
    branchId: member.branchId,
  };
}

/** Builds the whole directory view: scope options, filter counts, member cards. */
export function presentStaffDirectory({
  members,
  branches,
  currentUserId,
}: PresentStaffDirectoryInput): StaffDirectoryView {
  const branchNameById = new Map(branches.map(branch => [branch.id, branch.name]));
  const scopeOptions = [
    { label: copy.allLocations, value: 'all' },
    ...branches.map(branch => ({ label: branch.name, value: branch.id })),
  ];

  const presented = members.map(member =>
    presentMember(member, branchNameById.get(member.branchId), currentUserId),
  );

  const countGroup = (group: StaffFilterKey) =>
    group === 'all'
      ? presented.length
      : presented.filter(member => member.group === group).length;

  const online = members.filter(member => member.isOnline && !isPending(member)).length;

  return {
    scopeOptions,
    filters: (Object.keys(copy.filterLabels) as StaffFilterKey[]).map(key => ({
      key,
      label: copy.filterLabels[key],
      count: countGroup(key),
    })),
    onlineLine: `${online} ${copy.onlineLabel}`,
    members: presented,
  };
}

/* -------------------------------------------------------------------------- */
/* Invite form                                                                 */
/* -------------------------------------------------------------------------- */

export type InviteRoleId = 'manager' | 'cashier' | 'service' | 'custom';

export interface InviteStaffForm {
  fullName: string;
  email: string;
  phone?: string;
  roleId: InviteRoleId;
  branchId: string;
}

/**
 * The invite screen has no permission picker — its matrix is a read-only preview
 * — so each preset ships the entitlements that role needs to be usable at all.
 * Without them a `Staff` account would clear authentication and then be refused
 * by every `@Permissions(...)` route, since only OWNER/ADMIN bypass that guard.
 *
 * All values are members of the backend's `StaffPermission` enum.
 */
const ROLE_LABELS: Record<InviteRoleId, string> = {
  manager: 'Manager',
  cashier: 'Cashier',
  service: 'Service Staff',
  custom: 'Custom Staff',
};

const ROLE_PERMISSIONS: Record<InviteRoleId, string[]> = {
  manager: [
    'dashboard',
    'inventory',
    'pos',
    'visitors',
    'messages',
    'engagement',
    'customer-experience',
    'marketing',
    'discovery',
    'analytics',
    'staff',
    'settings',
    'qrthrive',
  ],
  cashier: ['dashboard', 'pos', 'visitors', 'customer-experience'],
  service: ['dashboard', 'visitors', 'messages', 'customer-experience'],
  custom: ['dashboard'],
};

/**
 * Form state → the `POST /users/team/invite` body, validated against the same
 * schema the request sends so a one-word name or a malformed email fails here
 * with the form's message instead of surfacing as a server rejection.
 */
export function inviteFormToInput(form: InviteStaffForm): InviteStaffInput {
  const [firstName, ...rest] = form.fullName.trim().split(/\s+/).filter(Boolean);
  const phone = form.phone?.trim();

  return inviteStaffInput.parse({
    firstName,
    lastName: rest.join(' '),
    email: form.email.trim(),
    ...(phone ? { phone } : {}),
    role: ROLE_LABELS[form.roleId],
    permissions: ROLE_PERMISSIONS[form.roleId],
    branchId: form.branchId,
  });
}
