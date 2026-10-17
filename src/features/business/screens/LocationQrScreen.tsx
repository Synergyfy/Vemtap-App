import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { AppModal } from '@components/ui/Modal';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState, LoadingState } from '@components/shared';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessAnalyticsNav,
  BusinessMetricGrid,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessQrFrame } from '@features/business/components/BusinessPosPrimitives';
import { qrSubTabIcon, qrSubTabs } from '@features/business/data/businessGrowthData';
import type { LocationQrView, QrCodeCard } from '@features/business/utils/qrMappers';

const copy = strings.locationQr;

const qrTabs = qrSubTabs.map(label => ({ key: label, label, icon: qrSubTabIcon[label] }));

export interface LocationQrScreenProps {
  view?: LocationQrView;
  isError?: boolean;
  onRetry?: () => void;
  isKitBusy?: boolean;
  notice?: { tone: 'success' | 'error'; text: string } | null;
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onFilterBranch?: (branchId: string | null) => void;
  onShare?: (code: QrCodeCard) => void;
  /** Print sheet for one branch (`branchId`) or every code (`null`). */
  onPrintSheet?: (branchId: string | null) => void;
  onRequestDevices?: () => void;
  onOpenProfile?: () => void;
}

/**
 * Location QR: every branch QR and tap device with its scans, a live status
 * strip for the network, the full-size tag for scanning, and the print sheet.
 */
export function LocationQrScreen({
  view,
  isError,
  onRetry,
  isKitBusy = false,
  notice,
  onBack,
  onOpenNotifications,
  onOpenSubTab,
  onFilterBranch,
  onShare,
  onPrintSheet,
  onRequestDevices,
  onOpenProfile,
}: LocationQrScreenProps) {
  const [subTab, setSubTab] = useState(qrSubTabs[1]);
  const [branch, setBranch] = useState<string | null>(null);
  const [tag, setTag] = useState<QrCodeCard | null>(null);

  const inScope = <T extends { branchId: string }>(rows: readonly T[]) =>
    branch ? rows.filter(row => row.branchId === branch) : rows;
  const branchCodes = inScope(view?.branchCodes ?? []);
  const points = inScope(view?.points ?? []);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'bellRing', label: copy.headerTitle, onPress: onOpenNotifications },
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        view ? (
          <BusinessActionDock>
            <Button
              label={
                isKitBusy
                  ? strings.businessIntelligence.exportReport.generating
                  : copy.exportCta
              }
              labelVariant="labelMd"
              loading={isKitBusy}
              disabled={isKitBusy}
              onPress={() => onPrintSheet?.(null)}
              leftIcon={<Icon name="download" size={18} color={colors.surface} />}
            />
            <Button
              label={copy.acrylicCta}
              labelVariant="labelSm"
              variant="secondary"
              onPress={onRequestDevices}
            />
          </BusinessActionDock>
        ) : undefined
      }
    >
      <View className="gap-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.manageLabel}
        </VemtapText>
        {view ? (
          <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
            {view.subtitle}
          </VemtapText>
        ) : null}
      </View>

      <BusinessAnalyticsNav
        tabs={qrTabs}
        value={subTab}
        onChange={next => {
          setSubTab(next as typeof subTab);
          onOpenSubTab?.(next);
        }}
        className="-mx-6 mt-3"
      />

      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={copy.loading} />
        )
      ) : (
        <>
          {view.groups.length > 2 ? (
            <BusinessChipScroller className="mt-3">
              {view.groups.map(group => (
                <BusinessCountChip
                  key={group.id ?? 'all'}
                  label={group.label}
                  count={group.count}
                  selected={group.id === branch}
                  onPress={() => {
                    setBranch(group.id);
                    onFilterBranch?.(group.id);
                  }}
                />
              ))}
            </BusinessChipScroller>
          ) : null}

          {notice ? (
            <VemtapText
              variant="caption"
              className={
                notice.tone === 'success'
                  ? 'mt-3 text-badge-discount-text'
                  : 'mt-3 text-error'
              }
            >
              {notice.text}
            </VemtapText>
          ) : null}

          <BusinessPanel
            className="mt-3"
            title={copy.networkTitle}
            icon="trendingUp"
            badge={copy.networkBadge}
            badgeTone="brand"
          >
            <BusinessMetricGrid cells={view.network} columns={2} variant="bare" />
          </BusinessPanel>

          <View className="mt-3 gap-2">
            {branchCodes.map(code => (
              <View key={code.id} className="gap-2 rounded-card bg-surface p-3 shadow-sm">
                <View className="flex-row items-center gap-2.5">
                  <BusinessIconWell icon="storefront" tone="brand" />
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {code.name}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {code.scans}
                    </VemtapText>
                  </View>
                  <BusinessStatusPill label={code.meta} tone="brand" />
                </View>
                <CodeActions
                  code={code}
                  onView={() => setTag(code)}
                  onShare={() => onShare?.(code)}
                  onPrint={() => onPrintSheet?.(code.branchId)}
                />
              </View>
            ))}

            {points.map(point => (
              <View
                key={point.id}
                className="gap-2 rounded-card bg-surface p-3 shadow-sm"
              >
                <View className="flex-row items-center gap-2.5">
                  <BusinessIconWell icon={point.icon} tone="brand" />
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {point.name}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {point.meta}
                    </VemtapText>
                  </View>
                  <BusinessStatusPill label={point.status} tone={point.tone} />
                </View>
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-primary"
                  >
                    {point.weekly}
                  </VemtapText>
                  <VemtapText variant="micro" tone="tertiary">
                    {point.total}
                  </VemtapText>
                </View>
                <CodeActions
                  code={point}
                  onView={() => setTag(point)}
                  onShare={() => onShare?.(point)}
                  onPrint={() => onPrintSheet?.(point.branchId)}
                />
              </View>
            ))}

            {points.length === 0 ? (
              <EmptyState
                icon="qrCodeScanner"
                variant="contained"
                title={copy.empty.title}
                description={copy.empty.body}
              />
            ) : null}
          </View>
        </>
      )}

      <AppModal visible={Boolean(tag)} onClose={() => setTag(null)} title={copy.tagTitle}>
        {tag ? (
          <View className="items-center gap-3 pb-2">
            <BusinessQrFrame size="lg" label={tag.name} caption={tag.url} svg={tag.svg} />
            <VemtapText variant="caption" tone="secondary" className="text-center">
              {copy.readyLabel}
            </VemtapText>
            <Button
              label={copy.tagClose}
              variant="secondary"
              onPress={() => setTag(null)}
            />
          </View>
        ) : null}
      </AppModal>
    </BusinessScreenLayout>
  );
}

function CodeActions({
  code,
  onView,
  onShare,
  onPrint,
}: {
  code: QrCodeCard;
  onView: () => void;
  onShare: () => void;
  onPrint: () => void;
}) {
  const actions = [
    {
      id: 'view',
      label: copy.viewTagCta,
      icon: 'qrCodeScanner' as const,
      onPress: onView,
    },
    { id: 'share', label: copy.shareCta, icon: 'share' as const, onPress: onShare },
    {
      id: 'print',
      label: copy.printStickerCta,
      icon: 'printReceipt' as const,
      onPress: onPrint,
    },
  ];
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {actions.map(action => (
        <Pressable
          key={action.id}
          accessibilityRole="button"
          accessibilityLabel={`${action.label} ${code.name}`}
          onPress={action.onPress}
          className={`min-h-9 flex-row items-center gap-1 rounded-full px-3 active:scale-95 ${
            action.id === 'view' ? 'bg-primary' : 'bg-surface-container'
          }`}
        >
          <Icon
            name={action.icon}
            size={14}
            color={action.id === 'view' ? colors.surface : colors.text}
          />
          <VemtapText
            variant="labelSm"
            className={
              action.id === 'view'
                ? 'font-sans-semibold text-primary-foreground'
                : 'font-sans-semibold'
            }
            numberOfLines={1}
          >
            {action.label}
          </VemtapText>
        </Pressable>
      ))}
    </View>
  );
}
