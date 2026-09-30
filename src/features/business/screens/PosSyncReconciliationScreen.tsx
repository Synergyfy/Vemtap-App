import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessInfoStrip,
  BusinessMetricTile,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  posSyncJournal,
  posSyncMetrics,
} from '@features/business/data/businessPosLedgerData';

const copy = strings.posSyncReconciliation;

export interface PosSyncReconciliationScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onForceSync?: () => void;
  onAcceptLocalSale?: (journalId: string) => void;
  onCustomLineItem?: (journalId: string) => void;
  onOpenDetails?: (journalId: string) => void;
  onDownloadCsv?: () => void;
}

/**
 * `pos_cloud_sync_reconciliation_center` - the reconciliation surface: upload
 * progress, the four standing sync metrics, and the conflict journal where a
 * local sale can collide with central stock and has to be resolved by hand.
 */
export function PosSyncReconciliationScreen({
  onBack,
  onOpenProfile,
  onForceSync,
  onAcceptLocalSale,
  onCustomLineItem,
  onOpenDetails,
  onDownloadCsv,
}: PosSyncReconciliationScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        subtitle: copy.headerSubtitle,
        onBack,
        titleVariant: 'labelMd',
        titleAccessory: (
          <View className="mt-1 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-success" />
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.onlineBadge}
            </VemtapText>
          </View>
        ),
        actions: [
          {
            icon: 'accountCircle',
            label: copy.profileActionLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
        <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
          <Icon name="wifi" size={17} color={colors.surface} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.networkTitle}
          </VemtapText>
          <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
            {copy.networkMeta}
          </VemtapText>
        </View>
        <BusinessStatusPill
          label={copy.latencyBadge}
          tone="neutral"
          className="shrink-0"
        />
      </View>

      <View className="mt-3 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-2">
              <View className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {copy.syncTitle}
              </VemtapText>
            </View>
          </View>
          <VemtapText
            variant="labelMd"
            className="shrink-0 font-sans-bold text-primary"
            numberOfLines={1}
          >
            {copy.syncPercent}
          </VemtapText>
        </View>
        <VemtapText variant="caption" tone="secondary" className="mt-1" numberOfLines={3}>
          {copy.syncBody}
        </VemtapText>
        <View className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-container-highest">
          <View className="h-full w-4/5 rounded-full bg-primary" />
        </View>
        <View className="mt-1.5 flex-row items-center justify-between gap-2">
          <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
            {copy.uploadedLabel}
          </VemtapText>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.queueLabel}
          </VemtapText>
        </View>
      </View>

      <View className="mt-2 flex-row flex-wrap gap-2">
        {posSyncMetrics.map(metric => (
          <BusinessMetricTile
            key={metric.id}
            label={metric.title}
            figure={metric.value}
            subline={metric.meta}
            icon={metric.icon}
            figureClassName={metric.tone === 'error' ? 'text-error' : undefined}
            sublineTone={metric.tone === 'error' ? 'brand' : 'default'}
            className="min-w-[45%] flex-1"
          />
        ))}
      </View>

      <View className="mt-3">
        <Button
          label={copy.syncNowCta}
          labelVariant="labelMd"
          onPress={onForceSync}
          leftIcon={<Icon name="bolt" size={17} color={colors.surface} />}
        />
      </View>

      <BusinessInfoStrip
        className="mt-2"
        icon="checkCircle"
        title={copy.autoSyncTitle}
        body={copy.autoSyncBody}
        tone="subtle"
      />

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.journalTitle}
        </VemtapText>
        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
          {copy.journalBadge}
        </VemtapText>
      </View>

      <View className="mt-2 gap-2.5">
        {posSyncJournal.map(entry => (
          <View key={entry.id} className="rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {entry.reference}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-0.5"
                  numberOfLines={2}
                >
                  {entry.when}
                </VemtapText>
              </View>
              <View className="shrink-0 items-end">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {entry.total}
                </VemtapText>
                <BusinessStatusPill
                  label={entry.badge}
                  tone={entry.badgeTone}
                  icon={
                    entry.badgeTone === 'tertiary'
                      ? 'alert'
                      : entry.badgeTone === 'success'
                        ? 'checkCircle'
                        : 'sync'
                  }
                  className="mt-1"
                />
              </View>
            </View>

            {entry.conflictTitle ? (
              <View className="mt-2 rounded-field bg-error-container p-2.5">
                <View className="flex-row items-center gap-1.5">
                  <Icon name="alert" size={15} color={colors.error} />
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-error"
                    numberOfLines={1}
                  >
                    {entry.conflictTitle}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="micro"
                  className="mt-1 leading-relaxed"
                  numberOfLines={4}
                >
                  {entry.conflictBody}
                </VemtapText>
              </View>
            ) : null}

            {entry.id === 'loc-005' ? (
              <View className="mt-2 flex-row flex-wrap items-center justify-between gap-2">
                <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                  <Icon name="lock" size={14} color={colors.textSecondary} />
                  <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                    {copy.packetLabel}
                  </VemtapText>
                </View>
                <BusinessStatusPill label={copy.channelBadge} tone="brand" />
              </View>
            ) : null}

            {entry.footnote ? (
              <View className="mt-2 flex-row items-center gap-1.5">
                <Icon name="checkCircle" size={14} color={colors.success} />
                <VemtapText variant="micro" tone="success" numberOfLines={2}>
                  {entry.footnote}
                </VemtapText>
              </View>
            ) : null}

            {entry.actions.length > 0 ? (
              <View className="mt-2.5 gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={entry.actions[0]}
                  onPress={() => onAcceptLocalSale?.(entry.id)}
                  className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-field bg-primary active:scale-[0.99]"
                >
                  <Icon name="check" size={16} color={colors.surface} />
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-surface"
                    numberOfLines={1}
                  >
                    {entry.actions[0]}
                  </VemtapText>
                </Pressable>
                <View className="flex-row gap-2">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={entry.actions[1]}
                    onPress={() => onCustomLineItem?.(entry.id)}
                    className="min-h-10 min-w-0 flex-1 items-center justify-center rounded-field bg-surface-container active:scale-95"
                  >
                    <VemtapText
                      variant="caption"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {entry.actions[1]}
                    </VemtapText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={entry.actions[2]}
                    onPress={() => onOpenDetails?.(entry.id)}
                    className="min-h-10 min-w-0 flex-1 items-center justify-center rounded-field bg-surface-container active:scale-95"
                  >
                    <VemtapText
                      variant="caption"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {entry.actions[2]}
                    </VemtapText>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.diagnosticsTitle}
        icon="hub"
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.diagnosticsTitle}
            onPress={() => onOpenDetails?.('diagnostics')}
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.diagnosticsBadge}
            </VemtapText>
          </Pressable>
        }
      >
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
            <Icon name="hub" size={18} color={colors.primary} />
          </View>
          <VemtapText variant="caption" className="min-w-0 flex-1" numberOfLines={2}>
            {copy.diagnosticsRegion}
          </VemtapText>
        </View>
        <View className="mt-2.5 flex-row gap-2">
          <View className="min-w-0 flex-1">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.offlineIntegrityLabel}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.offlineIntegrityValue}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.endpointLabel}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.endpointValue}
            </VemtapText>
          </View>
        </View>
        <View className="mt-2.5">
          <Button
            label={copy.downloadCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={onDownloadCsv}
            leftIcon={<Icon name="download" size={15} color={colors.text} />}
          />
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
