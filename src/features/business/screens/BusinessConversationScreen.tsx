import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/shared/EmptyState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessSelectionChip,
} from '@features/business/components/BusinessPrimitives';
import { FieldInput } from '@features/business/components/BusinessSetupPrimitives';
import { ConversationBubble } from '@features/merchantChat/components/ConversationBubble';

const copy = strings.businessMessages;

export type BusinessThreadId = keyof typeof copy.conversation.transcripts;

export interface BusinessConversationScreenProps {
  /** Thread id from `strings.businessMessages.threads`. */
  threadId: string;
  onBack: () => void;
  /** Thread record from the messages hub; falls back to the copy when absent. */
  thread?: {
    name: string;
    time: string;
    context: string;
    contextIcon:
      'localOffer' | 'receipt' | 'inventory' | 'eventAvailable' | 'help' | 'spa';
  };
}

interface SentMessage {
  id: string;
  sender: 'customer' | 'merchant';
  time: string;
  text: string;
}

function clockLabel(): string {
  return new Date().toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Business conversation — the single chat surface behind every thread row on the
 * Messages hub.
 *
 * One screen serves all six threads (the same approach the consumer chat uses):
 * the thread id selects the transcript, so there is no per-conversation screen
 * variant to keep in sync (AGENTS rule 17). Bubbles come from the shared
 * `ConversationBubble`, not a second bubble implementation.
 */
export function BusinessConversationScreen({
  threadId,
  onBack,
  thread,
}: BusinessConversationScreenProps) {
  const transcript =
    copy.conversation.transcripts[
      (threadId as BusinessThreadId) in copy.conversation.transcripts
        ? (threadId as BusinessThreadId)
        : 'tunde'
    ];
  const seeded = useMemo<{ name: string; time: string; context: string }>(
    () => ({
      name: thread?.name ?? 'Customer',
      time: thread?.time ?? '',
      context: thread?.context ?? '',
    }),
    [thread],
  );
  const [messages, setMessages] = useState<SentMessage[]>(() =>
    transcript.messages.map(message => ({ ...message })),
  );
  const [draft, setDraft] = useState('');

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages(current => [
      ...current,
      { id: `local-${current.length}`, sender: 'merchant', time: clockLabel(), text },
    ]);
    setDraft('');
  }

  return (
    <BusinessScreenLayout
      header={{
        title: seeded.name,
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
            {seeded.context}
          </VemtapText>
        </View>
        {seeded.time ? (
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="shrink-0"
            numberOfLines={1}
          >
            {seeded.time}
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
        <VemtapText variant="micro" tone="tertiary" className="self-center text-center">
          {transcript.intro}
        </VemtapText>
        {messages.length === 0 ? (
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
              onChangeText={setDraft}
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
            leftIcon={<Icon name="send" size={16} color={colors.surface} />}
            onPress={send}
          />
        </View>
      </View>
    </BusinessScreenLayout>
  );
}
