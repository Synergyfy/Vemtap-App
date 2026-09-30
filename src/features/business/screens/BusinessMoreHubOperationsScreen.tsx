import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import { BusinessAnalyticsRow } from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessSettingRow } from '@features/business/components/BusinessPosPrimitives';
import {
  hubAnalyticsRows,
  hubMarketingRows,
  hubPosTileAction,
  hubPosTileAlert,
  hubPosTiles,
  hubQrRows,
  type HubLinkRow,
} from '@features/business/data/businessOpsHubData';

const copy = strings.businessMoreHubOperations;

/** Shared row shell for the four icon+title+body link lists on this hub. */
function HubLinkList({
  rows,
  onOpenRow,
}: {
  rows: readonly HubLinkRow[];
  onOpenRow?: (rowId: string) => void;
}) {
  return (
    <View className="gap-2">
      {rows.map(row => (
        <BusinessAnalyticsRow
          key={row.id}
          title={row.title}
          subtitle={row.body}
          icon={row.icon}
          badge={row.badge}
          badgeTone={row.badgeTone === 'discount' ? 'warning' : 'brand'}
          chevron
          onPress={() => onOpenRow?.(row.id)}
        />
      ))}
    </View>
  );
}

export interface BusinessMoreHubOperationsScreenProps {
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenPosTile?: (tileId: string) => void;
  onOpenRow?: (rowId: string) => void;
  onSwitchToCustomer?: () => void;
  onSignOut?: () => void;
}

/**
 * The operations-dense More hub: POS tile grid, branch net-sales headline, then
 * four icon+title+body groups (analytics, marketing, QR & discovery, and the
 * management rows inherited from the standard More hub).
 *
 * The design's own bottom tab bar is not rendered — the app shell owns bottom
 * navigation — and the standard More hub remains the default landing screen.
 */
export function BusinessMoreHubOperationsScreen({
  onBack,
  onOpenNotifications,
  onOpenProfile,
  onOpenPosTile,
  onOpenRow,
  onSwitchToCustomer,
  onSignOut,
}: BusinessMoreHubOperationsScreenProps) {
  const more = strings.businessMore;
  /** Flattened management rows inherited from the standard More hub. */
  const managementRows: {
    id: string;
    label: string;
    meta: string;
    badge?: string;
    icon: string;
  }[] = [];
  more.sections.forEach(section => {
    if (section.id !== 'feedback' && section.id !== 'account') return;
    section.items.forEach(item => {
      managementRows.push({ ...item, meta: item.meta });
    });
  });

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
        <BusinessActionDock>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={more.switchToCustomer}
            onPress={onSwitchToCustomer}
            className="min-h-11 flex-row items-center justify-center gap-2 rounded-field bg-surface-tint px-4 active:scale-[0.98]"
          >
            <Icon name="localMall" size={18} color={colors.primary} />
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {more.switchToCustomer}
            </VemtapText>
            <Icon name="arrowForward" size={16} color={colors.primary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={more.signOut}
            onPress={onSignOut}
            className="min-h-10 flex-row items-center justify-center gap-1.5"
          >
            <Icon name="logout" size={16} color={colors.error} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-error"
              numberOfLines={1}
            >
              {more.signOut}
            </VemtapText>
          </Pressable>
        </BusinessActionDock>
      }
    >
      <View className="gap-1.5 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-2">
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.identityName}
          </VemtapText>
          <Icon name="verified" size={17} color={colors.primary} />
        </View>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {copy.identityMeta}
        </VemtapText>
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-row items-center gap-1.5">
            <Icon name="locationOn" size={13} color={colors.textTertiary} />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {copy.locationLabel}
            </VemtapText>
          </View>
          <BusinessStatusPill label={copy.terminalStatus} tone="success" />
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="cloudDone" size={13} color={colors.badgeDiscountText} />
          <VemtapText
            variant="micro"
            className="min-w-0 flex-1 text-badge-discount-text"
            numberOfLines={1}
          >
            {copy.terminalSynced}
          </VemtapText>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Icon name="pointOfSale" size={18} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="min-w-0 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.posTitle}
          </VemtapText>
        </View>
        <BusinessStatusPill label={copy.posStatus} tone="success" />
      </View>
      <VemtapText variant="caption" tone="secondary" className="mt-1" numberOfLines={2}>
        {copy.posBody}
      </VemtapText>

      <View className="mt-2 flex-row flex-wrap gap-2">
        {hubPosTiles.map(tile => {
          const primary = hubPosTileAction[tile.id] === 'primary';
          const alert = hubPosTileAlert[tile.id] === true;
          return (
            <Pressable
              key={tile.id}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
              onPress={() => onOpenPosTile?.(tile.id)}
              className={`min-w-[45%] flex-1 gap-1 rounded-card p-3 active:scale-[0.98] ${
                primary
                  ? 'bg-primary'
                  : alert
                    ? 'bg-surface-tint'
                    : 'bg-surface shadow-sm'
              }`}
            >
              <Icon
                name={tile.icon}
                size={20}
                color={primary ? colors.surface : colors.primary}
              />
              <VemtapText
                variant="labelSm"
                className={`font-sans-semibold ${primary ? 'text-surface' : ''}`}
                numberOfLines={1}
              >
                {tile.label}
              </VemtapText>
              {tile.hint ? (
                <VemtapText
                  variant="micro"
                  className={primary ? 'text-surface' : 'text-text-tertiary'}
                  numberOfLines={1}
                >
                  {tile.hint}
                </VemtapText>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.analyticsTitle}
        icon="insights"
        badge={copy.analyticsCta}
        badgeTone="brand"
      >
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.analyticsBody}
        </VemtapText>
        <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-2.5">
          <View className="min-w-0 flex-1">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.netSalesLabel}
            </VemtapText>
            <VemtapText variant="headingSm" className="font-sans-bold" numberOfLines={1}>
              {copy.netSalesValue}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1">
            <Icon name="trendingUp" size={15} color={colors.badgeDiscountText} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-badge-discount-text"
              numberOfLines={1}
            >
              {copy.netSalesDelta}
            </VemtapText>
          </View>
        </View>
        <HubLinkList rows={hubAnalyticsRows} onOpenRow={onOpenRow} />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.marketingTitle}
        icon="campaign"
        badge={copy.marketingBody}
        badgeTone="neutral"
      >
        <HubLinkList rows={hubMarketingRows} onOpenRow={onOpenRow} />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.qrTitle}
        icon="qrCodeScanner"
        badge={copy.qrBody}
        badgeTone="neutral"
      >
        <HubLinkList rows={hubQrRows} onOpenRow={onOpenRow} />
      </BusinessPanel>

      <View className="mt-3">
        <VemtapText
          variant="labelMd"
          className="mb-2 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.managementTitle}
        </VemtapText>
        <View className="overflow-hidden rounded-card bg-surface shadow-sm">
          {managementRows.map((item, index) => (
            <View key={item.id}>
              {index > 0 ? <View className="h-px bg-surface-container-low" /> : null}
              <BusinessSettingRow
                title={item.label}
                subtitle={item.meta}
                icon={item.icon as never}
                badge={item.badge}
                trailing="chevron"
                onPress={() => onOpenRow?.(item.id)}
                accessibilityLabel={item.label}
              />
            </View>
          ))}
        </View>
      </View>

      <View className="mt-3 flex-row items-center gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <Icon name="lock" size={13} color={colors.textTertiary} />
        <View className="min-w-0 flex-1">
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {more.buildFootnote}
          </VemtapText>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
            {strings.businessMore.complianceFootnote ?? more.buildFootnote}
          </VemtapText>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}
