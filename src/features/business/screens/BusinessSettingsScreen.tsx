import React from 'react';
import { Alert, View } from 'react-native';
import { ErrorState, LoadingState } from '@components/shared';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessSettingsGroup } from '@features/business/components/BusinessPosPrimitives';
import type {
  SettingsToggleId,
  SettingsToggleRow,
  SettingsView,
} from '@features/business/utils/settingsMappers';

const copy = strings.businessSettings;

export interface BusinessSettingsScreenProps {
  view?: SettingsView;
  isError?: boolean;
  onRetry?: () => void;
  /** Only owners may change POS policy, discovery and storefront state. */
  canEdit?: boolean;
  notice?: string | null;
  onBack?: () => void;
  onOpenProfile?: () => void;
  onChangeBranch?: () => void;
  onChangeHours?: () => void;
  onOpenHardware?: () => void;
  onOpenSecurity?: () => void;
  onToggle?: (id: SettingsToggleId, value: boolean) => void;
  onSetLive?: (live: boolean) => void;
  onSignOut?: () => void;
}

/**
 * Business settings: storefront identity and branch, ordering and POS policy,
 * hardware, notifications, security and storefront state. Every row reads and
 * writes the store that owns it (POS settings, discovery settings, the
 * business profile); rows a manager may not change are read-only.
 */
export function BusinessSettingsScreen({
  view,
  isError,
  onRetry,
  canEdit = true,
  notice,
  onBack,
  onOpenProfile,
  onChangeBranch,
  onChangeHours,
  onOpenHardware,
  onOpenSecurity,
  onToggle,
  onSetLive,
  onSignOut,
}: BusinessSettingsScreenProps) {
  const toggles = (rows: SettingsToggleRow[]) =>
    rows.map(row => ({
      title: row.title,
      subtitle: row.subtitle,
      icon: row.icon,
      trailing: 'switch' as const,
      switchValue: row.value,
      onSwitchChange: canEdit ? (value: boolean) => onToggle?.(row.id, value) : undefined,
    }));

  const confirmPause = () =>
    Alert.alert(copy.pauseConfirmTitle, copy.pauseConfirmBody, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.pauseConfirm,
        style: 'destructive',
        onPress: () => onSetLive?.(false),
      },
    ]);

  const heading = (title: string, subtitle?: string) => (
    <View className="px-1">
      <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
        {title}
      </VemtapText>
      {subtitle ? (
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {subtitle}
        </VemtapText>
      ) : null}
    </View>
  );

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          {
            icon: 'accountCircle',
            label: strings.businessShell.profileLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8 gap-3"
    >
      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={copy.loading} />
        )
      ) : (
        <>
          <View className="gap-2 rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-center gap-2">
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={1}
              >
                {view.identity.name}
              </VemtapText>
              <Icon name="verified" size={17} color={colors.primary} />
            </View>
            {view.identity.meta ? (
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {view.identity.meta}
              </VemtapText>
            ) : null}
            <View className="flex-row items-center justify-between gap-2">
              <BusinessStatusPill
                label={view.identity.live ? copy.identityLive : copy.identityPaused}
                tone={view.identity.live ? 'success' : 'warning'}
              />
              <VemtapText
                variant="caption"
                tone="tertiary"
                className="shrink-0"
                numberOfLines={1}
              >
                {view.identity.verification}
              </VemtapText>
            </View>
          </View>

          {notice ? (
            <VemtapText variant="caption" className="px-1 text-error">
              {notice}
            </VemtapText>
          ) : null}
          {!canEdit ? (
            <VemtapText variant="caption" tone="tertiary" className="px-1">
              {copy.ownerOnly}
            </VemtapText>
          ) : null}

          <BusinessSettingsGroup
            rows={[
              {
                title: copy.branchTitle,
                subtitle: copy.branchSubtitle,
                icon: 'storefront' as const,
                trailing: 'value',
                value: view.branchName,
                onPress: onChangeBranch,
              },
              {
                title: copy.hoursTitle,
                subtitle: copy.hoursSubtitle,
                icon: 'schedule' as const,
                trailing: 'value',
                value: copy.hoursValue,
                onPress: onChangeHours,
              },
            ]}
          />

          {heading(copy.storeTitle)}
          <BusinessSettingsGroup rows={toggles(view.ordering)} />

          {heading(copy.hardwareTitle, copy.hardwareSubtitle)}
          <BusinessSettingsGroup
            rows={view.hardware.map(row => ({
              title: row.title,
              icon: row.icon,
              trailing: 'value' as const,
              value: row.value,
              onPress: onOpenHardware,
            }))}
          />

          {heading(copy.teamTitle, copy.teamSubtitle)}
          <BusinessSettingsGroup rows={toggles(view.team)} />

          {heading(copy.dispatchTitle)}
          <BusinessSettingsGroup rows={toggles(view.dispatch)} />

          {heading(copy.securityTitle)}
          <BusinessSettingsGroup
            rows={[
              {
                title: copy.twoFactorTitle,
                subtitle: copy.twoFactorSubtitle,
                icon: 'verifiedUser' as const,
                trailing: 'value',
                value: view.twoFactor,
                valueTone: view.twoFactorOn ? 'success' : 'default',
                onPress: onOpenSecurity,
              },
              {
                title: copy.passwordTitle,
                subtitle: copy.passwordSubtitle,
                icon: 'password' as const,
                trailing: 'arrow',
                onPress: onOpenSecurity,
              },
            ]}
          />

          {heading(copy.sessionsTitle)}
          <BusinessSettingsGroup
            rows={[
              {
                title: view.live ? copy.pauseTitle : copy.resumeTitle,
                subtitle: view.live ? copy.pauseSubtitle : copy.resumeSubtitle,
                icon: view.live ? ('pauseCircle' as const) : ('playCircle' as const),
                trailing: 'pill',
                value: view.live ? copy.pauseValue : copy.resumeValue,
                onPress: canEdit
                  ? view.live
                    ? confirmPause
                    : () => onSetLive?.(true)
                  : undefined,
              },
              {
                title: copy.signOutTitle,
                subtitle: copy.signOutSubtitle,
                icon: 'logout' as const,
                trailing: 'arrow',
                onPress: onSignOut,
              },
            ]}
          />
        </>
      )}
    </BusinessScreenLayout>
  );
}
