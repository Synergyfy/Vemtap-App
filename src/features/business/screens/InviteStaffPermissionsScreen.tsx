import React, { useEffect, useState } from 'react';
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
  PhonePrefix,
  SetupCallout,
} from '@features/business/components/BusinessSetupPrimitives';
import type { InviteStaffForm, InviteRoleId } from '@features/business/utils/teamMappers';

cssInterop(Pressable, { className: 'style' });

const copy = strings.inviteStaff;

const roleIds: readonly InviteRoleId[] = ['manager', 'cashier', 'service', 'custom'];

/**
 * Deliberately looser than the API schema's `z.string().email()`: the form has
 * to accept what the user is mid-way through typing, and the exact same address
 * is validated again by `inviteStaffInput` before it is sent.
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface InviteStaffBranch {
  id: string;
  name: string;
}

export interface InviteStaffPermissionsScreenProps {
  onBack?: () => void;
  onMoreActions?: () => void;
  /** Live branches; the invite is always scoped to exactly one. */
  branches: readonly InviteStaffBranch[];
  defaultBranchId?: string | null;
  isSending?: boolean;
  /** Server-side rejection (plan gate, duplicate email) shown above the dock. */
  sendError?: string | null;
  onSend?: (form: InviteStaffForm) => void;
  onCancel?: () => void;
  onChangeBranch?: (value: string) => void;
}

/**
 * Staff invitation: contact details, invite channel, role preset, operating
 * branch and the enforced permission preview for the chosen role.
 *
 * Form state lives here; the route owns the mutation, so a rejection comes back
 * as `sendError` and the entered values are never lost with it.
 */
export function InviteStaffPermissionsScreen({
  onBack,
  onMoreActions,
  branches,
  defaultBranchId,
  isSending,
  sendError,
  onSend,
  onCancel,
  onChangeBranch,
}: InviteStaffPermissionsScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [role, setRole] = useState<InviteRoleId>('cashier');
  const [branch, setBranch] = useState<string>(defaultBranchId ?? '');
  const [localError, setLocalError] = useState<string | null>(null);

  // Adopt the active branch once the list has loaded, without clobbering a
  // branch the invitee already picked.
  useEffect(() => {
    setBranch(current => current || defaultBranchId || branches[0]?.id || '');
  }, [defaultBranchId, branches]);

  const selectBranch = (branchId: string) => {
    setBranch(branchId);
    setLocalError(null);
    onChangeBranch?.(branchId);
  };

  const handleSend = () => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    let error: string | null = null;

    if (parts.length < 2) error = copy.errors.name;
    else if (!EMAIL_SHAPE.test(email.trim())) error = copy.errors.email;
    else if (channel === 'sms' && phone.replace(/\D/g, '').length < 7)
      error = copy.errors.phone;
    else if (!branch) error = copy.errors.branch;

    if (error) {
      setLocalError(error);
      return;
    }

    setLocalError(null);
    onSend?.({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roleId: role,
      branchId: branch,
    });
  };

  const error = sendError ?? localError;

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
          {error ? (
            <VemtapText
              accessibilityRole="alert"
              variant="caption"
              tone="error"
              className="text-center"
            >
              {error}
            </VemtapText>
          ) : null}
          <Button
            label={isSending ? copy.sending : copy.send}
            labelVariant="labelMd"
            disabled={isSending}
            loading={isSending}
            onPress={handleSend}
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
          onChangeText={value => {
            setFullName(value);
            setLocalError(null);
          }}
          placeholder={copy.fullNamePlaceholder}
          accessibilityLabel={copy.fullName}
          autoCapitalize="words"
          trailingIcon="checkCircle"
          trailingIconColor={
            fullName.trim().split(/\s+/).filter(Boolean).length >= 2
              ? colors.primary
              : colors.textTertiary
          }
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
        <FieldInput
          label={copy.emailLabel}
          value={email}
          onChangeText={value => {
            setEmail(value);
            setLocalError(null);
          }}
          placeholder={copy.emailPlaceholder}
          accessibilityLabel={copy.emailLabel}
          keyboardType="email-address"
          autoCapitalize="none"
          leadingIcon="alternateEmail"
        />
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
            <View className="min-w-0 flex-1">
              <FieldInput
                value={phone}
                onChangeText={value => {
                  setPhone(value);
                  setLocalError(null);
                }}
                placeholder={copy.phonePlaceholder}
                accessibilityLabel={copy.phoneLabel}
                keyboardType="phone-pad"
              />
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
          const roleId = roleIds[index];
          const selected = role === roleId;
          return (
            <Pressable
              key={option.title}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.title}
              onPress={() => setRole(roleId)}
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
        <View className="min-h-[52px] flex-row items-center gap-2 rounded-field bg-surface-subtle px-3">
          <Icon name="locationOn" size={18} color={colors.textTertiary} />
          <VemtapText variant="bodyMd" className="min-w-0 flex-1" numberOfLines={1}>
            {branches.find(option => option.id === branch)?.name ??
              copy.branchPlaceholder}
          </VemtapText>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {branches.map(option => (
            <BusinessSelectionChip
              key={option.id}
              label={option.name}
              selected={branch === option.id}
              onPress={() => selectBranch(option.id)}
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
