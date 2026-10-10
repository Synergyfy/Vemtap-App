import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { useDiscoverBusinesses } from '@features/discover/hooks/useDiscoverBusinesses';
import { useStartCustomerConversation } from '@features/merchantChat/hooks/useCustomerMessaging';
import { publicBusinessApi } from '@api/publicBusinessApi';
import type { StartConversationSubject } from '@api/messagingApi';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

const copy = strings.messagesHub.composeSheet;

/** What the conversation is about, offered as chips in the sheet. */
const SUBJECTS: readonly {
  key: StartConversationSubject;
  label: string;
  icon: IconName;
}[] = [
  { key: 'GENERAL', label: copy.subjects.general, icon: 'message' },
  { key: 'DEAL', label: copy.subjects.deal, icon: 'localOffer' },
  { key: 'BOOKING', label: copy.subjects.booking, icon: 'schedule' },
  { key: 'CLAIM', label: copy.subjects.claim, icon: 'loyalty' },
  { key: 'ORDER', label: copy.subjects.order, icon: 'shoppingBag' },
];

export interface ComposeMessageSheetProps {
  visible: boolean;
  onClose: () => void;
  onSent?: (threadId: string | null) => void;
}

/**
 * Start a conversation with a business.
 *
 * The subject is the point of this sheet: the Messages filter chips read the
 * thread's `subjectType`, and it can only be set when the thread is created.
 * A conversation begun without one lands under "All" and nowhere else.
 */
export function ComposeMessageSheet({
  visible,
  onClose,
  onSent,
}: ComposeMessageSheetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState<StartConversationSubject>('GENERAL');
  const [message, setMessage] = useState('');

  const { data: businesses } = useDiscoverBusinesses(undefined, 20);
  const startConversation = useStartCustomerConversation();
  const selected = (businesses ?? []).find(item => item.id === selectedId) ?? null;
  const trimmed = message.trim();
  const canSend = Boolean(selected?.branchCode) && trimmed.length > 0;

  const reset = () => {
    setSelectedId(null);
    setSubject('GENERAL');
    setMessage('');
  };

  const [pendingBranch, setPendingBranch] = useState<string | null>(null);

  const send = async () => {
    if (!selected || !trimmed || pendingBranch) return;
    try {
      // `POST /threads/start` is keyed by branch id; the feed only hands out the
      // branch's 9-character code, so resolve it first.
      const branch = await publicBusinessApi.getBranchByCode(selected.branchCode);
      setPendingBranch(branch.id);
      startConversation.mutate(
        { branchId: branch.id, content: trimmed, subjectType: subject },
        {
          onSuccess: () => {
            onSent?.(null);
            reset();
            onClose();
          },
        },
      );
    } catch {
      // Leave the sheet open so the message is not lost to a failed lookup.
    } finally {
      setPendingBranch(null);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={copy.title}>
      <View className="gap-4 pb-2">
        <View className="gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.businessLabel}
          </VemtapText>
          {(businesses ?? []).length === 0 ? (
            <VemtapText variant="caption" tone="tertiary">
              {copy.noBusinesses}
            </VemtapText>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {(businesses ?? []).map(item => {
                const isPicked = item.id === selectedId;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isPicked }}
                    onPress={() => setSelectedId(item.id)}
                    className={cn(
                      'min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-full px-3',
                      selected ? 'bg-primary' : 'bg-surface-container-low',
                    )}
                  >
                    <Icon
                      name="storefront"
                      size={15}
                      color={selected ? colors.surface : colors.textSecondary}
                    />
                    <VemtapText
                      variant="labelSm"
                      numberOfLines={1}
                      className={selected ? 'text-primary-foreground' : 'text-text'}
                    >
                      {item.name}
                    </VemtapText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View className="gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.subjectLabel}
          </VemtapText>
          <View className="flex-row flex-wrap gap-2">
            {SUBJECTS.map(item => {
              const isPicked = item.key === subject;
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isPicked }}
                  onPress={() => setSubject(item.key)}
                  className={cn(
                    'min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-full px-3',
                    selected ? 'bg-primary' : 'bg-surface-container-low',
                  )}
                >
                  <Icon
                    name={item.icon}
                    size={15}
                    color={selected ? colors.surface : colors.textSecondary}
                  />
                  <VemtapText
                    variant="labelSm"
                    numberOfLines={1}
                    className={selected ? 'text-primary-foreground' : 'text-text'}
                  >
                    {item.label}
                  </VemtapText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.messageLabel}
          </VemtapText>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={copy.messagePlaceholder}
            multiline
            numberOfLines={3}
            accessibilityLabel={copy.messageLabel}
          />
        </View>

        <Button
          label={copy.send}
          disabled={!canSend || Boolean(pendingBranch) || startConversation.isPending}
          onPress={send}
          className="min-h-[48px]"
        />
        <VemtapText variant="caption" tone="tertiary" className="text-center">
          {copy.subjectHint}
        </VemtapText>
      </View>
    </BottomSheet>
  );
}
