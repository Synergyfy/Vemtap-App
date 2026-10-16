import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import {
  SetupCallout,
  SetupSectionCard,
  SetupSectionHeading,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import { BusinessAnalyticsRow } from '@features/business/components/BusinessAnalyticsPrimitives';
import { LoadingState } from '@components/shared/LoadingState';
import { ErrorState } from '@components/shared/ErrorState';
import type { SegmentDetailsView } from '@features/business/utils/segmentMappers';

const copy = strings.campaignWizard.segmentDetails;

const TOTAL_DINERS = 294;
const TOTAL_SPEND = 3_280_000;

function naira(value: number): string {
  return `\u20a6${value.toLocaleString('en-NG')}`;
}

/** The design's sample segment, shown when no live segment is passed. */
const prototypeView: SegmentDetailsView = {
  id: 'returning-customers',
  name: copy.title,
  updated: copy.updated,
  hero: `${TOTAL_DINERS} Diners`,
  badge: copy.badge,
  body: copy.body.replace('{business}', strings.campaignWizard.segmentActions.business),
  tags: copy.tags,
  spend: naira(TOTAL_SPEND),
  spendDelta: copy.spendDelta,
  aov: copy.aovValue,
  aovDelta: copy.aovDelta,
  aovNote: copy.aovNote,
  frequency: copy.frequencyValue,
  frequencyNote: copy.frequencyNote,
  branchesMeta: copy.branchesMeta,
  branches: copy.branches,
  channels: copy.channels,
  privacyTitle: copy.privacyTitle,
  favourites: copy.favorites,
  sampleMeta: copy.sampleMeta,
  patrons: copy.patrons,
};

export interface SegmentAudienceDetailsScreenProps {
  onClose: () => void;
  onUseSegment?: (segmentId: string) => void;
  onEditRules?: () => void;
  onOpenCustomer?: (customerId: string) => void;
  onOpenCrm?: () => void;
  /** The live segment; the design's sample is shown when absent. */
  details?: SegmentDetailsView;
  isLoading?: boolean;
  /** Shown in place of the figures when the segment fails to load. */
  error?: string;
  onRetry?: () => void;
}

/**
 * Segment Audience Details.
 * stitch_vemtap_mobile_app_design/segment_audience_details
 *
 * Full stack page (no scrim/grabber in the source) with a close affordance.
 * Figures derive from the cohort size so the header hero and the panels agree.
 */
export function SegmentAudienceDetailsScreen({
  onClose,
  onUseSegment,
  onEditRules,
  onOpenCustomer,
  onOpenCrm,
  details,
  isLoading = false,
  error,
  onRetry,
}: SegmentAudienceDetailsScreenProps) {
  const view = details ?? prototypeView;
  const ready = !isLoading && !error;
  return (
    <BusinessScreenLayout
      header={{
        title: copy.title,
        onBack: onClose,
        titleVariant: 'headingSm',
        showAvatar: true,
      }}
      contentContainerClassName="gap-4 pb-6"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.cta}
            labelVariant="button"
            size="md"
            accessibilityLabel={copy.cta}
            className="min-h-[52px] rounded-xl"
            leftIcon={<Icon name="bolt" size={18} color={colors.surface} />}
            disabled={!ready}
            onPress={() => onUseSegment?.(view.id)}
          />
          <TextActionButton
            label={copy.editCta}
            icon="tune"
            tone="secondary"
            onPress={onEditRules}
          />
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center justify-between gap-2 rounded-xl bg-surface-tint px-3 py-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="verified" size={14} color={colors.primary} />
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.sync}
          </VemtapText>
        </View>
        <VemtapText variant="micro" className="shrink-0 text-primary" numberOfLines={1}>
          {view.updated}
        </VemtapText>
      </View>

      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? <ErrorState description={error} onRetry={onRetry} /> : null}
      {ready ? (
        <>
          <View className="gap-2">
            <VemtapText
              variant="labelSm"
              className="uppercase tracking-wider text-text-secondary"
              numberOfLines={1}
            >
              {copy.eyebrow}
            </VemtapText>
            <View className="flex-row flex-wrap items-center gap-2">
              <VemtapText
                variant="displayMobile"
                className="font-sans-bold"
                numberOfLines={1}
              >
                {view.hero}
              </VemtapText>
              <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold text-badge-discount-text"
                  numberOfLines={1}
                >
                  {view.badge}
                </VemtapText>
              </View>
            </View>
            <VemtapText variant="bodyMd" tone="secondary">
              {view.body}
            </VemtapText>
            <View className="flex-row flex-wrap gap-1.5">
              {view.tags.map(tag => (
                <View key={tag} className="rounded-full bg-surface-container px-2 py-0.5">
                  <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                    {tag}
                  </VemtapText>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <SetupSectionHeading title={copy.valueTitle} className="min-w-0 flex-1" />
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.valueMeta}
              </VemtapText>
            </View>
            <SetupSectionCard tone="container" className="gap-2 p-4">
              <View className="flex-row items-end justify-between gap-2">
                <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                  {copy.spendLabel}
                </VemtapText>
                <VemtapText
                  variant="micro"
                  className="shrink-0 text-success"
                  numberOfLines={1}
                >
                  {view.spendDelta ?? ''}
                </VemtapText>
              </View>
              <VemtapText
                variant="headingLg"
                className="font-sans-bold"
                numberOfLines={1}
              >
                {view.spend}
              </VemtapText>
              <VemtapText variant="micro" tone="tertiary">
                {copy.spendCaption}
              </VemtapText>
            </SetupSectionCard>
            <View className="flex-row gap-2">
              <View className="min-w-0 flex-1 gap-1 rounded-card bg-surface-container-lowest p-3 shadow-sm">
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {copy.aovLabel}
                </VemtapText>
                <VemtapText
                  variant="headingMd"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {view.aov}
                </VemtapText>
                <View className="flex-row items-center gap-1">
                  <VemtapText variant="micro" className="text-success" numberOfLines={1}>
                    {view.aovDelta ?? ''}
                  </VemtapText>
                  <VemtapText
                    variant="micro"
                    tone="tertiary"
                    className="min-w-0 flex-1"
                    numberOfLines={1}
                  >
                    {view.aovNote ?? ''}
                  </VemtapText>
                </View>
              </View>
              <View className="min-w-0 flex-1 gap-1 rounded-card bg-surface-container-lowest p-3 shadow-sm">
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {copy.frequencyLabel}
                </VemtapText>
                <VemtapText
                  variant="headingMd"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {view.frequency}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {view.frequencyNote}
                </VemtapText>
              </View>
            </View>
            <SetupSectionCard tone="lowest" className="gap-2.5 p-4 shadow-sm">
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {copy.branchesTitle}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {view.branchesMeta}
                </VemtapText>
              </View>
              <View className="h-3 w-full flex-row gap-0.5 overflow-hidden rounded-full">
                {view.branches.map((branch, index) => (
                  <View
                    key={branch.id}
                    className={
                      index === 0 ? 'h-full bg-primary' : 'h-full bg-secondary-fixed'
                    }
                    style={{ width: `${branch.percent}%` }}
                  />
                ))}
              </View>
              <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
                {view.branches.map((branch, index) => (
                  <View key={branch.id} className="flex-row items-center gap-1">
                    <View
                      className={
                        index === 0
                          ? 'h-1.5 w-1.5 rounded-full bg-primary'
                          : 'h-1.5 w-1.5 rounded-full bg-secondary-fixed'
                      }
                    />
                    <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                      {branch.label}
                    </VemtapText>
                  </View>
                ))}
              </View>
            </SetupSectionCard>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <SetupSectionHeading title={copy.reachTitle} className="min-w-0 flex-1" />
              <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
                <Icon name="shield" size={12} color={colors.badgeDiscountText} />
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold text-badge-discount-text"
                  numberOfLines={1}
                >
                  {copy.reachBadge}
                </VemtapText>
              </View>
            </View>
            <SetupSectionCard tone="lowest" className="gap-3 p-4 shadow-sm">
              {view.channels.map(channel => (
                <View key={channel.id} className="gap-1.5">
                  <View className="flex-row items-center gap-2">
                    <Icon name={channel.icon} size={15} color={colors.primary} />
                    <VemtapText
                      variant="caption"
                      className="min-w-0 flex-1"
                      numberOfLines={1}
                    >
                      {channel.label}
                    </VemtapText>
                    <VemtapText
                      variant="labelSm"
                      className="shrink-0 font-sans-semibold"
                      numberOfLines={1}
                    >
                      {channel.value}
                    </VemtapText>
                  </View>
                  <View className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                    <View
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${channel.percent}%` }}
                    />
                  </View>
                </View>
              ))}
              {view.privacyTitle ? (
                <View className="flex-row items-start gap-2.5 rounded-lg bg-surface-subtle p-3">
                  <Icon name="lock" size={15} color={colors.textSecondary} />
                  <View className="min-w-0 flex-1 gap-0.5">
                    <VemtapText
                      variant="caption"
                      className="font-sans-semibold"
                      numberOfLines={2}
                    >
                      {view.privacyTitle}
                    </VemtapText>
                    <VemtapText variant="micro" tone="secondary">
                      {copy.privacyBody}
                    </VemtapText>
                  </View>
                </View>
              ) : null}
            </SetupSectionCard>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <SetupSectionHeading
                title={copy.favoritesTitle}
                className="min-w-0 flex-1"
              />
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.favoritesMeta}
              </VemtapText>
            </View>
            {view.favourites.map(item => (
              <BusinessAnalyticsRow
                key={item.id}
                title={item.name}
                subtitle={item.meta}
                icon="restaurant"
                trailing={`${item.count} ${copy.ordersUnit}`}
                trailingTone="brand"
              />
            ))}
          </View>

          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <SetupSectionHeading title={copy.sampleTitle} className="min-w-0 flex-1" />
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {view.sampleMeta}
              </VemtapText>
            </View>
            <SetupSectionCard
              tone="lowest"
              className="gap-0 overflow-hidden p-0 shadow-sm"
            >
              {view.patrons.map(patron => (
                <BusinessAnalyticsRow
                  key={patron.id}
                  title={patron.name}
                  subtitle={patron.meta}
                  badge={patron.tier}
                  chevron
                  leading={
                    <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed">
                      <VemtapText
                        variant="labelMd"
                        className="font-sans-bold text-primary"
                        numberOfLines={1}
                      >
                        {patron.initials}
                      </VemtapText>
                    </View>
                  }
                  onPress={() => onOpenCustomer?.(patron.id)}
                />
              ))}
            </SetupSectionCard>
            <TextActionButton
              label={copy.crmCta}
              icon="openInNew"
              tone="brand"
              onPress={onOpenCrm}
            />
          </View>

          <SetupCallout
            icon="insights"
            title={copy.roiTitle}
            body={copy.roiBody}
            tone="subtle"
            bodyVariant="caption"
          />
        </>
      ) : null}
    </BusinessScreenLayout>
  );
}
