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
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessAnalyticsNav,
  BusinessMetricGrid,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  type CustomerSegmentCard,
  growthSubTabIcon,
  growthSubTabs,
} from '@features/business/data/businessGrowthData';

const copy = strings.customerSegments;

const growthTabs = growthSubTabs.map(label => ({
  key: label,
  label,
  icon: growthSubTabIcon[label],
}));

const segmentToneTile: Record<string, string> = {
  brand: 'bg-surface-tint',
  success: 'bg-badge-discount-bg',
  tertiary: 'bg-tertiary-fixed',
  secondary: 'bg-secondary-fixed',
};

const segmentToneIcon: Record<string, string> = {
  brand: colors.primary,
  success: colors.badgeDiscountText,
  tertiary: colors.tertiary,
  secondary: colors.secondary,
};

export interface CustomerSegmentsScreenProps {
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onNewSegment?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onChangeScope?: () => void;
  onOpenSegment?: (segmentId: string) => void;
  onRunSegmentAction?: (segmentId: string) => void;
  onConfigureMatrix?: () => void;
  onOpenProfile?: () => void;
  /** The branch's segments. */
  segments: readonly CustomerSegmentCard[];
  /** Live header figures: customers seen and how many push can reach. */
  metrics?: { footfall: string; reach: string };
  /** Branch the segments belong to. */
  scopeLabel?: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

/**
 * Customer segments: synced footfall and segmentation health, the pre-built
 * smart cohorts with their value figures and per-cohort actions, and the
 * custom-audience filter matrix.
 */
export function CustomerSegmentsScreen({
  onBack,
  onOpenNotifications,
  onNewSegment,
  onOpenSubTab,
  onChangeScope,
  onOpenSegment,
  onRunSegmentAction,
  onConfigureMatrix,
  onOpenProfile,
  segments,
  metrics,
  scopeLabel = copy.scopeLabel,
  isLoading = false,
  error,
  onRetry,
}: CustomerSegmentsScreenProps) {
  const cards = segments;
  const [subTab, setSubTab] = useState(growthSubTabs[0]);

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
            label={copy.newSegmentCta}
            labelVariant="labelMd"
            onPress={onNewSegment}
            leftIcon={<Icon name="plus" size={18} color={colors.surface} />}
          />
          <Button
            label={copy.customMatrixCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={onConfigureMatrix}
          />
        </BusinessActionDock>
      }
    >
      <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
        {copy.headerSubtitle}
      </VemtapText>

      <BusinessAnalyticsNav
        tabs={growthTabs}
        value={subTab}
        onChange={next => {
          setSubTab(next as typeof subTab);
          onOpenSubTab?.(next);
        }}
        className="-mx-6 mt-2"
      />

      <View className="mt-3 flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={scopeLabel}
          onPress={onChangeScope}
          className="min-h-11 min-w-0 flex-1 flex-row items-center gap-2 rounded-field bg-surface px-3 shadow-sm active:bg-surface-subtle"
        >
          <Icon name="store" size={17} color={colors.primary} />
          <VemtapText
            variant="labelSm"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {scopeLabel}
          </VemtapText>
          <Icon name="expandMore" size={18} color={colors.textTertiary} />
        </Pressable>
      </View>

      <BusinessPanel className="mt-3" icon="donutLarge">
        <BusinessMetricGrid
          cells={
            metrics
              ? [
                  {
                    label: copy.live.footfallLabel,
                    value: metrics.footfall,
                    note: copy.footfallUnit,
                    icon: 'group',
                  },
                  {
                    label: copy.live.reachLabel,
                    value: metrics.reach,
                    icon: 'notificationsActive',
                  },
                ]
              : [
                  // Loading or unavailable: labels only, never sample figures.
                  { label: copy.live.footfallLabel, value: '\u2014', icon: 'group' },
                  {
                    label: copy.live.reachLabel,
                    value: '\u2014',
                    icon: 'notificationsActive',
                  },
                ]
          }
          columns={2}
          variant="bare"
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.live.smartTitle}
        icon="autoAwesome"
        badge={copy.live.smartBadge(cards.length)}
        badgeTone="brand"
      >
        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? (
          <ErrorState title={copy.error.title} description={error} onRetry={onRetry} />
        ) : null}
        {!isLoading && !error && cards.length === 0 ? (
          <EmptyState
            icon="group"
            variant="contained"
            title={copy.empty.title}
            description={copy.empty.body}
          />
        ) : null}
        <View className="gap-2">
          {(isLoading || error ? [] : cards).map(segment => (
            <View key={segment.id} className="gap-2 rounded-field bg-surface-subtle p-3">
              <View className="flex-row items-center gap-2.5">
                <View
                  className={`h-9 w-9 shrink-0 items-center justify-center rounded-lg ${segmentToneTile[segment.iconTone]}`}
                >
                  <Icon
                    name={segment.icon}
                    size={18}
                    color={segmentToneIcon[segment.iconTone]}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {segment.name}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {segment.detail}
                  </VemtapText>
                </View>
                <BusinessStatusPill label={segment.badge} tone={segment.badgeTone} />
              </View>

              <View className="flex-row flex-wrap gap-2">
                <View className="min-w-[45%] flex-1 gap-0.5 rounded-field bg-surface p-2.5">
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {copy.sizeLabel}
                  </VemtapText>
                  <View className="flex-row items-baseline gap-1">
                    <VemtapText
                      variant="headingSm"
                      className="font-sans-bold"
                      numberOfLines={1}
                    >
                      {segment.size}
                    </VemtapText>
                    {segment.sizeNote ? (
                      <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                        {segment.sizeNote}
                      </VemtapText>
                    ) : null}
                  </View>
                </View>
                {segment.aov ? (
                  <View className="min-w-[45%] flex-1 gap-0.5 rounded-field bg-surface p-2.5">
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {copy.aovLabel}
                    </VemtapText>
                    <VemtapText
                      variant="headingSm"
                      className="font-sans-bold"
                      numberOfLines={1}
                    >
                      {segment.aov}
                    </VemtapText>
                  </View>
                ) : null}
              </View>

              {segment.generatesNote ? (
                <View
                  className={`flex-row items-center gap-1.5 rounded-field p-2.5 ${
                    segment.trendDown ? 'bg-surface-container' : 'bg-badge-discount-bg'
                  }`}
                >
                  <Icon
                    name={segment.trendDown ? 'trendingDown' : 'trendingUp'}
                    size={15}
                    color={segment.trendDown ? colors.error : colors.badgeDiscountText}
                  />
                  <VemtapText
                    variant="caption"
                    className={
                      segment.trendDown
                        ? 'min-w-0 flex-1 text-text'
                        : 'min-w-0 flex-1 text-badge-discount-text'
                    }
                    numberOfLines={2}
                  >
                    {`${segment.generatesLabel}: ${segment.generatesNote}`}
                  </VemtapText>
                </View>
              ) : (
                <View className="flex-row items-center gap-1.5">
                  <Icon name="info" size={14} color={colors.textTertiary} />
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="min-w-0 flex-1"
                    numberOfLines={2}
                  >
                    {segment.insight}
                  </VemtapText>
                </View>
              )}

              <View className="flex-row gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={segment.cta}
                  onPress={() => onRunSegmentAction?.(segment.id)}
                  className="min-h-9 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-primary px-3 active:scale-95"
                >
                  <VemtapText
                    variant="labelSm"
                    className="min-w-0 flex-1 text-center font-sans-semibold text-surface"
                    numberOfLines={1}
                  >
                    {segment.cta}
                  </VemtapText>
                  <Icon name="forward" size={15} color={colors.surface} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={segment.name}
                  onPress={() => onOpenSegment?.(segment.id)}
                  className="min-h-9 w-10 items-center justify-center rounded-field bg-surface-container active:scale-95"
                >
                  <Icon name="more" size={16} color={colors.text} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-3 flex-row items-start gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <Icon name="verifiedUser" size={14} color={colors.textTertiary} />
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="min-w-0 flex-1"
          numberOfLines={4}
        >
          {copy.privacyNote}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}
