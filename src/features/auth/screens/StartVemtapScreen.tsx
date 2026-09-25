import React, { useEffect, useMemo, useRef } from 'react';
import {
  useWindowDimensions,
  View,
  ScrollView,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { OnboardingHeader } from '@components/onboarding/OnboardingHeader';
import { colors } from '@theme/colors';
import type { AuthStackParamList, RootStackParamList } from '@navigation/types';
import { strings } from '@constants/strings';
import { concentricCircle } from '@utils/radarLayout';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'StartVemtap'>,
  NativeStackNavigationProp<RootStackParamList>
>;

function categoryChip(position: string, children: React.ReactNode) {
  return (
    <View
      className={`absolute ${position} flex-row items-center gap-1.5 rounded-full bg-surface-canvas px-3 py-1.5 shadow-onboard-md`}
    >
      {children}
    </View>
  );
}

export function StartVemtapScreen() {
  const navigation = useNavigation<Nav>();
  const pulse = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  // px-6 gutters + inner safety: never wider than the content column (slim 320pt phones).
  const radarSize = Math.min(300, Math.max(220, width - 72));
  const ring = useMemo(
    () => ({
      // Design base 300px: outer inset-0, 280 / 210 / 140, beacon 64
      outer: radarSize,
      r1: Math.round(radarSize * (280 / 300)),
      r2: Math.round(radarSize * (210 / 300)),
      r3: Math.round(radarSize * (140 / 300)),
      beacon: Math.round(radarSize * (64 / 300)),
      beaconCore: Math.round(radarSize * (52 / 300)),
      glow: Math.round(radarSize * (80 / 300)),
    }),
    [radarSize],
  );

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
          onSkip={() => navigation.navigate('Register')}
          center="progress"
          progress={{ activeIndex: 2, total: 3 }}
        />
      </View>

      <ScrollView contentContainerClassName="flex-grow px-6 pb-6">
        {/* Radar graphic — concentric rings share one center on iOS + Android */}
        <View className="my-auto w-full items-center justify-center overflow-hidden py-6">
          <View style={{ height: ring.outer, width: ring.outer }}>
            {/* Outer pulse */}
            <Animated.View
              style={[
                concentricCircle(ring.outer),
                {
                  backgroundColor: 'rgba(225, 232, 253, 0.4)',
                  borderWidth: 1,
                  borderColor: 'rgba(6, 108, 244, 0.3)',
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                },
              ]}
            />
            <View style={[concentricCircle(ring.r1), { backgroundColor: '#F1F3FF' }]} />
            <View style={[concentricCircle(ring.r2), { backgroundColor: '#E9EDFF' }]} />
            <View style={[concentricCircle(ring.r3), { backgroundColor: '#EEF5FF' }]} />

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
                <Icon name="spa" size={15} color={colors.secondary} />
                <VemtapText className="text-label-sm text-text">Services</VemtapText>
              </>,
            )}

            {/* Center beacon — same concentric center as rings */}
            <View
              pointerEvents="none"
              style={[
                concentricCircle(ring.glow),
                {
                  backgroundColor: 'rgba(6, 108, 244, 0.2)',
                  transform: [{ scale: 1.4 }],
                },
              ]}
            />
            <View
              style={[
                concentricCircle(ring.beacon),
                {
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 6,
                  shadowColor: '#066CF4',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 8,
                  zIndex: 10,
                },
              ]}
            >
              <View
                style={{
                  width: ring.beaconCore,
                  height: ring.beaconCore,
                  borderRadius: ring.beaconCore / 2,
                  backgroundColor: '#066CF4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="nearMe" size={28} color="#FFFFFF" />
              </View>
            </View>
            {/* Pulse indicator dot — offset from beacon edge */}
            <View
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                left: '50%',
                top: '50%',
                marginLeft: ring.beacon / 2 - 4,
                marginTop: -ring.beacon / 2 - 4,
                borderRadius: 8,
                backgroundColor: '#059669',
                borderWidth: 2,
                borderColor: '#FFFFFF',
                zIndex: 11,
              }}
            />
          </View>
        </View>

        {/* Copy & actions */}
        <View className="w-full flex-col items-center">
          <VemtapText
            variant="displayMobile"
            accessibilityRole="header"
            className="px-2 text-center text-heading-xl tracking-tight"
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
            className="rounded-2xl bg-primary shadow-onboard-lg"
            rightIcon={<Icon name="forward" size={20} color="#FFFFFF" />}
            onPress={() => navigation.navigate('Register')}
            accessibilityHint="Continues to account registration"
          />

          {/* Secondary business entry (kept subtle per design brief) */}
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={strings.onboarding.setUpBusiness}
            onPress={() => navigation.navigate('BusinessSetup')}
            className="flex-row items-center justify-center px-3 py-3"
          >
            <VemtapText className="text-label-md text-text-secondary">
              {strings.onboarding.ownABusiness}{' '}
              <VemtapText className="font-sans-semibold text-label-md text-primary">
                {strings.onboarding.setUpBusiness}
              </VemtapText>
            </VemtapText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
