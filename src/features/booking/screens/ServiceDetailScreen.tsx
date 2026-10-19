import React, { useCallback, useMemo } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { DoubleTapLike } from '@components/shared/DoubleTapLike';
import { LikeButton } from '@components/shared/LikeButton';
import { useCatalogueItemLike } from '@features/order/hooks/useCatalogueItemLike';
import { strings } from '@constants/strings';
import { toAmount } from '@features/deals/utils/offerMapper';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import { useServiceItem } from '@features/booking/hooks/useServiceItem';
import { formatBookingNaira } from '@features/booking/bookingData';

cssInterop(Image, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'ServiceDetail'>;

/**
 * One catalogue service, read from `GET /public/catalogue/items/:id`.
 *
 * Everything on screen comes from that payload: name, branch price, duration,
 * description and the merchant/branch names the opening list supplied. The two
 * design-only sections that had no endpoint behind them — the add-on upsell and
 * the specialist picker — are gone rather than kept as pickers whose selection
 * would be dropped: `CreateBookingDto` accepts neither, so a choice made there
 * could never have reached the server.
 */
export function ServiceDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { serviceId, branchId, businessName, branchName } = route.params ?? {};
  const item = useServiceItem(serviceId, branchId);
  const like = useCatalogueItemLike(serviceId);

  const hero = useMemo(() => {
    const gallery = item.data?.galleryImages ?? [];
    return item.data?.mainImage ?? gallery[0] ?? null;
  }, [item.data]);

  const share = useCallback(() => {
    Share.share({
      message: `${item.data?.name ?? strings.bookingFlow.service} — ${
        businessName ?? strings.bookingFlow.business
      }`,
    }).catch(() => undefined);
  }, [businessName, item.data?.name]);

  const book = useCallback(() => {
    navigation.navigate('ScheduleAppointment', {
      draft: {
        itemId: serviceId,
        branchId,
        date: '',
        time: '',
        notes: '',
        businessName,
        branchName,
      },
    });
  }, [branchId, branchName, businessName, navigation, serviceId]);

  const header = (
    <SafeAreaView edges={['top']} className="bg-surface">
      <RegistrationHeader
        title={strings.bookingFlow.serviceDetail}
        onBack={navigation.goBack}
        showShareAction
        onShare={share}
      />
    </SafeAreaView>
  );

  if (!serviceId) {
    return (
      <View className="flex-1 bg-surface">
        {header}
        <EmptyState
          title={strings.bookingFlow.serviceMissingTitle}
          description={strings.bookingFlow.serviceMissingBody}
          onAction={navigation.goBack}
          actionLabel={strings.bookingFlow.serviceMissingAction}
        />
      </View>
    );
  }

  if (item.isLoading) {
    return (
      <View className="flex-1 bg-surface">
        {header}
        <LoadingState label={strings.bookingFlow.loadingService} />
      </View>
    );
  }

  if (item.isError || !item.data) {
    return (
      <View className="flex-1 bg-surface">
        {header}
        <ErrorState
          title={strings.bookingFlow.serviceErrorTitle}
          description={strings.bookingFlow.serviceErrorBody}
          onRetry={() => item.refetch()}
        />
      </View>
    );
  }

  const service = item.data;
  const description = service.description ?? service.shortDescription;

  return (
    <View className="flex-1 bg-surface">
      {header}

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="pb-40"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative aspect-[4/3] overflow-hidden bg-surface-container-high">
          {hero ? (
            <DoubleTapLike onDoubleTap={like.like} style={StyleSheet.absoluteFill}>
              <Image
                source={{ uri: hero }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </DoubleTapLike>
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Icon name="spa" size={64} color={colors.outline} />
            </View>
          )}
          <View pointerEvents="none" className="absolute inset-0 bg-inverse-surface/25" />
          {service.category?.name ? (
            <View className="absolute left-4 top-4 flex-row items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 shadow-sm">
              <Icon name="spa" size={16} color={colors.primary} />
              <VemtapText variant="labelSm" className="text-primary">
                {service.category.name}
              </VemtapText>
            </View>
          ) : null}
        </View>

        <View className="-mt-3 gap-6 px-6">
          <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <Icon name="storefront" size={18} color={colors.primary} />
              <VemtapText variant="labelSm" className="shrink font-sans-medium text-text">
                {businessName ?? strings.bookingFlow.business}
              </VemtapText>
              {branchName ? (
                <>
                  <VemtapText variant="labelSm" tone="secondary">
                    •
                  </VemtapText>
                  <VemtapText variant="labelSm" tone="secondary">
                    {branchName}
                  </VemtapText>
                </>
              ) : null}
            </View>
            <VemtapText
              accessibilityRole="header"
              variant="headingXl"
              className="text-heading-xl text-text"
            >
              {service.name}
            </VemtapText>
            <LikeButton
              liked={like.liked}
              likesCount={like.likesCount}
              onToggle={like.toggle}
              accessibilityLabel={service.name}
            />
            <View className="flex-row flex-wrap gap-2">
              {service.duration ? (
                <Badge icon="schedule" label={service.duration} />
              ) : null}
              {service.serviceMode ? (
                <Badge icon="locationOn" label={strings.bookingFlow.atTheBranch} />
              ) : null}
            </View>
            <View className="flex-row flex-wrap items-baseline gap-2 pt-1">
              <VemtapText className="font-sans-bold text-display-mobile text-primary">
                {formatBookingNaira(toAmount(service.price) ?? 0)}
              </VemtapText>
            </View>
          </View>

          {description ? (
            <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">
              <VemtapText variant="headingSm" className="text-text">
                {strings.bookingFlow.aboutService}
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary" className="leading-relaxed">
                {description}
              </VemtapText>
            </View>
          ) : null}

          <View className="mb-4 gap-3 rounded-card bg-surface p-4 shadow-sm">
            <VemtapText variant="headingSm" className="text-text">
              {strings.bookingFlow.importantInformation}
            </VemtapText>
            <InfoRow
              icon="hourglass"
              text={`${strings.bookingFlow.arriveTitle} — ${strings.bookingFlow.arriveBody}`}
            />
            <InfoRow icon="calendar" text={strings.bookingFlow.cancelAnytimeBody} />
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
            {formatBookingNaira(toAmount(service.price) ?? 0)}{' '}
            {service.duration ? (
              <VemtapText variant="caption" tone="tertiary">
                • {service.duration}
              </VemtapText>
            ) : null}
          </VemtapText>
        </View>
        <View className="min-w-0 flex-1">
          {branchId ? (
            <Button
              label={strings.booking.bookAppointment}
              rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
              onPress={book}
            />
          ) : (
            <VemtapText variant="caption" tone="secondary" className="text-center">
              {strings.bookingFlow.noBranchToBook}
            </VemtapText>
          )}
        </View>
      </View>
    </View>
  );
}

function Badge({ icon, label }: { icon: 'schedule' | 'locationOn'; label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1">
      <Icon name={icon} size={15} color={colors.textSecondary} />
      <VemtapText variant="labelSm" tone="secondary">
        {label}
      </VemtapText>
    </View>
  );
}

function InfoRow({ icon, text }: { icon: 'hourglass' | 'calendar'; text: string }) {
  return (
    <View className="flex-row items-start gap-2.5">
      <Icon name={icon} size={20} color={colors.primary} />
      <VemtapText variant="bodyMd" tone="secondary" className="min-w-0 flex-1">
        {text}
      </VemtapText>
    </View>
  );
}
