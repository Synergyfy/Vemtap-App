import type { MyBusiness } from '@api/businessDashboardApi';
import type { DiscoverySettings } from '@api/businessNetworkApi';
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const copy = strings.businessSettings;

export type SettingsToggleId =
  | 'selfOrderingEnabled'
  | 'printKitchenChits'
  | 'refundRequiresPin'
  | 'voidRequiresPin'
  | 'pushNotifications'
  | 'emailSummary';

export interface SettingsToggleRow {
  id: SettingsToggleId;
  title: string;
  subtitle: string;
  icon: IconName;
  value: boolean;
}

export interface SettingsView {
  identity: { name: string; meta: string; live: boolean; verification: string };
  branchName: string;
  ordering: SettingsToggleRow[];
  hardware: { id: string; title: string; value: string; icon: IconName }[];
  team: SettingsToggleRow[];
  dispatch: SettingsToggleRow[];
  twoFactor: string;
  twoFactorOn: boolean;
  live: boolean;
}

export interface SettingsInput {
  business: MyBusiness;
  branchName: string | null;
  pos: {
    selfOrderingEnabled?: boolean;
    printKitchenChits?: boolean;
    permissions?: { refundRequiresPin?: boolean; voidRequiresPin?: boolean } | null;
  } | null;
  discovery: DiscoverySettings | null;
  peripherals: readonly { type: string }[];
  ownerEmail: string;
  twoFactorEnabled: boolean;
}

const HARDWARE: { id: string; icon: IconName }[] = [
  { id: 'printer', icon: 'printReceipt' },
  { id: 'card_terminal', icon: 'contactlessPay' },
  { id: 'scanner', icon: 'qrCodeScanner' },
];

export function toSettingsView(input: SettingsInput): SettingsView {
  const { business, pos, discovery } = input;
  const live = business.isVisible !== false;
  return {
    identity: {
      name: business.name,
      meta: copy.identityMeta(business.category?.name ?? '', business.city ?? ''),
      live,
      verification:
        copy.verification[business.verificationStatus ?? ''] ??
        (business.isVerified ? copy.verification.verified : copy.verification.unverified),
    },
    branchName: input.branchName ?? copy.noBranch,
    ordering: [
      {
        id: 'selfOrderingEnabled',
        title: copy.selfOrderingTitle,
        subtitle: copy.selfOrderingSubtitle,
        icon: 'dining',
        value: Boolean(pos?.selfOrderingEnabled),
      },
      {
        id: 'printKitchenChits',
        title: copy.kitchenChitsTitle,
        subtitle: copy.kitchenChitsSubtitle,
        icon: 'printReceipt',
        value: Boolean(pos?.printKitchenChits),
      },
    ],
    hardware: HARDWARE.map(item => ({
      id: item.id,
      title: copy.hardware[item.id],
      icon: item.icon,
      value: copy.hardwareCount(input.peripherals.filter(p => p.type === item.id).length),
    })),
    team: [
      {
        id: 'refundRequiresPin',
        title: copy.refundPinTitle,
        subtitle: copy.refundPinSubtitle,
        icon: 'pin',
        value: Boolean(pos?.permissions?.refundRequiresPin),
      },
      {
        id: 'voidRequiresPin',
        title: copy.voidPinTitle,
        subtitle: copy.voidPinSubtitle,
        icon: 'shieldPerson',
        value: Boolean(pos?.permissions?.voidRequiresPin),
      },
    ],
    dispatch: [
      {
        id: 'pushNotifications',
        title: copy.pushTitle,
        subtitle: copy.pushSubtitle,
        icon: 'notificationsActive',
        value: Boolean(discovery?.pushNotifications),
      },
      {
        id: 'emailSummary',
        title: copy.emailTitle,
        subtitle: copy.emailSubtitle(input.ownerEmail),
        icon: 'markEmailUnread',
        value: Boolean(discovery?.emailSummary),
      },
    ],
    twoFactor: input.twoFactorEnabled ? copy.twoFactorOn : copy.twoFactorOff,
    twoFactorOn: input.twoFactorEnabled,
    live,
  };
}
