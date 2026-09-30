import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessPanel,
  BusinessScopePicker,
} from '@features/business/components/BusinessOpsPrimitives';
import { SetupCallout } from '@features/business/components/BusinessSetupPrimitives';

cssInterop(Pressable, { className: 'style' });

const copy = strings.locationsBranches;

const branchIds = ['wuse', 'vi', 'garki'] as const;

export interface LocationsBranchesScreenProps {
  onNotifications?: () => void;
  onAddLocation?: () => void;
  onChangeScope?: (value: string) => void;
  onViewDetails?: (branchId: string) => void;
  onEditLocation?: (branchId: string) => void;
  onMoreBranchOptions?: (branchId: string) => void;
  onCallBranch?: (branchId: string) => void;
  onReactivate?: (branchId: string) => void;
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
}: LocationsBranchesScreenProps) {
  const [scope, setScope] = useState('wuse');

  return (
    <BusinessScreenLayout
      header={{
        title: copy.branches[0].name,
        eyebrow: copy.eyebrow,
        centerTitle: false,
        titleVariant: 'headingSm',
        actions: [{ icon: 'notifications', label: copy.title, onPress: onNotifications }],
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

      <View className="mt-3 flex-row items-center justify-between gap-3 rounded-card bg-surface-container-high p-3 shadow-sm">
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
            label={copy.branches[0].name}
            value={scope}
            options={[
              { label: copy.branches[0].name, value: 'wuse' },
              { label: copy.branches[1].name, value: 'vi' },
              { label: copy.branches[2].name, value: 'garki' },
            ]}
            onChange={value => {
              setScope(value);
              onChangeScope?.(value);
            }}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.switch}
          onPress={() => onChangeScope?.(scope === 'all' ? 'wuse' : 'all')}
          className="min-h-8 shrink-0 justify-center rounded-full bg-surface px-2.5 py-1 shadow-sm active:scale-95"
        >
          <VemtapText variant="caption" className="font-sans-medium text-primary">
            {copy.switch}
          </VemtapText>
        </Pressable>
      </View>

      <View className="mt-3 gap-3">
        {copy.branches.map((branch, index) => {
          const id = branchIds[index];
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
