import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { concentricCircle } from '@utils/radarLayout';
import { nearestArea } from '@utils/geo';
import { requestCurrentLocation } from '@features/location/utils/currentLocation';
import type { AuthStackParamList } from '@navigation/types';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

type Nav = NativeStackNavigationProp<AuthStackParamList, 'LocationPermission'>;

function FloatCard({
  className,
  children,
  delay = 0,
}: {
  className: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, {
          toValue: -5,
          duration: 2200,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [y, delay]);

  return (
    <Animated.View
      className={`absolute z-10 ${className}`}
      style={{ transform: [{ translateY: y }] }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Conversion of stitch_vemtap_design_system/4._location_permission/code.html
 */
export function LocationPermissionScreen() {
  const navigation = useNavigation<Nav>();
  /**
   * `denied` and `unavailable` are terminal-but-retryable: the OS may have
   * refused the prompt, so the button stays live and the manual picker is the
   * guaranteed way forward.
   */
  const [locState, setLocState] = useState<
    'idle' | 'finding' | 'set' | 'denied' | 'unavailable'
  >('idle');
  const pulse = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const radarH = Math.min(320, Math.max(240, width - 64));
  const ringSizes = useMemo(
    () => ({
      // Design (h-[320px]): w-72 / w-60 / w-44 / w-28 / hub w-16
      r1: Math.round(radarH * (288 / 320)),
      r2: Math.round(radarH * (240 / 320)),
      r3: Math.round(radarH * (176 / 320)),
      r4: Math.round(radarH * (112 / 320)),
      hub: Math.round(radarH * (64 / 320)),
    }),
    [radarH],
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const hubScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const hubOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] });

  /** Held so the "Location Set!" beat can be cancelled if the screen unmounts. */
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onUseLocation = useCallback(async () => {
    setLocState('finding');

    const result = await requestCurrentLocation();
    if (!result.ok) {
      setLocState(result.reason);
      return;
    }

    // The district is chosen from the real position; the coordinates travel on
    // the route so the confirmation screen is the one place that persists them.
    const area = nearestArea(result.coords);
    setLocState('set');
    timer.current = setTimeout(() => {
      navigation.navigate('LocationConfirmation', { area, coords: result.coords });
    }, 600);
  }, [navigation]);

  const onManual = useCallback(() => {
    navigation.navigate('ManualLocationSearch');
  }, [navigation]);

  const primaryLabel =
    locState === 'finding'
      ? strings.auth.locationFinding
      : locState === 'set'
        ? strings.auth.locationSet
        : strings.auth.locationUseMyLocation;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="flex-grow px-6 pb-6">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.goBack}
            hitSlop={8}
            className="-ml-2 h-11 w-11 items-center justify-center rounded-full bg-surface-container-low shadow-sm active:scale-95"
            onPress={() => navigation.goBack()}
          >
            <Icon name="backIos" size={18} color={colors.surfaceDark} />
          </Pressable>
          <View className="flex-row items-center gap-1">
            <View className="h-1.5 w-6 rounded-full bg-primary" />
            <View className="h-1.5 w-1.5 rounded-full bg-surface-container-highest" />
            <View className="h-1.5 w-1.5 rounded-full bg-surface-container-highest" />
          </View>
          <View className="h-11 w-11" />
        </View>

        {/* Radar — concentric rings share one center on iOS + Android */}
        <View className="my-4 w-full" style={{ height: radarH }}>
          <View
            style={[
              concentricCircle(ringSizes.r1),
              { backgroundColor: 'rgba(225, 232, 253, 0.4)' },
            ]}
          />
          <View
            style={[
              concentricCircle(ringSizes.r2),
              { backgroundColor: 'rgba(238, 245, 255, 0.7)' },
            ]}
          />
          <View
            style={[concentricCircle(ringSizes.r3), { backgroundColor: '#E9EDFF' }]}
          />
          <View
            style={[concentricCircle(ringSizes.r4), { backgroundColor: '#E1E8FD' }]}
          />

          <FloatCard className="-top-1 right-2 max-w-[170px]" delay={0}>
            <View className="flex-row items-center gap-2 rounded-xl bg-surface-canvas p-2 shadow-md">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low">
                <Icon name="cafeFilled" size={18} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText numberOfLines={1} className="text-label-sm text-text">
                  {strings.auth.locationCafeAroma}
                </VemtapText>
                <View className="mt-0.5 self-start rounded bg-badge-discount-bg px-1 py-0.5">
                  <VemtapText className="text-caption text-badge-discount-text">
                    {strings.auth.locationCafeBadge}
                  </VemtapText>
                </View>
              </View>
            </View>
          </FloatCard>

          <FloatCard className="left-0 top-20" delay={400}>
            <View className="flex-row items-center gap-1.5 rounded-full bg-surface-canvas px-3 py-1.5 shadow-md">
              <Icon name="fashion" size={14} color={colors.tertiaryContainer} />
              <VemtapText className="text-label-sm text-text-secondary">
                {strings.auth.locationSneakers}
              </VemtapText>
            </View>
          </FloatCard>

          <FloatCard className="bottom-2 left-2 max-w-[160px]" delay={800}>
            <View className="rounded-xl bg-surface-canvas p-2 shadow-md">
              <View className="flex-row items-center gap-2">
                <View className="h-7 w-7 items-center justify-center rounded-lg bg-badge-discount-bg">
                  <Icon name="restaurant" size={14} color={colors.tertiaryContainer} />
                </View>
                <VemtapText numberOfLines={1} className="text-label-sm text-text">
                  {strings.auth.locationBistro}
                </VemtapText>
              </View>
              <View className="mt-1 flex-row items-center gap-1">
                <Icon name="nearMe" size={12} color={colors.primary} />
                <VemtapText className="text-caption text-text-tertiary">
                  {strings.auth.locationBistroKm}
                </VemtapText>
              </View>
            </View>
          </FloatCard>

          <FloatCard className="bottom-6 right-3" delay={1200}>
            <View className="flex-row items-center gap-1 rounded-full bg-surface-canvas px-3 py-1.5 shadow-md">
              <Icon name="star" size={14} color={colors.tertiaryContainer} />
              <VemtapText className="font-sans-semibold text-label-sm text-text">
                {strings.auth.locationRating}
              </VemtapText>
              <VemtapText className="text-caption text-text-tertiary">
                {strings.auth.locationRatingCount}
              </VemtapText>
            </View>
          </FloatCard>

          {/* Hub pulse + solid hub — same center as rings */}
          <Animated.View
            pointerEvents="none"
            style={[
              concentricCircle(ringSizes.hub),
              {
                backgroundColor: '#066CF4',
                transform: [{ scale: hubScale }],
                opacity: hubOpacity,
              },
            ]}
          />
          <View
            style={[
              concentricCircle(ringSizes.hub),
              {
                backgroundColor: '#066CF4',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#066CF4',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
                zIndex: 20,
              },
            ]}
          >
            <Icon name="locationOn" size={32} color="#FFFFFF" />
          </View>
        </View>

        {/* Copy */}
        <View className="items-center px-1 text-center">
          <VemtapText
            variant="headingXl"
            accessibilityRole="header"
            className="text-heading-xl"
          >
            {strings.auth.locationPermissionTitle}
          </VemtapText>
          <VemtapText tone="secondary" className="mt-3 max-w-[310px] text-center">
            {strings.auth.locationPermissionBody}
          </VemtapText>
          {locState === 'denied' || locState === 'unavailable' ? (
            <VemtapText
              accessibilityRole="alert"
              className="mt-3 max-w-[310px] text-center text-caption text-text-secondary"
            >
              {locState === 'denied'
                ? strings.auth.locationDenied
                : strings.auth.locationUnavailable}
            </VemtapText>
          ) : null}
        </View>

        {/* Actions */}
        <View className="mt-8 gap-3">
          <Button
            label={primaryLabel}
            loading={locState === 'finding'}
            disabled={locState === 'finding' || locState === 'set'}
            className={locState === 'set' ? 'bg-success active:bg-success' : undefined}
            leftIcon={
              locState === 'set' ? (
                <Icon name="checkCircle" size={20} color="#FFFFFF" />
              ) : locState === 'finding' ? undefined : (
                <Icon name="myLocation" size={20} color="#FFFFFF" />
              )
            }
            onPress={onUseLocation}
          />
          <Pressable
            accessibilityRole="button"
            className="h-12 w-full items-center justify-center rounded-xl bg-surface-container-low active:bg-surface-container"
            onPress={onManual}
          >
            <VemtapText className="text-button-md text-text">
              {strings.auth.locationEnterManually}
            </VemtapText>
          </Pressable>
          <View className="flex-row items-center justify-center gap-1.5 pt-1">
            <Icon name="lock" size={13} color={colors.textTertiary} />
            <VemtapText className="text-center text-caption text-text-tertiary">
              {strings.auth.locationPrivacy}
            </VemtapText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
