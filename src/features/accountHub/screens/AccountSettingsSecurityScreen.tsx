import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { AccountSection } from '@features/accountHub/components/AccountScreensPrimitives';
import { SecuritySettingRow } from '@features/accountHub/components/SecuritySettingRow';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';

const copy = strings.accountSettingsSecurity;

export interface AccountSettingsSecurityScreenProps {
  onBack?: () => void;
  onSecurityPin?: () => void;
  onChangePassword?: () => void;
  onManageDevices?: () => void;
  onSecurityAudit?: () => void;
  onLocationPrecision?: () => void;
  onDownloadData?: () => void;
  onSignOutAll?: () => void;
  onDeleteAccount?: () => void;
  onBiometricChange?: (value: boolean) => void;
  onSmsAlertsChange?: (value: boolean) => void;
  onEmailNoticesChange?: (value: boolean) => void;
  onPersonalizedDealsChange?: (value: boolean) => void;
}

export function AccountSettingsSecurityScreen({
  onBack,
  onSecurityPin,
  onChangePassword,
  onManageDevices,
  onSecurityAudit,
  onLocationPrecision,
  onDownloadData,
  onSignOutAll,
  onDeleteAccount,
  onBiometricChange,
  onSmsAlertsChange,
  onEmailNoticesChange,
  onPersonalizedDealsChange,
}: AccountSettingsSecurityScreenProps) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <RegistrationHeader title={copy.title} onBack={() => onBack?.()} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-4 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative gap-3 overflow-hidden rounded-card bg-surface p-4 shadow-sm">
          <View className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-badge-discount-bg opacity-60" />
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-row items-center gap-2">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
                <Icon name="verifiedUser" size={20} color={colors.badgeDiscountText} />
              </View>
              <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                <VemtapText
                  variant="caption"
                  tone="success"
                  className="font-sans-semibold"
                >
                  {copy.protected}
                </VemtapText>
              </View>
            </View>
            <Icon name="checkCircle" size={18} color={colors.badgeDiscountText} />
          </View>
          <VemtapText tone="secondary">{copy.statusBody}</VemtapText>
          <View className="flex-row items-center gap-1.5">
            <Icon name="accountCircle" size={16} color={colors.primary} />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.accountLine}
            </VemtapText>
          </View>
        </View>
        <AccountSection title={copy.credentials}>
          <SecuritySettingRow
            icon="pin"
            title={copy.pin}
            subtitle={copy.pinSubtitle}
            meta={copy.pinStatus}
            onPress={onSecurityPin}
          />
          <SecuritySettingRow
            icon="fingerprint"
            title={copy.biometrics}
            subtitle={copy.biometricsSubtitle}
            switchInitialValue
            onValueChange={onBiometricChange}
          />
          <SecuritySettingRow
            icon="password"
            title={copy.changePassword}
            subtitle={copy.passwordDate}
            onPress={onChangePassword}
            last
          />
        </AccountSection>
        <AccountSection title={copy.devices}>
          <View className="gap-4 p-4">
            <DeviceRow
              icon="phoneDevice"
              name={copy.phoneName}
              meta={copy.phoneMeta}
              badge={copy.activeNow}
            />
            <View className="h-px w-full bg-surface-container" />
            <DeviceRow icon="tablet" name={copy.tabletName} meta={copy.tabletMeta} />
            <Button
              label={copy.manageDevices}
              variant="ghost"
              size="sm"
              labelVariant="labelMd"
              onPress={onManageDevices}
              rightIcon={<Icon name="arrowForward" size={16} color={colors.primary} />}
            />
          </View>
        </AccountSection>
        <AccountSection title={copy.verification}>
          <SecuritySettingRow
            icon="sms"
            title={copy.smsAlerts}
            subtitle={copy.smsSubtitle}
            switchInitialValue
            onValueChange={onSmsAlertsChange}
          />
          <SecuritySettingRow
            icon="mail"
            title={copy.emailNotices}
            subtitle={copy.emailSubtitle}
            switchInitialValue
            onValueChange={onEmailNoticesChange}
          />
          <SecuritySettingRow
            icon="history"
            title={copy.audit}
            subtitle={copy.auditSubtitle}
            onPress={onSecurityAudit}
            last
          />
        </AccountSection>
        <AccountSection title={copy.privacy}>
          <SecuritySettingRow
            icon="locationPrecision"
            title={copy.location}
            subtitle={copy.locationSubtitle}
            value={copy.whileUsing}
            onPress={onLocationPrecision}
          />
          <SecuritySettingRow
            icon="autoAwesome"
            title={copy.personalized}
            subtitle={copy.personalizedSubtitle}
            switchInitialValue
            onValueChange={onPersonalizedDealsChange}
          />
          <SecuritySettingRow
            icon="fileDocument"
            title={copy.download}
            subtitle={copy.downloadSubtitle}
            onPress={onDownloadData}
            last
          />
        </AccountSection>
        <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">
          <Button
            label={copy.signOut}
            variant="secondary"
            size="sm"
            labelVariant="labelMd"
            onPress={onSignOutAll}
            leftIcon={<Icon name="logout" size={18} color={colors.error} />}
          />
          <View className="h-px w-full bg-surface-container" />
          <View className="items-center px-1">
            <Button
              label={copy.delete}
              variant="ghost"
              size="sm"
              fullWidth={false}
              labelVariant="labelMd"
              labelClassName="text-error"
              onPress={onDeleteAccount}
              leftIcon={<Icon name="delete" size={16} color={colors.error} />}
            />
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="mt-1 max-w-[280px] text-center"
            >
              {copy.deleteBody}
            </VemtapText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DeviceRow({
  icon,
  name,
  meta,
  badge,
}: {
  icon: 'phoneDevice' | 'tablet';
  name: string;
  meta: string;
  badge?: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-10 w-10 shrink-0 items-center justify-center rounded-field bg-surface-tint-blue">
        <Icon name={icon} size={22} color={colors.primary} />
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {name}
          </VemtapText>
          {badge ? (
            <View className="rounded-full bg-badge-discount-bg px-1.5 py-0.5">
              <VemtapText variant="micro" tone="success">
                {badge}
              </VemtapText>
            </View>
          ) : null}
        </View>
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {meta}
        </VemtapText>
      </View>
    </View>
  );
}
