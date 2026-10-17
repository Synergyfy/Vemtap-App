import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { showToast } from '@components/shared/toast';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { ApiError } from '@api/ApiError';
import {
  useCreateProductComment,
  useDeleteProductComment,
  useProductComments,
  useUpdateProductComment,
} from '@features/order/hooks/useProductComments';
import {
  toProductCommentView,
  type ProductCommentView,
} from '@features/order/utils/productDetailMapper';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(TextInput, { className: 'style' });

const copy = strings.productComments;

export interface ProductCommentsSheetProps {
  visible: boolean;
  onClose: () => void;
  itemId: string;
  productName: string;
  businessName?: string;
  /** False when signed out: the list still shows, the composer does not. */
  canComment: boolean;
}

function StarPicker({
  value,
  onChange,
  label,
  size = 22,
}: {
  value: number;
  onChange?: (next: number) => void;
  label: string;
  size?: number;
}) {
  return (
    <View className="flex-row items-center gap-0.5" accessibilityLabel={label}>
      {[1, 2, 3, 4, 5].map(star => (
        <Pressable
          key={star}
          accessibilityRole={onChange ? 'button' : undefined}
          accessibilityLabel={onChange ? copy.starLabel(star) : undefined}
          disabled={!onChange}
          onPress={() => onChange?.(star === value ? 0 : star)}
          hitSlop={4}
        >
          <Icon
            name="star"
            size={size}
            color={star <= value ? colors.tertiary : colors.textTertiary}
          />
        </Pressable>
      ))}
    </View>
  );
}

function failureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return copy.alreadyCommented;
    if (error.status === 403) return copy.ownProduct;
    if (error.message) return error.message;
  }
  return copy.failed;
}

/**
 * Comments on one product: everyone can read them, a signed-in customer can
 * post one (with optional stars), then edit or delete it. Comments publish
 * straight away; the business's reply shows under the comment it answers.
 */
export function ProductCommentsSheet({
  visible,
  onClose,
  itemId,
  productName,
  businessName = '',
  canComment,
}: ProductCommentsSheetProps) {
  const list = useProductComments(visible ? itemId : null);
  const create = useCreateProductComment(itemId);
  const update = useUpdateProductComment(itemId);
  const remove = useDeleteProductComment(itemId);

  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const comments = (list.data?.comments ?? []).map(toProductCommentView);
  const hasOwn = comments.some(comment => comment.isMine);
  const showComposer = canComment && (!hasOwn || editingId !== null);
  const pending = create.isPending || update.isPending;

  const resetComposer = () => {
    setText('');
    setRating(0);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (comment: ProductCommentView) => {
    setEditingId(comment.id);
    setText(comment.body);
    setRating(comment.rating);
    setError(null);
  };

  const submit = () => {
    const value = text.trim();
    if (!value || pending) return;
    setError(null);
    const onError = (failure: unknown) => setError(failureMessage(failure));
    if (editingId) {
      update.mutate(
        {
          commentId: editingId,
          comment: value,
          ...(rating > 0 ? { rating } : {}),
        },
        {
          onSuccess: () => {
            resetComposer();
            showToast(copy.updated, 'success');
          },
          onError,
        },
      );
      return;
    }
    create.mutate(
      { comment: value, ...(rating > 0 ? { rating } : {}) },
      {
        onSuccess: () => {
          resetComposer();
          showToast(copy.posted, 'success');
        },
        onError,
      },
    );
  };

  const confirmDelete = (comment: ProductCommentView) => {
    Alert.alert(copy.deleteTitle, copy.deleteBody, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.deleteConfirm,
        style: 'destructive',
        onPress: () =>
          remove.mutate(comment.id, {
            onSuccess: () => {
              if (editingId === comment.id) resetComposer();
              showToast(copy.deleted, 'success');
            },
            onError: failure => showToast(failureMessage(failure), 'error'),
          }),
      },
    ]);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.title}
      count={list.data?.total}
    >
      <View className="mx-6 mb-3 flex-row items-center gap-2.5 rounded-xl bg-surface-tint p-3">
        <Icon name="shoppingBag" size={20} color={colors.primary} />
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.subtitle(productName)}
          </VemtapText>
          {businessName ? (
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {businessName}
            </VemtapText>
          ) : null}
        </View>
      </View>

      <ScrollView
        className="max-h-[390px]"
        contentContainerClassName="gap-3 px-6 pb-4 pt-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {list.isLoading ? (
          <LoadingState label={copy.loading} />
        ) : list.isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={() => list.refetch()}
          />
        ) : comments.length === 0 ? (
          <EmptyState
            icon="rateReview"
            title={copy.empty.title}
            description={copy.empty.body}
          />
        ) : (
          comments.map(comment => (
            <View
              key={comment.id}
              className="gap-2 rounded-2xl border border-border bg-surface p-3.5"
            >
              <View className="flex-row items-center gap-2.5">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
                  <VemtapText className="font-sans-bold text-caption text-secondary">
                    {comment.initials}
                  </VemtapText>
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-bold text-text"
                    numberOfLines={1}
                  >
                    {comment.author}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary">
                    {comment.when}
                  </VemtapText>
                </View>
                {comment.rating > 0 ? (
                  <StarPicker
                    value={comment.rating}
                    label={copy.starLabel(comment.rating)}
                    size={14}
                  />
                ) : null}
              </View>
              <VemtapText variant="bodyMd" className="text-text">
                {comment.body}
              </VemtapText>
              {comment.reply ? (
                <View className="ml-4 gap-0.5 rounded-xl bg-surface-muted p-3">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-primary"
                  >
                    {copy.businessReply(businessName)}
                    {comment.replyWhen ? ` · ${comment.replyWhen}` : ''}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {comment.reply}
                  </VemtapText>
                </View>
              ) : null}
              {comment.isMine && canComment ? (
                <View className="flex-row gap-2">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.edit}
                    onPress={() => startEdit(comment)}
                    className="min-h-10 flex-row items-center gap-1 px-2.5"
                  >
                    <Icon name="edit" size={16} color={colors.primary} />
                    <VemtapText variant="labelSm" tone="brand">
                      {copy.edit}
                    </VemtapText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.delete}
                    onPress={() => confirmDelete(comment)}
                    className="min-h-10 flex-row items-center gap-1 px-2.5"
                  >
                    <Icon name="delete" size={16} color={colors.error} />
                    <VemtapText variant="labelSm" className="text-error">
                      {copy.delete}
                    </VemtapText>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      {showComposer ? (
        <View className="gap-2 border-t border-border px-6 pb-2 pt-3">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="caption" tone="secondary">
              {copy.ratingLabel}
            </VemtapText>
            <StarPicker value={rating} onChange={setRating} label={copy.ratingLabel} />
          </View>
          <View className="flex-row items-end gap-2">
            <TextInput
              accessibilityLabel={copy.placeholder}
              value={text}
              onChangeText={setText}
              placeholder={copy.placeholder}
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={1000}
              className="max-h-24 min-h-10 flex-1 rounded-2xl bg-surface-muted px-4 py-2 text-body-md text-text"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={editingId ? copy.save : copy.post}
              onPress={submit}
              disabled={pending || !text.trim()}
              className="h-10 items-center justify-center rounded-full bg-primary px-4"
            >
              <VemtapText className="font-sans-semibold text-label-md text-primary-foreground">
                {editingId ? copy.save : copy.post}
              </VemtapText>
            </Pressable>
          </View>
          {editingId ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.cancelEdit}
              onPress={resetComposer}
              className="self-start py-1"
            >
              <VemtapText variant="labelSm" tone="secondary">
                {copy.cancelEdit}
              </VemtapText>
            </Pressable>
          ) : null}
          {error ? (
            <VemtapText variant="caption" className="text-error">
              {error}
            </VemtapText>
          ) : null}
        </View>
      ) : !canComment ? (
        <View className="border-t border-border px-6 pb-2 pt-3">
          <VemtapText variant="caption" tone="secondary">
            {copy.signInToComment}
          </VemtapText>
        </View>
      ) : null}
    </BottomSheet>
  );
}
