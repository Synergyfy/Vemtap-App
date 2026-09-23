import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { LocationMapView } from '@components/shared/LocationMapView';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { strings } from '@constants/strings';
import { areaCoords } from '@constants/locations';
import { concentricCircle, concentricBox } from '@utils/radarLayout';
import type { AuthStackParamList } from '@navigation/types';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

type Nav = NativeStackNavigationProp<AuthStackParamList, 'LocationConfirmation'>;
type Rt = RouteProp<AuthStackParamList, 'LocationConfirmation'>;

function MapChip({
  className,
  icon,
  iconColor,
  label,
  secondary,
}: {
  className: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  iconColor: string;
  label: string;
  secondary?: boolean;
}) {
  return (
    <View
      className={`absolute flex-row items-center gap-1 rounded-full bg-surface-canvas/90 px-2.5 py-1 shadow-sm ${className}`}
    >
      <Icon name={icon} size={14} color={iconColor} />
      <VemtapText
        className={
          secondary
            ? 'text-caption text-text-secondary'
            : 'font-sans-medium text-caption text-text'
        }
      >
        {label}
      </VemtapText>
    </View>
  );
}

/**
 * Conversion of stitch_vemtap_design_system/6._location_confirmation/code.html
 */
export function LocationConfirmationScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const area = params.area ?? 'Apo';
  const mapRegion = useMemo(() => areaCoords(area), [area]);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] });

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between bg-surface px-6 pb-3 pt-2"
        style={navbarBottomShadow}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.common.goBack}
          hitSlop={8}
          className="-ml-2 h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-low"
          onPress={() => navigation.goBack()}
        >
          <Icon name="backIos" size={22} color={colors.surfaceDark} />
        </Pressable>
        <VemtapText
          accessibilityRole="header"
          variant="headingSm"
          className="max-w-[200px] text-center"
          numberOfLines={1}
        >
          {strings.auth.confirmHeader}
        </VemtapText>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Icon name="person" size={18} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView contentContainerClassName="flex-grow px-6 pb-6 pt-2">
        {/* Status + title */}
        <View className="mb-4 gap-1">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-primary" />
            <VemtapText className="font-sans-semibold text-label-sm uppercase tracking-wider text-primary">
              {strings.auth.confirmEyebrow}
            </VemtapText>
          </View>
          <VemtapText
            variant="headingXl"
            accessibilityRole="header"
            className="text-heading-xl"
          >
            {strings.auth.confirmTitle}
          </VemtapText>
        </View>

        {/* Location card */}
        <View className="mb-4 flex-row items-start justify-between rounded-xl bg-surface-canvas p-4 shadow-sm">
          <View className="min-w-0 flex-1 flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Icon name="locationOn" size={22} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="headingMd" numberOfLines={1}>
                {area}, Abuja
              </VemtapText>
              <VemtapText tone="secondary" numberOfLines={1}>
                {strings.auth.confirmRegion}
              </VemtapText>
              <VemtapText className="mt-0.5 text-caption text-text-tertiary">
                {strings.auth.confirmRadius}
              </VemtapText>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full bg-badge-discount-bg px-2 py-1">
            <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
            <VemtapText className="font-sans-medium text-caption text-badge-discount-text">
              {strings.auth.confirmActiveArea}
            </VemtapText>
          </View>
        </View>

        {/* Live map panel with radius overlay (structure from HTML) — flex height so short screens scroll */}
        <View className="relative mb-4 h-56 overflow-hidden rounded-xl bg-surface-container-low shadow-sm sm:h-64 md:h-72">
          <LocationMapView
            region={mapRegion}
            style={StyleSheet.absoluteFill}
            scrollEnabled={false}
            zoomEnabled={false}
          />

          {/* Radius rings — design: ping w-44, solid w-48 (contains w-36), shared center */}
          <Animated.View
            pointerEvents="none"
            style={[
              concentricCircle(176),
              {
                backgroundColor: 'rgba(6, 108, 244, 0.1)',
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              concentricCircle(192),
              { backgroundColor: 'rgba(217, 226, 255, 0.4)' },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              concentricCircle(144),
              { backgroundColor: 'rgba(6, 108, 244, 0.15)' },
            ]}
          />

          {/* Hub label + pin — same center as rings */}
          <View
            pointerEvents="none"
            style={[
              concentricBox(120, 72),
              {
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              },
            ]}
          >
            <View className="mb-1 rounded-full bg-surface-canvas px-2 py-0.5 shadow-md">
              <VemtapText className="font-sans-semibold text-caption text-primary">
                {strings.auth.confirmHub}
              </VemtapText>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg">
              <Icon name="storefront" size={24} color="#FFFFFF" />
            </View>
          </View>

          <MapChip
            className="left-3 top-3"
            icon="localOffer"
            iconColor={colors.primary}
            label={strings.auth.confirmDeals}
          />
          <MapChip
            className="right-3 top-12"
            icon="cafe"
            iconColor={colors.tertiaryContainer}
            label={strings.auth.confirmCafes}
          />
          <MapChip
            className="bottom-9 left-4"
            icon="shoppingBag"
            iconColor={colors.secondary ?? '#4A5E88'}
            label={strings.auth.confirmStores}
          />
          <MapChip
            className="bottom-2 self-center"
            icon="radar"
            iconColor={colors.primary}
            label={strings.auth.confirmRadiusChip}
            secondary
          />
        </View>

        {/* Change location */}
        <View className="mb-6 items-center">
          <Pressable
            accessibilityRole="button"
            className="h-11 flex-row items-center gap-2 rounded-full px-4 active:scale-95"
            onPress={() => navigation.navigate('ManualLocationSearch')}
          >
            <Icon name="editLocation" size={18} color={colors.primary} />
            <VemtapText className="text-button-md text-primary">
              {strings.auth.confirmChangeLocation}
            </VemtapText>
          </Pressable>
        </View>

        <View className="mt-auto gap-3">
          {/* Progress dots — step 3 active last */}
          <View className="flex-row items-center justify-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-border" />
            <View className="h-1.5 w-1.5 rounded-full bg-border" />
            <View className="h-1.5 w-6 rounded-full bg-primary" />
          </View>
          <Button
            label={strings.auth.confirmContinue}
            className="bg-primary"
            rightIcon={<Icon name="arrowForward" size={20} color="#FFFFFF" />}
            onPress={() => navigation.navigate('DiscoveringNearbyDeals')}
          />
          <View className="flex-row items-center justify-center gap-1 pt-1">
            <VemtapText className="text-center text-caption text-text-secondary">
              {strings.auth.confirmOwnBusiness}{' '}
            </VemtapText>
            <VemtapText className="font-sans-medium text-caption text-primary">
              {strings.auth.manualSetupVemtap}
            </VemtapText>
            <Icon name="forward" size={12} color={colors.primary} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
