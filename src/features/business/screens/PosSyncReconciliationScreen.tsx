import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessPanel,
  BusinessStatTile,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.posSyncReconciliation;

export type SyncJournalStatus = 'synced' | 'duplicate' | 'conflict' | 'failed';

const statusTone = {
  synced: 'success',
  duplicate: 'success',
  conflict: 'tertiary',
  failed: 'warning',
} as const;

export interface SyncJournalEntry {
  id: string;
  status: SyncJournalStatus;
  title: string;
  detail: string;
  when: string;
  /** Conflicts can be re-queued after the cause is fixed. */
  canRequeue: boolean;
}

export interface PosSyncReconciliationView {
  online: boolean;
  waiting: number;
  synced: number;
  needsReview: number;
  lastPush: string;
  journal: SyncJournalEntry[];
}

export interface PosSyncReconciliationScreenProps {
  view: PosSyncReconciliationView;
  isSyncing?: boolean;
  onBack?: () => void;
  onForceSync?: () => void;
  onRequeue?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onOpenSale?: (id: string) => void;
}

/** Offline sync status: what is waiting, what landed, and conflicts that need a person. */
export function PosSyncReconciliationScreen({
  view,
  isSyncing,
  onBack,
  onForceSync,
  onRequeue,
  onDismiss,
  onOpenSale,
}: PosSyncReconciliationScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.syncNowCta}
            labelVariant="labelMd"
            disabled={!view.online || view.waiting === 0}
            loading={isSyncing}
            onPress={onForceSync}
            leftIcon={<Icon name="sync" size={17} color={colors.surface} />}
          />
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center gap-2 rounded-card bg-surface p-3 shadow-sm">
        <Icon
          name={view.online ? 'cloudDone' : 'cloudOff'}
          size={18}
          color={view.online ? colors.success : colors.tertiary}
        />
        <VemtapText
          variant="labelMd"
          className="min-w-0 flex-1 font-sans-semibold"
          numberOfLines={1}
        >
          {view.online ? copy.onlineTitle : copy.offlineTitle}
        </VemtapText>
      </View>

      <View className="mt-3 flex-row flex-wrap gap-2">
        <BusinessStatTile
          label={copy.waitingTitle}
          value={String(view.waiting)}
          icon="cloudQueue"
          accent="brand"
          className="min-w-[45%] p-2.5"
        />
        <BusinessStatTile
          label={copy.syncedTitle}
          value={String(view.synced)}
          icon="doneAll"
          accent="success"
          className="min-w-[45%] p-2.5"
        />
        <BusinessStatTile
          label={copy.reviewTitle}
          value={String(view.needsReview)}
          icon="alert"
          accent="tertiary"
          className="min-w-[45%] p-2.5"
        />
        <BusinessStatTile
          label={copy.pushTitle}
          value={view.lastPush}
          icon="schedule"
          accent="tertiary"
          className="min-w-[45%] p-2.5"
        />
      </View>

      <View className="mt-3 rounded-field bg-surface-subtle p-2.5">
        <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
          {copy.autoSyncTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={4}>
          {copy.autoSyncBody}
        </VemtapText>
      </View>

      <BusinessPanel className="mt-3" title={copy.journalTitle} icon="history">
        {view.journal.length ? (
          <View className="gap-2">
            {view.journal.map(entry => (
              <View
                key={entry.id}
                className="gap-1.5 rounded-field bg-surface-subtle p-2.5"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="labelSm"
                    className="min-w-0 flex-1 font-sans-semibold"
                    numberOfLines={1}
                  >
                    {entry.title}
                  </VemtapText>
                  <BusinessStatusPill
                    label={copy.status[entry.status]}
                    tone={statusTone[entry.status]}
                  />
                </View>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {entry.when}
                </VemtapText>
                {entry.detail ? (
                  <VemtapText variant="caption" tone="secondary" numberOfLines={3}>
                    {entry.detail}
                  </VemtapText>
                ) : null}
                <View className="flex-row gap-2">
                  {entry.canRequeue ? (
                    <View className="min-w-0 flex-1">
                      <Button
                        label={copy.requeueCta}
                        size="sm"
                        labelVariant="labelSm"
                        onPress={() => onRequeue?.(entry.id)}
                      />
                    </View>
                  ) : null}
                  {entry.status === 'synced' || entry.status === 'duplicate' ? (
                    <View className="min-w-0 flex-1">
                      <Button
                        label={copy.viewDetailsCta}
                        size="sm"
                        labelVariant="labelSm"
                        variant="secondary"
                        onPress={() => onOpenSale?.(entry.id)}
                      />
                    </View>
                  ) : null}
                  <View className="min-w-0 flex-1">
                    <Button
                      label={copy.dismissCta}
                      size="sm"
                      labelVariant="labelSm"
                      variant="secondary"
                      onPress={() => onDismiss?.(entry.id)}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            variant="contained"
            title={copy.empty.title}
            description={copy.empty.body}
          />
        )}
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
