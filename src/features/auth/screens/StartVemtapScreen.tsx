import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Animated, Easing } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { OnboardingHeader } from '@components/onboarding/OnboardingHeader';
import { colors } from '@theme/colors';
import type { AuthStackParamList } from '@navigation/types';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

type Nav = NativeStackNavigationProp<AuthStackParamList, 'StartVemtap'>;

function categoryChip(position: string, children: React.ReactNode) {
  return (
    <View
      className={`absolute ${position} flex-row items-center gap-1.5 rounded-full bg-surface-canvas px-3 py-1.5 shadow-md`}
    >
      {children}
    </View>
  );
}

export function StartVemtapScreen() {
  const navigation = useNavigation<Nav>();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6 pt-2">
        <OnboardingHeader
          showBack
          onBack={() => navigation.goBack()}
          showSkip
          onSkip={() => navigation.navigate('SignUp')}
          center="progress"
          progress={{ activeIndex: 2, total: 3 }}
        />
      </View>

      <ScrollView contentContainerClassName="flex-grow px-6 pb-6">
        {/* Radar graphic */}
        <View className="my-auto w-full items-center justify-center overflow-hidden py-6">
          <View className="h-[300px] w-[300px] items-center justify-center">
            <Animated.View
              className="absolute h-[300px] w-[300px] rounded-full border border-primary/30"
              style={{
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              }}
            />
            <View className="absolute h-[280px] w-[280px] rounded-full bg-surface-container-low" />
            <View className="absolute h-[210px] w-[210px] rounded-full bg-surface-container" />
            <View className="absolute h-[140px] w-[140px] rounded-full bg-surface-tint" />

            {/* Category tags */}
            {categoryChip(
              'left-0 top-2 -rotate-3',
              <>
                <View className="h-2 w-2 rounded-full bg-tertiary-container" />
                <VemtapText className="text-label-sm text-text">Cafes</VemtapText>
                <View className="rounded-full bg-badge-discount-bg px-1.5 py-0.5">
                  <VemtapText className="text-caption text-badge-discount-text">
                    20% off
                  </VemtapText>
                </View>
              </>,
            )}
            {categoryChip(
              'right-0 top-5 rotate-6',
              <>
                <Icon name="devices" size={15} color={colors.primary} />
                <VemtapText className="text-label-sm text-text">Electronics</VemtapText>
              </>,
            )}
            {categoryChip(
              'bottom-14 right-0 -rotate-2',
              <>
                <Icon name="fashion" size={15} color={colors.tertiaryContainer} />
                <VemtapText className="text-label-sm text-text">Fashion</VemtapText>
              </>,
            )}
            {categoryChip(
              'bottom-10 left-0 rotate-3',
              <>
                <Icon name="groceries" size={15} color={colors.badgeDiscountText} />
                <VemtapText className="text-label-sm text-text">Groceries</VemtapText>
              </>,
            )}
            {categoryChip(
              '-bottom-1 left-1/2 -translate-x-6',
              <>
                <Icon name="spa" size={15} color="#4A5E88" />
                <VemtapText className="text-label-sm text-text">Services</VemtapText>
              </>,
            )}

            {/* Center beacon */}
            <View className="relative z-10 items-center justify-center">
              <View
                className="absolute h-20 w-20 rounded-full bg-primary/20"
                style={{ transform: [{ scale: 1.4 }] }}
              />
              <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-canvas p-1.5 shadow-xl">
                <View className="shadow-inner h-full w-full items-center justify-center rounded-full bg-primary">
                  <Icon name="nearMe" size={28} color="#FFFFFF" />
                </View>
              </View>
              <View className="absolute -right-1 -top-1">
                <View className="relative h-4 w-4">
                  <View className="absolute inset-0 rounded-full bg-badge-discount-text opacity-70" />
                  <View className="relative h-4 w-4 rounded-full bg-badge-discount-text" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Copy & actions */}
        <View className="w-full flex-col items-center">
          <VemtapText
            variant="displayMobile"
            accessibilityRole="header"
            className="px-2 text-center tracking-tight"
          >
            {strings.onboarding.startHeadline}
          </VemtapText>
          <VemtapText
            variant="bodyLg"
            tone="secondary"
            className="mx-auto mt-2.5 max-w-[320px] px-2 text-center leading-relaxed"
          >
            {strings.onboarding.startSubtitle}
          </VemtapText>
        </View>

        <View className="w-full flex-col items-center pt-6">
          <Button
            label={strings.common.getStarted}
            size="lg"
            className="rounded-2xl bg-primary shadow-lg"
            rightIcon={<Icon name="forward" size={20} color="#FFFFFF" />}
            onPress={() => navigation.navigate('SignUp')}
            accessibilityHint="Continues to location permission"
          />

          {/* Secondary business entry (kept subtle per design brief) */}
          <View className="flex-row items-center justify-center px-3 py-3">
            <VemtapText className="text-label-md text-text-secondary">
              {strings.onboarding.ownABusiness}{' '}
              <VemtapText className="font-sans-semibold text-label-md text-primary">
                {strings.onboarding.setUpBusiness}
              </VemtapText>
            </VemtapText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
