import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessMetricGrid } from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  posBranchChoices,
  posDrawerBalance,
  posDrawerSummary,
  posOperationalSummary,
  posQuickActions,
  posRegisterControls,
  posShift,
} from '@features/business/data/businessPosFlowData';

const copy = strings.posHomeSalesOperations;

export interface PosHomeSalesOperationsScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onSelectBranch?: (branchId: string) => void;
  onSyncCheck?: () => void;
  onQuickAction?: (actionId: string) => void;
  onOpenDrawer?: () => void;
  onOpenControl?: (controlId: string) => void;
}

/**
 * Store operations: branch switcher, sync + offline protection status, quick
 * actions, today's operational summary and register controls.
 *
 * The design's own bottom tab bar is not rendered — the app shell owns it.
 */
export function PosHomeSalesOperationsScreen({
  onBack,
  onOpenProfile,
  onOpenSettings,
  onSelectBranch,
  onSyncCheck,
  onQuickAction,
  onOpenDrawer,
  onOpenControl,
}: PosHomeSalesOperationsScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'tune', label: copy.settingsActionLabel, onPress: onOpenSettings },
          {
            icon: 'accountCircle',
            label: copy.profileActionLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="gap-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.storeTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {strings.businessMore.name}
        </VemtapText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.branchLabel}
        onPress={() => onSelectBranch?.(posBranchChoices[0].id)}
        className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
      >
        <BusinessIconWell icon="storefront" tone="brand" />
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.branchLabel}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {posBranchChoices[0].name}
          </VemtapText>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {posBranchChoices[0].id === 'wuse' ? 'Tap to switch location' : ''}
          </VemtapText>
        </View>
        <BusinessStatusPill label="Online" tone="success" />
      </Pressable>

      <View className="mt-2 gap-1.5 rounded-card bg-surface-subtle p-3">
        {posBranchChoices.map(branch => (
          <Pressable
            key={branch.id}
            accessibilityRole="button"
            accessibilityState={{ selected: branch.current }}
            accessibilityLabel={branch.name}
            onPress={() => onSelectBranch?.(branch.id)}
            className="flex-row items-center gap-2.5 py-1"
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <VemtapText
                variant="caption"
                className={`min-w-0 flex-1 ${branch.current ? 'font-sans-semibold text-primary' : 'text-text-secondary'}`}
                numberOfLines={1}
              >
                {branch.name}
              </VemtapText>
              {branch.distance ? (
                <VemtapText
                  variant="micro"
                  tone="tertiary"
                  className="shrink-0"
                  numberOfLines={1}
                >
                  {branch.distance}
                </VemtapText>
              ) : null}
            </View>
            {branch.current ? (
              <Icon name="checkCircle" size={16} color={colors.badgeDiscountText} />
            ) : null}
          </Pressable>
        ))}
      </View>

      <View className="mt-3 flex-row items-center gap-2 rounded-card bg-surface px-3 py-2.5 shadow-sm">
        <Icon name="cloudDone" size={16} color={colors.badgeDiscountText} />
        <VemtapText
          variant="caption"
          className="min-w-0 flex-1 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.syncLabel}
        </VemtapText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check"
          onPress={onSyncCheck}
          className="shrink-0"
        >
          <Icon name="sync" size={17} color={colors.textTertiary} />
        </Pressable>
      </View>

      <View className="mt-2 flex-row items-start gap-2.5 rounded-card bg-surface p-3 shadow-sm">
        <BusinessIconWell icon="shieldLock" tone="success" size="sm" />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="caption"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.offlineTitle}
            </VemtapText>
            <BusinessStatusPill label="Active" tone="success" />
          </View>
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="mt-0.5"
            numberOfLines={3}
          >
            {copy.offlineBody}
          </VemtapText>
        </View>
      </View>

      <View className="mt-2 flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5">
        <BusinessIconWell icon="clockLock" tone="neutral" size="sm" />
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="caption"
            className="min-w-0 font-sans-semibold"
            numberOfLines={2}
          >
            {copy.storageTitle}
          </VemtapText>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.storageMeta}
          </VemtapText>
        </View>
      </View>

      <View className="mt-3">
        <VemtapText
          variant="labelMd"
          className="mb-2 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.quickActionsTitle}
        </VemtapText>
        <View className="flex-row flex-wrap gap-2">
          {posQuickActions.map(action => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => onQuickAction?.(action.id)}
              className="min-w-[45%] flex-1 gap-1 rounded-card bg-surface p-3 shadow-sm active:scale-[0.98]"
            >
              <View className="flex-row items-center justify-between gap-2">
                <Icon name={action.icon} size={19} color={colors.primary} />
                {action.shortcut ? (
                  <View className="rounded bg-surface-container px-1.5 py-0.5">
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {action.shortcut}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {action.label}
              </VemtapText>
              <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
                {action.hint}
              </VemtapText>
            </Pressable>
          ))}
        </View>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.summaryTitle}
        icon="insights"
        badge={`${copy.summarySub} • Shift #${posShift.id}`}
        badgeTone="neutral"
      >
        <BusinessMetricGrid
          cells={posOperationalSummary.map(tallied => ({
            label: tallied.label,
            value: tallied.value,
            note: tallied.note,
            icon: tallied.icon,
          }))}
          columns={2}
          variant="bare"
        />
      </BusinessPanel>

      <View className="mt-3">
        <VemtapText
          variant="labelMd"
          className="mb-2 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.drawerTitle}
        </VemtapText>
        <View className="overflow-hidden rounded-card bg-surface shadow-sm">
          {posDrawerSummary.map((row, index) => (
            <View key={row.id}>
              {index > 0 ? <View className="h-px bg-surface-container-low" /> : null}
              <View className="flex-row items-center justify-between gap-3 px-3 py-2.5">
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1"
                  numberOfLines={1}
                >
                  {row.label}
                </VemtapText>
                <VemtapText
                  variant="labelMd"
                  className="shrink-0 font-sans-semibold"
                  numberOfLines={1}
                >
                  {row.value}
                </VemtapText>
              </View>
            </View>
          ))}
          <View className="h-px bg-surface-container-low" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={posDrawerBalance.label}
            onPress={onOpenDrawer}
            className="flex-row items-center justify-between gap-3 bg-surface-tint px-3 py-2.5"
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <Icon name="checkCircle" size={15} color={colors.badgeDiscountText} />
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {posDrawerBalance.label}
              </VemtapText>
            </View>
            <VemtapText
              variant="labelSm"
              className="shrink-0 font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {posDrawerBalance.value}
            </VemtapText>
          </Pressable>
        </View>
      </View>

      <View className="mt-3 gap-2">
        {posRegisterControls.map(control => (
          <Pressable
            key={control.id}
            accessibilityRole="button"
            accessibilityLabel={control.title}
            onPress={() => onOpenControl?.(control.id)}
            className="flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
          >
            <BusinessIconWell icon={control.icon} tone="brand" size="sm" />
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {control.title}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {control.subtitle}
              </VemtapText>
            </View>
            <View className="shrink-0">
              <Icon name="arrowForward" size={18} color={colors.textTertiary} />
            </View>
          </Pressable>
        ))}
      </View>
    </BusinessScreenLayout>
  );
}
