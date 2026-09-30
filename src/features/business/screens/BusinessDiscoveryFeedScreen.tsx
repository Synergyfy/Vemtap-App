import React, { useState } from 'react';
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
import {
  BusinessAnalyticsNav,
  BusinessAnalyticsRow,
  BusinessMetricGrid,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  BusinessRatingStars,
  BusinessSettingRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  discoveryControls,
  discoveryFeedCard,
  discoveryHealthStats,
  discoveryIndexRows,
  discoveryZones,
  qrSubTabIcon,
  qrSubTabs,
} from '@features/business/data/businessGrowthData';

const copy = strings.businessDiscoveryFeed;

const qrTabs = qrSubTabs.map(label => ({ key: label, label, icon: qrSubTabIcon[label] }));

export interface BusinessDiscoveryFeedScreenProps {
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onPreviewConsumerFeed?: () => void;
  onEditFeedCard?: () => void;
  onOpenIndexRow?: (rowId: string) => void;
  onToggleControl?: (controlId: string, value: boolean) => void;
  onOpenZone?: (zoneId: string) => void;
  onBoostFeed?: () => void;
  onOpenProfile?: () => void;
}

/**
 * Business discovery: the feed-health score, reach/radius/category figures, a
 * live simulation of the consumer feed card, the search & catalog index rows,
 * the active discovery zones, and the automation toggles that drive feed
 * ranking.
 */
export function BusinessDiscoveryFeedScreen({
  onBack,
  onOpenNotifications,
  onOpenSubTab,
  onPreviewConsumerFeed,
  onEditFeedCard,
  onOpenIndexRow,
  onToggleControl,
  onOpenZone,
  onBoostFeed,
  onOpenProfile,
}: BusinessDiscoveryFeedScreenProps) {
  const [subTab, setSubTab] = useState(qrSubTabs[3]);
  const [controls, setControls] = useState<Record<string, boolean>>(
    Object.fromEntries(discoveryControls.map(control => [control.id, control.enabled])),
  );

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
          <Button
            label={copy.boostCta}
            labelVariant="labelMd"
            onPress={onBoostFeed}
            leftIcon={<Icon name="rocket" size={18} color={colors.surface} />}
          />
          <Button
            label={copy.editCardCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={onEditFeedCard}
          />
        </BusinessActionDock>
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
      <VemtapText variant="labelMd" className="mt-1 font-sans-semibold" numberOfLines={1}>
        {copy.businessName}
      </VemtapText>

      <BusinessAnalyticsNav
        tabs={qrTabs}
        value={subTab}
        onChange={next => {
          setSubTab(next as typeof subTab);
          onOpenSubTab?.(next);
        }}
        className="-mx-6 mt-3"
      />

      <View className="mt-3 flex-row items-center gap-3 rounded-card bg-surface p-4 shadow-sm">
        <View className="items-center">
          <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-primary">
            <VemtapText variant="headingLg" className="font-sans-bold" numberOfLines={1}>
              {copy.healthValue}
            </VemtapText>
          </View>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.healthUnit}
          </VemtapText>
        </View>
        <View className="min-w-0 flex-1 gap-1.5">
          <View className="flex-row items-center gap-1.5">
            <Icon name="travelExplore" size={18} color={colors.primary} />
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={2}
            >
              {copy.healthTitle}
            </VemtapText>
          </View>
          <BusinessStatusPill label={copy.healthBadge} tone="success" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.previewCta}
            onPress={onPreviewConsumerFeed}
            className="min-h-9 flex-row items-center gap-1 self-start rounded-full bg-surface-tint px-3 active:scale-95"
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.previewCta}
            </VemtapText>
            <Icon name="northEast" size={14} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <BusinessMetricGrid
        cells={discoveryHealthStats.map(stat => ({
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
        className="mt-3"
      />

      <BusinessPanel
        className="mt-3"
        title={copy.feedTitle}
        icon="travelExplore"
        badge={copy.feedSubtitle}
        badgeTone="neutral"
      >
        <View className="gap-2 rounded-card border border-border bg-surface p-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1.5">
              <Icon name={discoveryFeedCard.icon} size={14} color={colors.tertiary} />
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-tertiary"
                numberOfLines={1}
              >
                {discoveryFeedCard.discount}
              </VemtapText>
            </View>
            <BusinessStatusPill label={discoveryFeedCard.distance} tone="neutral" />
          </View>

          <View className="flex-row items-center gap-2.5">
            <BusinessIconWell icon="restaurant" tone="brand" size="lg" />
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1.5">
                <Icon name="favoriteFilled" size={13} color={colors.primary} />
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1 font-sans-semibold"
                  numberOfLines={1}
                >
                  {discoveryFeedCard.name}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {discoveryFeedCard.locality}
              </VemtapText>
              <View className="flex-row items-center gap-1.5">
                <BusinessRatingStars rating={discoveryFeedCard.rating} size={12} />
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {`(${discoveryFeedCard.reviews})`}
                </VemtapText>
              </View>
              <VemtapText
                variant="caption"
                className="font-sans-medium"
                numberOfLines={1}
              >
                {discoveryFeedCard.category}
              </VemtapText>
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {discoveryFeedCard.price}
              </VemtapText>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.editCardCta}
            onPress={onEditFeedCard}
            className="min-h-9 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container active:scale-95"
          >
            <Icon name="tune" size={15} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.editCardCta}
            </VemtapText>
          </Pressable>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.indexTitle}
        icon="manageSearch"
        badge={copy.indexSubtitle}
        badgeTone="neutral"
      >
        <View className="gap-1.5">
          {discoveryIndexRows.map(row => (
            <BusinessAnalyticsRow
              key={row.id}
              title={row.label}
              leading={<BusinessIconWell icon={row.icon} tone="neutral" size="sm" />}
              badge={row.value}
              badgeTone={
                row.value === 'Live' || row.value === 'Synced' ? 'success' : 'brand'
              }
              chevron
              onPress={() => onOpenIndexRow?.(row.id)}
            />
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.zonesTitle}
        icon="locationSchedule"
        badge={copy.zonesBadge}
        badgeTone="brand"
      >
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.zonesSubtitle}
        </VemtapText>
        <View className="flex-row items-center gap-1.5">
          <Icon name="nearMe" size={14} color={colors.primary} />
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.primaryHub}
          </VemtapText>
        </View>
        <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
          {copy.zonesList}
        </VemtapText>
        <View className="gap-1.5">
          {discoveryZones.map(zone => (
            <BusinessAnalyticsRow
              key={zone.id}
              title={zone.label}
              icon="locationSchedule"
              trailing={zone.radius}
              badge={zone.active ? 'Active' : 'Off'}
              badgeTone={zone.active ? 'success' : 'neutral'}
              onPress={() => onOpenZone?.(zone.id)}
            />
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-3">
        <VemtapText
          variant="labelMd"
          className="mb-2 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.controlsTitle}
        </VemtapText>
        <View className="overflow-hidden rounded-card bg-surface shadow-sm">
          {discoveryControls.map((control, index) => (
            <View key={control.id}>
              {index > 0 ? <View className="h-px bg-surface-container-low" /> : null}
              <View className="flex-row items-center gap-3 px-3 py-2.5">
                <BusinessIconWell
                  icon={control.icon}
                  tone={controls[control.id] ? 'brand' : 'neutral'}
                  size="sm"
                />
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="min-w-0 flex-1"
                    numberOfLines={1}
                  >
                    {control.title}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                    {control.body}
                  </VemtapText>
                </View>
                <BusinessSettingRow
                  title={control.title}
                  trailing="switch"
                  switchValue={controls[control.id]}
                  onSwitchChange={(value: boolean) => {
                    setControls(current => ({ ...current, [control.id]: value }));
                    onToggleControl?.(control.id, value);
                  }}
                  className="h-9 w-14 shrink-0 justify-end px-0 py-0"
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
        <BusinessIconWell icon="bolt" tone="brand" />
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            Feed Booster
          </VemtapText>
          <VemtapText variant="caption" className="text-primary" numberOfLines={2}>
            {copy.boostBody}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.boostCta}
          onPress={onBoostFeed}
          className="shrink-0"
        >
          <Icon name="arrowForward" size={20} color={colors.primary} />
        </Pressable>
      </View>
    </BusinessScreenLayout>
  );
}
