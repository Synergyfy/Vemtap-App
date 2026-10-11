import React, { useRef } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSubmitEditingEventData,
} from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import {
  composerLift,
  composerPaddingBottom,
  useKeyboardInset,
} from '@features/merchantChat/hooks/useKeyboardInset';

export interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  quickReplies: readonly string[];
  /** Visible caption above the rail. Omitted where the chips speak for themselves. */
  quickRepliesLabel?: string;
  /** Tapping a quick reply fills the draft so it can be edited before sending. */
  onQuickReply: (reply: string) => void;
  placeholder: string;
  inputAccessibilityLabel: string;
  sendAccessibilityLabel: string;
  attachAccessibilityLabel: string;
  cameraAccessibilityLabel: string;
  emojiAccessibilityLabel: string;
  emojiReactions?: readonly string[];
  onEmoji?: (emoji: string) => void;
  onAttach?: () => void;
  onCamera?: () => void;
  /** Blocks sending (e.g. an in-flight request) without greying the whole bar. */
  isSending?: boolean;
  /** Mirrors the merchant's "typing" state back to the thread. */
  onTyping?: (isTyping: boolean) => void;
  /** Shown under the bar while an upload or send is in flight. */
  statusLabel?: string;
  /** Hosted image preview for the attachment being composed. */
  pendingMediaUrl?: string | null;
  bottomInset: number;
  /**
   * How far to lift the bar so the keyboard cannot cover it — see
   * `useKeyboardInset`, which measures it. `0` leaves the bar resting on the
   * home-indicator inset.
   */
  keyboardInset?: number;
  /**
   * Called when the input loses focus, to clear the lift. A keyboard event is
   * not guaranteed on every dismissal — iOS skips `keyboardWillHide` when a
   * gesture takes the keyboard away — and without this the bar stayed lifted.
   */
  onKeyboardDismiss?: () => void;
  testID?: string;
}

/**
 * The chat composer shared by the customer and merchant conversation screens.
 *
 * Both surfaces are a transcript plus a pinned composer, so the input, the send
 * button and the quick-reply rail live here once — a keyboard fix or a spacing
 * tweak applies to both instead of drifting apart.
 *
 * Sizing is deliberate rather than intrinsic: the row has a fixed height and the
 * field stretches to fill it, so the bar cannot be squeezed by the keyboard
 * avoiding view (the symptom on iOS) and the touch targets stay 44pt.
 */
export function ChatComposer({
  value,
  onChangeText,
  onSend,
  quickReplies,
  quickRepliesLabel,
  onQuickReply,
  placeholder,
  inputAccessibilityLabel,
  sendAccessibilityLabel,
  attachAccessibilityLabel,
  cameraAccessibilityLabel,
  emojiAccessibilityLabel,
  emojiReactions,
  onEmoji,
  onAttach,
  onCamera,
  isSending = false,
  onTyping,
  statusLabel,
  pendingMediaUrl,
  bottomInset,
  keyboardInset = 0,
  onKeyboardDismiss,
  testID,
}: ChatComposerProps) {
  const inputRef = useRef<TextInput>(null);
  const isKeyboardOpen = keyboardInset > 0;
  const lift = composerLift(keyboardInset);

  const handleSubmit = (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    event.nativeEvent?.text !== undefined && onTyping?.(false);
    onSend();
  };

  const insertEmoji = (emoji: string) => {
    onChangeText(`${value}${emoji}`);
    onTyping?.(`${value}${emoji}`.trim().length > 0);
    // Keep focus so the tray behaves like a keyboard, not a modal.
    inputRef.current?.focus();
  };

  const hasDraft = value.trim().length > 0;
  const canSend = hasDraft && !isSending;
  const hasMedia = Boolean(pendingMediaUrl);

  return (
    <View
      testID={testID}
      className="gap-2 bg-surface px-6 pt-2"
      style={[
        navbarBottomShadow,
        {
          // Lifted by exactly the keyboard's height, so the card's bottom edge
          // sits directly on the keyboard. The space the bar vacates is the
          // keyboard itself, so it shows the page behind it either way.
          marginBottom: lift > 0 ? lift : undefined,
          // Padding inside the card, so the field keeps daylight above the
          // keyboard instead of resting hard against it.
          paddingBottom: composerPaddingBottom(isKeyboardOpen, bottomInset),
        },
      ]}
    >
      {quickReplies.length > 0 ? (
        <>
          {quickRepliesLabel ? (
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {quickRepliesLabel}
            </VemtapText>
          ) : null}
          <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-2 py-1"
        >
          {quickReplies.map(reply => (
            <Pressable
              key={reply}
              accessibilityRole="button"
              accessibilityLabel={reply}
              onPress={() => onQuickReply(reply)}
              className="shrink-0 rounded-full bg-surface px-3 py-2 shadow-sm active:bg-surface-tint"
            >
              <VemtapText variant="labelSm">{reply}</VemtapText>
            </Pressable>
          ))}
          </ScrollView>
        </>
      ) : null}

      {emojiReactions && emojiReactions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerClassName="gap-1 py-0.5"
        >
          {emojiReactions.map(emoji => (
            <Pressable
              key={emoji}
              accessibilityRole="button"
              accessibilityLabel={`Add ${emoji}`}
              onPress={() => insertEmoji(emoji)}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-surface-container"
            >
              <VemtapText className="text-heading-md">{emoji}</VemtapText>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {hasMedia ? (
        <View className="flex-row items-center gap-2 rounded-xl bg-surface-container-low p-2">
          <Image
            source={{ uri: pendingMediaUrl as string }}
            className="h-14 w-14 rounded-lg bg-surface-container"
          />
          <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
            {statusLabel}
          </VemtapText>
        </View>
      ) : statusLabel ? (
        <VemtapText variant="caption" tone="tertiary">
          {statusLabel}
        </VemtapText>
      ) : null}

      {/* Fixed height: the bar must not shrink when the keyboard resizes it. */}
      <View className="h-[52px] flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={attachAccessibilityLabel}
          onPress={onAttach}
          disabled={!onAttach}
          className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container-low disabled:opacity-40"
        >
          <Icon name="plus" size={22} color={colors.textSecondary} />
        </Pressable>

        <View className="min-w-0 flex-1 flex-row items-center rounded-full bg-surface-container-low px-3">
          <TextInput
            ref={inputRef}
            accessibilityLabel={inputAccessibilityLabel}
            value={value}
            onChangeText={text => {
              onChangeText(text);
              onTyping?.(text.trim().length > 0);
            }}
            onBlur={onKeyboardDismiss}
            onSubmitEditing={handleSubmit}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            returnKeyType="send"
            multiline={false}
            className="h-[52px] min-w-0 flex-1 py-0 font-sans text-body-md text-text"
          />
          {onEmoji ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={emojiAccessibilityLabel}
              onPress={() => insertEmoji(emojiReactions?.[0] ?? '❤️')}
              hitSlop={8}
            >
              <Icon name="emoji" size={20} color={colors.textTertiary} />
            </Pressable>
          ) : null}
          {onCamera ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cameraAccessibilityLabel}
              onPress={onCamera}
              hitSlop={8}
              className="ml-1"
            >
              <Icon name="localMall" size={19} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={sendAccessibilityLabel}
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={onSend}
          className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary shadow-md active:scale-95 disabled:opacity-50"
        >
          <Icon name={isSending ? 'history' : 'send'} size={22} color={colors.surface} />
        </Pressable>
      </View>
    </View>
  );
}