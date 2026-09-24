import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Share, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import { NumberedInstructions } from '@features/order/components/OrderComponents';
import {
  bookingAddons,
  bookingImages,
  formatBookingNaira,
} from '@features/booking/bookingData';
import {
  AddonSelection,
  TherapistCards,
} from '@features/booking/components/BookingComponents';

cssInterop(Image, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'ServiceDetail'>;

export function ServiceDetailScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [therapistId, setTherapistId] = useState('any');
  const total = useMemo(
    () =>
      16000 +
      bookingAddons
        .filter(addon => selectedAddons.includes(addon.id))
        .reduce((sum, addon) => sum + addon.price, 0),
    [selectedAddons],
  );

  const toggleAddon = useCallback((id: string) => {
    setSelectedAddons(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  }, []);

  const share = useCallback(() => {
    Share.share({
      message: 'https://vemtap.com/bookings/deep-hydration-radiance-facial',
    }).catch(() => undefined);
  }, []);

  const book = useCallback(() => {
    navigation.navigate('ScheduleAppointment', {
      draft: {
        addons: selectedAddons,
        therapistId,
        date: '2024-10-17',
        time: '1:15',
        notes: '',
      },
    });
  }, [navigation, selectedAddons, therapistId]);

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface">
        <RegistrationHeader
          title={strings.booking.dealDetail}
          onBack={navigation.goBack}
          showShareAction
          onShare={share}
        />
      </SafeAreaView>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="pb-40"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative aspect-[4/3] overflow-hidden bg-surface-container-high">
          <Image
            source={{ uri: bookingImages.hero }}
            className="h-full w-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-inverse-surface/25" />
          <View className="absolute left-4 top-4 flex-row items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 shadow-sm">
            <Icon name="spa" size={16} color={colors.primary} />
            <VemtapText variant="labelSm" className="text-primary">
              {strings.booking.aestheticCare}
            </VemtapText>
          </View>
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
            <View className="h-1.5 w-6 rounded-full bg-surface" />
            <View className="h-1.5 w-1.5 rounded-full bg-surface/50" />
            <View className="h-1.5 w-1.5 rounded-full bg-surface/50" />
          </View>
        </View>

        <View className="-mt-3 gap-6 px-6">
          <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <Icon name="storefront" size={18} color={colors.primary} />
              <VemtapText variant="labelSm" className="shrink font-sans-medium text-text">
                {strings.booking.merchant}
              </VemtapText>
              <VemtapText variant="labelSm" tone="secondary">
                •
              </VemtapText>
              <VemtapText variant="labelSm" tone="secondary">
                {strings.booking.merchantDistance}
              </VemtapText>
            </View>
            <VemtapText
              accessibilityRole="header"
              variant="headingXl"
              className="text-heading-xl text-text"
            >
              {strings.booking.serviceTitle}
            </VemtapText>
            <View className="flex-row flex-wrap gap-2">
              <Badge icon="schedule" label={strings.booking.duration} />
              <Badge
                icon="star"
                label={`${strings.booking.rating} ${strings.booking.reviews}`}
                iconColor={colors.tertiaryContainer}
              />
              <Badge icon="person" label={strings.booking.unisex} />
            </View>
            <View className="flex-row flex-wrap items-baseline justify-between gap-2 pt-1">
              <View className="flex-row items-baseline gap-2">
                <VemtapText className="font-sans-bold text-display-mobile text-primary">
                  {formatBookingNaira(total)}
                </VemtapText>
                <VemtapText variant="bodyMd" tone="tertiary" className="line-through">
                  {strings.booking.originalPrice}
                </VemtapText>
              </View>
              <View className="rounded-full bg-success-container px-2.5 py-1">
                <VemtapText variant="labelSm" className="font-sans-semibold text-success">
                  {strings.booking.savePercent}
                </VemtapText>
              </View>
            </View>
          </View>

          <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">
            <View className="flex-row items-center justify-between gap-3">
              <VemtapText variant="headingSm" className="text-text">
                {strings.booking.included}
              </VemtapText>
              <VemtapText variant="caption" className="text-primary">
                {strings.booking.stepsProtocol}
              </VemtapText>
            </View>
            <NumberedInstructions items={[...strings.booking.protocol]} />
          </View>

          <AddonSelection
            addons={bookingAddons}
            selected={selectedAddons}
            onToggle={toggleAddon}
          />

          <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
            <View className="flex-row items-center justify-between gap-3">
              <VemtapText variant="headingSm" className="text-text">
                {strings.booking.therapistSelection}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {strings.booking.instantMatch}
              </VemtapText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-3"
            >
              <TherapistCards selected={therapistId} onSelect={setTherapistId} />
            </ScrollView>
          </View>

          <View className="mb-4 gap-3 rounded-card bg-surface p-4 shadow-sm">
            <VemtapText variant="headingSm" className="text-text">
              {strings.booking.importantInformation}
            </VemtapText>
            <InfoRow icon="hourglass" text={strings.booking.arriveEarly} />
            <InfoRow icon="verifiedUser" text={strings.booking.cancellationPolicy} />
            <InfoRow icon="qrCode" text={strings.booking.redemption} />
          </View>
        </View>
      </ScrollView>

      <View
        className="flex-row items-center gap-3 bg-surface px-6 pt-3 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="shrink-0">
          <VemtapText
            variant="caption"
            tone="secondary"
            className="font-sans-semibold uppercase"
          >
            {strings.booking.totalPrice}
          </VemtapText>
          <VemtapText variant="headingMd" className="font-sans-bold text-primary">
            {formatBookingNaira(total)}{' '}
            <VemtapText variant="caption" tone="tertiary">
              • 60m
            </VemtapText>
          </VemtapText>
        </View>
        <View className="min-w-0 flex-1">
          <Button
            label={strings.booking.bookAppointment}
            rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
            onPress={book}
          />
        </View>
      </View>
    </View>
  );
}

function Badge({
  icon,
  label,
  iconColor,
}: {
  icon: 'schedule' | 'star' | 'person';
  label: string;
  iconColor?: string;
}) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1">
      <Icon name={icon} size={15} color={iconColor ?? colors.textSecondary} />
      <VemtapText variant="labelSm" tone="secondary">
        {label}
      </VemtapText>
    </View>
  );
}

function InfoRow({
  icon,
  text,
}: {
  icon: 'hourglass' | 'verifiedUser' | 'qrCode';
  text: string;
}) {
  return (
    <View className="flex-row items-start gap-2.5">
      <Icon name={icon} size={20} color={colors.primary} />
      <VemtapText variant="bodyMd" tone="secondary" className="min-w-0 flex-1">
        {text}
      </VemtapText>
    </View>
  );
}
