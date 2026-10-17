import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { EmptyState, ErrorState, LoadingState } from '@components/shared';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionTile,
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessSelectionChip,
  BusinessStatusPill,
  type BusinessPillTone,
} from '@features/business/components/BusinessPrimitives';
import { PlanFeatureRow } from '@features/business/components/VerificationPrimitives';
import {
  BusinessChipScroller,
  BusinessInfoStrip,
  BusinessPanel,
  BusinessScopePicker,
} from '@features/business/components/BusinessOpsPrimitives';
import type {
  StaffDirectoryView,
  StaffFilterKey,
  StaffMemberView,
} from '@features/business/utils/teamMappers';

cssInterop(Pressable, { className: 'style' });

const copy = strings.staffDirectory;

const roleTone: Record<string, BusinessPillTone> = {
  inverse: 'inverse',
  brand: 'brand',
  secondary: 'brandContainer',
  neutral: 'neutral',
};

export interface StaffTeamAccessDirectoryScreenProps {
  /** Live directory; while undefined the screen shows loading or the error. */
  view?: StaffDirectoryView;
  /** Selected scope — owned by the route, which is what fetches for it. */
  scope?: string;
  /**
   * Role filter. The route owns it (it decides what is fetched and what is
   * shown); passing nothing falls back to a local `all`, so the screen still
   * behaves sensibly in isolation.
   */
  filter?: StaffFilterKey;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onNotifications?: () => void;
  onChangeScope?: (value: string) => void;
  onFilterChange?: (filter: StaffFilterKey) => void;
  onInvite?: () => void;
  onOpenPermissions?: (memberId: string) => void;
  onAssignBranch?: (memberId: string) => void;
  onViewPayout?: (memberId: string) => void;
  onResendInvite?: (memberId: string) => void;
  onCancelInvite?: (memberId: string) => void;
  onMoreMemberOptions?: (memberId: string) => void;
}

function MemberCard({
  member,
  onOpenPermissions,
  onAssignBranch,
  onViewPayout,
  onResendInvite,
  onCancelInvite,
  onMoreMemberOptions,
}: {
  member: StaffMemberView;
  onOpenPermissions?: (memberId: string) => void;
  onAssignBranch?: (memberId: string) => void;
  onViewPayout?: (memberId: string) => void;
  onResendInvite?: (memberId: string) => void;
  onCancelInvite?: (memberId: string) => void;
  onMoreMemberOptions?: (memberId: string) => void;
}) {
  return (
    <View className="gap-3 rounded-card-lg bg-surface p-4 shadow-sm">
      <View className="flex-row items-start gap-3">
        <View className="relative h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-high">
          {member.avatarUri ? (
            <BusinessProductImage
              source={{ uri: member.avatarUri }}
              alt={member.name}
              className="h-full w-full"
            />
          ) : (
            <VemtapText variant="labelSm" className="font-sans-semibold text-secondary">
              {member.initials}
            </VemtapText>
          )}
          <View
            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-surface ${
              member.pending ? 'bg-tertiary-container' : 'bg-badge-discount-text'
            }`}
          />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1.5">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {member.name}
              </VemtapText>
              {member.self ? (
                <View className="rounded bg-surface-container px-1.5 py-0.5">
                  <VemtapText variant="micro" className="font-sans-medium text-primary">
                    {member.self}
                  </VemtapText>
                </View>
              ) : null}
            </View>
            {member.pending ? null : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${member.name} options`}
                hitSlop={8}
                onPress={() => onMoreMemberOptions?.(member.id)}
              >
                <Icon name="more" size={19} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Icon name={member.contactIcon} size={14} color={colors.textTertiary} />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {member.contact}
            </VemtapText>
          </View>
        </View>
      </View>

      <BusinessStatusPill
        label={member.role}
        tone={roleTone[member.roleTone] ?? 'neutral'}
        icon={member.roleIcon}
      />

      {member.pending ? (
        <View className="gap-1.5 rounded-card bg-tertiary-fixed p-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="hourglass" size={15} color={colors.tertiary} />
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-tertiary"
                numberOfLines={1}
              >
                {member.pendingTitle}
              </VemtapText>
            </View>
            {member.pendingExpiry ? (
              <VemtapText
                variant="caption"
                className="shrink-0 font-sans-medium text-tertiary"
              >
                {member.pendingExpiry}
              </VemtapText>
            ) : null}
          </View>
          <VemtapText variant="caption" tone="secondary" className="leading-snug">
            {member.pendingBody}
          </VemtapText>
        </View>
      ) : (
        <View className="gap-2 rounded-card bg-surface-container-low p-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name={member.scopeIcon} size={15} color={colors.textTertiary} />
              <VemtapText
                variant="labelSm"
                tone="secondary"
                className="min-w-0 flex-1"
                numberOfLines={1}
              >
                {`${copy.assignedPrefix}${member.scope}`}
              </VemtapText>
            </View>
            <BusinessStatusPill label={member.status} tone="success" />
          </View>
          <VemtapText variant="caption" tone="secondary" className="leading-snug">
            {member.blurb}
          </VemtapText>
        </View>
      )}

      {member.pending ? (
        <View className="flex-row gap-2">
          <BusinessActionTile
            label={member.resend}
            icon="send"
            tone="brand"
            onPress={() => onResendInvite?.(member.id)}
          />
          <BusinessActionTile
            label={member.cancel}
            icon="close"
            tone="error"
            onPress={() => onCancelInvite?.(member.id)}
          />
        </View>
      ) : member.payout && onViewPayout ? (
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <Icon name="lock" size={14} color={colors.textTertiary} />
            <VemtapText
              variant="caption"
              tone="tertiary"
              numberOfLines={1}
              className="min-w-0 flex-1"
            >
              {member.protected}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={member.payout}
            hitSlop={8}
            onPress={() => onViewPayout?.(member.id)}
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {member.payout}
            </VemtapText>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row gap-2">
          <BusinessActionTile
            label={copy.permissionsAction}
            icon="tune"
            onPress={() => onOpenPermissions?.(member.id)}
          />
          {onAssignBranch ? (
            <BusinessActionTile
              label={copy.assignAction}
              icon="locationOn"
              onPress={() => onAssignBranch?.(member.id)}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

/**
 * Business tab root for team access: branch-scoped staff directory with role
 * filters, presence, per-branch scope and the centralized privilege matrix.
 *
 * Data-only — the route supplies the view model from `GET /users/team`, so this
 * file owns layout and local filter state and nothing else.
 */
export function StaffTeamAccessDirectoryScreen({
  view,
  scope = 'all',
  filter: filterProp,
  isLoading,
  isError,
  onRetry,
  onNotifications,
  onChangeScope,
  onFilterChange,
  onInvite,
  onOpenPermissions,
  onAssignBranch,
  onViewPayout,
  onResendInvite,
  onCancelInvite,
  onMoreMemberOptions,
}: StaffTeamAccessDirectoryScreenProps) {
  const [internalFilter, setInternalFilter] = useState<StaffFilterKey>('all');
  const filter = filterProp ?? internalFilter;

  const setFilter = (next: StaffFilterKey) => {
    setInternalFilter(next);
    onFilterChange?.(next);
  };

  const members = (view?.members ?? []).filter(
    member => filter === 'all' || member.group === filter,
  );

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        eyebrow: copy.pro,
        centerTitle: false,
        titleVariant: 'headingSm',
        actions: [{ icon: 'notifications', label: copy.title, onPress: onNotifications }],
      }}
      contentContainerClassName="pb-8"
    >
      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <>
          <View className="mt-1 flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-2">
                <Icon name="badge" size={19} color={colors.primary} />
                <VemtapText
                  accessibilityRole="header"
                  variant="headingLg"
                  className="min-w-0 flex-1 text-heading-lg"
                  numberOfLines={2}
                >
                  {copy.title}
                </VemtapText>
              </View>
              <VemtapText variant="bodyMd" tone="secondary" className="mt-1">
                {copy.subtitle}
              </VemtapText>
            </View>
            <Button
              label={copy.invite}
              labelVariant="labelSm"
              size="sm"
              fullWidth={false}
              onPress={onInvite}
              leftIcon={<Icon name="groupAdd" size={16} color={colors.surface} />}
            />
          </View>

          <View className="z-10 mt-3 flex-row items-center justify-between gap-2">
            <BusinessScopePicker
              label={
                view.scopeOptions.find(option => option.value === scope)?.label ??
                copy.allLocations
              }
              value={scope}
              options={view.scopeOptions}
              onChange={value => onChangeScope?.(value)}
            />
            <View className="flex-row items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1.5">
              <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
              <VemtapText variant="labelSm" className="font-sans-medium">
                {view.onlineLine}
              </VemtapText>
            </View>
          </View>

          <View className="mt-3">
            <BusinessChipScroller>
              {view.filters.map(chip => (
                <BusinessSelectionChip
                  key={chip.key}
                  label={`${chip.label} · ${chip.count}`}
                  selected={filter === chip.key}
                  showCheck={false}
                  onPress={() => setFilter(chip.key)}
                />
              ))}
            </BusinessChipScroller>
          </View>

          <View className="mt-3 gap-3">
            {members.length === 0 ? (
              <EmptyState
                variant="contained"
                title={copy.empty.title}
                description={copy.empty.body}
              />
            ) : (
              members.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onOpenPermissions={onOpenPermissions}
                  onAssignBranch={onAssignBranch}
                  onViewPayout={onViewPayout}
                  onResendInvite={onResendInvite}
                  onCancelInvite={onCancelInvite}
                  onMoreMemberOptions={onMoreMemberOptions}
                />
              ))
            )}
          </View>

          <BusinessPanel
            className="mt-4"
            tone="low"
            title={copy.governanceTitle}
            subtitle={copy.governanceSubtitle}
            icon="adminPanel"
          >
            {copy.governance.map(row => (
              <View key={row.title} className="rounded-card bg-surface p-2.5">
                <PlanFeatureRow
                  label={row.title}
                  meta={row.body}
                  icon={row.icon as IconName}
                  state="included"
                  size="sm"
                />
              </View>
            ))}
            <BusinessInfoStrip
              icon="shieldPerson"
              tone="tint"
              body={`${copy.compliancePrefix}${copy.complianceBody}`}
            />
          </BusinessPanel>

          <View className="mt-4 gap-2">
            <Button
              label={copy.inviteCta}
              labelVariant="labelMd"
              onPress={onInvite}
              leftIcon={<Icon name="groupAdd" size={19} color={colors.surface} />}
            />
            <VemtapText variant="caption" tone="tertiary" className="text-center">
              {copy.inviteLegal}
            </VemtapText>
          </View>
        </>
      )}
    </BusinessScreenLayout>
  );
}
