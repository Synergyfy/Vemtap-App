import React, { useCallback, useEffect, useState } from 'react';
import { Clipboard, Image, Pressable, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { dealsGrid } from '@features/deals/data/dealsFeed';
import type { AppStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'DealClaimedSuccess'>;

export function DealClaimedSuccessScreen({ route, navigation }: Props) {
  const [copied, setCopied] = useState(false);
  const deal = dealsGrid.find(item => item.id === route.params.dealId) ?? dealsGrid[0];

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(() => {
    Clipboard.setString('VT-48291');
    setCopied(true);
  }, []);
  const handleViewDeal = useCallback(
    () => navigation.navigate('MyClaimedDeal', { dealId: deal.id }),
    [deal.id, navigation],
  );
  const handleContinue = useCallback(
    () => navigation.navigate('Tabs', { screen: 'Deals' }),
    [navigation],
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="flex-grow px-6 pb-6 pt-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative mx-auto w-full max-w-screen flex-1 self-center">
          <View className="mb-5 mt-3 items-center">
            <View className="h-40 w-40 items-center justify-center">
              <View className="absolute h-36 w-36 rounded-full bg-surface-tint opacity-60" />
              <View className="absolute h-28 w-28 rounded-full bg-primary opacity-10" />
              <View className="absolute right-0 top-0">
                <Icon name="backIos" size={25} color={colors.primary} />
              </View>
              <View className="absolute left-1 top-7">
                <Icon name="autoAwesome" size={16} color={colors.primary} />
              </View>
              <View className="absolute bottom-3 left-3">
                <Icon name="star" size={18} color={colors.secondary} />
              </View>
              <LinearGradient
                colors={[colors.primary, colors.primaryContainer]}
                className="h-20 w-20 items-center justify-center rounded-full"
              >
                <View className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-sm">
                  <Icon name="check" size={40} color={colors.surface} />
                </View>
              </LinearGradient>
            </View>

            <VemtapText
              accessibilityRole="header"
              variant="headingXl"
              className="text-heading-xl text-text"
            >
              {strings.claimSuccess.title}
            </VemtapText>
            <VemtapText
              variant="bodyMd"
              tone="secondary"
              className="mt-1 max-w-[300px] text-center leading-relaxed"
            >
              {strings.claimSuccess.subtitle}
            </VemtapText>
          </View>

          <View className="mb-4 overflow-hidden rounded-2xl bg-surface shadow-xl">
            <View className="p-4 pb-3">
              <View className="mb-3 flex-row items-center justify-between gap-2">
                <View className="min-w-0 flex-row items-center gap-1.5 self-start rounded-full bg-badge-discount-bg px-3 py-1">
                  <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold uppercase tracking-wider text-badge-discount-text"
                  >
                    {strings.claimSuccess.activeClaim}
                  </VemtapText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    copied ? strings.claimSuccess.copied : strings.claimSuccess.claimCode
                  }
                  onPress={handleCopy}
                  className="min-w-0 flex-row items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-1 active:bg-surface-container-highest"
                >
                  <VemtapText
                    variant="labelSm"
                    className="shrink font-sans-semibold text-text"
                    numberOfLines={1}
                  >
                    {copied
                      ? strings.claimSuccess.copied
                      : strings.claimSuccess.claimCode}
                  </VemtapText>
                  <Icon
                    name={copied ? 'check' : 'copy'}
                    size={14}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              <View className="mt-1 flex-row items-start gap-3">
                <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest shadow-sm">
                  <Icon name="restaurant" size={24} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold text-text"
                    numberOfLines={1}
                  >
                    {strings.claimSuccess.merchant}
                  </VemtapText>
                  <VemtapText
                    variant="headingSm"
                    className="font-sans-bold text-primary"
                    numberOfLines={2}
                  >
                    {strings.claimSuccess.offer}
                  </VemtapText>
                  <View className="mt-0.5 flex-row items-center gap-1">
                    <Icon name="locationOn" size={14} color={colors.textSecondary} />
                    <VemtapText
                      variant="caption"
                      tone="secondary"
                      className="min-w-0 flex-1"
                      numberOfLines={1}
                    >
                      {strings.claimSuccess.location}
                    </VemtapText>
                  </View>
                </View>
              </View>
            </View>

            <View className="h-6 flex-row items-center justify-between bg-surface">
              <View className="-ml-2 h-6 w-4 rounded-r-full bg-background shadow-sm" />
              <View className="mx-2 flex-1 border-t-2 border-dashed border-outline-variant opacity-60" />
              <View className="-mr-2 h-6 w-4 rounded-l-full bg-background shadow-sm" />
            </View>

            <View className="gap-3 p-4 pt-1">
              <View className="flex-row gap-2 pt-1">
                <View className="min-w-0 flex-1">
                  <VemtapText variant="caption" tone="tertiary">
                    {strings.claimSuccess.dealPrice}
                  </VemtapText>
                  <VemtapText
                    variant="headingMd"
                    className="mt-0.5 font-sans-bold text-text"
                  >
                    {deal.price}
                  </VemtapText>
                  <VemtapText
                    variant="caption"
                    className="font-sans-medium text-badge-discount-text"
                  >
                    {deal.save}
                  </VemtapText>
                </View>
                <View className="min-w-0 flex-1 items-end">
                  <VemtapText variant="caption" tone="tertiary">
                    {strings.claimSuccess.validity}
                  </VemtapText>
                  <VemtapText
                    variant="labelMd"
                    className="mt-0.5 font-sans-semibold text-text"
                  >
                    20 Sep 2025
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {strings.claimSuccess.oneTime}
                  </VemtapText>
                </View>
              </View>

              <View className="mt-1 h-24 overflow-hidden rounded-xl">
                <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', colors.surfaceDark]}
                  locations={[0.35, 1]}
                  className="absolute inset-x-0 bottom-0 h-14 items-start justify-end p-2"
                >
                  <View className="flex-row items-center gap-1.5">
                    <Icon name="storefront" size={13} color={colors.surface} />
                    <VemtapText
                      variant="caption"
                      className="font-sans-medium text-surface"
                    >
                      {strings.claimSuccess.dineInTakeaway}
                    </VemtapText>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </View>

          <View className="mb-5 flex-row items-start gap-2 rounded-xl bg-surface-tint-blue p-3">
            <Icon name="info" size={20} color={colors.primary} />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1 leading-relaxed"
            >
              {strings.claimSuccess.instruction}
            </VemtapText>
          </View>

          <View className="mt-auto gap-3">
            <Button
              label={strings.claimSuccess.viewMyDeal}
              className="mx-1"
              rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
              onPress={handleViewDeal}
            />
            <Button
              label={strings.claimSuccess.continueDiscovering}
              variant="ghost"
              onPress={handleContinue}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
