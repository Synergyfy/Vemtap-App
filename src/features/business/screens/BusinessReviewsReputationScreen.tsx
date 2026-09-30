import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { EmptyState } from '@components/shared/EmptyState';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessIconWell,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessInitialsAvatar,
  BusinessRatingStars,
} from '@features/business/components/BusinessPosPrimitives';
import {
  businessReviews,
  reviewDistribution,
  reviewTierTone,
  reviewTrendingIcons,
  type BusinessReview,
} from '@features/business/data/businessTrustSettingsData';

const copy = strings.businessReviewsReputation;

/** Bar width for the star distribution; keeps the numeric style off the JSX. */
const barWidth = (percent: number) => ({ width: `${percent}%` as const });

export interface BusinessReviewsReputationScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onApplyFilter?: (filterId: string) => void;
  onReply?: (review: BusinessReview) => void;
  onSendThankYouPerk?: (reviewId: string) => void;
  onExport?: () => void;
  onConfigureRequests?: () => void;
}

/**
 * Reviews & reputation: aggregate score and star distribution, trending
 * attributes, filterable review feed with merchant replies, plus the automated
 * review-request and CSV export actions.
 */
export function BusinessReviewsReputationScreen({
  onBack,
  onOpenProfile,
  onApplyFilter,
  onReply,
  onSendThankYouPerk,
  onExport,
  onConfigureRequests,
}: BusinessReviewsReputationScreenProps) {
  const [filter, setFilter] = useState('all');
  const [replied, setReplied] = useState<string[]>([]);

  const visible = businessReviews.filter(review => {
    if (filter === 'unreplied') return !review.replied && !replied.includes(review.id);
    if (filter === 'fiveStar') return review.rating === 5;
    if (filter === 'photos') return review.hasPhoto;
    if (filter === 'negative') return review.rating <= 3;
    return true;
  });

  const filters = [
    { id: 'all', label: copy.filters.all, count: copy.filterCounts.all },
    {
      id: 'unreplied',
      label: copy.filters.unreplied,
      count: copy.filterCounts.unreplied,
    },
    { id: 'fiveStar', label: copy.filters.fiveStar, count: copy.filterCounts.fiveStar },
    { id: 'photos', label: copy.filters.photos, count: copy.filterCounts.photos },
    { id: 'negative', label: copy.filters.negative, count: copy.filterCounts.negative },
  ];

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.exportCta}
            onPress={onExport}
            className="min-h-10 flex-row items-center justify-center gap-1.5"
          >
            <Icon name="download" size={17} color={colors.primary} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.exportCta}
            </VemtapText>
          </Pressable>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-end gap-4 rounded-card bg-surface p-4 shadow-sm">
        <View className="items-center">
          <VemtapText variant="headingLg" className="font-sans-bold" numberOfLines={1}>
            {copy.scoreLabel}
          </VemtapText>
          <BusinessRatingStars
            rating={5}
            size={14}
            accessibilityLabel={copy.scoreLabel}
          />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
            {copy.reviewsBased}
          </VemtapText>
          <BusinessStatusPill label={copy.positiveBadge} tone="success" />
        </View>
      </View>

      <View className="mt-3 gap-2 rounded-card bg-surface p-4 shadow-sm">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.distributionTitle}
        </VemtapText>
        {reviewDistribution.map(row => (
          <View key={row.stars} className="flex-row items-center gap-2">
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="w-8 shrink-0"
              numberOfLines={1}
            >
              {`${row.stars}★`}
            </VemtapText>
            <View className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-container-high">
              <View
                className="h-full rounded-full bg-primary"
                style={barWidth(row.percent)}
              />
            </View>
            <VemtapText
              variant="micro"
              tone="secondary"
              className="w-9 shrink-0 text-right"
              numberOfLines={1}
            >
              {`${row.percent}%`}
            </VemtapText>
          </View>
        ))}
      </View>

      <View className="mt-3 flex-row flex-wrap items-center gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
          {copy.trendingTitle}
        </VemtapText>
        {copy.trending.map((label, index) => (
          <View
            key={label}
            className="flex-row items-center gap-1 rounded-full bg-surface px-2.5 py-1"
          >
            <Icon
              name={reviewTrendingIcons[index]}
              size={13}
              color={index === 0 ? colors.tertiary : colors.textTertiary}
            />
            <VemtapText variant="micro" className="font-sans-medium" numberOfLines={1}>
              {label}
            </VemtapText>
          </View>
        ))}
      </View>

      <BusinessChipScroller className="mt-3">
        {filters.map(item => (
          <BusinessCountChip
            key={item.id}
            label={item.label}
            count={item.count}
            selected={item.id === filter}
            onPress={() => {
              setFilter(item.id);
              onApplyFilter?.(item.id);
            }}
          />
        ))}
      </BusinessChipScroller>

      <View className="mt-3 gap-2">
        {visible.map(review => {
          const merchantReply =
            review.replied ??
            (replied.includes(review.id)
              ? { label: copy.youReplied, time: 'Just now', body: '' }
              : undefined);
          return (
            <View key={review.id} className="gap-2 rounded-card bg-surface p-3 shadow-sm">
              <View className="flex-row items-center gap-2.5">
                <BusinessInitialsAvatar
                  initials={review.initials}
                  size="sm"
                  tone={
                    reviewTierTone[
                      businessReviews.indexOf(review) % reviewTierTone.length
                    ]
                  }
                />
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {review.name}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {`${review.tier} • ${review.time}`}
                  </VemtapText>
                </View>
                <BusinessRatingStars
                  rating={review.rating}
                  size={13}
                  accessibilityLabel={review.name}
                />
              </View>

              <View className="flex-row items-center gap-1.5">
                <Icon name="storefront" size={13} color={colors.textTertiary} />
                <VemtapText
                  variant="caption"
                  tone="tertiary"
                  className="min-w-0 flex-1"
                  numberOfLines={1}
                >
                  {`${review.branch} • ${review.items}`}
                </VemtapText>
              </View>

              <VemtapText variant="bodyMd" className="leading-relaxed" numberOfLines={4}>
                {review.body}
              </VemtapText>

              <View className="flex-row flex-wrap items-center gap-2">
                {review.hasPhoto ? (
                  <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-0.5">
                    <Icon name="photoLibrary" size={12} color={colors.textSecondary} />
                    <VemtapText
                      variant="micro"
                      className="text-text-secondary"
                      numberOfLines={1}
                    >
                      {copy.verifiedItem}
                    </VemtapText>
                  </View>
                ) : null}
                <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-0.5">
                  <Icon name="thumbUp" size={12} color={colors.textSecondary} />
                  <VemtapText
                    variant="micro"
                    className="text-text-secondary"
                    numberOfLines={1}
                  >
                    {copy.helpfulLabel.replace('{count}', String(review.helpful))}
                  </VemtapText>
                </View>
              </View>

              {merchantReply ? (
                <View className="gap-1 rounded-field bg-surface-tint p-2.5">
                  <View className="flex-row items-center gap-1.5">
                    <Icon name="replyArrow" size={13} color={colors.primary} />
                    <VemtapText
                      variant="micro"
                      className="font-sans-bold text-primary"
                      numberOfLines={1}
                    >
                      {merchantReply.label}
                    </VemtapText>
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {merchantReply.time}
                    </VemtapText>
                  </View>
                  {merchantReply.body ? (
                    <VemtapText
                      variant="caption"
                      className="text-primary"
                      numberOfLines={2}
                    >
                      {merchantReply.body}
                    </VemtapText>
                  ) : null}
                </View>
              ) : (
                <View className="flex-row items-center gap-1.5">
                  <Icon name="rateReview" size={14} color={colors.tertiary} />
                  <VemtapText
                    variant="micro"
                    className="font-sans-bold text-tertiary"
                    numberOfLines={1}
                  >
                    {copy.needsReply}
                  </VemtapText>
                </View>
              )}

              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.replyTo.replace('{name}', review.name)}
                  onPress={() => {
                    setReplied(ids =>
                      ids.includes(review.id) ? ids : [...ids, review.id],
                    );
                    onReply?.(review);
                  }}
                  className="min-h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-primary px-3 active:scale-95"
                >
                  <Icon name="replyArrow" size={15} color={colors.surface} />
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-surface"
                    numberOfLines={1}
                  >
                    {copy.replyCta}
                  </VemtapText>
                </Pressable>
                {review.rating === 5 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.thankYouPerk}
                    onPress={() => onSendThankYouPerk?.(review.id)}
                    className="min-h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container px-3 active:scale-95"
                  >
                    <Icon name="redeem" size={15} color={colors.text} />
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold text-text"
                      numberOfLines={1}
                    >
                      {copy.thankYouPerk}
                    </VemtapText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {visible.length === 0 ? (
        <EmptyState
          icon="rateReview"
          variant="contained"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.autoRequestTitle}
        onPress={onConfigureRequests}
        className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
      >
        <BusinessIconWell icon="markEmailRead" tone="brand" size="md" />
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.autoRequestTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
            {copy.autoRequestBody}
          </VemtapText>
        </View>
        <View className="shrink-0">
          <Icon name="forward" size={18} color={colors.textTertiary} />
        </View>
      </Pressable>
    </BusinessScreenLayout>
  );
}
