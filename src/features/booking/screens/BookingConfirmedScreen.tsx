import React, { useCallback, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, Share, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import {
  MerchantActions,
  type MerchantAction,
} from '@features/order/components/OrderComponents';
import {
  bookingAddons,
  bookingImages,
  formatBookingNaira,
} from '@features/booking/bookingData';
import {
  ArrivalGuide,
  BookingSuccessState,
} from '@features/booking/components/BookingComponents';

cssInterop(Image, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'BookingConfirmed'>;

const defaultDraft = {
  addons: ['led-light-therapy'],
  therapistId: 'amara',
  date: '2024-10-17',
  time: '1:15',
  notes: '',
};

export function BookingConfirmedScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [guideExpanded, setGuideExpanded] = useState(true);
  const draft = route.params?.draft ?? defaultDraft;
  const selectedAddons = bookingAddons.filter(addon => draft.addons.includes(addon.id));
  const services = [
    {
      name: strings.booking.facialLine,
      detail: strings.booking.facialDescription,
      price: 16000,
    },
    {
      name: strings.booking.manicureLine,
      detail: strings.booking.manicureDescription,
      price: 9000,
    },
    ...selectedAddons.map(addon => ({
      name: addon.id === 'led-light-therapy' ? strings.booking.ledBooster : addon.name,
      detail:
        addon.id === 'led-light-therapy'
          ? strings.booking.ledDescription
          : addon.description,
      price: addon.price,
    })),
  ];
  const subtotal = services.reduce((sum, service) => sum + service.price, 0);
  const total = subtotal - 5000;
  const treatmentCount = services.length;

  const goHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
    });
  }, [navigation]);

  const share = useCallback(() => {
    Share.share({
      message:
        'My Glow & Serenity appointment is confirmed. Booking reference: #GS-44218',
    }).catch(() => undefined);
  }, []);

  const merchantActions: MerchantAction[] = [
    {
      icon: 'phone',
      label: strings.booking.directCall,
      onPress: () => Linking.openURL('tel:+2348035550192').catch(() => undefined),
    },
    {
      icon: 'message',
      label: strings.booking.inAppChat,
      onPress: () =>
        navigation.navigate('MerchantChat', { dealId: 'glow-serenity-facial' }),
    },
    {
      icon: 'whatsapp',
      label: strings.booking.whatsapp,
      success: true,
      onPress: () =>
        Linking.openURL('https://wa.me/2348035550192').catch(() => undefined),
    },
  ];

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface" />
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="gap-6 px-6 pb-40"
        showsVerticalScrollIndicator={false}
      >
        <BookingSuccessState />

        <View className="gap-3 rounded-card bg-surface-container-low p-4 shadow-sm">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-field bg-primary-fixed">
              <Icon name="eventAvailable" size={22} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                tone="secondary"
                className="font-sans-semibold uppercase"
              >
                {strings.booking.reservedSlot}
              </VemtapText>
              <VemtapText variant="headingSm" className="text-text">
                {strings.booking.reservedDate}
              </VemtapText>
              <View className="mt-0.5 flex-row items-center gap-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
                  1:15 PM
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  •
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  ~1h 45m duration
                </VemtapText>
              </View>
            </View>
          </View>
          <View className="flex-row items-center gap-3 rounded-field bg-surface p-3 shadow-sm">
            <Image
              source={{ uri: bookingImages.confirmedAmara }}
              className="h-10 w-10 shrink-0 rounded-full bg-surface-container-high"
              resizeMode="cover"
            />
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelSm" tone="secondary">
                {strings.booking.assignedSpecialist}
              </VemtapText>
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                Amara K.
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {strings.booking.amaraFullRole}
              </VemtapText>
            </View>
            <Icon name="spa" size={20} color={colors.primary} />
          </View>
        </View>

        <View className="gap-1">
          <VemtapText
            variant="labelSm"
            tone="secondary"
            className="font-sans-semibold uppercase"
          >
            {strings.booking.appointmentMode}
          </VemtapText>
          <View className="flex-row gap-1 rounded-card bg-surface-container p-1.5">
            <View className="min-w-0 flex-1 flex-row items-center justify-center gap-1 rounded-field bg-surface px-2 py-2 shadow-sm">
              <Icon name="storefront" size={18} color={colors.primary} />
              <VemtapText variant="labelMd" className="text-primary">
                {strings.booking.inSalonVisit}
              </VemtapText>
            </View>
            <View className="min-w-0 flex-1 flex-row items-center justify-center gap-1 rounded-field px-2 py-2 opacity-70">
              <Icon name="homeLiving" size={16} color={colors.textTertiary} />
              <VemtapText
                variant="labelSm"
                tone="tertiary"
                className="text-center"
                numberOfLines={2}
              >
                {strings.booking.mobileUnavailable}
              </VemtapText>
            </View>
          </View>
        </View>

        <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row items-center justify-between gap-3">
            <VemtapText variant="headingSm" className="text-text">
              {strings.booking.serviceBreakdown}
            </VemtapText>
            <VemtapText variant="caption" className="text-primary">
              {treatmentCount} Treatments
            </VemtapText>
          </View>
          {services.map(service => (
            <View
              key={service.name}
              className="flex-row items-start justify-between gap-3"
            >
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-medium text-text">
                  {service.name}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {service.detail}
                </VemtapText>
              </View>
              <VemtapText
                variant="labelMd"
                className="shrink-0 font-sans-semibold text-text"
              >
                {formatBookingNaira(service.price)}
              </VemtapText>
            </View>
          ))}
          <View className="flex-row items-center justify-between gap-3 rounded-field bg-success-container p-3">
            <View className="min-w-0 flex-row items-center gap-2">
              <Icon name="localActivity" size={20} color={colors.badgeDiscountText} />
              <View className="min-w-0">
                <VemtapText variant="labelSm" className="font-sans-semibold text-success">
                  {strings.booking.voucherApplied}
                </VemtapText>
                <VemtapText variant="caption" className="text-success">
                  Code: VT-SPA8821
                </VemtapText>
              </View>
            </View>
            <VemtapText
              variant="labelMd"
              className="shrink-0 font-sans-bold text-success"
            >
              -{formatBookingNaira(5000)}
            </VemtapText>
          </View>
          <View className="gap-1 rounded-card bg-surface-tint p-4">
            <View className="flex-row items-baseline justify-between gap-3">
              <VemtapText variant="headingSm" className="text-text">
                {strings.booking.totalAtSalon}
              </VemtapText>
              <VemtapText className="font-sans-bold text-display-mobile text-primary">
                {formatBookingNaira(total)}
              </VemtapText>
            </View>
            <View className="flex-row items-start gap-1">
              <Icon name="check" size={16} color={colors.badgeDiscountText} />
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                {strings.booking.zeroUpfront}
              </VemtapText>
            </View>
          </View>
        </View>

        <View className="gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: guideExpanded }}
            onPress={() => setGuideExpanded(value => !value)}
            className="flex-row items-center justify-between gap-3 px-1 py-1"
          >
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-2">
                <VemtapText variant="headingSm" className="text-text">
                  {strings.booking.arrivalGuide}
                </VemtapText>
                <View className="rounded-full bg-surface-container px-2 py-0.5">
                  <VemtapText variant="caption" className="text-primary">
                    {strings.booking.fourSteps}
                  </VemtapText>
                </View>
              </View>
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {strings.booking.guideSubtitle}
              </VemtapText>
            </View>
            <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container">
              <Icon
                name="expandMore"
                size={20}
                color={colors.textSecondary}
                style={guideExpanded ? { transform: [{ rotate: '180deg' }] } : undefined}
              />
            </View>
          </Pressable>
          {guideExpanded ? <ArrivalGuide /> : null}
        </View>

        <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <VemtapText variant="headingSm" className="text-text" numberOfLines={1}>
                {strings.booking.merchant}
              </VemtapText>
              <View className="mt-0.5 flex-row flex-wrap items-center gap-1">
                <View className="flex-row items-center gap-0.5">
                  <Icon name="star" size={15} color={colors.tertiaryContainer} />
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-tertiary"
                  >
                    4.9
                  </VemtapText>
                </View>
                <VemtapText variant="caption" tone="tertiary">
                  • 96 reviews • 1.4 km (5m drive)
                </VemtapText>
              </View>
            </View>
            <Image
              source={{ uri: bookingImages.facade }}
              className="h-12 w-12 shrink-0 rounded-field bg-surface-container"
              resizeMode="cover"
            />
          </View>
          <MerchantActions actions={merchantActions} />
          <View className="relative h-36 overflow-hidden rounded-card shadow-sm">
            <Image
              source={{ uri: bookingImages.facade }}
              className="h-full w-full"
              resizeMode="cover"
            />
            <View className="absolute inset-x-0 bottom-0 flex-row items-end justify-between gap-2 bg-inverse-surface/80 p-3">
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="text-inverse font-sans-semibold"
                  numberOfLines={1}
                >
                  Plot 14 Amazon Street, Maitama Heights
                </VemtapText>
                <VemtapText variant="caption" className="text-inverse" numberOfLines={1}>
                  Abuja, FCT, Nigeria
                </VemtapText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.booking.directions}
                onPress={() =>
                  Linking.openURL('https://maps.google.com').catch(() => undefined)
                }
                className="shrink-0 flex-row items-center gap-1 rounded-field bg-primary px-3 py-2 shadow-sm"
              >
                <Icon name="nearMe" size={16} color={colors.surface} />
                <VemtapText variant="labelSm" className="text-inverse font-sans-semibold">
                  {strings.booking.directions}
                </VemtapText>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3">
          <Button
            label={strings.booking.addToCalendar}
            variant="outline"
            size="sm"
            leftIcon={<Icon name="eventAvailable" size={20} color={colors.primary} />}
            onPress={share}
          />
          <Button
            label={strings.booking.shareDetails}
            variant="outline"
            size="sm"
            leftIcon={<Icon name="share" size={20} color={colors.secondary} />}
            onPress={share}
          />
        </View>
      </ScrollView>

      <View
        className="gap-2 bg-surface px-6 pt-3 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Button
          label={strings.booking.trackChat}
          leftIcon={<Icon name="message" size={20} color={colors.surface} />}
          onPress={() =>
            navigation.navigate('MerchantChat', { dealId: 'glow-serenity-facial' })
          }
        />
        <Button label={strings.booking.backHome} variant="ghost" onPress={goHome} />
      </View>
    </View>
  );
}
