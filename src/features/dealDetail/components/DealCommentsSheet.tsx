import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { showToast } from '@components/shared/toast';
import { formatWhen } from '@utils/formatters';
import {
  useCreateDealReview,
  useDealReviewDetail,
  useDealReviews,
  useDeleteDealReview,
  useUpdateDealReview,
} from '@features/dealDetail/hooks/useDealReviews';
import type { DealReview } from '@api/dealsApi';
import { ApiError } from '@api/ApiError';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

const copy = strings.deals;

export interface DealCommentsSheetProps {
  visible: boolean;
  onClose: () => void;
  dealTitle: string;
  merchant: string;
  commentCount: number;
}

interface LiveCommentsSheetProps extends DealCommentsSheetProps {
  /** The offer uuid; reviews are fetched only while it is set. */
  offerId: string;
}

/** Live reviews for one offer (`/deals/:offerId/reviews`). */
export function DealCommentsSheet(props: LiveCommentsSheetProps) {
  return <LiveReviewsSheet {...props} />;
}

// ---------------------------------------------------------------------------
// Live reviews (real offer)
// ---------------------------------------------------------------------------

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return words
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
}

function StarPicker({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange?: (next: number) => void;
  label: string;
}) {
  return (
    <View
      style={styles.starRow}
      accessibilityRole={onChange ? 'adjustable' : undefined}
      accessibilityLabel={label}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <Pressable
          key={star}
          accessibilityRole={onChange ? 'button' : undefined}
          accessibilityLabel={`${label} ${star}`}
          disabled={!onChange}
          onPress={() => onChange?.(star === value ? 0 : star)}
          hitSlop={4}
        >
          <Icon
            name="star"
            size={22}
            color={star <= value ? colors.tertiary : colors.textTertiary}
          />
        </Pressable>
      ))}
    </View>
  );
}

function LiveReviewRow({ review, onOpen }: { review: DealReview; onOpen: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onOpen} style={styles.reviewCard}>
      <View style={styles.nameRow}>
        <View style={[styles.avatar, { backgroundColor: colors.surfaceContainer }]}>
          <VemtapText className="font-sans-bold text-caption text-secondary">
            {initialsOf(review.reviewerName)}
          </VemtapText>
        </View>
        <View style={styles.commentBody}>
          <VemtapText variant="labelMd" className="font-sans-bold text-text">
            {review.reviewerName}
          </VemtapText>
          <VemtapText variant="caption" tone="tertiary">
            {formatWhen(review.createdAt)}
          </VemtapText>
        </View>
        <StarPicker value={review.rating ?? 0} label={review.reviewerName} />
      </View>
      <VemtapText variant="bodyMd" className="mt-2 text-text">
        {review.comment}
      </VemtapText>
      <View style={styles.likesRow}>
        <Icon name="favorite" size={15} color={colors.textTertiary} />
        <VemtapText variant="caption" tone="secondary">
          {review.likesCount}
        </VemtapText>
      </View>
    </Pressable>
  );
}

function LiveReviewsSheet({
  visible,
  onClose,
  dealTitle,
  merchant,
  commentCount,
  offerId,
}: LiveCommentsSheetProps) {
  const list = useDealReviews(offerId);
  const createReview = useCreateDealReview(offerId);

  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const createError =
    createReview.error instanceof ApiError && createReview.error.status === 409
      ? copy.alreadyReviewed
      : createReview.isError
        ? (createReview.error as Error).message || strings.errors.server
        : undefined;

  const postReview = () => {
    const value = text.trim();
    if (!value || createReview.isPending) return;
    createReview.mutate(
      { comment: value, rating: rating > 0 ? rating : undefined },
      {
        onSuccess: created => {
          setText('');
          setRating(0);
          showToast(
            created.status && created.status !== 'approved'
              ? copy.underReview
              : copy.reviewPosted,
            'success',
          );
        },
      },
    );
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.comments}
      count={list.data?.total ?? commentCount}
    >
      {selectedId ? (
        <ReviewDetail
          offerId={offerId}
          reviewId={selectedId}
          onBack={() => setSelectedId(null)}
          onDeleted={() => {
            setSelectedId(null);
            showToast(copy.reviewDeleted, 'success');
          }}
          onUpdated={() => showToast(copy.reviewUpdated, 'success')}
        />
      ) : (
        <>
          <View style={styles.reference}>
            <Icon name="restaurant" size={20} color={colors.primary} />
            <View style={styles.referenceCopy}>
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {dealTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {merchant}
              </VemtapText>
            </View>
          </View>
          <ScrollView
            style={styles.feed}
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {list.isLoading ? (
              <LoadingState label={strings.common.loading} />
            ) : list.isError ? (
              <ErrorState onRetry={() => list.refetch()} />
            ) : (list.data?.reviews ?? []).length === 0 ? (
              <EmptyState
                icon="rateReview"
                title={copy.noReviews}
                description={copy.noReviewsBody}
              />
            ) : (
              (list.data?.reviews ?? []).map(review => (
                <LiveReviewRow
                  key={review.id}
                  review={review}
                  onOpen={() => setSelectedId(review.id)}
                />
              ))
            )}
          </ScrollView>
          <View style={styles.composer}>
            <View style={styles.composerBody}>
              <StarPicker value={rating} onChange={setRating} label={copy.rateOptional} />
              <View style={styles.composerRow}>
                <TextInput
                  accessibilityLabel={copy.addCommentPlaceholder(merchant)}
                  value={text}
                  onChangeText={setText}
                  placeholder={copy.addCommentPlaceholder(merchant)}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  className="max-h-24 min-h-10 flex-1 rounded-2xl bg-surface-muted px-4 py-2 text-body-md text-text"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.post}
                  onPress={postReview}
                  disabled={createReview.isPending}
                  style={styles.postButton}
                >
                  <VemtapText className="font-sans-semibold text-label-md text-primary-foreground">
                    {copy.post}
                  </VemtapText>
                </Pressable>
              </View>
              {createError ? (
                <VemtapText variant="caption" tone="error">
                  {createError}
                </VemtapText>
              ) : null}
            </View>
          </View>
        </>
      )}
    </BottomSheet>
  );
}

function ReviewDetail({
  offerId,
  reviewId,
  onBack,
  onDeleted,
  onUpdated,
}: {
  offerId: string;
  reviewId: string;
  onBack: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}) {
  const detail = useDealReviewDetail(offerId, reviewId);
  const updateReview = useUpdateDealReview(offerId);
  const deleteReview = useDeleteDealReview(offerId);

  const [editing, setEditing] = useState(false);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);

  const startEdit = () => {
    if (!detail.data) return;
    setEditComment(detail.data.comment);
    setEditRating(detail.data.rating ?? 0);
    setEditing(true);
  };

  const saveEdit = () => {
    const value = editComment.trim();
    if (!value || updateReview.isPending) return;
    updateReview.mutate(
      { reviewId, input: { comment: value, rating: editRating || undefined } },
      {
        onSuccess: () => {
          setEditing(false);
          onUpdated();
        },
      },
    );
  };

  const confirmDelete = () => {
    Alert.alert(copy.deleteReviewTitle, copy.deleteReviewBody, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: copy.deleteReviewAction,
        style: 'destructive',
        onPress: () => deleteReview.mutate(reviewId, { onSuccess: onDeleted }),
      },
    ]);
  };

  const review = detail.data;

  return (
    <ScrollView
      style={styles.feed}
      contentContainerStyle={styles.detailContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.backToComments}
        onPress={onBack}
        hitSlop={6}
        style={styles.backRow}
      >
        <Icon name="back" size={18} color={colors.textSecondary} />
        <VemtapText variant="labelSm" tone="secondary" className="font-sans-semibold">
          {copy.backToComments}
        </VemtapText>
      </Pressable>
      {detail.isLoading ? (
        <LoadingState label={strings.common.loading} />
      ) : detail.isError || !review ? (
        <EmptyState
          icon="rateReview"
          title={copy.reviewUnavailable}
          description={strings.errors.server}
          actionLabel={strings.common.retry}
          onAction={() => detail.refetch()}
        />
      ) : (
        <View style={styles.reviewCard}>
          <View style={styles.nameRow}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceContainer }]}>
              <VemtapText className="font-sans-bold text-caption text-secondary">
                {initialsOf(review.reviewerName)}
              </VemtapText>
            </View>
            <View style={styles.commentBody}>
              <View style={styles.nameRow}>
                <VemtapText variant="labelMd" className="font-sans-bold text-text">
                  {review.reviewerName}
                </VemtapText>
                {review.isAuthor ? (
                  <View style={styles.ownerBadge}>
                    <Icon name="person" size={12} color={colors.primary} />
                    <VemtapText className="font-sans-bold text-caption text-primary">
                      {copy.yourReview}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
              <StarPicker value={review.rating ?? 0} label={review.reviewerName} />
            </View>
          </View>
          {editing ? (
            <>
              <TextInput
                accessibilityLabel={copy.editReview}
                value={editComment}
                onChangeText={setEditComment}
                multiline
                className="mt-2 max-h-32 min-h-16 rounded-2xl bg-surface-muted px-4 py-2 text-body-md text-text"
              />
              <View style={styles.editActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setEditing(false)}
                  style={styles.secondaryAction}
                >
                  <VemtapText
                    variant="labelSm"
                    tone="secondary"
                    className="font-sans-semibold"
                  >
                    {copy.cancelEdit}
                  </VemtapText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={saveEdit}
                  disabled={updateReview.isPending}
                  style={styles.postButton}
                >
                  <VemtapText className="font-sans-semibold text-label-sm text-primary-foreground">
                    {copy.saveReview}
                  </VemtapText>
                </Pressable>
              </View>
              {updateReview.isError ? (
                <VemtapText variant="caption" tone="error">
                  {(updateReview.error as Error).message || strings.errors.server}
                </VemtapText>
              ) : null}
            </>
          ) : (
            <>
              <VemtapText variant="bodyMd" className="mt-2 text-text">
                {review.comment}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary" className="mt-1">
                {formatWhen(review.createdAt)}
              </VemtapText>
              {review.status && review.status !== 'approved' ? (
                <VemtapText variant="caption" tone="secondary" className="mt-1">
                  {copy.underReview}
                </VemtapText>
              ) : null}
              {review.isAuthor ? (
                <View style={styles.editActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={startEdit}
                    style={styles.secondaryAction}
                  >
                    <Icon name="edit" size={16} color={colors.primary} />
                    <VemtapText
                      variant="labelSm"
                      tone="brand"
                      className="font-sans-semibold"
                    >
                      {copy.editReview}
                    </VemtapText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={confirmDelete}
                    disabled={deleteReview.isPending}
                    style={styles.secondaryAction}
                  >
                    <Icon name="delete" size={16} color={colors.error} />
                    <VemtapText
                      variant="labelSm"
                      tone="error"
                      className="font-sans-semibold"
                    >
                      {copy.deleteReview}
                    </VemtapText>
                  </Pressable>
                </View>
              ) : null}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  reference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceTint,
    padding: 12,
  },
  referenceCopy: { flex: 1, minWidth: 0 },
  feed: { maxHeight: 390 },
  feedContent: { gap: 16, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  detailContent: { gap: 12, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  reviewCard: {
    gap: 2,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentBody: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  likesRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 40,
    paddingHorizontal: 10,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 999,
    backgroundColor: colors.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  composerBody: { flex: 1, minWidth: 0, gap: 8 },
  composerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  postButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
  },
});
