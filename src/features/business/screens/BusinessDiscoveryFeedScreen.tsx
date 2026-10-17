import React, { useState } from 'react';
import { ErrorState, LoadingState } from '@components/shared';
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
import { qrSubTabIcon, qrSubTabs } from '@features/business/data/businessGrowthData';
import type { DiscoveryView } from '@features/business/utils/networkMappers';

const copy = strings.businessDiscoveryFeed;

const qrTabs = qrSubTabs.map(label => ({ key: label, label, icon: qrSubTabIcon[label] }));

export interface BusinessDiscoveryFeedScreenProps {
  view?: DiscoveryView;
  isError?: boolean;
  onRetry?: () => void;
  /** Only the owner may change discovery settings. */
  canEditControls?: boolean;
  notice?: string | null;
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onPreviewConsumerFeed?: () => void;
  onEditFeedCard?: () => void;
  onOpenIndexRow?: (rowId: string) => void;
  onToggleControl?: (
    controlId: DiscoveryView['controls'][number]['id'],
    value: boolean,
  ) => void;
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
  view,
  isError,
  onRetry,
  canEditControls = true,
  notice,
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
      {view ? (
        <>
          <View className="flex-row flex-wrap items-center gap-1.5">
            <BusinessStatusPill
              label={view.live ? copy.liveBadge : copy.hiddenBadge}
              tone={view.live ? 'success' : 'neutral'}
            />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {view.statusSub}
            </VemtapText>
          </View>
          <VemtapText
            variant="labelMd"
            className="mt-1 font-sans-semibold"
            numberOfLines={1}
          >
            {view.businessName}
          </VemtapText>
        </>
      ) : null}

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
          <View className="mt-3 flex-row items-center gap-3 rounded-card bg-surface p-4 shadow-sm">
            <View className="items-center">
              <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-primary">
                <VemtapText
                  variant="headingLg"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {view.health.score}
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
              <BusinessStatusPill
                label={view.health.badge}
                tone={Number(view.health.score) >= 80 ? 'success' : 'warning'}
              />
              {view.health.missing.length ? (
                <VemtapText variant="micro" tone="tertiary" numberOfLines={3}>
                  {copy.healthMissing(view.health.missing.join(', '))}
                </VemtapText>
              ) : null}
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
            cells={view.stats.map(stat => ({
              label: stat.label,
              value: stat.value,
              note: stat.note,
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
                  <Icon name="fire" size={14} color={colors.tertiary} />
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-tertiary"
                    numberOfLines={1}
                  >
                    {view.card.deal ?? copy.noDeal}
                  </VemtapText>
                </View>
                {view.card.dealName ? (
                  <VemtapText
                    variant="micro"
                    tone="tertiary"
                    className="min-w-0 flex-1 text-right"
                    numberOfLines={1}
                  >
                    {view.card.dealName}
                  </VemtapText>
                ) : null}
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
                      {view.card.name}
                    </VemtapText>
                  </View>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {view.card.locality}
                  </VemtapText>
                  {view.card.rating != null ? (
                    <View className="flex-row items-center gap-1.5">
                      <BusinessRatingStars rating={view.card.rating} size={12} />
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                        {`(${view.card.reviews})`}
                      </VemtapText>
                    </View>
                  ) : null}
                  <VemtapText
                    variant="caption"
                    className="font-sans-medium"
                    numberOfLines={1}
                  >
                    {view.card.category}
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
              {view.index.map(row => (
                <BusinessAnalyticsRow
                  key={row.id}
                  title={row.label}
                  leading={<BusinessIconWell icon={row.icon} tone="neutral" size="sm" />}
                  badge={row.value}
                  badgeTone={row.value === copy.indexRows.missing ? 'warning' : 'success'}
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
            badge={copy.zonesBadge(view.zones.filter(zone => zone.active).length)}
            badgeTone="brand"
          >
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {copy.zonesSubtitle}
            </VemtapText>
            <View className="gap-1.5">
              {view.zones.map(zone => (
                <BusinessAnalyticsRow
                  key={zone.id}
                  title={zone.label}
                  icon="locationSchedule"
                  trailing={zone.area || undefined}
                  badge={zone.active ? copy.liveBadge : copy.zoneHidden}
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
              {view.controls.map((control, index) => (
                <View key={control.id}>
                  {index > 0 ? <View className="h-px bg-surface-container-low" /> : null}
                  <View className="flex-row items-center gap-3 px-3 py-2.5">
                    <BusinessIconWell
                      icon={control.icon}
                      tone={control.enabled ? 'brand' : 'neutral'}
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
                      switchValue={control.enabled}
                      onSwitchChange={
                        canEditControls
                          ? (value: boolean) => onToggleControl?.(control.id, value)
                          : undefined
                      }
                      className="h-9 w-14 shrink-0 justify-end px-0 py-0"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {!canEditControls ? (
            <VemtapText variant="micro" tone="tertiary" className="mt-1">
              {copy.controlsOwnerOnly}
            </VemtapText>
          ) : null}
          {notice ? (
            <VemtapText variant="caption" className="mt-1 text-error">
              {notice}
            </VemtapText>
          ) : null}
        </>
      )}

      <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
        <BusinessIconWell icon="bolt" tone="brand" />
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.boostCta}
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
