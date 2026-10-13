import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@components/shared/EmptyState';
import { Icon, type IconName } from '@components/ui/Icon';
import { LoadingState } from '@components/shared/LoadingState';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { formatClock, messageTimeOf } from '@features/merchantChat/utils/messageTime';
import { uploadBusinessImage } from '@features/business/utils/uploadBusinessMedia';
import type { ChatMessage } from '@api/messagingApi';
import { BusinessHeader } from '@features/business/components/BusinessPrimitives';
import {
  ConversationBubble,
  bubbleStatusOf,
  type BubbleStatus,
} from '@features/merchantChat/components/ConversationBubble';
import { ChatComposer } from '@features/merchantChat/components/ChatComposer';
import { useKeyboardInset } from '@features/merchantChat/hooks/useKeyboardInset';
import { presenceCaption, usePresence } from '@features/merchantChat/hooks/usePresence';

const copy = strings.businessMessages;
const TYPING_IDLE_MS = 2_000;

export interface BusinessConversationMessage {
  id: string;
  sender: 'customer' | 'merchant';
  time: string;
  text: string;
  mediaUrl?: string;
  /** Receipt state for the merchant's own bubbles (sent/delivered/read). */
  status?: BubbleStatus;
}

/** API message → bubble view-model. */
export function toBusinessConversationMessage(
  message: ChatMessage,
): BusinessConversationMessage {
  return {
    id: message.id,
    // The backend stamps INBOUND for what the customer wrote and OUTBOUND for
    // the merchant, so the customer reads as the other party here.
    sender: message.direction === 'INBOUND' ? 'customer' : 'merchant',
    time: formatClock(messageTimeOf(message)),
    text: message.content,
    mediaUrl: message.mediaUrl ?? undefined,
    status: bubbleStatusOf(message.status),
  };
}

export interface BusinessConversationScreenProps {
  onBack: () => void;
  /** Thread record from the messages hub; falls back to generic copy when absent. */
  thread?: {
    name: string;
    time: string;
    context: string;
    contextIcon: IconName;
  };
  /** Customer on the other end; drives the header's online/last-seen line. */
  customerId?: string;
  /** Real messages, oldest first. `undefined` means "still loading". */
  messages?: BusinessConversationMessage[];
  isLoading?: boolean;
  isSending?: boolean;
  onTyping?: (isTyping: boolean) => void;
  onSend: (content: string) => void;
  /** Optional media send. Without it the attachment controls stay hidden. */
  onSendMedia?: (content: string, mediaUrl: string) => void;
}

/**
 * Business conversation — the single chat surface behind every thread row on the
 * Messages hub.
 *
 * Structurally the same as the customer view: a header, a transcript that takes
 * the remaining height, and a composer pinned outside it. Keeping the composer
 * out of the scrollable area is what stops the keyboard covering it on Android,
 * where the window shrinks but scrollable content does not.
 *
 * Messages and sending are owned by the navigator route (REST + socket); this
 * screen owns only the draft, so it stays testable (rule.md).
 */
export function BusinessConversationScreen({
  onBack,
  thread,
  customerId,
  messages,
  isLoading = false,
  isSending = false,
  onTyping,
  onSend,
  onSendMedia,
}: BusinessConversationScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draft, setDraft] = useState('');
  const [pendingMediaUrl, setPendingMediaUrl] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const { keyboardInset, isKeyboardVisible, dismissKeyboard } = useKeyboardInset();

  useEffect(
    () => () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    },
    [],
  );

  function handleDraftChange(text: string) {
    setDraft(text);
    onTyping?.(text.trim().length > 0);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => onTyping?.(false), TYPING_IDLE_MS);
  }

  const scrollToLatest = useCallback((animated: boolean) => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated }));
  }, []);

  // Covers the first load, an own send, and a socket-delivered arrival: all of
  // them change the transcript's content size.
  useEffect(() => {
    scrollToLatest(false);
  }, [messages?.length, scrollToLatest]);

  useEffect(() => {
    if (isKeyboardVisible) scrollToLatest(true);
  }, [isKeyboardVisible, scrollToLatest]);

  function send() {
    const text = draft.trim();
    if (isSending || uploadingMedia) return;
    if (pendingMediaUrl) {
      if (onSendMedia) onSendMedia(text, pendingMediaUrl);
      setPendingMediaUrl(null);
    } else if (text) {
      onSend(text);
    } else {
      return;
    }
    setDraft('');
    onTyping?.(false);
    scrollToLatest(true);
  }

  /**
   * Business media reuses `POST /uploads`, which merchants already hold the role
   * to use, rather than a second customer-only endpoint.
   */
  const attachPickedImage = useCallback(
    async (file: { uri: string; fileName?: string | null; mimeType?: string }) => {
      setUploadingMedia(true);
      try {
        const url = await uploadBusinessImage({
          fileUri: file.uri,
          fileName: file.fileName ?? `chat-photo-${Date.now()}.jpg`,
          mimeType: file.mimeType ?? 'image/jpeg',
        });
        if (url) setPendingMediaUrl(url);
      } catch {
        // Keep the draft; a failed upload must not swallow what was typed.
      } finally {
        setUploadingMedia(false);
      }
    },
    [],
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

  const { quickReplies } = copy.conversation;

  // Is the customer holding a socket right now? Without a customerId there is
  // no channel to watch, so the header keeps the static copy it had before.
  const { userPresence } = usePresence(customerId ? { userIds: [customerId] } : {});
  const presence = customerId ? userPresence(customerId) : undefined;
  const subtitle =
    presence && !presence.isOnline
      ? presenceCaption(presence, {
          activeNow: strings.presence.activeNow,
          offline: strings.presence.offline,
          lastSeenPrefix: strings.presence.lastSeenPrefix,
        })
      : copy.online;

  return (
    // Lifted by the measured keyboard inset rather than a
    // `KeyboardAvoidingView`, for the same reasons as the customer chat.
    <View className="flex-1 bg-background">
      <View className="w-full bg-surface" style={{ paddingTop: Math.max(insets.top, 8) }}>
        <BusinessHeader
          title={thread?.name ?? copy.customerFallback}
          onBack={onBack}
          titleVariant="headingSm"
          subtitle={subtitle}
          showAvatar={true}
        />
        <View className="px-6 pb-3">
          <View
            className="flex-row items-center justify-between gap-2 rounded-card bg-surface-container-low px-3 py-2"
            accessible
            accessibilityLabel={copy.conversation.contextLabel}
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              {thread ? (
                <Icon name={thread.contextIcon} size={15} color={colors.primary} />
              ) : null}
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 flex-1"
                numberOfLines={1}
              >
                {thread?.context ?? ''}
              </VemtapText>
            </View>
            {thread?.time ? (
              <VemtapText
                variant="micro"
                tone="tertiary"
                className="shrink-0"
                numberOfLines={1}
              >
                {thread.time}
              </VemtapText>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="gap-2.5 px-6 pb-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollToLatest(false)}
        accessibilityLabel={copy.conversation.transcriptLabel}
      >
        {isLoading ? (
          <LoadingState label={strings.common.loading} />
        ) : !messages || messages.length === 0 ? (
          <EmptyState
            variant="contained"
            title={copy.conversation.emptyTitle}
            description={copy.conversation.emptyBody}
          />
        ) : (
          messages.map(message => (
            <ConversationBubble
              key={message.id}
              message={message.text}
              time={message.time}
              sender={message.sender}
              // The merchant is the one reading this screen, so its own reply
              // (OUTBOUND → 'merchant') is the message on the right.
              isOwn={message.sender === 'merchant'}
              mediaUrl={message.mediaUrl}
              status={message.status}
            />
          ))
        )}
      </ScrollView>

      <ChatComposer
        value={draft}
        onChangeText={handleDraftChange}
        onSend={send}
        quickReplies={quickReplies}
        quickRepliesLabel={copy.conversation.quickRepliesLabel}
        onQuickReply={handleDraftChange}
        placeholder={copy.conversation.composerPlaceholder}
        inputAccessibilityLabel={copy.conversation.composerPlaceholder}
        sendAccessibilityLabel={copy.conversation.sendHint}
        attachAccessibilityLabel={copy.conversation.attachLabel}
        cameraAccessibilityLabel={copy.conversation.cameraLabel}
        emojiAccessibilityLabel={strings.urbanConversation.emoji}
        emojiReactions={strings.urbanConversation.emojiReactions}
        onAttach={onSendMedia ? pickImage : undefined}
        onCamera={onSendMedia ? takePhoto : undefined}
        isSending={isSending || uploadingMedia}
        pendingMediaUrl={pendingMediaUrl}
        statusLabel={statusMessage}
        bottomInset={insets.bottom}
        keyboardInset={keyboardInset}
        onKeyboardDismiss={dismissKeyboard}
        testID="business-chat-composer"
      />
    </View>
  );
}
