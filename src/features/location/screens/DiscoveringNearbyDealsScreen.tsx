import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VemtapText } from '@components/ui/Text';
import { Icon } from '@components/ui/Icon';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { useAuthStore } from '@store/authStore';
import { concentricCircle, concentricBox } from '@utils/radarLayout';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const STEP_MS = 1200;

/**
 * Conversion of stitch_vemtap_design_system/7._discovering_nearby_deals/code.html
 * Design arena is h-[380px] with rings w-72 / w-64 / w-48 / w-32 (px = 4 * n).
 */
export function DiscoveringNearbyDealsScreen() {
  const setSession = useAuthStore(s => s.setSession);
  const [step, setStep] = useState(0);
  const { width, height } = useWindowDimensions();
  // Scale the arena so slim phones fit and short phones can still scroll.
  const arenaH = Math.min(380, Math.max(260, Math.min(width - 40, height * 0.48)));
  const arena = useMemo(
    () => ({
      // Design px / 380 — exact concentric ratios from the HTML
      ring1: Math.round(arenaH * (288 / 380)),
      ring2: Math.round(arenaH * (256 / 380)),
      ring3: Math.round(arenaH * (192 / 380)),
      ring4: Math.round(arenaH * (128 / 380)),
      sweep: Math.round(arenaH * (256 / 380)),
      beacon: Math.round(arenaH * (64 / 380)),
    }),
    [arenaH],
  );

  const pulse = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const float4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    const sweepLoop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 4500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const makeFloat = (val: Animated.Value, duration: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: -5,
            duration,
            delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

    pulseLoop.start();
    sweepLoop.start();
    const f1 = makeFloat(float1, 2200, 0);
    const f2 = makeFloat(float2, 2500, 300);
    const f3 = makeFloat(float3, 2000, 150);
    const f4 = makeFloat(float4, 2800, 450);
    f1.start();
    f2.start();
    f3.start();
    f4.start();
    return () => {
      pulseLoop.stop();
      sweepLoop.stop();
      f1.stop();
      f2.stop();
      f3.stop();
      f4.stop();
    };
  }, [pulse, sweep, float1, float2, float3, float4]);

  useEffect(() => {
    if (step >= strings.auth.discoveringStatuses.length - 1) {
      const done = setTimeout(() => {
        setSession({
          user: {
            id: 'local-onboarding',
            email: 'guest@vemtap.local',
            displayName: 'VEMTAP User',
          },
          tokens: { accessToken: 'local-onboarding' },
        });
      }, STEP_MS);
      return () => clearTimeout(done);
    }
    const id = setTimeout(() => setStep(s => s + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [step, setSession]);

  const progress = strings.auth.discoveringProgress[step] ?? 45;
  const status = strings.auth.discoveringStatuses[step] ?? '';
  // Design: scale 0.65 → 1.45, opacity 0.8 → 0 over 2.8s
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1.45] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });
  const sweepRotate = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView className="flex-1 overflow-hidden bg-surface" edges={['top', 'bottom']}>
      {/* Ambient glows — explicitly centered (absolute + self-center is unreliable in RN) */}
      <View
        pointerEvents="none"
        style={[
          styles.glowTop,
          { width: 384, height: 384, marginLeft: -192, marginTop: -192 },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glowMid,
          { width: 320, height: 320, marginLeft: -160, marginTop: -160 },
        ]}
      />

      <ScrollView
        contentContainerClassName="flex-grow px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-between">
          {/* Brand badge */}
          <View className="items-center pt-4">
            <View className="flex-row items-center gap-1.5 rounded-full bg-surface-container-high/60 px-3 py-1">
              <View className="h-2 w-2 rounded-full bg-primary" />
              <VemtapText className="font-sans-semibold text-caption uppercase tracking-wide text-text-secondary">
                {strings.auth.confirmingSetup}
              </VemtapText>
            </View>
          </View>

          {/* Radar arena — every ring uses the same center point (iOS + Android) */}
          <View className="relative w-full" style={{ height: arenaH }}>
            {/* Outer pulse ring */}
            <Animated.View
              style={[
                concentricCircle(arena.ring1),
                styles.ringPulse,
                {
                  transform: [{ scale: ringScale }],
                  opacity: ringOpacity,
                },
              ]}
            />
            {/* Static rings — same center, design ratios */}
            <View style={[concentricCircle(arena.ring2), styles.ring2]} />
            <View style={[concentricCircle(arena.ring3), styles.ring3]} />
            <View style={[concentricCircle(arena.ring4), styles.ring4]} />

            {/* Sweeping radar beam — SVG sector, same center as rings */}
            <Animated.View
              pointerEvents="none"
              style={[
                concentricBox(arena.sweep, arena.sweep),
                { transform: [{ rotate: sweepRotate }] },
              ]}
            >
              <Svg width={arena.sweep} height={arena.sweep} viewBox="0 0 200 200">
                <Defs>
                  <SvgGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#066CF4" stopOpacity="0.35" />
                    <Stop offset="60%" stopColor="#066CF4" stopOpacity="0.08" />
                    <Stop offset="100%" stopColor="#066CF4" stopOpacity="0" />
                  </SvgGradient>
                </Defs>
                {/* Matches design path: M 100 100 L 200 100 A 100 100 0 0 0 100 0 Z */}
                <Path
                  d="M 100 100 L 200 100 A 100 100 0 0 0 100 0 Z"
                  fill="url(#radarSweep)"
                />
              </Svg>
            </Animated.View>

            {/* Center beacon — flex-centered among non-absolute siblings is wrong;
              pin it to the same concentric center as the rings */}
            <View
              style={[
                concentricCircle(arena.beacon),
                styles.beacon,
                {
                  width: arena.beacon,
                  height: arena.beacon,
                  borderRadius: arena.beacon / 2,
                },
              ]}
            >
              <View
                style={StyleSheet.absoluteFill}
                className="rounded-full bg-white/20"
              />
              <Icon name="explore" size={28} color="#FFFFFF" />
            </View>

            {/* Float cards — intentionally offset from the arena edges */}
            <Animated.View
              className="absolute -top-1 left-2 z-10 max-w-[190px]"
              style={{ transform: [{ translateY: float1 }] }}
            >
              <View className="rounded-xl bg-surface-canvas p-2 shadow-md">
                <View className="flex-row items-center gap-2">
                  <View className="h-9 w-9 items-center justify-center rounded-lg bg-surface-container">
                    <VemtapText>☕</VemtapText>
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <VemtapText
                        numberOfLines={1}
                        className="font-sans-bold text-label-sm text-text"
                      >
                        {strings.auth.discoveringCafeNeo}
                      </VemtapText>
                      <View className="rounded bg-badge-discount-bg px-1">
                        <VemtapText className="font-sans-bold text-[10px] text-badge-discount-text">
                          {strings.auth.discoveringCafeDiscount}
                        </VemtapText>
                      </View>
                    </View>
                    <VemtapText className="text-caption text-text-secondary">
                      {strings.auth.discoveringCafeDeal}
                    </VemtapText>
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              className="absolute bottom-2 right-2 z-10 max-w-[185px]"
              style={{ transform: [{ translateY: float2 }] }}
            >
              <View className="rounded-xl bg-surface-canvas p-2 shadow-md">
                <View className="flex-row items-center gap-2">
                  <View className="h-9 w-9 items-center justify-center rounded-lg bg-surface-container">
                    <VemtapText>👟</VemtapText>
                  </View>
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      numberOfLines={1}
                      className="font-sans-bold text-label-sm text-text"
                    >
                      {strings.auth.discoveringSole}
                    </VemtapText>
                    <VemtapText className="font-sans-medium text-caption text-primary">
                      {strings.auth.discoveringSoleSub}
                    </VemtapText>
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              className="absolute right-0 top-6 z-10"
              style={{ transform: [{ translateY: float3 }] }}
            >
              <View className="flex-row items-center gap-1.5 rounded-full bg-surface-canvas px-3 py-1.5 shadow-md">
                <VemtapText>🛍️</VemtapText>
                <VemtapText className="font-sans-semibold text-label-sm text-text">
                  {strings.auth.discoveringNewDeals}
                </VemtapText>
              </View>
            </Animated.View>

            <Animated.View
              className="absolute bottom-4 left-0 z-10"
              style={{ transform: [{ translateY: float4 }] }}
            >
              <View className="flex-row items-center gap-1.5 rounded-full bg-surface-canvas px-3 py-1.5 shadow-md">
                <Icon name="nearMe" size={16} color={colors.primary} />
                <VemtapText className="font-sans-medium text-label-sm text-text-secondary">
                  {strings.auth.discoveringArea}
                </VemtapText>
              </View>
            </Animated.View>
          </View>

          {/* Copy + progress */}
          <View className="items-center gap-3 px-2">
            <View className="flex-row items-center gap-1.5 rounded-full bg-surface-tint px-3 py-1">
              <Icon name="autoAwesome" size={14} color={colors.primary} />
              <VemtapText className="font-sans-semibold text-label-sm text-primary">
                {strings.auth.discoveringTag}
              </VemtapText>
            </View>
            <VemtapText
              variant="headingXl"
              accessibilityRole="header"
              className="text-center text-heading-xl"
            >
              {strings.auth.discoveringTitle}
            </VemtapText>
            <VemtapText tone="secondary" className="max-w-[280px] text-center">
              {strings.auth.discoveringBody}
            </VemtapText>

            <View className="w-full max-w-[260px] pt-2">
              <View className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>

            <View className="flex-row items-center justify-center gap-1.5">
              <Animated.View
                style={{
                  transform: [{ rotate: sweepRotate }],
                }}
              >
                <Icon name="sync" size={14} color={colors.primary} />
              </Animated.View>
              <VemtapText className="font-sans-medium text-caption text-text-secondary">
                {status}
              </VemtapText>
            </View>

            <VemtapText className="pt-4 text-center text-caption text-text-tertiary">
              {strings.auth.discoveringHint}
            </VemtapText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  glowTop: {
    position: 'absolute',
    left: '50%',
    top: -96,
    borderRadius: 192,
    backgroundColor: 'rgba(6, 108, 244, 0.10)',
  },
  glowMid: {
    position: 'absolute',
    left: '50%',
    top: '33%',
    borderRadius: 160,
    backgroundColor: '#EEF5FF',
    opacity: 0.8,
  },
  ringPulse: {
    backgroundColor: 'rgba(238, 245, 255, 0.4)',
  },
  ring2: {
    backgroundColor: 'rgba(225, 232, 253, 0.4)',
  },
  ring3: {
    backgroundColor: 'rgba(233, 237, 255, 0.6)',
  },
  ring4: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  beacon: {
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
});
