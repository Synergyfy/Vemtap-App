import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/shared/EmptyState';
import { Icon, type IconName } from '@components/ui/Icon';
import { LoadingState } from '@components/shared/LoadingState';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { formatWhen } from '@utils/formatters';
import type { ChatMessage } from '@api/messagingApi';
import {
  BusinessScreenLayout,
  BusinessSelectionChip,
} from '@features/business/components/BusinessPrimitives';
import { FieldInput } from '@features/business/components/BusinessSetupPrimitives';
import { ConversationBubble } from '@features/merchantChat/components/ConversationBubble';

const copy = strings.businessMessages;
const TYPING_IDLE_MS = 2_000;

export interface BusinessConversationMessage {
  id: string;
  sender: 'customer' | 'merchant';
  time: string;
  text: string;
}

/** API message → bubble view-model. */
export function toBusinessConversationMessage(
  message: ChatMessage,
): BusinessConversationMessage {
  return {
    id: message.id,
    sender: message.direction === 'INBOUND' ? 'customer' : 'merchant',
    time: message.timestamp ? formatWhen(message.timestamp) : '',
    text: message.content,
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
  /** Real messages, oldest first. `undefined` means "still loading". */
  messages?: BusinessConversationMessage[];
  isLoading?: boolean;
  isSending?: boolean;
  onTyping?: (isTyping: boolean) => void;
  onSend: (content: string) => void;
}

/**
 * Business conversation — the single chat surface behind every thread row on the
 * Messages hub.
 *
 * Messages and sending are owned by the navigator route (REST + socket); this
 * screen owns only the draft, so it stays testable (rule.md).
 */
export function BusinessConversationScreen({
  onBack,
  thread,
  messages,
  isLoading = false,
  isSending = false,
  onTyping,
  onSend,
}: BusinessConversationScreenProps) {
  const [draft, setDraft] = useState('');
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function send() {
    const text = draft.trim();
    if (!text || isSending) return;
    onSend(text);
    setDraft('');
    onTyping?.(false);
  }

  return (
    <BusinessScreenLayout
      header={{
        title: thread?.name ?? copy.customerFallback,
        onBack,
        titleVariant: 'headingSm',
        subtitle: copy.online,
        showAvatar: true,
      }}
      contentContainerClassName="flex-1 gap-3 pb-4"
    >
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

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2.5 pb-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            />
          ))
        )}
      </ScrollView>

      <View className="gap-2">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.conversation.quickRepliesLabel}
          </VemtapText>
          {copy.conversation.quickReplies.map(reply => (
            <BusinessSelectionChip
              key={reply}
              label={reply}
              selected={draft === reply}
              onPress={() => setDraft(reply)}
            />
          ))}
        </View>
        <View className="flex-row items-center gap-2">
          <View className="min-w-0 flex-1">
            <FieldInput
              value={draft}
              onChangeText={handleDraftChange}
              placeholder={copy.conversation.composerPlaceholder}
              accessibilityLabel={copy.conversation.composerPlaceholder}
            />
          </View>
          <Button
            label={copy.conversation.sendLabel}
            labelVariant="labelSm"
            size="sm"
            fullWidth={false}
            accessibilityLabel={copy.conversation.sendHint}
            className="min-h-[44px]"
            loading={isSending}
            leftIcon={<Icon name="send" size={16} color={colors.surface} />}
            onPress={send}
          />
        </View>
      </View>
    </BusinessScreenLayout>
  );
}
