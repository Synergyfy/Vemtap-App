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
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import type { IconName } from '@components/ui/Icon';

const copy = strings.posHomeSalesOperations;

const quickActions: readonly {
  id: string;
  label: string;
  hint: string;
  icon: IconName;
}[] = [
  { id: 'new-sale', icon: 'addCircle', ...copy.quickActions.newSale },
  { id: 'transactions', icon: 'receiptLong', ...copy.quickActions.transactions },
  { id: 'customers', icon: 'accountSearch', ...copy.quickActions.customers },
  { id: 'products', icon: 'inventory', ...copy.quickActions.products },
];

const registerControls: readonly {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
}[] = [
  { id: 'public-mode', icon: 'touchApp', ...copy.controls.publicMode },
  { id: 'drawer', icon: 'pointOfSale', ...copy.controls.drawer },
  { id: 'sync', icon: 'sync', ...copy.controls.sync },
];

/** Display-ready figures for the operations hub. */
export interface PosHomeView {
  storeName: string;
  branches: { id: string; name: string; current: boolean }[];
  activeBranchName: string;
  online: boolean;
  /** Sales waiting on this device to sync. */
  queuedCount: number;
  /** e.g. `Shift opened 08:30 AM`; null with no open register. */
  shiftLabel: string | null;
  summary: {
    sales: string;
    salesNote: string;
    transactions: string;
    transactionsNote: string;
    pending: string;
    pendingNote: string;
    refunds: string;
    refundsNote: string;
  };
  /** Null when no register is open. */
  drawer: { openingFloat: string; cashInTill: string; balanceLabel: string } | null;
}

export interface PosHomeSalesOperationsScreenProps {
  view?: PosHomeView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
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
  view,
  isLoading,
  isError,
  onRetry,
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
        <PosHomeBody
          view={view}
          onSelectBranch={onSelectBranch}
          onSyncCheck={onSyncCheck}
          onQuickAction={onQuickAction}
          onOpenDrawer={onOpenDrawer}
          onOpenControl={onOpenControl}
        />
      )}
    </BusinessScreenLayout>
  );
}

function PosHomeBody({
  view,
  onSelectBranch,
  onSyncCheck,
  onQuickAction,
  onOpenDrawer,
  onOpenControl,
}: Pick<
  PosHomeSalesOperationsScreenProps,
  'onSelectBranch' | 'onSyncCheck' | 'onQuickAction' | 'onOpenDrawer' | 'onOpenControl'
> & { view: PosHomeView }) {
  const current = view.branches.find(branch => branch.current);
  const summaryCells = [
    {
      label: copy.summary.sales,
      value: view.summary.sales,
      note: view.summary.salesNote,
      icon: 'payments' as IconName,
    },
    {
      label: copy.summary.transactions,
      value: view.summary.transactions,
      note: view.summary.transactionsNote,
      icon: 'doneAll' as IconName,
    },
    {
      label: copy.summary.pending,
      value: view.summary.pending,
      note: view.summary.pendingNote,
      icon: 'roomService' as IconName,
    },
    {
      label: copy.summary.refunds,
      value: view.summary.refunds,
      note: view.summary.refundsNote,
      icon: 'closeCircleOutline' as IconName,
    },
  ];
  return (
    <>
      <View className="gap-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.storeTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {view.storeName}
        </VemtapText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.branchLabel}
        onPress={() => current && onSelectBranch?.(current.id)}
        className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
      >
        <BusinessIconWell icon="storefront" tone="brand" />
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.branchLabel}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {view.activeBranchName}
          </VemtapText>
          {view.branches.length > 1 ? (
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.switchHint}
            </VemtapText>
          ) : null}
        </View>
        <BusinessStatusPill
          label={view.online ? copy.online : copy.offline}
          tone={view.online ? 'success' : 'warning'}
        />
      </Pressable>

      <View className="mt-2 gap-1.5 rounded-card bg-surface-subtle p-3">
        {view.branches.map(branch => (
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
          {view.queuedCount > 0 ? copy.queuedLabel(view.queuedCount) : copy.syncLabel}
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
            <BusinessStatusPill label={copy.offlineActive} tone="success" />
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
            {copy.storageMeta(view.queuedCount)}
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
          {quickActions.map(action => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => onQuickAction?.(action.id)}
              className="min-w-[45%] flex-1 gap-1 rounded-card bg-surface p-3 shadow-sm active:scale-[0.98]"
            >
              <View className="flex-row items-center justify-between gap-2">
                <Icon name={action.icon} size={19} color={colors.primary} />
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
        badge={
          view.shiftLabel ? `${copy.summarySub} • ${view.shiftLabel}` : copy.summarySub
        }
        badgeTone="neutral"
      >
        <BusinessMetricGrid cells={summaryCells} columns={2} variant="bare" />
      </BusinessPanel>

      <View className="mt-3">
        <VemtapText
          variant="labelMd"
          className="mb-2 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.drawerTitle}
        </VemtapText>
        {view.drawer ? (
          <View className="overflow-hidden rounded-card bg-surface shadow-sm">
            {[
              {
                id: 'float',
                label: copy.drawer.openingFloat,
                value: view.drawer.openingFloat,
              },
              {
                id: 'cash',
                label: copy.drawer.cashInTill,
                value: view.drawer.cashInTill,
              },
            ].map((row, index) => (
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
              accessibilityLabel={copy.drawer.balance}
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
                  {copy.drawer.balance}
                </VemtapText>
              </View>
              <VemtapText
                variant="labelSm"
                className="shrink-0 font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {view.drawer.balanceLabel}
              </VemtapText>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.drawer.openAction}
            onPress={onOpenDrawer}
            className="rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
          >
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.drawer.closedTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {copy.drawer.closedBody}
            </VemtapText>
          </Pressable>
        )}
      </View>

      <View className="mt-3 gap-2">
        {registerControls.map(control => (
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
    </>
  );
}
