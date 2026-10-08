import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { orderImages } from '@features/order/orderData';
import {
  useCustomerThreadMessages,
  useCustomerThreads,
  useSendCustomerReply,
} from '@features/merchantChat/hooks/useCustomerMessaging';
import { formatWhen } from '@utils/formatters';
import { ConversationBubble } from '@features/merchantChat/components/ConversationBubble';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';

export interface UrbanConversationScreenProps {
  /**
   * The in-house thread to open. Messages come from
   * `GET /customer/messaging/threads/{threadId}` and replies go to its `/reply`.
   */
  threadId?: string;
  onBack?: () => void;
  onCallMerchant?: () => void;
  onOpenDetails?: () => void;
  onMore?: () => void;
  onViewPass?: () => void;
  onCloseDeal?: () => void;
  onAttachment?: () => void;
  onEmoji?: () => void;
  onCamera?: () => void;
  onQuickReply?: (message: string) => void;
}

export function UrbanConversationScreen({
  threadId,
  onBack,
  onCallMerchant,
  onOpenDetails,
  onMore,
  onViewPass,
  onCloseDeal,
  onAttachment,
  onEmoji,
  onCamera,
  onQuickReply,
}: UrbanConversationScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [showDeal, setShowDeal] = useState(true);
  const [draft, setDraft] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const threadsQuery = useCustomerThreads();
  const thread = threadId
    ? (threadsQuery.data ?? []).find(candidate => candidate.id === threadId)
    : undefined;
  const messagesQuery = useCustomerThreadMessages(threadId);
  const sendReply = useSendCustomerReply();

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const send = useCallback(() => {
    const message = draft.trim();
    if (!message || !threadId) return;
    sendReply.mutate({ threadId, payload: { content: message } });
    setDraft('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [draft, threadId, sendReply]);

  const closeDeal = useCallback(() => {
    setShowDeal(false);
    onCloseDeal?.();
  }, [onCloseDeal]);

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior="padding">
      <View style={{ paddingTop: Math.max(insets.top, 8) }} className="bg-surface">
        <RegistrationHeader
          title={strings.urbanConversation.pageTitle}
          onBack={onBack ?? (() => undefined)}
          showMoreAction
          onMore={onMore}
        />
        <View className="flex-row items-center justify-between gap-2 px-6 py-3 shadow-sm">
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <View className="relative h-11 w-11 shrink-0">
              <Image
                source={
                  thread?.branch?.logoUrl
                    ? { uri: thread.branch.logoUrl }
                    : { uri: orderImages.merchant }
                }
                className="h-full w-full rounded-full bg-surface-container"
              />
              <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1">
                <VemtapText
                  variant="headingSm"
                  numberOfLines={1}
                  className="min-w-0 flex-1"
                >
                  {thread?.branch?.name ?? strings.urbanConversation.merchant}
                </VemtapText>
                <Icon name="verified" size={17} color={colors.primary} />
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {strings.urbanConversation.replyStatus}
              </VemtapText>
            </View>
          </View>
          <View className="shrink-0 flex-row items-center gap-1.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanConversation.callMerchant}
              onPress={onCallMerchant}
              className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-tint active:scale-95"
            >
              <Icon name="phone" size={18} color={colors.primary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanConversation.dealDetails}
              onPress={onOpenDetails}
              className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container active:scale-95"
            >
              <Icon name="receipt" size={18} color={colors.surfaceDark} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="gap-4 px-6 pb-4 pt-3"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        showsVerticalScrollIndicator={false}
      >
        {showDeal ? (
          <View className="rounded-xl bg-surface p-3 shadow-md">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon name="localActivity" size={18} color={colors.primary} />
                <VemtapText
                  variant="labelSm"
                  tone="brand"
                  className="font-sans-semibold uppercase"
                >
                  {strings.urbanConversation.activeDeal}
                </VemtapText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.urbanConversation.closeDeal}
                onPress={closeDeal}
                hitSlop={8}
              >
                <Icon name="close" size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
            <View className="mt-3 flex-row gap-3">
              <Image
                source={{ uri: orderImages.burger }}
                className="h-16 w-16 shrink-0 rounded-lg bg-surface-container"
              />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={2}
                >
                  {strings.urbanConversation.dealTitle}
                </VemtapText>
                <View className="mt-0.5 flex-row flex-wrap items-center gap-2">
                  <VemtapText variant="caption" className="font-sans-bold">
                    {strings.urbanConversation.dealPrice}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary" className="line-through">
                    {strings.urbanConversation.regularPrice}
                  </VemtapText>
                  <VemtapText
                    variant="caption"
                    tone="success"
                    className="rounded-full bg-success-container px-1.5 py-0.5"
                  >
                    {strings.urbanConversation.save}
                  </VemtapText>
                </View>
                <View className="mt-1 flex-row items-center justify-between gap-2">
                  <VemtapText variant="caption" tone="secondary">
                    {strings.urbanConversation.codeLabel}{' '}
                    <VemtapText className="font-sans-semibold text-text">
                      {strings.urbanConversation.code}
                    </VemtapText>
                  </VemtapText>
                  <Pressable
                    accessibilityRole="button"
                    onPress={onViewPass}
                    className="flex-row items-center"
                  >
                    <VemtapText
                      variant="labelSm"
                      tone="brand"
                      className="font-sans-semibold"
                    >
                      {strings.urbanConversation.viewPass}
                    </VemtapText>
                    <Icon name="arrowForward" size={14} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ) : null}
        <View className="my-1 items-center">
          <VemtapText
            variant="caption"
            tone="secondary"
            className="rounded-full bg-surface-container-low px-3 py-1 shadow-sm"
          >
            {strings.urbanConversation.date}
          </VemtapText>
        </View>
        <View className="flex-row items-start gap-2 rounded-xl bg-surface-tint p-3 shadow-sm">
          <Icon name="lock" size={18} color={colors.primary} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="flex-1 leading-relaxed"
          >
            {strings.urbanConversation.security}
          </VemtapText>
        </View>
        {messagesQuery.isLoading ? (
          <LoadingState label={strings.common.loading} />
        ) : messagesQuery.isError ? (
          <ErrorState title={strings.common.error} onRetry={messagesQuery.refetch} />
        ) : (messagesQuery.data ?? []).length === 0 ? (
          <EmptyState variant="contained" icon="message" title={strings.common.empty} />
        ) : (
          (messagesQuery.data ?? []).map(message => (
            <ConversationBubble
              key={message.id}
              message={message.content}
              time={formatWhen(message.createdAt ?? '')}
              sender={message.direction === 'INBOUND' ? 'merchant' : 'customer'}
            />
          ))
        )}
      </ScrollView>

      <View
        className="gap-2 bg-surface px-6 pb-2 pt-2"
        style={[
          navbarBottomShadow,
          { paddingBottom: keyboardHeight > 0 ? 0 : Math.max(insets.bottom, 10) },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-2 py-1"
        >
          {strings.urbanConversation.quickReplies.map(reply => (
            <Pressable
              key={reply}
              accessibilityRole="button"
              onPress={() => onQuickReply?.(reply)}
              className="shrink-0 rounded-full bg-surface px-3 py-2 shadow-sm active:bg-surface-tint"
            >
              <VemtapText variant="labelSm">{reply}</VemtapText>
            </Pressable>
          ))}
        </ScrollView>
        <View className="min-h-[52px] flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.urbanConversation.attachment}
            onPress={onAttachment}
            className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container-low"
          >
            <Icon name="plus" size={22} color={colors.textSecondary} />
          </Pressable>
          <View className="min-w-0 flex-1 flex-row items-center rounded-full bg-surface-container-low px-3">
            <TextInput
              accessibilityLabel={strings.urbanConversation.inputLabel}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={send}
              placeholder={strings.urbanConversation.placeholder}
              placeholderTextColor={colors.textTertiary}
              returnKeyType="send"
              className="min-w-0 flex-1 font-sans text-body-md text-text"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanConversation.emoji}
              onPress={onEmoji}
              hitSlop={8}
            >
              <Icon name="emoji" size={20} color={colors.textTertiary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanConversation.camera}
              onPress={onCamera}
              hitSlop={8}
            >
              <Icon name="localMall" size={19} color={colors.textTertiary} />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.urbanConversation.send}
            disabled={!draft.trim()}
            onPress={send}
            className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary shadow-md active:scale-95 disabled:opacity-50"
          >
            <Icon name="send" size={22} color={colors.surface} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
