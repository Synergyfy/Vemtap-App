import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessSettingsGroup } from '@features/business/components/BusinessPosPrimitives';
import {
  settingsBranch,
  settingsDispatchGroups,
  settingsHardwareGroups,
  settingsSecurityGroups,
  settingsSessionGroups,
  settingsStoreGroups,
  settingsTeamGroups,
} from '@features/business/data/businessTrustSettingsData';

const copy = strings.businessSettings;

/** Icon per settings row id so the list and its data stay in one place. */
const settingsRowIcon: Record<string, string> = {
  branch: 'storefront',
  hours: 'schedule',
  'dine-in': 'dining',
  alerts: 'notificationsActive',
  drawer: 'payments',
  printer: 'printReceipt',
  scanner: 'qrCodeScanner',
  'refund-pin': 'pin',
  'mask-phone': 'shieldPerson',
  whatsapp: 'whatsapp',
  'email-digest': 'markEmailUnread',
  '2fa': 'verifiedUser',
  pin: 'password',
  devices: 'devices',
  pause: 'pauseCircle',
  signout: 'logout',
};

export interface BusinessSettingsScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onChangeBranch?: () => void;
  onChangeHours?: () => void;
  onOpenRow?: (rowId: string) => void;
  onToggleRow?: (rowId: string, value: boolean) => void;
}

/**
 * Business settings: storefront identity and location, ordering behaviour,
 * POS hardware, team policy, dispatch, security and session management. Every
 * group renders through the shared settings-row primitive.
 */
export function BusinessSettingsScreen({
  onBack,
  onOpenProfile,
  onChangeBranch,
  onChangeHours,
  onOpenRow,
  onToggleRow,
}: BusinessSettingsScreenProps) {
  const [switches, setSwitches] = useState<Record<string, boolean>>({
    'dine-in': true,
    alerts: true,
    'refund-pin': true,
    'mask-phone': true,
    whatsapp: false,
    'email-digest': true,
  });

  const toggle = (id: string, value: boolean) => {
    setSwitches(current => ({ ...current, [id]: value }));
    onToggleRow?.(id, value);
  };

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8 gap-3"
    >
      <View className="gap-2 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-2">
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.identityName}
          </VemtapText>
          <Icon name="verified" size={17} color={colors.primary} />
        </View>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {copy.identityMeta}
        </VemtapText>
        <View className="flex-row items-center justify-between gap-2">
          <BusinessStatusPill label={copy.identityStatus} tone="success" />
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="shrink-0"
            numberOfLines={1}
          >
            {copy.identityStatusNote}
          </VemtapText>
        </View>
      </View>

      <BusinessSettingsGroup
        rows={[
          {
            title: copy.branchTitle,
            subtitle: copy.branchSubtitle,
            icon: 'storefront' as const,
            trailing: 'value',
            value: settingsBranch.title,
            onPress: onChangeBranch,
          },
          {
            title: copy.hoursTitle,
            subtitle: copy.hoursStatus,
            icon: 'schedule' as const,
            trailing: 'value',
            value: settingsBranch.hours,
            onPress: onChangeHours,
          },
        ]}
      />

      <BusinessSettingsGroup
        rows={settingsStoreGroups.map(row => ({
          title: row.title,
          subtitle: row.subtitle,
          icon: settingsRowIcon[row.id] as never,
          trailing: 'switch' as const,
          switchValue: switches[row.id],
          onSwitchChange: value => toggle(row.id, value),
        }))}
      />

      <View className="flex-row items-center justify-between gap-2 px-1">
        <VemtapText
          variant="labelMd"
          className="min-w-0 flex-1 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.hardwareTitle}
        </VemtapText>
        <BusinessStatusPill label={copy.hardwareBadge} tone="brand" />
      </View>

      <BusinessSettingsGroup
        rows={[
          {
            title: 'Default Cash Drawer Base',
            subtitle: 'Opening balance per shift',
            icon: 'payments' as const,
            trailing: 'value',
            value: settingsBranch.drawerBase,
            onPress: () => onOpenRow?.('drawer'),
          },
          ...settingsHardwareGroups.map(row => ({
            title: row.title,
            subtitle: row.subtitle,
            icon: settingsRowIcon[row.id] as never,
            trailing: 'value' as const,
            value: row.value,
            onPress: () => onOpenRow?.(row.id),
          })),
        ]}
      />

      <View className="px-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.teamTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {settingsTeamGroups[0].subtitle}
        </VemtapText>
      </View>

      <BusinessSettingsGroup
        rows={settingsTeamGroups.map(row => ({
          title: row.title,
          subtitle: row.subtitle,
          icon: settingsRowIcon[row.id] as never,
          trailing: 'switch' as const,
          switchValue: switches[row.id],
          onSwitchChange: value => toggle(row.id, value),
        }))}
      />

      <View className="px-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.dispatchTitle}
        </VemtapText>
      </View>

      <BusinessSettingsGroup
        rows={settingsDispatchGroups.map(row => ({
          title: row.title,
          subtitle: row.subtitle,
          icon: settingsRowIcon[row.id] as never,
          trailing: row.id === 'whatsapp' ? ('switch' as const) : ('value' as const),
          switchValue: switches[row.id],
          onSwitchChange: value => toggle(row.id, value),
          value: row.value,
          onPress: () => onOpenRow?.(row.id),
        }))}
      />

      <View className="px-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.securityTitle}
        </VemtapText>
      </View>

      <BusinessSettingsGroup
        rows={settingsSecurityGroups.map(row => ({
          title: row.title,
          subtitle: row.subtitle,
          icon: settingsRowIcon[row.id] as never,
          trailing: 'value' as const,
          value: row.value,
          valueTone: (row.id === '2fa' ? 'success' : 'default') as 'success' | 'default',
          onPress: () => onOpenRow?.(row.id),
        }))}
      />

      <View className="px-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.sessionsTitle}
        </VemtapText>
      </View>

      <BusinessSettingsGroup
        rows={settingsSessionGroups.map(row => ({
          title: row.title,
          subtitle: row.subtitle,
          icon: settingsRowIcon[row.id] as never,
          trailing: (row.id === 'signout' ? 'arrow' : 'pill') as 'arrow' | 'pill',
          value: row.value,
          onPress: () => onOpenRow?.(row.id),
        }))}
      />

      <View className="flex-row items-center gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <Icon name="devices" size={14} color={colors.textTertiary} />
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {copy.terminalVersion}
        </VemtapText>
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="shrink-0"
          numberOfLines={1}
        >
          {copy.terminalFooter}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}
