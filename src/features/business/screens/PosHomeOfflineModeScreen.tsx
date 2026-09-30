import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessMetricGrid } from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  offlineQueuedAmount,
  offlineQueuedCount,
  offlineShift,
  offlineTally,
} from '@features/business/data/businessOpsHubData';

const copy = strings.posHomeOfflineMode;

const offlineActionIcon: Record<string, import('@components/ui/Icon').IconName> = {
  'new-sale': 'pointOfSale',
  transactions: 'receiptLong',
  customers: 'groupNetwork',
  products: 'menuBook',
};

export interface PosHomeOfflineModeScreenProps {
  onBack?: () => void;
  onChangeBranch?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onRetrySync?: () => void;
  onOpenAction?: (actionId: string) => void;
  onOpenCustomerDisplay?: () => void;
  onOpenDrawer?: () => void;
}

/**
 * POS home while the terminal is offline: the offline banner and encrypted
 * buffer state, the pending-sync panel, the offline-capable actions, and
 * today's local SQLite tally.
 *
 * The design's own bottom tab bar is not rendered — the app shell owns bottom
 * navigation.
 */
export function PosHomeOfflineModeScreen({
  onBack,
  onChangeBranch,
  onOpenProfile,
  onOpenSettings,
  onRetrySync,
  onOpenAction,
  onOpenCustomerDisplay,
  onOpenDrawer,
}: PosHomeOfflineModeScreenProps) {
  const queueLabel = copy.syncCount.replace('{count}', String(offlineQueuedCount));
  const queueBody = copy.syncBody.replace('{count}', String(offlineQueuedCount));
  const bufferBody = copy.bufferBody.replace('{count}', String(offlineQueuedCount));

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'tune', label: copy.headerTitle, onPress: onOpenSettings },
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.retrySyncCta}
            labelVariant="labelMd"
            onPress={onRetrySync}
            leftIcon={<Icon name="sync" size={18} color={colors.surface} />}
          />
          <View className="flex-row items-center justify-center gap-1.5">
            <Icon name="wifiAlert" size={13} color={colors.textTertiary} />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="text-center"
              numberOfLines={2}
            >
              {copy.syncAutoBody}
            </VemtapText>
          </View>
        </BusinessActionDock>
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.locationLabel}
        onPress={onChangeBranch}
        className="flex-row items-center justify-between gap-2"
      >
        <View className="min-w-0 flex-row items-center gap-1.5">
          <VemtapText
            variant="labelMd"
            className="min-w-0 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.locationLabel}
          </VemtapText>
          <Icon name="expandMore" size={18} color={colors.textTertiary} />
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-error" />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-error"
            numberOfLines={1}
          >
            {copy.onlineLabel}
          </VemtapText>
        </View>
      </Pressable>

      <View className="mt-1 flex-row items-center gap-1.5">
        <View className="h-1.5 w-1.5 rounded-full bg-outline" />
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1"
          numberOfLines={1}
        >
          {`${offlineShift.cashier} (${offlineShift.till})`}
        </VemtapText>
        <View className="h-1.5 w-1.5 rounded-full bg-outline" />
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="shrink-0"
          numberOfLines={1}
        >
          {offlineShift.mode}
        </VemtapText>
      </View>

      <View className="mt-3 gap-2 rounded-card border border-border bg-surface p-4 shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error-container">
            <Icon name="cloudOff" size={20} color={colors.error} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.offlineTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.offlineSubtitle}
            </VemtapText>
          </View>
        </View>

        <View className="flex-row items-start gap-2 rounded-field bg-surface-subtle p-2.5">
          <Icon name="lock" size={14} color={colors.badgeDiscountText} />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
              numberOfLines={1}
            >
              {copy.encryptedLabel}
            </VemtapText>
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="mt-0.5"
              numberOfLines={3}
            >
              {copy.encryptedBody}
            </VemtapText>
          </View>
        </View>

        <View className="flex-row items-start gap-2 rounded-field bg-surface-subtle p-2.5">
          <BusinessIconWell icon="databaseLocal" tone="brand" size="sm" />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="caption"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.bufferTitle}
            </VemtapText>
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {bufferBody}
            </VemtapText>
            <VemtapText
              variant="caption"
              className="mt-0.5 font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {offlineQueuedAmount}
            </VemtapText>
          </View>
        </View>
      </View>

      <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm">
        <BusinessIconWell icon="restaurant" tone="brand" size="lg" />
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.storeLabel}
          </VemtapText>
          <View className="flex-row items-center gap-1.5">
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {`${copy.branchLabel} · ${offlineShift.till} · ${offlineShift.cashier}`}
            </VemtapText>
          </View>
          <VemtapText
            variant="micro"
            className="font-sans-semibold text-error"
            numberOfLines={1}
          >
            {copy.cacheLabel}
          </VemtapText>
        </View>
      </View>

      <View className="mt-3 gap-2 rounded-card border border-border bg-surface-tint p-3">
        <View className="flex-row items-center gap-2.5">
          <BusinessIconWell icon="sync" tone="brand" size="sm" />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.syncTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {queueBody}
            </VemtapText>
          </View>
          <BusinessStatusPill label={queueLabel} tone="warning" />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.retrySyncCta}
          onPress={onRetrySync}
          className="min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-primary active:scale-95"
        >
          <Icon name="bolt" size={16} color={colors.surface} />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-surface"
            numberOfLines={1}
          >
            {copy.retrySyncCta}
          </VemtapText>
        </Pressable>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.offlineActionsTitle}
        icon="bolt"
        badge={copy.readyLabel}
        badgeTone="success"
      >
        <View className="gap-2">
          {copy.offlineActions.map(action => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.title}
              onPress={() => onOpenAction?.(action.id)}
              className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5 active:bg-surface-container"
            >
              <BusinessIconWell
                icon={offlineActionIcon[action.id]}
                tone="brand"
                size="sm"
              />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {action.title}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                  {action.body}
                </VemtapText>
              </View>
              <View className="shrink-0">
                <Icon name="arrowForward" size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.tallyTitle}
        icon="clipboardText"
        badge={copy.tallyBadge}
        badgeTone="brand"
      >
        <BusinessMetricGrid
          cells={offlineTally.map(tallied => ({
            label: tallied.label,
            value: tallied.value,
            note: tallied.note,
            icon: tallied.icon,
          }))}
          columns={2}
          variant="bare"
        />
        <View className="flex-row items-center gap-1.5">
          <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 text-badge-discount-text"
            numberOfLines={1}
          >
            {copy.printerValue}
          </VemtapText>
        </View>
      </BusinessPanel>

      <View className="mt-3 flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.drawerLabel}
          onPress={onOpenDrawer}
          className="min-h-11 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface px-3 shadow-sm active:scale-95"
        >
          <Icon name="pointOfSale" size={17} color={colors.text} />
          <VemtapText
            variant="labelSm"
            className="min-w-0 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.drawerLabel}
          </VemtapText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.displayModeLabel}
          onPress={onOpenCustomerDisplay}
          className="min-h-11 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface px-3 shadow-sm active:scale-95"
        >
          <Icon name="television" size={17} color={colors.text} />
          <VemtapText
            variant="labelSm"
            className="min-w-0 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.displayModeLabel}
          </VemtapText>
        </Pressable>
      </View>
    </BusinessScreenLayout>
  );
}
