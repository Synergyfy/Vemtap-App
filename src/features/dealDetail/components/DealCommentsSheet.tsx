import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

export interface DealCommentsSheetProps {
  visible: boolean;
  onClose: () => void;
  dealTitle: string;
  merchant: string;
  commentCount: number;
}

type Comment = {
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

const initialComments: Comment[] = [
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

export function DealCommentsSheet({
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
      title={strings.deals.comments}
      titleVariant="headingSm"
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
            {strings.deals.active}
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
                        {strings.deals.owner}
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
          accessibilityLabel={strings.deals.addCommentPlaceholder}
          value={text}
          onChangeText={setText}
          placeholder={strings.deals.addCommentPlaceholder}
          placeholderTextColor={colors.textTertiary}
          className="min-h-10 flex-1 rounded-full bg-surface-muted px-4 text-body-md text-text"
          returnKeyType="done"
          onSubmitEditing={postComment}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.deals.post}
          onPress={postComment}
          style={styles.postButton}
        >
          <VemtapText className="font-sans-semibold text-label-md text-primary-foreground">
            {strings.deals.post}
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
          {strings.deals.reply}
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
  feedContent: { gap: 20, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
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
  likeButton: { padding: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  replyButton: { minHeight: 24, justifyContent: 'center' },
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
