import React, { useCallback, useRef, useState } from 'react';
import {
  Clipboard,
  Image,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { strings } from '@constants/strings';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import type { AppStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'MerchantChat'>;

type Message = {
  id: string;
  text: string;
  time: string;
};

const merchantImage = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5EHdPBiqV-fejGdf7TrB-SpdnO9l8ryfjfECc9Msgcee0FrhjtKOsn2PseQB9YJKEEbOc85e66uibO6nAuUF6Waz3S9GzRgaIS0-3PD0OzNHLPujNJ926j0imnPdoI9TJMnq6JaYB0t966Cz-cZyMQrpIXpIbx5E3yMyVL08fy4b0CxhBVB-dsBgS0yaMcvCATo-54qmsimsTXjHs4U67SYR7MLASGIlfhXems1kWxMuZjNk3tpUerA',
};

const merchantThumbnail = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqx_chQxFA1JDezBmai9JKaK2_VSbVcWG08duHTy9WqIStdgSnRn6pcaz-5rHrhL1pgP9lY438PWJMvFXMaclxaL6e0Sy3PsldCXnXOqaU6fTRhjAM2JLQSuSfCZKOfBp9_RpV3csZb5vvbOyeLETSLCGFJ61C0C18Y37Yr4Z_IM012MMWw6T0K1JWaP53ulQqOLC6WWW4qGhB3beje45UjVg29rMTim6FMJ3yRGbjKEQ68j11aGrORg',
};

export function MerchantChatScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const streamRef = useRef<ScrollView>(null);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'customer-question',
      text: strings.merchantChat.customerMessageOne,
      time: strings.merchantChat.customerMessageOneTime,
    },
    {
      id: 'customer-thanks',
      text: strings.merchantChat.customerMessageTwo,
      time: strings.merchantChat.customerMessageTwoTime,
    },
  ]);

  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    setMessages(current => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        text,
        time: strings.merchantChat.sentAt,
      },
    ]);
    setDraft('');
    requestAnimationFrame(() => streamRef.current?.scrollToEnd({ animated: true }));
  }, [draft]);

  const selectSuggestion = useCallback((suggestion: string) => {
    setDraft(suggestion);
  }, []);

  const addEmoji = useCallback(() => {
    setDraft(current => `${current}${strings.merchantChat.emojiSample}`);
  }, []);

  const showCopied = useCallback(() => {
    Clipboard.setString(strings.merchantChat.voucherCode);
    setCopied(true);
    if (copyResetRef.current) {
      clearTimeout(copyResetRef.current);
    }
    copyResetRef.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 8 }]}
        className="bg-surface-canvas px-6"
      >
        <View className="min-w-0 flex-row items-center justify-between">
          <View className="min-w-0 flex-1 flex-row items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.merchantChat.goBack}
              hitSlop={8}
              className="-ml-2 h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-low"
              onPress={navigation.goBack}
            >
              <Icon name="back" size={24} color={colors.surfaceDark} />
            </Pressable>
            <View className="relative h-11 w-11 shrink-0">
              <Image
                accessibilityIgnoresInvertColors
                source={merchantImage}
                className="h-11 w-11 rounded-full bg-surface-container"
              />
              <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-success" />
            </View>
            <View className="ml-3 min-w-0 flex-1">
              <View className="min-w-0 flex-row items-center gap-1">
                <VemtapText variant="headingSm" numberOfLines={1} className="shrink">
                  {strings.merchantChat.merchantName}
                </VemtapText>
                <Icon name="verified" size={18} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-row items-center gap-1">
                <View className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                <VemtapText variant="caption" tone="success" className="font-sans-medium">
                  {strings.merchantChat.activeNow}
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  {strings.merchantChat.statusSeparator}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {strings.merchantChat.replyTime}
                </VemtapText>
              </View>
            </View>
          </View>
          <View className="ml-2 shrink-0 flex-row items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.merchantChat.callRestaurant}
              onPress={() => {
                Linking.openURL('tel:+2348023456789').catch(() => undefined);
              }}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-tint"
            >
              <Icon name="phone" size={22} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.merchantChat.moreOptions}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-tint"
            >
              <Icon name="more" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <View className="mt-3 rounded-xl bg-surface-container-low p-3 shadow-sm">
          <View className="min-w-0 flex-row items-start">
            <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
              <Icon name="voucher" size={20} color={colors.primary} />
            </View>
            <View className="ml-2 min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-1">
                <VemtapText variant="labelSm" className="shrink font-sans-semibold">
                  {strings.merchantChat.dealTitle}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  tone="success"
                  className="rounded-full bg-success-container px-1.5 py-0.5 font-sans-semibold"
                >
                  {strings.merchantChat.savings}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {strings.merchantChat.dealDetails}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.merchantChat.viewQr}
              onPress={() =>
                navigation.navigate('MyClaimedDeal', { dealId: route.params.dealId })
              }
              className="ml-2 flex-row items-center pt-0.5"
            >
              <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                {strings.merchantChat.viewQr}
              </VemtapText>
              <Icon name="qrCode" size={16} color={colors.primary} />
            </Pressable>
          </View>
          <View className="mt-3 flex-row items-center justify-between rounded-lg bg-surface px-3 py-1.5">
            <View className="min-w-0 flex-row items-center gap-1.5">
              <VemtapText variant="caption" tone="tertiary" className="uppercase">
                {strings.merchantChat.voucherCodeLabel}
              </VemtapText>
              <VemtapText
                variant="labelSm"
                className="font-sans-bold tracking-wider"
                selectable
              >
                {strings.merchantChat.voucherCode}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copied ? strings.merchantChat.copied : strings.merchantChat.copy
              }
              onPress={showCopied}
              className="flex-row items-center gap-1 px-1"
            >
              <Icon
                name={copied ? 'doneAll' : 'copy'}
                size={15}
                color={copied ? colors.badgeDiscountText : colors.primary}
              />
              <VemtapText
                variant="caption"
                tone={copied ? 'success' : 'brand'}
                className="font-sans-medium"
              >
                {copied ? strings.merchantChat.copied : strings.merchantChat.copy}
              </VemtapText>
            </Pressable>
          </View>
        </View>

        <View className="mb-2 mt-2 flex-row items-center gap-2 rounded-lg bg-surface-subtle px-3 py-1.5">
          <Icon name="verified" size={16} color={colors.primary} />
          <VemtapText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            className="shrink"
          >
            {strings.merchantChat.protectionNotice}
          </VemtapText>
        </View>
      </View>

      <ScrollView
        ref={streamRef}
        className="min-h-0 flex-1"
        contentContainerClassName="gap-4 px-6 py-3"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => streamRef.current?.scrollToEnd({ animated: false })}
      >
        <View className="my-1 items-center">
          <VemtapText
            variant="caption"
            tone="secondary"
            className="rounded-full bg-surface-container px-3 py-0.5 shadow-sm"
          >
            {strings.merchantChat.timeline}
          </VemtapText>
        </View>

        <View className="items-center">
          <View className="max-w-[85%] rounded-xl bg-surface-container-low px-3 py-2 shadow-sm">
            <View className="mb-0.5 flex-row items-center justify-center gap-1">
              <Icon name="voucher" size={16} color={colors.primary} />
              <VemtapText
                variant="labelSm"
                tone="brand"
                className="text-center font-sans-semibold"
              >
                {strings.merchantChat.voucherAttached}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary" className="text-center">
              {strings.merchantChat.voucherShared}
            </VemtapText>
          </View>
        </View>

        <View className="items-end gap-1 pl-10">
          <VemtapText
            variant="bodyMd"
            tone="inverse"
            className="max-w-full rounded-2xl rounded-tr-sm bg-primary p-3 shadow-md"
          >
            {messages[0]?.text}
          </VemtapText>
          <View className="flex-row items-center gap-1 pr-1">
            <VemtapText variant="caption" tone="tertiary">
              {messages[0]?.time}
            </VemtapText>
            <Icon name="doneAll" size={14} color={colors.primary} />
          </View>
        </View>

        <View className="items-start gap-1 pr-10">
          <View className="flex-row items-start">
            <Image
              accessibilityIgnoresInvertColors
              source={merchantThumbnail}
              className="mr-2 mt-1 h-8 w-8 shrink-0 rounded-full bg-surface-container"
            />
            <VemtapText
              variant="bodyMd"
              className="max-w-full rounded-2xl rounded-tl-sm bg-surface p-3 shadow-sm"
            >
              {strings.merchantChat.merchantMessageOne}
            </VemtapText>
          </View>
          <VemtapText variant="caption" tone="tertiary" className="pl-10">
            {strings.merchantChat.merchantMessageOneTime}
          </VemtapText>
        </View>

        <View className="items-start gap-1 pr-10">
          <View className="flex-row items-start">
            <View className="mr-2 mt-1 h-8 w-8 shrink-0" />
            <VemtapText
              variant="bodyMd"
              className="max-w-full rounded-2xl rounded-tl-sm bg-surface p-3 shadow-sm"
            >
              {strings.merchantChat.merchantMessageTwoPrefix}{' '}
              <VemtapText
                variant="labelSm"
                tone="brand"
                className="rounded bg-surface-tint px-1.5 py-0.5"
              >
                {strings.merchantChat.voucherCode}
              </VemtapText>{' '}
              {strings.merchantChat.merchantMessageTwoSuffix}
            </VemtapText>
          </View>
          <VemtapText variant="caption" tone="tertiary" className="pl-10">
            {strings.merchantChat.merchantMessageTwoTime}
          </VemtapText>
        </View>

        {messages.slice(1).map(message => (
          <View key={message.id} className="items-end gap-1 pl-10">
            <VemtapText
              variant="bodyMd"
              tone="inverse"
              className="max-w-full rounded-2xl rounded-tr-sm bg-primary p-3 shadow-md"
            >
              {message.text}
            </VemtapText>
            <View className="flex-row items-center gap-1 pr-1">
              <VemtapText variant="caption" tone="tertiary">
                {message.time}
              </VemtapText>
              <Icon name="doneAll" size={14} color={colors.textTertiary} />
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        className="gap-2 bg-surface-canvas px-6 pt-2"
        style={[navbarBottomShadow, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-2 py-1"
        >
          {strings.merchantChat.suggestions.map((suggestion, index) => (
            <Pressable
              key={suggestion}
              accessibilityRole="button"
              onPress={() => selectSuggestion(suggestion)}
              className="shrink-0 flex-row items-center gap-1 rounded-full bg-surface-subtle px-3 py-1.5 shadow-sm active:bg-surface-tint"
            >
              <VemtapText variant="labelSm" tone="secondary">
                {suggestion}
              </VemtapText>
              <VemtapText>{strings.merchantChat.suggestionEmoji[index]}</VemtapText>
            </Pressable>
          ))}
        </ScrollView>
        <View className="min-h-[52px] flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.merchantChat.addAttachment}
            className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container-low active:bg-surface-tint"
          >
            <Icon name="plus" size={22} color={colors.textSecondary} />
          </Pressable>
          <View className="min-w-0 flex-1 flex-row items-center rounded-full bg-surface-container-low px-3 py-1.5 focus-within:bg-surface">
            <TextInput
              accessibilityLabel={strings.merchantChat.messageLabel}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={sendMessage}
              placeholder={strings.merchantChat.messagePlaceholder}
              placeholderTextColor={colors.textTertiary}
              returnKeyType="send"
              blurOnSubmit={false}
              className="min-w-0 flex-1 px-1 font-sans text-body-md text-text"
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.merchantChat.addEmoji}
              hitSlop={8}
              onPress={addEmoji}
              className="p-1"
            >
              <Icon name="emoji" size={20} color={colors.textTertiary} />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.merchantChat.sendMessage}
            accessibilityState={{ disabled: !draft.trim() }}
            disabled={!draft.trim()}
            onPress={sendMessage}
            className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary shadow-md active:scale-95 disabled:opacity-50"
          >
            <Icon name="send" size={20} color={colors.surface} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    zIndex: 30,
  },
  input: {
    paddingVertical: 0,
  },
});
