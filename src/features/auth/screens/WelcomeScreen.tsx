import React from 'react';
import { Image, View, ScrollView, Pressable } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { LocalSvg } from '@components/ui/LocalSvg';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { colors } from '@theme/colors';
import type { AuthStackParamList } from '@navigation/types';
import { strings } from '@constants/strings';
import vemtapLogo from '@assets/images/vemtap-logo.png';
import outdoorBistro from '../../../../assets/images/outdoor-bistro.svg';

cssInterop(Image, { className: 'style' });
cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(Pressable, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="flex-grow px-6 py-2">
        {/* Brand header */}
        <View className="w-full flex-row items-center justify-between pt-1">
          <View className="flex-row items-center gap-1.5">
            <Image
              source={vemtapLogo}
              accessibilityLabel="VEMTAP"
              className="h-10 w-32"
              resizeMode="contain"
            />
          </View>
          <View className="flex-row items-center gap-1 rounded-full bg-surface-container-high px-3 py-1">
            <Icon name="bolt" size={15} color={colors.primary} />
            <VemtapText className="font-sans-semibold text-caption text-primary">
              {strings.onboarding.welcomeBadge}
            </VemtapText>
          </View>
        </View>

        {/* Phone mockup visual */}
        <View className="my-auto flex-col items-center justify-center rounded-[32px] bg-white py-6 shadow-onboard-md">
          <View className="relative w-full max-w-[340px] flex-col justify-between overflow-hidden rounded-[32px] bg-surface-canvas p-3 shadow-onboard-xl">
            {/* Bezel top */}
            <View className="w-full flex-row items-center justify-between px-2 pb-2 pt-1">
              <View className="flex-row items-center gap-2">
                <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                <View className="h-2 w-16 rounded-full bg-surface-container" />
              </View>
              <View className="flex-row items-center gap-1 rounded-full bg-surface-tint px-2 py-0.5">
                <View className="relative h-2 w-2">
                  <View className="absolute inset-0 rounded-full bg-primary opacity-75" />
                  <View className="relative h-2 w-2 rounded-full bg-primary" />
                </View>
                <VemtapText className="font-sans-medium text-caption text-primary">
                  {strings.onboarding.welcomeLocation}
                </VemtapText>
              </View>
            </View>

            {/* Hero visual mosaic */}
            <View className="relative h-[155px] w-full overflow-hidden rounded-2xl">
              <LocalSvg source={outdoorBistro} />
              <View className="absolute inset-0 bg-on-background/30" />
              <View className="absolute left-2.5 top-2.5 flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2.5 py-1 shadow-onboard-sm">
                <Icon name="offer" size={14} color={colors.badgeDiscountText} />
                <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
                  {strings.onboarding.welcomeBogo}
                </VemtapText>
              </View>
              <View className="absolute bottom-2.5 left-3 right-3 flex-row items-end justify-between">
                <View className="flex-col">
                  <VemtapText className="font-sans-semibold text-label-md leading-tight text-white">
                    {strings.onboarding.welcomeThermometer}
                  </VemtapText>
                  <View className="mt-0.5 flex-row items-center gap-0.5">
                    <Icon name="pin" size={13} color="#F9FAFB" />
                    <VemtapText className="text-caption text-white/80">
                      {strings.onboarding.welcomeThermometerLoc}
                    </VemtapText>
                  </View>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary shadow-onboard-md">
                  <Icon name="forward" size={18} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Floating micro cards */}
            <View className="mt-10 flex-row gap-2">
              <View className="flex-1 flex-row items-center gap-2 rounded-xl bg-surface-subtle p-2.5 shadow-onboard-sm">
                <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                  <Icon name="storefront" size={20} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1 flex-col">
                  <VemtapText className="shrink font-sans-semibold text-label-sm text-text">
                    {strings.onboarding.welcomeMicro1}
                  </VemtapText>
                  <VemtapText className="shrink font-sans-medium text-caption text-badge-discount-text">
                    {strings.onboarding.welcomeMicro1Sub}
                  </VemtapText>
                </View>
              </View>
              <View className="flex-1 flex-row items-center gap-2 rounded-xl bg-surface-subtle p-2.5 shadow-onboard-sm">
                <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
                  <Icon name="bag" size={20} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1 flex-col">
                  <VemtapText className="shrink font-sans-semibold text-label-sm text-text">
                    {strings.onboarding.welcomeMicro2}
                  </VemtapText>
                  <VemtapText className="shrink text-caption text-text-secondary">
                    {strings.onboarding.welcomeMicro2Sub}
                  </VemtapText>
                </View>
              </View>
            </View>
          </View>

          {/* Accent floating badges */}
          <View className="absolute -right-1 top-5 z-10 -rotate-3 flex-row items-center gap-1 rounded-full bg-surface-canvas px-3 py-1.5 shadow-onboard-lg">
            <Icon name="verified" size={16} color={colors.badgeDiscountText} />
            <VemtapText className="font-sans-semibold text-caption text-text">
              {strings.onboarding.welcomeVerified}
            </VemtapText>
          </View>
          <View className="absolute -left-3 bottom-6 z-10 rotate-3 flex-row items-center gap-1 rounded-full bg-surface-canvas px-3 py-1.5 shadow-onboard-lg">
            <Icon name="nearMe" size={16} color={colors.primary} />
            <VemtapText className="font-sans-semibold text-caption text-text">
              {strings.onboarding.welcomePickup}
            </VemtapText>
          </View>
        </View>

        {/* Copy */}
        <View className="mt-2 w-full flex-col items-center text-center">
          <VemtapText
            variant="displayMobile"
            accessibilityRole="header"
            className="text-center text-heading-xl"
          >
            {strings.onboarding.welcomeHeadline}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary" className="mt-2 px-3 text-center">
            {strings.onboarding.welcomeSubtitle}
          </VemtapText>

          <ProgressDots total={3} activeIndex={0} className="my-5" />

          <Button
            label={strings.common.getStarted}
            size="lg"
            className="rounded-full"
            rightIcon={<Icon name="forward" size={20} color="#FFFFFF" />}
            onPress={() => navigation.navigate('DiscoverDeals')}
            accessibilityHint="Continues to the discovery overview"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.signIn}
            hitSlop={8}
            className="my-1 flex-row items-center justify-center py-2"
            onPress={() => navigation.navigate('SignIn')}
          >
            <View className="flex-row items-center justify-center">
              <VemtapText variant="bodyMd" tone="secondary" className="text-center">
                {strings.onboarding.alreadyHaveAccount}
              </VemtapText>
              <VemtapText className="ml-1 font-sans-semibold text-label-md text-primary">
                {strings.common.signIn}
              </VemtapText>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
