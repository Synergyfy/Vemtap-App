import { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { AppModal } from '@components/ui/Modal';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState, LoadingState } from '@components/shared';
import { colors } from '@theme/colors';
import {
  BusinessActionTile,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessInitialsAvatar,
  BusinessRatingStars,
} from '@features/business/components/BusinessPosPrimitives';
import type { ReviewModerationAction } from '@features/business/hooks/useBusinessReviews';
import type {
  ReviewCardView,
  ReviewFilterKey,
  ReviewSource,
  ReviewsReputationView,
} from '@features/business/utils/reviewMappers';

const copy = strings.businessReviewsReputation;

/** Bar width for the star distribution; keeps the numeric style off the JSX. */
const barWidth = (percent: number) => ({ width: `${percent}%` as const });

export interface BusinessReviewsReputationScreenProps {
  /** Live reviews + score; while undefined the screen shows loading or the error. */
  view?: ReviewsReputationView;
  /**
   * The moderation filter is owned by the route, because it is the query: the
   * chip has to ask the server for the pending queue, not filter what it has.
   */
  filter: ReviewFilterKey;
  onChangeFilter: (filter: ReviewFilterKey) => void;
  /** Deal reviews or product comments; the toggle hides without `onChangeSource`. */
  sources?: { key: ReviewSource; label: string }[];
  source?: ReviewSource;
  onChangeSource?: (source: ReviewSource) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  onModerate?: (reviewId: string, action: ReviewModerationAction) => void;
  /** Post or replace (`text`) or remove (`null`) the reply on a review. */
  onReply?: (reviewId: string, text: string | null) => void;
  isReplying?: boolean;
  replyError?: string | null;
}

/**
 * Reviews & reputation: the business's average and star distribution, and its
 * reviews as a moderation queue — the one thing the API actually lets a
 * merchant do with them is approve, reject or delete.
 *
 * The screen renders whatever `view` says; every figure (score, bars, counts,
 * status) is computed in `reviewMappers` from the two live endpoints.
 */
export function BusinessReviewsReputationScreen({
  view,
  filter,
  onChangeFilter,
  sources,
  source,
  onChangeSource,
  isLoading,
  isError,
  onRetry,
  onBack,
  onModerate,
  onReply,
  isReplying = false,
  replyError,
}: BusinessReviewsReputationScreenProps) {
  const [replying, setReplying] = useState<ReviewCardView | null>(null);
  const [draft, setDraft] = useState('');
  const wasReplying = useRef(false);

  // Close the composer once a save finishes without an error.
  useEffect(() => {
    if (wasReplying.current && !isReplying && !replyError) setReplying(null);
    wasReplying.current = isReplying;
  }, [isReplying, replyError]);

  const openReply = (review: ReviewCardView) => {
    setDraft(review.reply ?? '');
    setReplying(review);
  };

  const confirmDelete = (review: ReviewCardView) => {
    Alert.alert(
      view?.deleteTitle ?? copy.deleteTitle,
      view?.deleteBody ?? copy.deleteBody,
      [
        { text: copy.cancel, style: 'cancel' },
        {
          text: copy.deleteConfirm,
          style: 'destructive',
          onPress: () => onModerate?.(review.id, 'delete'),
        },
      ],
    );
  };

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
      }}
      contentContainerClassName="pb-8"
    >
      {sources && onChangeSource ? (
        <BusinessChipScroller className="mb-3">
          {sources.map(item => (
            <BusinessCountChip
              key={item.key}
              label={item.label}
              selected={item.key === source}
              onPress={() => onChangeSource(item.key)}
            />
          ))}
        </BusinessChipScroller>
      ) : null}
      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <>
          <View className="flex-row items-end gap-4 rounded-card bg-surface p-4 shadow-sm">
            <View className="items-center">
              <VemtapText
                variant="headingLg"
                className="font-sans-bold"
                numberOfLines={1}
              >
                {view.score}
              </VemtapText>
              <BusinessRatingStars
                rating={view.stars}
                size={14}
                accessibilityLabel={view.score}
              />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                {view.totalLabel}
              </VemtapText>
              {view.pendingLabel ? (
                <BusinessStatusPill label={view.pendingLabel} tone="warning" />
              ) : (
                <BusinessStatusPill label={view.settledLabel} tone="success" />
              )}
            </View>
          </View>

          <View className="mt-3 gap-2 rounded-card bg-surface p-4 shadow-sm">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.distributionTitle}
            </VemtapText>
            {view.distribution.map(row => (
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

          <BusinessChipScroller className="mt-3">
            {view.filters.map(item => (
              <BusinessCountChip
                key={item.key}
                label={item.label}
                selected={item.key === filter}
                onPress={() => onChangeFilter(item.key)}
              />
            ))}
          </BusinessChipScroller>

          <BusinessPanel
            className="mt-3"
            title={view.moderationTitle}
            subtitle={view.moderationSubtitle}
            icon="shield"
          >
            {view.reviews.length ? (
              <View className="gap-2">
                {view.reviews.map(review => (
                  <View
                    key={review.id}
                    className="gap-2 rounded-field bg-surface-subtle p-3"
                  >
                    <View className="flex-row items-center gap-2.5">
                      <BusinessInitialsAvatar
                        initials={review.initials}
                        size="sm"
                        tone="brand"
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
                          {`${review.offerName} • ${review.time}`}
                        </VemtapText>
                      </View>
                      <BusinessRatingStars
                        rating={review.rating ?? 0}
                        size={13}
                        accessibilityLabel={review.name}
                      />
                    </View>

                    {review.body ? (
                      <VemtapText
                        variant="bodyMd"
                        className="leading-relaxed"
                        numberOfLines={4}
                      >
                        {review.body}
                      </VemtapText>
                    ) : null}

                    {review.likes !== null || review.statusPill ? (
                      <View className="flex-row items-center gap-1.5">
                        {review.likes !== null ? (
                          <>
                            <Icon name="thumbUp" size={12} color={colors.textSecondary} />
                            <VemtapText
                              variant="micro"
                              className="text-text-secondary"
                              numberOfLines={1}
                            >
                              {copy.likesLabel(review.likes)}
                            </VemtapText>
                          </>
                        ) : null}
                        <View className="min-w-0 flex-1" />
                        {review.statusPill ? (
                          <BusinessStatusPill
                            label={review.statusPill.label}
                            tone={review.statusPill.tone}
                          />
                        ) : null}
                      </View>
                    ) : null}

                    {review.reply ? (
                      <View className="gap-0.5 rounded-field bg-surface-subtle p-2.5">
                        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                          {copy.replyLabel(review.replyTime)}
                        </VemtapText>
                        <VemtapText variant="caption" tone="secondary">
                          {review.reply}
                        </VemtapText>
                      </View>
                    ) : null}

                    {onModerate || onReply ? (
                      <View className="flex-row flex-wrap gap-2">
                        {onReply && review.canReply ? (
                          <BusinessActionTile
                            label={review.reply ? copy.editReply : copy.reply}
                            icon="replyArrow"
                            onPress={() => openReply(review)}
                          />
                        ) : null}
                        {review.canApprove ? (
                          <BusinessActionTile
                            label={copy.approve}
                            icon="checkCircle"
                            tone="brand"
                            onPress={() => onModerate?.(review.id, 'approve')}
                          />
                        ) : null}
                        {review.canReject ? (
                          <BusinessActionTile
                            label={copy.reject}
                            icon="block"
                            onPress={() => onModerate?.(review.id, 'reject')}
                          />
                        ) : null}
                        {onModerate && review.canDelete ? (
                          <BusinessActionTile
                            label={copy.delete}
                            icon="delete"
                            tone="errorContainer"
                            onPress={() => confirmDelete(review)}
                          />
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="rateReview"
                variant="contained"
                title={view.emptyTitle}
                description={view.emptyBody}
              />
            )}
          </BusinessPanel>
        </>
      )}
      <AppModal
        visible={Boolean(replying)}
        onClose={() => setReplying(null)}
        title={copy.replyTitle}
      >
        <View className="gap-3">
          <VemtapText variant="caption" tone="secondary">
            {copy.replyHint}
          </VemtapText>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder={copy.replyPlaceholder}
            accessibilityLabel={copy.replyTitle}
            multiline
            maxLength={1000}
          />
          {replyError ? (
            <VemtapText variant="caption" className="text-error">
              {replyError}
            </VemtapText>
          ) : null}
          <View className="flex-row gap-2">
            {replying?.reply ? (
              <Button
                label={copy.replyRemove}
                variant="secondary"
                className="flex-1"
                disabled={isReplying}
                onPress={() => replying && onReply?.(replying.id, null)}
              />
            ) : null}
            <Button
              label={copy.replySave}
              className="flex-1"
              loading={isReplying}
              disabled={isReplying || !draft.trim()}
              onPress={() => replying && onReply?.(replying.id, draft.trim())}
            />
          </View>
        </View>
      </AppModal>
    </BusinessScreenLayout>
  );
}
