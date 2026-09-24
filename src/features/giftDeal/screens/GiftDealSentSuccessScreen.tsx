import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clipboard, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { dealsGrid } from '@features/deals/data/dealsFeed';
import type { AppStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });

const CLAIM_CODE = '#VT-GIFT-83921';

type Props = NativeStackScreenProps<AppStackParamList, 'GiftDealSentSuccess'>;

export function GiftDealSentSuccessScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);
  const deal = dealsGrid.find(item => item.id === route.params.dealId) ?? dealsGrid[0];
  const recipientName = `${route.params.recipient.firstName} ${route.params.recipient.lastName}`;
  const copy = strings.giftSuccess;

  useEffect(
    () => () => {
      if (copyResetTimer.current) {
        clearTimeout(copyResetTimer.current);
      }
    },
    [],
  );

  const handleCopy = useCallback(() => {
    Clipboard.setString(CLAIM_CODE);
    setCopied(true);
    if (copyResetTimer.current) {
      clearTimeout(copyResetTimer.current);
    }
    copyResetTimer.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleDone = useCallback(() => {
    navigation.navigate('Tabs', { screen: 'Deals' });
  }, [navigation]);

  const handleSendAnother = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-surface">
        <View
          className="h-16 flex-row items-center justify-between px-6"
          style={navbarBottomShadow}
        >
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <Icon name="localMall" size={20} color={colors.surface} />
            </View>
            <VemtapText
              variant="headingSm"
              className="min-w-0 text-heading-sm text-text"
              numberOfLines={1}
            >
              {copy.headerTitle}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.notifications}
              className="h-11 w-11 items-center justify-center rounded-full"
            >
              <Icon name="notifications" size={24} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.avatar}
              className="h-8 w-8 items-center justify-center rounded-full bg-primary"
            >
              <Icon name="person" size={18} color={colors.surface} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full px-6 py-6">
          <View className="items-center text-center">
            <View className="relative mb-4 h-24 w-24 items-center justify-center">
              <View className="absolute h-24 w-24 rounded-full bg-primary/10" />
              <View className="h-20 w-20 items-center justify-center rounded-full bg-surface-tint-blue shadow-sm">
                <Icon name="localOffer" size={40} color={colors.primaryContainer} />
              </View>
              <View className="absolute -right-1 -top-1 h-7 w-7 items-center justify-center rounded-full bg-badge-discount-bg shadow-sm">
                <Icon name="check" size={18} color={colors.badgeDiscountText} />
              </View>
            </View>
            <VemtapText
              accessibilityRole="header"
              variant="headingXl"
              className="mb-1 text-center text-heading-xl text-text"
            >
              {copy.title}
            </VemtapText>
            <VemtapText className="max-w-xs text-center text-body-md text-text-secondary">
              {copy.instructionsPrefix}{' '}
              <VemtapText className="font-sans-medium text-body-md text-text">
                {recipientName}
              </VemtapText>{' '}
              (
              <VemtapText className="text-text">
                {route.params.recipient.email}
              </VemtapText>
              ).
            </VemtapText>
          </View>

          <View className="mt-6 overflow-hidden rounded-xl bg-surface-canvas shadow-md">
            <View className="flex-row items-center gap-3 bg-surface-container-low p-4">
              <View className="h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-fixed">
                <Icon name="restaurant" size={24} color={colors.onSecondaryFixed} />
              </View>
              <View className="min-w-0 flex-1">
                <View className="mb-1 flex-row flex-wrap items-center gap-1">
                  <VemtapText className="rounded-full bg-badge-discount-bg px-1 py-0.5 font-sans-semibold text-caption text-badge-discount-text">
                    {deal.leftBadge.label}
                  </VemtapText>
                  <VemtapText className="text-caption text-text-tertiary">
                    {copy.giftVoucher}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="headingSm"
                  className="text-heading-sm text-text"
                  numberOfLines={1}
                >
                  {deal.title}
                </VemtapText>
                <VemtapText
                  className="text-caption text-text-secondary"
                  numberOfLines={1}
                >
                  {deal.merchant}
                </VemtapText>
              </View>
            </View>

            <View className="gap-4 p-4">
              <View className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-subtle px-3 py-2">
                <View className="min-w-0 flex-1">
                  <VemtapText className="text-caption uppercase tracking-wider text-text-tertiary">
                    {copy.claimCodeReserved}
                  </VemtapText>
                  <VemtapText className="font-sans-medium text-button-md tracking-wide text-text">
                    {CLAIM_CODE}
                  </VemtapText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copied ? copy.copied : copy.copy}
                  onPress={handleCopy}
                  className="shrink-0 flex-row items-center gap-1 rounded-lg bg-surface-tint-blue px-3 py-1.5 active:scale-95"
                >
                  <Icon name="copy" size={16} color={colors.primaryContainer} />
                  <VemtapText className="text-label-sm text-primary-container">
                    {copied ? copy.copied : copy.copy}
                  </VemtapText>
                </Pressable>
              </View>

              <View className="flex-row items-start gap-3">
                <View className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg">
                  <Icon name="send" size={18} color={colors.badgeDiscountText} />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText className="text-label-md text-text">
                    {copy.verificationDispatched}
                  </VemtapText>
                  <VemtapText className="text-caption text-text-secondary">
                    {copy.verificationDescription}
                  </VemtapText>
                </View>
              </View>

              <View className="flex-row items-start gap-3 rounded-lg bg-surface-container-low p-3">
                <Icon name="schedule" size={20} color={colors.primaryContainer} />
                <VemtapText className="min-w-0 flex-1 text-caption leading-relaxed text-text-secondary">
                  {copy.redemptionNotice}
                </VemtapText>
              </View>
            </View>
          </View>

          <View className="mt-6 gap-3">
            <Button
              label={copy.done}
              onPress={handleDone}
              className="h-[52px] shadow-md"
            />
            <Button
              label={copy.sendAnotherDeal}
              variant="ghost"
              onPress={handleSendAnother}
              leftIcon={<Icon name="localOffer" size={18} color={colors.textSecondary} />}
              className="h-11"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
