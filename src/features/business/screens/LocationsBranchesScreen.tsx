import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { colors } from '@theme/colors';
import {
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessPanel,
  BusinessScopePicker,
} from '@features/business/components/BusinessOpsPrimitives';
import { SetupCallout } from '@features/business/components/BusinessSetupPrimitives';
import type { ProfileBranch } from '@api/businessProfileApi';

cssInterop(Pressable, { className: 'style' });

const copy = strings.locationsBranches;

/**
 * One branch card. `products`/`services`/`deals` are optional because
 * `profileBranchSchema` carries no per-branch catalogue counts — the pills are
 * dropped rather than filled with design numbers when the API is silent.
 */
export interface LocationBranchRow {
  id: string;
  name: string;
  tag: string;
  cluster: string;
  address: string;
  status: string;
  active: boolean;
  phone?: string;
  editable?: boolean;
  notice?: string;
  products?: string;
  services?: string;
  deals?: string;
}

/**
 * `GET /businesses/my-business` → `branches[]` to the card shape.
 *
 * `isActive` is `nullish` on the wire, so only an explicit `false` means
 * paused; a branch that simply omits the field is still trading.
 */
export function branchToLocationRow(branch: ProfileBranch): LocationBranchRow {
  const active = branch.isActive !== false;
  const cluster = [branch.city, branch.state].filter(Boolean).join(' • ');
  return {
    id: branch.id,
    name: branch.name,
    tag:
      branch.isMainBranch === true ? 'Flagship Branch' : (branch.uniqueCode ?? 'Branch'),
    cluster,
    address: branch.address ?? 'Address not set',
    status: active ? 'Active' : 'Inactive / Paused',
    active,
    phone: branch.phone ?? undefined,
    editable: true,
    // Only paused branches need the explanation; an active one has no notice.
    ...(active
      ? {}
      : {
          notice: 'This location is paused. Customers cannot discover or order from it.',
        }),
  };
}

export interface LocationsBranchesScreenProps {
  onNotifications?: () => void;
  onAddLocation?: () => void;
  onChangeScope?: (value: string) => void;
  onViewDetails?: (branchId: string) => void;
  onEditLocation?: (branchId: string) => void;
  onMoreBranchOptions?: (branchId: string) => void;
  onCallBranch?: (branchId: string) => void;
  onReactivate?: (branchId: string) => void;
  /**
   * Live branches from `GET /businesses/my-business`. Omitted keeps the designed
   * copy so the standalone/storybook render still works.
   */
  branches?: readonly LocationBranchRow[];
  /**
   * True once the API has refused a location on plan grounds. Drives a
   * persistent, actionable callout — a toast alone expires before the merchant
   * can do anything about it.
   */
  planBlocked?: boolean;
  /** The branch list is still loading / failed to load. */
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onOpenPlan?: () => void;
  onDismissPlanNotice?: () => void;
}

/**
 * Business tab root for locations: operating-view switcher and one card per
 * branch with its cluster, trading status, catalogue counts and reach actions.
 */
export function LocationsBranchesScreen({
  onNotifications,
  onAddLocation,
  onChangeScope,
  onViewDetails,
  onEditLocation,
  onMoreBranchOptions,
  onCallBranch,
  onReactivate,
  branches,
  planBlocked = false,
  onOpenPlan,
  onDismissPlanNotice,
  isLoading = false,
  isError = false,
  onRetry,
}: LocationsBranchesScreenProps) {
  const [scope, setScope] = useState('');
  // Only the business's own branches: never sample locations, which would
  // read as real ones while the list loads or when there are none.
  const rows = branches ?? [];
  const firstRow = rows[0];
  const scopeValue = rows.some(row => row.id === scope) ? scope : (firstRow?.id ?? scope);

  return (
    <BusinessScreenLayout
      header={{
        title: firstRow?.name ?? copy.title,
        eyebrow: copy.eyebrow,
        centerTitle: false,
        titleVariant: 'headingSm',
        actions: [
          {
            icon: 'notifications',
            label: strings.businessShell.notificationsLabel,
            onPress: onNotifications,
          },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingLg"
            className="text-heading-lg"
            numberOfLines={2}
          >
            {copy.title}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary" className="mt-1">
            {copy.subtitle}
          </VemtapText>
        </View>
        <Button
          label={copy.addLocation}
          labelVariant="labelSm"
          size="sm"
          fullWidth={false}
          onPress={onAddLocation}
          leftIcon={<Icon name="addLocation" size={16} color={colors.surface} />}
        />
      </View>

      {/*
        A plan refusal is permanent, so it outlives the four-second toast and is
        still here once the sheet closes — otherwise the merchant taps "Add
        Location" again, gets the same refusal, and has nothing to act on. It
        sits directly under the heading because that is where the Add button
        they just pressed lives.
      */}
      {planBlocked ? (
        <SetupCallout
          className="mt-3"
          icon="info"
          tone="tint"
          iconSurface="circlePrimary"
          title={copy.planNoticeTitle}
          body={copy.planNoticeBody}
          bodyVariant="bodyMd"
          titleClassName="font-sans-semibold"
        >
          <View className="mt-2 flex-row items-center gap-2">
            <BusinessInlineAction
              label={copy.planNoticeCta}
              icon="arrowForward"
              onPress={onOpenPlan}
            />
            <BusinessInlineAction
              label={copy.dismissPlanNotice}
              onPress={onDismissPlanNotice}
            />
          </View>
        </SetupCallout>
      ) : null}

      {/* z-10 sits on this row rather than on the picker: RN orders siblings
          only, so the flyout's own z-30 could never lift it past the branch
          cards — this container is their sibling, so this is what wins. */}
      {isLoading ? (
        <LoadingState label={copy.loading} />
      ) : isError ? (
        <ErrorState
          title={copy.error.title}
          description={copy.error.body}
          onRetry={onRetry}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="storefront"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : null}

      {rows.length > 0 ? (
        <View className="z-10 mt-3 flex-row items-center justify-between gap-3 rounded-card bg-surface-container-high p-3 shadow-sm">
          <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
            <View className="h-2.5 w-2.5 shrink-0 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              className="shrink-0"
            >
              {copy.operatingView}
            </VemtapText>
            <BusinessScopePicker
              className="flex-1"
              label={firstRow?.name ?? copy.title}
              value={scopeValue}
              options={rows.map(row => ({ label: row.name, value: row.id }))}
              onChange={value => {
                setScope(value);
                onChangeScope?.(value);
              }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.switch}
            onPress={() => onChangeScope?.(scopeValue)}
            className="min-h-8 shrink-0 justify-center rounded-full bg-surface px-2.5 py-1 shadow-sm active:scale-95"
          >
            <VemtapText variant="caption" className="font-sans-medium text-primary">
              {copy.switch}
            </VemtapText>
          </Pressable>
        </View>
      ) : null}

      <View className="mt-3 gap-3">
        {rows.map((branch, index) => {
          const { id } = branch;
          return (
            <View
              key={branch.id}
              className={`gap-3 rounded-card-lg p-4 shadow-sm ${
                branch.active ? 'bg-surface' : 'bg-surface-container-low opacity-95'
              }`}
            >
              <View className="flex-row items-start justify-between gap-2">
                <View className="min-w-0 flex-1">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <VemtapText
                      variant="labelMd"
                      className={`min-w-0 font-sans-semibold ${
                        branch.active ? '' : 'text-text-secondary'
                      }`}
                      numberOfLines={1}
                    >
                      {branch.name}
                    </VemtapText>
                    <BusinessStatusPill
                      label={branch.tag}
                      tone={index === 0 ? 'brand' : 'neutral'}
                    />
                  </View>
                  <View className="mt-0.5 flex-row items-center gap-1.5">
                    <Icon name="hub" size={14} color={colors.textTertiary} />
                    <VemtapText
                      variant="caption"
                      tone="tertiary"
                      className="min-w-0 flex-1"
                      numberOfLines={1}
                    >
                      {branch.cluster}
                    </VemtapText>
                  </View>
                </View>
                <View className="flex-row items-center">
                  {'editable' in branch && branch.editable ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={copy.editLocation}
                      hitSlop={8}
                      onPress={() => onEditLocation?.(id)}
                      className="h-8 w-8 items-center justify-center rounded-lg active:bg-surface-subtle"
                    >
                      <Icon name="edit" size={18} color={colors.textSecondary} />
                    </Pressable>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${branch.name} options`}
                    hitSlop={8}
                    onPress={() => onMoreBranchOptions?.(id)}
                    className="h-8 w-8 items-center justify-center rounded-lg active:bg-surface-subtle"
                  >
                    <Icon name="more" size={18} color={colors.textSecondary} />
                  </Pressable>
                </View>
              </View>

              <View className="flex-row items-start gap-2">
                <Icon
                  name="locationOn"
                  size={17}
                  color={branch.active ? colors.text : colors.outline}
                />
                <VemtapText
                  variant="bodyMd"
                  tone={branch.active ? 'default' : 'secondary'}
                  className="min-w-0 flex-1 leading-snug"
                >
                  {branch.address}
                </VemtapText>
              </View>

              <BusinessStatusPill
                label={branch.status}
                tone={branch.active ? 'success' : 'neutral'}
                icon={branch.active ? 'checkCircle' : 'block'}
              />

              {'notice' in branch && branch.notice ? (
                <View className="flex-row items-start gap-2 rounded-card bg-surface-container-high p-3">
                  <Icon name="block" size={17} color={colors.tertiaryContainer} />
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="min-w-0 flex-1 leading-relaxed"
                  >
                    {branch.notice}
                  </VemtapText>
                </View>
              ) : (
                <View className="flex-row flex-wrap items-center gap-1.5">
                  {'products' in branch && branch.products ? (
                    <BusinessStatusPill
                      label={branch.products}
                      tone="neutral"
                      icon="inventory"
                    />
                  ) : null}
                  {'services' in branch && branch.services ? (
                    <BusinessStatusPill
                      label={branch.services}
                      tone="neutral"
                      icon="roomService"
                    />
                  ) : null}
                  {'deals' in branch && branch.deals ? (
                    <BusinessStatusPill
                      label={branch.deals}
                      tone="brand"
                      icon="localOffer"
                    />
                  ) : null}
                </View>
              )}

              <View className="flex-row items-center justify-between gap-3 border-t border-border pt-3">
                {branch.active ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={branch.phone}
                    hitSlop={8}
                    onPress={() => onCallBranch?.(id)}
                    className="flex-row items-center gap-1.5"
                  >
                    <Icon name="call" size={15} color={colors.textSecondary} />
                    <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
                      {branch.phone}
                    </VemtapText>
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.reactivate}
                    onPress={() => onReactivate?.(id)}
                    className="min-h-9 flex-row items-center gap-1.5 rounded-field bg-surface px-3 py-1.5 shadow-sm active:scale-95"
                  >
                    <Icon name="bolt" size={15} color={colors.primary} />
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold text-primary"
                    >
                      {copy.reactivate}
                    </VemtapText>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.viewDetails}
                  hitSlop={8}
                  onPress={() => onViewDetails?.(id)}
                  className="flex-row items-center gap-1.5"
                >
                  <VemtapText
                    variant="labelMd"
                    className={
                      branch.active
                        ? 'font-sans-semibold text-primary'
                        : 'text-text-secondary'
                    }
                    numberOfLines={1}
                  >
                    {copy.viewDetails}
                  </VemtapText>
                  <Icon
                    name="arrowForward"
                    size={15}
                    color={branch.active ? colors.primary : colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <BusinessPanel className="mt-4" tone="tint">
        <SetupCallout
          icon="sync"
          tone="plain"
          iconSurface="circlePrimary"
          iconSize={19}
          title={copy.centralTitle}
          titleClassName="text-primary"
          body={copy.centralBody}
        />
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
