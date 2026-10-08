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
import { useUiStore } from '@store/uiStore';
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
  /**
   * The offer UUID for a live deal. Fictional seed offers have no server row,
   * so when this is absent the sheet keeps the designed demo conversation.
   */
  offerId: string;
}

export function DealCommentsSheet(props: DealCommentsSheetProps & { offerId?: string }) {
  const { offerId, ...base } = props;
  if (offerId) {
    return <LiveReviewsSheet {...base} offerId={offerId} />;
  }
  return <DemoCommentsSheet {...base} />;
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
  const showToast = useUiStore(state => state.showToast);
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
                  accessibilityLabel={copy.addCommentPlaceholder}
                  value={text}
                  onChangeText={setText}
                  placeholder={copy.addCommentPlaceholder}
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

// ---------------------------------------------------------------------------
// Demo conversation (fictional seed deals — no server row exists)
// ---------------------------------------------------------------------------

type DemoComment = {
  id: string;
  name: string;
  handle: string;
  text: string;
  time: string;
  likes: number;
  initials: string;
  reply?: {
    text: string;
    time: string;
    likes: number;
  };
};

const initialComments: DemoComment[] = [
  {
    id: 'samuel',
    name: 'Samuel A.',
    handle: '@sam_adeleke',
    text: 'Just claimed this yesterday! The burger is massive and the fries were super fresh. Definitely worth the ₦9,600 🔥',
    time: '2h ago',
    likes: 14,
    initials: 'SA',
  },
  {
    id: 'chioma',
    name: 'Chioma N.',
    handle: '@chioma_eats',
    text: 'Can this voucher be used on Sunday afternoon or strictly weekdays?',
    time: '5h ago',
    likes: 3,
    initials: 'CN',
    reply: {
      text: '@chioma_eats Hi Chioma! This lunch deal is valid Monday to Friday 12 PM - 4 PM. We hope to host you!',
      time: '3h ago',
      likes: 6,
    },
  },
  {
    id: 'tunde',
    name: 'Tunde Bakare',
    handle: '@tundeb',
    text: 'Saved for tomorrow’s team lunch in Apo. Seamless reservation!',
    time: '1d ago',
    likes: 5,
    initials: 'TB',
  },
];

function DemoCommentsSheet({
  visible,
  onClose,
  dealTitle,
  merchant,
  commentCount,
}: DealCommentsSheetProps) {
  const [comments, setComments] = useState(initialComments);
  const [liked, setLiked] = useState<string[]>([]);
  const [text, setText] = useState('');

  const toggleLike = (id: string) => {
    setLiked(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  };

  const postComment = () => {
    const value = text.trim();
    if (!value) return;
    setComments(current => [
      ...current,
      {
        id: `comment-${Date.now()}`,
        name: 'You',
        handle: '@you',
        text: value,
        time: 'Just now',
        likes: 0,
        initials: 'YO',
      },
    ]);
    setText('');
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.comments}
      count={commentCount + comments.length - initialComments.length}
    >
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
            {merchant} • Abuja, NG
          </VemtapText>
        </View>
        <View style={styles.activeBadge}>
          <VemtapText className="font-sans-bold text-label-sm text-badge-discount-text">
            {copy.active}
          </VemtapText>
        </View>
      </View>

      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {comments.map(comment => (
          <View key={comment.id} style={styles.commentGroup}>
            <View style={styles.commentRow}>
              <View style={[styles.avatar, { backgroundColor: colors.surfaceContainer }]}>
                <VemtapText className="font-sans-bold text-caption text-secondary">
                  {comment.initials}
                </VemtapText>
              </View>
              <View style={styles.commentBody}>
                <View style={styles.nameRow}>
                  <VemtapText variant="labelMd" className="font-sans-bold text-text">
                    {comment.name}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary">
                    {comment.handle}
                  </VemtapText>
                </View>
                <VemtapText variant="bodyMd" className="mt-1 text-text">
                  {comment.text}
                </VemtapText>
                <CommentMeta
                  time={comment.time}
                  likes={comment.likes + (liked.includes(comment.id) ? 1 : 0)}
                  onReply={() => undefined}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Like comment"
                onPress={() => toggleLike(comment.id)}
                style={styles.likeButton}
              >
                <Icon
                  name={liked.includes(comment.id) ? 'favoriteFilled' : 'favorite'}
                  size={20}
                  color={liked.includes(comment.id) ? colors.error : colors.textTertiary}
                />
              </Pressable>
            </View>
            {comment.reply ? (
              <View style={styles.reply}>
                <View style={styles.replyAvatar}>
                  <Icon name="restaurant" size={16} color={colors.primary} />
                </View>
                <View style={styles.commentBody}>
                  <View style={styles.nameRow}>
                    <VemtapText variant="labelSm" className="font-sans-bold text-text">
                      Urban Grill & Bistro
                    </VemtapText>
                    <View style={styles.ownerBadge}>
                      <Icon name="verified" size={12} color={colors.primary} />
                      <VemtapText className="font-sans-bold text-caption text-primary">
                        {copy.owner}
                      </VemtapText>
                    </View>
                  </View>
                  <VemtapText variant="bodyMd" className="mt-1 text-text">
                    {comment.reply.text}
                  </VemtapText>
                  <CommentMeta
                    time={comment.reply.time}
                    likes={comment.reply.likes}
                    onReply={() => undefined}
                  />
                </View>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View style={styles.emojiTray}>
        {['❤️', '🔥', '👏', '😍', '🤤'].map(emoji => (
          <Pressable
            key={emoji}
            accessibilityRole="button"
            accessibilityLabel={`Add ${emoji}`}
            onPress={() => setText(value => `${value}${emoji}`)}
            style={styles.emojiButton}
          >
            <VemtapText className="text-heading-md">{emoji}</VemtapText>
          </Pressable>
        ))}
      </View>
      <View style={styles.composer}>
        <View style={styles.userAvatar}>
          <VemtapText className="font-sans-bold text-caption text-primary">YO</VemtapText>
        </View>
        <TextInput
          accessibilityLabel={copy.addCommentPlaceholder}
          value={text}
          onChangeText={setText}
          placeholder={copy.addCommentPlaceholder}
          placeholderTextColor={colors.textTertiary}
          className="min-h-10 flex-1 rounded-full bg-surface-muted px-4 text-body-md text-text"
          returnKeyType="done"
          onSubmitEditing={postComment}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.post}
          onPress={postComment}
          style={styles.postButton}
        >
          <VemtapText className="font-sans-semibold text-label-md text-primary-foreground">
            {copy.post}
          </VemtapText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

function CommentMeta({
  time,
  likes,
  onReply,
}: {
  time: string;
  likes: number;
  onReply: () => void;
}) {
  return (
    <View style={styles.metaRow}>
      <VemtapText variant="caption" tone="secondary">
        {time}
      </VemtapText>
      <VemtapText variant="caption" className="font-sans-medium text-text">
        {likes} likes
      </VemtapText>
      <Pressable accessibilityRole="button" onPress={onReply} style={styles.replyButton}>
        <VemtapText variant="caption" tone="secondary" className="font-sans-semibold">
          {copy.reply}
        </VemtapText>
      </Pressable>
    </View>
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
  activeBadge: {
    borderRadius: 999,
    backgroundColor: colors.badgeDiscountBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
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
  commentGroup: { gap: 12 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
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
  likeButton: { padding: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  replyButton: { minHeight: 24, justifyContent: 'center' },
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
  reply: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginLeft: 52,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    padding: 12,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryFixed,
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
  emojiTray: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 4,
  },
  emojiButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryFixed,
  },
  postButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
  },
});
