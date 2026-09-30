import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionTile,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessAnalyticsNav,
  BusinessMetricGrid,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessQrFrame } from '@features/business/components/BusinessPosPrimitives';
import {
  businessQrIdentity,
  businessQrRouting,
  businessQrScanStats,
  qrSubTabIcon,
  qrSubTabs,
} from '@features/business/data/businessGrowthData';

const copy = strings.businessQr;

const qrTabs = qrSubTabs.map(label => ({ key: label, label, icon: qrSubTabIcon[label] }));

export interface BusinessQrScreenProps {
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onShare?: () => void;
  onDownloadKit?: () => void;
  onOrderStandee?: () => void;
  onSendToSocials?: () => void;
  onCopyCode?: (value: string) => void;
  onSelectRouting?: (routingId: string) => void;
  onCustomizeStandee?: () => void;
  onOpenLocationQrs?: () => void;
  onOpenProfile?: () => void;
}

/**
 * Business Master QR: the scannable storefront anchor with its shortcode, the
 * 30-day scan impact figures, where scans should route, and the physical
 * collateral (acrylic standee, download kit, socials) that carries it.
 */
export function BusinessQrScreen({
  onBack,
  onOpenNotifications,
  onOpenSubTab,
  onShare,
  onDownloadKit,
  onOrderStandee,
  onSendToSocials,
  onCopyCode,
  onSelectRouting,
  onCustomizeStandee,
  onOpenLocationQrs,
  onOpenProfile,
}: BusinessQrScreenProps) {
  const [subTab, setSubTab] = useState(qrSubTabs[1]);
  const [routing, setRouting] = useState(businessQrRouting[0].id);

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
        <View className="gap-2">
          <Button
            label={copy.shareCta}
            labelVariant="labelMd"
            onPress={onShare}
            leftIcon={<Icon name="share" size={18} color={colors.surface} />}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.locationQrsLink}
            onPress={onOpenLocationQrs}
            className="min-h-10 flex-row items-center justify-center gap-1.5"
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.locationQrsLink}
            </VemtapText>
            <Icon name="forward" size={15} color={colors.primary} />
          </Pressable>
        </View>
      }
    >
      <View className="flex-row flex-wrap items-center gap-1.5">
        <BusinessStatusPill label={copy.statusBadge} tone="success" />
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1"
          numberOfLines={1}
        >
          {copy.statusSub}
        </VemtapText>
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

      <BusinessPanel className="mt-3" icon="restaurant" title={copy.presenceLabel}>
        <View className="items-center">
          <BusinessQrFrame
            size="lg"
            glyph="qrCodeScanner"
            label={businessQrIdentity.brand}
            caption={businessQrIdentity.shortcode}
            className="w-full"
          />
        </View>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Icon name="verified" size={14} color={colors.badgeDiscountText} />
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 text-badge-discount-text"
            numberOfLines={1}
          >
            {copy.presenceLabel}
          </VemtapText>
        </View>

        <View className="mt-1 gap-1.5">
          <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-2.5">
            <View className="min-w-0 flex-1">
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.shortcodeLabel}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {businessQrIdentity.shortcode}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.shortcodeLabel}
              onPress={() => onCopyCode?.(businessQrIdentity.shortcode)}
              className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high active:scale-95"
            >
              <Icon name="copy" size={17} color={colors.text} />
            </Pressable>
          </View>
          <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-2.5">
            <View className="min-w-0 flex-1">
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.codeLabel}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {businessQrIdentity.code}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.codeLabel}
              onPress={() => onCopyCode?.(businessQrIdentity.code)}
              className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high active:scale-95"
            >
              <Icon name="copy" size={17} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <VemtapText
          variant="caption"
          tone="secondary"
          className="mt-1 leading-relaxed"
          numberOfLines={3}
        >
          {copy.scanToLabel}
        </VemtapText>
      </BusinessPanel>

      <View className="mt-3 flex-row gap-2">
        <View className="min-w-0 flex-1">
          <BusinessActionTile
            size="stacked"
            label={copy.downloadKitCta}
            hint={copy.downloadKitSub}
            icon="download"
            onPress={onDownloadKit}
          />
        </View>
        <View className="min-w-0 flex-1">
          <BusinessActionTile
            size="stacked"
            label={copy.standeeCta}
            hint={copy.standeeSub}
            icon="printReceipt"
            onPress={onOrderStandee}
          />
        </View>
        <View className="min-w-0 flex-1">
          <BusinessActionTile
            size="stacked"
            label={copy.socialsCta}
            hint={copy.socialsSub}
            icon="share"
            onPress={onSendToSocials}
          />
        </View>
      </View>
      <View className="mt-1 flex-row items-center gap-1.5">
        <Icon name="schedule" size={13} color={colors.textTertiary} />
        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
          {copy.downloadKitEta}
        </VemtapText>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.insightsTitle}
        icon="insights"
        badge={copy.insightsSubtitle}
        badgeTone="brand"
      >
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.impactTitle}
          </VemtapText>
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="shrink-0"
            numberOfLines={1}
          >
            {copy.impactSubtitle}
          </VemtapText>
        </View>
        <BusinessMetricGrid
          cells={businessQrScanStats.map(stat => ({
            label: stat.label,
            value: stat.value,
            note: stat.delta,
            noteIcon: stat.delta.startsWith('+') ? 'trendingUp' : undefined,
            noteTone: stat.delta.startsWith('+')
              ? ('success' as const)
              : ('default' as const),
            icon: stat.icon,
          }))}
          columns={3}
          variant="bare"
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.routingTitle}
        icon="altRoute"
        badge={copy.routingSubtitle}
        badgeTone="neutral"
      >
        <View className="gap-2">
          {businessQrRouting.map(option => {
            const active = option.id === routing;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option.title}
                onPress={() => {
                  setRouting(option.id);
                  onSelectRouting?.(option.id);
                }}
                className={`gap-1.5 rounded-field p-3 active:scale-[0.99] ${
                  active ? 'bg-surface-tint' : 'bg-surface-subtle'
                }`}
              >
                <View className="flex-row items-center gap-2.5">
                  <View
                    className={`h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      active ? 'bg-surface' : 'bg-surface-container-high'
                    }`}
                  >
                    <Icon
                      name={option.icon}
                      size={18}
                      color={active ? colors.primary : colors.text}
                    />
                  </View>
                  <VemtapText
                    variant="labelMd"
                    className={`min-w-0 flex-1 font-sans-semibold ${active ? 'text-primary' : ''}`}
                    numberOfLines={2}
                  >
                    {option.title}
                  </VemtapText>
                  {option.badge ? (
                    <BusinessStatusPill
                      label={option.badge}
                      tone={option.badge === copy.routingTitle ? 'neutral' : 'success'}
                    />
                  ) : null}
                  <View className="shrink-0">
                    <Icon
                      name={active ? 'checkCircle' : 'checkBold'}
                      size={18}
                      color={active ? colors.primary : colors.outline}
                    />
                  </View>
                </View>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="leading-relaxed"
                  numberOfLines={3}
                >
                  {option.body}
                </VemtapText>
              </Pressable>
            );
          })}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.collateralTitle}
        icon="layers"
        badge={copy.collateralSubtitle}
        badgeTone="neutral"
      >
        <View className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-3">
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
            <Icon name="contactlessPay" size={18} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="micro"
              className="font-sans-bold uppercase tracking-wider text-primary"
              numberOfLines={1}
            >
              {copy.tapOrScanLabel}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.acrylicTitle}
            </VemtapText>
          </View>
        </View>
        <VemtapText
          variant="caption"
          tone="secondary"
          className="leading-relaxed"
          numberOfLines={3}
        >
          {copy.acrylicBody}
        </VemtapText>
        <BusinessStatusPill label={copy.acrylicBadge} tone="success" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.customizeCta}
          onPress={onCustomizeStandee}
          className="min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container active:scale-95"
        >
          <Icon name="palette" size={16} color={colors.text} />
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.customizeCta}
          </VemtapText>
        </Pressable>
      </BusinessPanel>

      <View className="mt-3 flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-3">
        <Icon name="qrCodeScanner" size={17} color={colors.primary} />
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {copy.locationQrsCta}
        </VemtapText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.locationQrsLink}
          onPress={onOpenLocationQrs}
          className="shrink-0"
        >
          <Icon name="forward" size={18} color={colors.primary} />
        </Pressable>
      </View>
    </BusinessScreenLayout>
  );
}
