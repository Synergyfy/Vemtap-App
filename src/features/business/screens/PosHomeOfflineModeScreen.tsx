import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
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

const copy = strings.posHomeOfflineMode;

const actions: readonly { id: string; icon: IconName; title: string; body: string }[] = [
  { id: 'new-sale', icon: 'pointOfSale', ...copy.actions.newSale },
  { id: 'queue', icon: 'cloudQueue', ...copy.actions.queue },
  { id: 'products', icon: 'menuBook', ...copy.actions.products },
];

export interface PosOfflineHomeView {
  online: boolean;
  branchName: string;
  /** `Ada Obi • Till 01`; empty when no shift is cached. */
  shiftLine: string;
  queuedCount: number;
  queuedAmount: string;
  lastSync: string | null;
  menuCount: number;
  /** Last figures fetched before going offline; null if never loaded. */
  tally: { sales: string; transactions: string; held: string } | null;
}

export interface PosHomeOfflineModeScreenProps {
  view: PosOfflineHomeView;
  isSyncing?: boolean;
  onBack?: () => void;
  onRetrySync?: () => void;
  onOpenAction?: (actionId: string) => void;
}

/** The till when the connection drops: what is queued on the device and what still works. */
export function PosHomeOfflineModeScreen({
  view,
  isSyncing,
  onBack,
  onRetrySync,
  onOpenAction,
}: PosHomeOfflineModeScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.retrySyncCta}
            labelVariant="labelMd"
            disabled={!view.online || view.queuedCount === 0}
            loading={isSyncing}
            onPress={onRetrySync}
            leftIcon={<Icon name="sync" size={17} color={colors.surface} />}
          />
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="text-center"
            numberOfLines={2}
          >
            {copy.syncAutoBody}
          </VemtapText>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center gap-2">
        <Icon name="store" size={16} color={colors.textSecondary} />
        <VemtapText
          variant="labelMd"
          className="min-w-0 flex-1 font-sans-semibold"
          numberOfLines={1}
        >
          {view.branchName}
        </VemtapText>
        <BusinessStatusPill
          label={view.online ? copy.onlineLabel : copy.offlineLabel}
          tone={view.online ? 'success' : 'neutral'}
        />
      </View>
      {view.shiftLine ? (
        <VemtapText variant="caption" tone="secondary" className="mt-1" numberOfLines={1}>
          {view.shiftLine}
        </VemtapText>
      ) : null}

      <View className="mt-3 gap-2 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <BusinessIconWell
            icon={view.online ? 'cloudDone' : 'cloudOff'}
            tone={view.online ? 'success' : 'neutral'}
          />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {view.online ? copy.onlineTitle : copy.offlineTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={3}>
              {copy.encryptedBody}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-2.5">
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.bufferTitle}
            </VemtapText>
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.bufferBody(view.queuedCount)}
            </VemtapText>
          </View>
          <VemtapText
            variant="labelMd"
            className="shrink-0 font-sans-bold"
            numberOfLines={1}
          >
            {view.queuedAmount}
          </VemtapText>
        </View>
        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
          {view.lastSync ? copy.lastSync(view.lastSync) : copy.neverSynced}
        </VemtapText>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.offlineActionsTitle}
        icon="bolt"
        badge={copy.readyLabel}
        badgeTone="success"
      >
        <View className="gap-2">
          {actions.map(action => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.title}
              onPress={() => onOpenAction?.(action.id)}
              className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5 active:bg-surface-container"
            >
              <BusinessIconWell icon={action.icon} tone="brand" size="sm" />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {action.title}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
                  {action.id === 'products'
                    ? copy.menuCached(view.menuCount)
                    : action.body}
                </VemtapText>
              </View>
              <Icon name="arrowForward" size={16} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </BusinessPanel>

      {view.tally ? (
        <BusinessPanel
          className="mt-3"
          title={copy.tallyTitle}
          icon="insights"
          badge={copy.tallyBadge}
          badgeTone="neutral"
        >
          <BusinessMetricGrid
            cells={[
              {
                label: copy.salesLabel,
                value: view.tally.sales,
                icon: 'payments' as IconName,
              },
              {
                label: copy.transactionsLabel,
                value: view.tally.transactions,
                icon: 'doneAll' as IconName,
              },
              {
                label: copy.heldLabel,
                value: view.tally.held,
                icon: 'pauseCircle' as IconName,
              },
            ]}
            columns={2}
            variant="bare"
          />
        </BusinessPanel>
      ) : null}
    </BusinessScreenLayout>
  );
}
