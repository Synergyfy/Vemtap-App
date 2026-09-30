import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessSelectionChip,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessPanel,
  BusinessScopeCard,
} from '@features/business/components/BusinessOpsPrimitives';
import { PlanFeatureRow } from '@features/business/components/VerificationPrimitives';
import {
  FieldInput,
  FieldSelect,
  PhonePrefix,
  SetupCallout,
} from '@features/business/components/BusinessSetupPrimitives';

cssInterop(Pressable, { className: 'style' });

const copy = strings.inviteStaff;

const roleIds = ['manager', 'cashier', 'service', 'custom'] as const;

export interface InviteStaffPermissionsScreenProps {
  onBack?: () => void;
  onMoreActions?: () => void;
  onSend?: () => void;
  onCancel?: () => void;
  onChangeBranch?: (value: string) => void;
}

/**
 * Staff invitation: contact details, invite channel, role preset, operating
 * branch and the enforced permission preview for the chosen role.
 */
export function InviteStaffPermissionsScreen({
  onBack,
  onMoreActions,
  onSend,
  onCancel,
  onChangeBranch,
}: InviteStaffPermissionsScreenProps) {
  const [fullName, setFullName] = useState<string>(copy.fullNameValue);
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [role, setRole] = useState<string>('cashier');
  const [branch, setBranch] = useState('wuse');

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        titleVariant: 'headingSm',
        actions: [{ icon: 'more', label: copy.headerTitle, onPress: onMoreActions }],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.send}
            labelVariant="labelMd"
            onPress={onSend}
            rightIcon={<Icon name="arrowForward" size={19} color={colors.surface} />}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.cancel}
            onPress={onCancel}
            className="min-h-10 items-center justify-center"
          >
            <VemtapText variant="labelMd" tone="secondary" numberOfLines={1}>
              {copy.cancel}
            </VemtapText>
          </Pressable>
        </BusinessActionDock>
      }
    >
      <View className="mt-2">
        <View className="flex-row items-center gap-1.5 self-start rounded-full bg-surface-tint px-2.5 py-1">
          <Icon name="groupAdd" size={15} color={colors.primary} />
          <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
            {copy.kicker}
          </VemtapText>
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingLg"
          className="mt-2 text-heading-lg"
          numberOfLines={2}
        >
          {copy.title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="mt-1 leading-relaxed">
          {copy.subtitle}
        </VemtapText>
      </View>

      <BusinessPanel className="mt-4" title={copy.contactTitle} icon="badge">
        <FieldInput
          label={copy.fullName}
          value={fullName}
          onChangeText={setFullName}
          placeholder={copy.fullNamePlaceholder}
          accessibilityLabel={copy.fullName}
          trailingIcon="checkCircle"
          trailingIconColor={colors.primary}
        />
        <View className="flex-row gap-2">
          {[
            { id: 'email' as const, label: copy.channelEmail },
            { id: 'sms' as const, label: copy.channelSms },
          ].map(option => (
            <View key={option.id} className="min-w-0 flex-1">
              <BusinessScopeCard
                title={option.label}
                selected={channel === option.id}
                onPress={() => setChannel(option.id)}
                className="min-h-11 items-center justify-center py-2"
              />
            </View>
          ))}
        </View>
        <View className={channel === 'email' ? '' : 'opacity-60'}>
          <FieldInput
            label={copy.emailLabel}
            value="babatunde.a@example.com"
            onChangeText={() => undefined}
            accessibilityLabel={copy.emailLabel}
            keyboardType="email-address"
            autoCapitalize="none"
            leadingIcon="alternateEmail"
          />
        </View>
        <View className={channel === 'sms' ? '' : 'opacity-60'}>
          <VemtapText variant="caption" tone="secondary">
            {copy.phoneLabel}
          </VemtapText>
          <View className="mt-1.5 flex-row items-center gap-2">
            <PhonePrefix
              flag="🇳🇬"
              dialCode={copy.dialCode}
              accessibilityLabel={copy.phoneLabel}
            />
            <View className="min-h-[52px] flex-1 justify-center rounded-field bg-surface-subtle px-3">
              <VemtapText variant="bodyMd">{copy.phoneValue}</VemtapText>
            </View>
          </View>
        </View>
      </BusinessPanel>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.roleTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {copy.roleSubtitle}
          </VemtapText>
        </View>
        <BusinessStatusPill label={copy.rolePresets} tone="brandContainer" />
      </View>

      <View className="mt-2 gap-2">
        {copy.roles.map((option, index) => {
          const selected = role === roleIds[index];
          return (
            <Pressable
              key={option.title}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.title}
              onPress={() => setRole(roleIds[index])}
              className={`flex-row items-start gap-3 rounded-card p-4 shadow-sm active:scale-[0.99] ${
                selected ? 'bg-surface-tint' : 'bg-surface'
              }`}
            >
              <View
                className={`mt-0.5 h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  selected ? 'bg-primary' : 'bg-surface-container'
                }`}
              >
                {selected ? <View className="h-2 w-2 rounded-full bg-surface" /> : null}
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-2">
                  <Icon
                    name={option.icon as IconName}
                    size={16}
                    color={colors.secondary}
                  />
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {option.title}
                  </VemtapText>
                  {'badge' in option && option.badge ? (
                    <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                      <VemtapText
                        variant="caption"
                        className="font-sans-semibold text-badge-discount-text"
                      >
                        {option.badge}
                      </VemtapText>
                    </View>
                  ) : null}
                </View>
                <VemtapText
                  variant="bodyMd"
                  tone="secondary"
                  className="mt-1 leading-snug"
                >
                  {option.body}
                </VemtapText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <BusinessPanel
        className="mt-4"
        title={copy.branchTitle}
        subtitle={copy.branchSubtitle}
        icon="storefront"
      >
        <FieldSelect
          value={copy.branches.find(option => option.value === branch)?.label ?? ''}
          onPress={() => onChangeBranch?.(branch)}
          accessibilityLabel={copy.branchTitle}
          leadingIcon="locationOn"
        />
        <View className="flex-row flex-wrap gap-2">
          {copy.branches.map(option => (
            <BusinessSelectionChip
              key={option.value}
              label={option.chip}
              selected={branch === option.value}
              onPress={() => {
                setBranch(option.value);
                onChangeBranch?.(option.value);
              }}
            />
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-4"
        title={copy.permissionsTitle}
        subtitle={copy.permissionsSubtitle}
        icon="shieldPerson"
      >
        {copy.permissions.map(permission => (
          <View
            key={permission.title}
            className={`rounded-field p-3 ${
              permission.granted
                ? 'bg-surface-subtle'
                : 'bg-surface-container-low opacity-80'
            }`}
          >
            <PlanFeatureRow
              label={permission.title}
              meta={permission.body}
              icon={permission.icon as IconName}
              state={permission.granted ? 'highlighted' : 'locked'}
            />
          </View>
        ))}
      </BusinessPanel>

      <SetupCallout
        className="mt-4"
        icon="shieldLock"
        tone="tint"
        title={copy.safeguardTitle}
        body={copy.safeguardBody}
        bodyVariant="bodyMd"
        titleClassName="text-primary"
      />
    </BusinessScreenLayout>
  );
}
