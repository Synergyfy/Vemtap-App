import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { messagingApi } from '@api/messagingApi';
import {
  joinMessagingThread,
  leaveMessagingThread,
  setActiveMessagingThread,
  markMessagingRead,
} from '@api/messagingSocket';
import { strings } from '@constants/strings';
import { orderImages } from '@features/order/orderData';
import {
  markCustomerThreadReadLocally,
  useCustomerThreadMessages,
  useCustomerThreads,
  useSendCustomerReply,
} from '@features/merchantChat/hooks/useCustomerMessaging';
import { formatCurrency } from '@utils/formatters';
import { ConversationBubble } from '@features/merchantChat/components/ConversationBubble';
import { ChatComposer } from '@features/merchantChat/components/ChatComposer';
import { useKeyboardInset } from '@features/merchantChat/hooks/useKeyboardInset';
import {
  dayLabel,
  formatClock,
  messageTimeOf,
  startsNewDay,
} from '@features/merchantChat/utils/messageTime';
import { useClaimPass } from '@features/myDeals/hooks/useMyClaims';
import { colors } from '@theme/colors';


export interface UrbanConversationScreenProps {
  /**
   * The in-house thread to open. Messages come from
   * `GET /customer/messaging/threads/{threadId}` and replies go to its `/reply`.
   */
  threadId?: string;
  /**
   * The linked deal pass, when the chat was opened straight from one. The thread
   * itself carries `claimId`, but a just-started thread may not be in the cached
   * list yet, so the route's claim wins when both are present.
   */
  claimId?: string;
  onBack?: () => void;
  onCallMerchant?: () => void;
  /** Opens the merchant's public profile. Receives the branch's 9-char code. */
  onOpenBusiness?: (code: string) => void;
  onOpenDetails?: () => void;
  onMore?: () => void;
  /** Opens the linked deal pass. Carries the claim so the pass route can resolve it. */
  onViewPass?: (claimId: string) => void;
  onCloseDeal?: () => void;
  onAttachment?: () => void;
  onEmoji?: (emoji: string) => void;
  onCamera?: () => void;
  /** Puts a quick reply in the draft so it can be edited before sending. */
  onQuickReply?: (message: string) => void;
}

export function UrbanConversationScreen({
  threadId,
  claimId,
  onBack,
  onCallMerchant,
  onOpenBusiness,
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
  const { keyboardInset, isKeyboardVisible, dismissKeyboard } = useKeyboardInset();
  const [showDeal, setShowDeal] = useState(true);
  const [draft, setDraft] = useState('');
  const [pendingMediaUrl, setPendingMediaUrl] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const threadsQuery = useCustomerThreads();
  const thread = threadId
    ? (threadsQuery.data ?? []).find(candidate => candidate.id === threadId)
    : undefined;
  const messagesQuery = useCustomerThreadMessages(threadId);
  const sendReply = useSendCustomerReply();

  /**
   * Older threads can predate the branch relations, so the business name falls
   * back through the branch to the business to a placeholder. Every consumer of
   * the name (header, security line, share sheet) reads this one value.
   */
  const businessName = useMemo(
    () =>
      thread?.branch?.name ?? thread?.business?.name ?? strings.urbanConversation.merchant,
    [thread?.branch?.name, thread?.business?.name],
  );
  const branchPhone = thread?.branch?.phone ?? thread?.business?.phone ?? undefined;
  const branchCode = thread?.branch?.code ?? undefined;

  /**
   * The linked deal comes off the thread (`claimId` is set when the chat was
   * started from a pass) and is resolved against `GET /me/claims`. A route
   * param wins so a chat opened straight from a pass still renders the card
   * before the thread list has caught up. Only asked for when a claim is known,
   * so a general conversation does not download the whole pass wallet to render
   * nothing.
   */
  const linkedClaimId = claimId ?? thread?.claimId ?? undefined;
  const { claim: linkedClaim } = useClaimPass({
    claimId: linkedClaimId,
    enabled: linkedClaimId != null,
  });
  const linkedOffer = linkedClaim?.offer;
  const savedAmount =
    linkedOffer != null ? linkedOffer.originalPrice - linkedOffer.calculatedPrice : 0;

  // Tell the socket bridge which thread is on screen: it joins that thread's
  // room (so live messages arrive while it is open), marks inbound messages
  // read rather than delivered, and leaves the room on exit.
  useEffect(() => {
    if (!threadId) return;
    setActiveMessagingThread(threadId);
    joinMessagingThread(threadId);
    // Tell the server, and clear the badge the messages hub is showing straight
    // away. The socket emit alone leaves the local unread count untouched, so the
    // number and the Unread chip would both still list this thread as unread.
    markCustomerThreadReadLocally(threadId);
    markMessagingRead(threadId);
    return () => {
      setActiveMessagingThread(null);
      leaveMessagingThread(threadId);
    };
  }, [threadId]);

  /**
   * Keep the newest message in view whenever the transcript grows — on first
   * load, after a send, and when the socket appends an incoming one. Without it
   * the list stays wherever it was left, so the newest bubble sits below the
   * fold and the reader has to scroll to see what just arrived.
   */
  const scrollToLatest = useCallback((animated: boolean) => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated }));
  }, []);

  useEffect(() => {
    scrollToLatest(false);
  }, [messagesQuery.data?.length, scrollToLatest]);

  useEffect(() => {
    if (isKeyboardVisible) scrollToLatest(true);
  }, [isKeyboardVisible, scrollToLatest]);

  const send = useCallback(() => {
    const message = draft.trim();
    // An image on its own is a complete message, so the text is optional once
    // there is something attached.
    if ((!message && !pendingMediaUrl) || !threadId) return;
    sendReply.mutate({
      threadId,
      payload: {
        content: message,
        ...(pendingMediaUrl ? { mediaUrl: pendingMediaUrl } : {}),
      },
    });
    setDraft('');
    setPendingMediaUrl(null);
    scrollToLatest(true);
  }, [draft, pendingMediaUrl, threadId, sendReply, scrollToLatest]);

  /**
   * Host the picked image, then stage it on the composer rather than sending
   * straight away — the user still gets to add a caption or change their mind.
   */
  const attachPickedImage = useCallback(
    async (file: { uri: string; fileName?: string | null; mimeType?: string }) => {
      if (!threadId) return;
      setUploadingMedia(true);
      try {
        const { url } = await messagingApi.uploadCustomerMedia({
          fileUri: file.uri,
          fileName: file.fileName ?? `chat-photo-${Date.now()}.jpg`,
          mimeType: file.mimeType ?? 'image/jpeg',
        });
        setPendingMediaUrl(url);
      } catch {
        // Leave the composer as it was; the draft is never lost.
      } finally {
        setUploadingMedia(false);
      }
    },
    [threadId],
  );

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    const asset = result.canceled ? undefined : result.assets?.[0];
    if (asset) await attachPickedImage(asset);
  }, [attachPickedImage]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    const asset = result.canceled ? undefined : result.assets?.[0];
    if (asset) await attachPickedImage(asset);
  }, [attachPickedImage]);

  const statusMessage = uploadingMedia
    ? strings.urbanConversation.uploading
    : pendingMediaUrl && !draft.trim()
      ? strings.urbanConversation.photoAttached
      : undefined;

  /**
   * A caller can still take over the call entirely; otherwise the thread's own
   * number is handed to the dialler rather than a hardcoded one. A thread whose
   * branch carries no phone renders the control disabled instead of dialling
   * nothing.
   */
  const callBusiness = useCallback(() => {
    if (onCallMerchant) {
      onCallMerchant();
      return;
    }
    if (!branchPhone) return;
    Linking.openURL(`tel:${branchPhone}`).catch(() => undefined);
  }, [branchPhone, onCallMerchant]);

  const openBusiness = useCallback(() => {
    if (!branchCode) return;
    onOpenBusiness?.(branchCode);
  }, [branchCode, onOpenBusiness]);

  const closeDeal = useCallback(() => {
    setShowDeal(false);
    onCloseDeal?.();
  }, [onCloseDeal]);

  return (
    // No `KeyboardAvoidingView`: it relies on an event/layout race that drops
    // the first keyboard frame on a focused screen, and it cannot lift the bar
    // at all where the window never resizes (iOS, and Android under Expo Go).
    // The composer is lifted by the measured inset instead.
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: Math.max(insets.top, 8) }} className="bg-surface">
        <RegistrationHeader
          title={strings.urbanConversation.pageTitle}
          onBack={onBack ?? (() => undefined)}
          showMoreAction
          onMore={onMore}
        />
        <View className="flex-row items-center justify-between gap-2 px-6 py-3 shadow-sm">
          {/* The merchant row is the way into their public profile. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${strings.urbanConversation.openBusiness}: ${businessName}`}
            accessibilityState={{ disabled: !branchCode }}
            disabled={!branchCode}
            onPress={openBusiness}
            className="min-w-0 flex-1 flex-row items-center gap-3 disabled:opacity-70"
          >
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
                  {businessName}
                </VemtapText>
                <Icon name="verified" size={17} color={colors.primary} />
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {strings.urbanConversation.replyStatus}
              </VemtapText>
            </View>
          </Pressable>
          <View className="shrink-0 flex-row items-center gap-1.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanConversation.callMerchant}
              accessibilityState={{ disabled: !branchPhone }}
              disabled={!branchPhone}
              onPress={callBusiness}
              className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-tint active:scale-95 disabled:opacity-40"
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
        keyboardDismissMode="on-drag"
        // No `automaticallyAdjustKeyboardInsets` here: together with the
        // avoiding view above it would inset the list twice on iOS.
        onContentSizeChange={() => scrollToLatest(false)}
        showsVerticalScrollIndicator={false}
      >
        {showDeal && linkedClaim && linkedOffer ? (
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
                source={
                  linkedOffer.mainImage
                    ? { uri: linkedOffer.mainImage }
                    : { uri: orderImages.burger }
                }
                className="h-16 w-16 shrink-0 rounded-lg bg-surface-container"
              />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={2}
                >
                  {linkedOffer.name}
                </VemtapText>
                <View className="mt-0.5 flex-row flex-wrap items-center gap-2">
                  <VemtapText variant="caption" className="font-sans-bold">
                    {formatCurrency(linkedOffer.calculatedPrice)}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary" className="line-through">
                    {formatCurrency(linkedOffer.originalPrice)}
                  </VemtapText>
                  {savedAmount > 0 ? (
                    <VemtapText
                      variant="caption"
                      tone="success"
                      className="rounded-full bg-success-container px-1.5 py-0.5"
                    >
                      {strings.urbanConversation.saveAmountFor(
                        formatCurrency(savedAmount),
                      )}
                    </VemtapText>
                  ) : null}
                </View>
                <View className="mt-1 flex-row items-center justify-between gap-2">
                  <VemtapText variant="caption" tone="secondary">
                    {strings.urbanConversation.codeLabel}{' '}
                    <VemtapText className="font-sans-semibold text-text">
                      {linkedClaim.claimCode}
                    </VemtapText>
                  </VemtapText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={strings.urbanConversation.viewPass}
                    onPress={() => onViewPass?.(linkedClaim.id)}
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
        <View className="flex-row items-start gap-2 rounded-xl bg-surface-tint p-3 shadow-sm">
          <Icon name="lock" size={18} color={colors.primary} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="flex-1 leading-relaxed"
          >
            {strings.urbanConversation.securityFor(businessName)}
          </VemtapText>
        </View>
        {messagesQuery.isLoading ? (
          <LoadingState label={strings.common.loading} />
        ) : messagesQuery.isError ? (
          <ErrorState title={strings.common.error} onRetry={messagesQuery.refetch} />
        ) : (messagesQuery.data ?? []).length === 0 ? (
          <EmptyState variant="contained" icon="message" title={strings.common.empty} />
        ) : (
          (messagesQuery.data ?? []).map((message, index, all) => {
            const previous = all[index - 1];
            const iso = messageTimeOf(message);
            // The backend stamps INBOUND for what the customer wrote and
            // OUTBOUND for the merchant, so the customer is on the right.
            const sender = message.direction === 'INBOUND' ? 'customer' : 'merchant';
            return (
              <View key={message.id} className="gap-3">
                {startsNewDay(previous ? messageTimeOf(previous) : undefined, iso) ? (
                  <View className="my-1 items-center">
                    <VemtapText
                      variant="caption"
                      tone="secondary"
                      className="rounded-full bg-surface-container-low px-3 py-1 shadow-sm"
                    >
                      {dayLabel(iso)}
                    </VemtapText>
                  </View>
                ) : null}
                <ConversationBubble
                  message={message.content}
                  time={formatClock(iso)}
                  sender={sender}
                  isOwn={sender === 'customer'}
                  mediaUrl={message.mediaUrl ?? undefined}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      <ChatComposer
        testID="customer-chat-composer"
        value={draft}
        onChangeText={setDraft}
        onSend={send}
        quickReplies={strings.urbanConversation.quickReplies}
        onQuickReply={onQuickReply ?? setDraft}
        placeholder={strings.urbanConversation.placeholder}
        inputAccessibilityLabel={strings.urbanConversation.inputLabel}
        sendAccessibilityLabel={strings.urbanConversation.send}
        attachAccessibilityLabel={strings.urbanConversation.attachment}
        cameraAccessibilityLabel={strings.urbanConversation.camera}
        emojiAccessibilityLabel={strings.urbanConversation.emoji}
        emojiReactions={strings.urbanConversation.emojiReactions}
        onEmoji={onEmoji}
        onAttach={onAttachment ?? pickImage}
        onCamera={onCamera ?? takePhoto}
        isSending={sendReply.isPending}
        pendingMediaUrl={pendingMediaUrl}
        statusLabel={statusMessage}
        bottomInset={insets.bottom}
        keyboardInset={keyboardInset}
        onKeyboardDismiss={dismissKeyboard}
      />
    </View>
  );
}
