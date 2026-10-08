import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { CompactDealCard } from '@components/discover/CompactDealCard';
import { ContactActionGrid } from '@components/discover/ContactActionGrid';
import { DetailActionDockBar } from '@components/discover/DetailActionDockBar';
import { HoursList } from '@components/discover/HoursList';
import { ProfilePageHeader } from '@components/discover/ProfilePageHeader';
import { ReviewCard } from '@components/discover/ReviewCard';
import { ServiceCard } from '@components/discover/ServiceCard';
import { LocationMapView } from '@components/shared/LocationMapView';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  glowCover,
  glowLogo,
  glowMapRegion,
  glowProfileDeals,
  glowProfileServices,
} from '@features/discover/data/glowSerenityData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface GlowSerenityProfileProps {
  onBack: () => void;
  onOpenServices: () => void;
  onOpenDeal: (dealId: string) => void;
  onOpenInApp?: () => void;
}

export function GlowSerenityProfileScreen({
  onBack,
  onOpenServices,
  onOpenDeal,
  onOpenInApp = () => undefined,
}: GlowSerenityProfileProps) {
  const [following, setFollowing] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    strings.glowProfile.address,
  )}`;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-surface-canvas">
      <ProfilePageHeader
        title={strings.glowProfile.businessProfile}
        onBack={onBack}
        right={
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Icon name="person" size={18} color={colors.surface} />
          </View>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-screen self-center pb-3"
      >
        <View className="relative h-64 w-full overflow-hidden bg-surface-container-high">
          <Image
            source={{ uri: glowCover.uri }}
            accessibilityLabel={glowCover.alt}
            className="h-full w-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-surface-dark/40" />
          <View className="absolute right-4 top-4 flex-row items-center gap-1 rounded-full bg-surface-canvas/90 px-3 py-1 shadow-sm">
            <Icon name="verified" size={15} color={colors.badgeDiscountText} />
            <VemtapText variant="caption" className="font-sans-medium text-text">
              {strings.glowProfile.verifiedPartner}
            </VemtapText>
          </View>
        </View>

        <View className="-mt-12 px-6">
          <View className="gap-3 rounded-2xl border border-border bg-surface-canvas p-5 shadow-md">
            <View className="flex-row items-end justify-between gap-3">
              <View className="relative h-20 w-20 shrink-0 rounded-full border-2 border-surface-canvas bg-surface-canvas p-1 shadow-sm">
                <Image
                  source={{ uri: glowLogo.uri }}
                  accessibilityLabel={glowLogo.alt}
                  className="h-full w-full rounded-full bg-surface-canvas"
                  resizeMode="cover"
                />
                <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-primary-container">
                  <Icon name="check" size={15} color={colors.surface} />
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setFollowing(value => !value)}
                className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
                  following ? 'bg-primary' : 'bg-surface-container-low'
                }`}
              >
                <Icon
                  name={following ? 'check' : 'plus'}
                  size={17}
                  color={following ? colors.surface : colors.primary}
                />
                <VemtapText
                  variant="labelMd"
                  tone={following ? 'inverse' : 'brand'}
                  className="font-sans-semibold"
                >
                  {following ? strings.glowProfile.following : strings.glowProfile.follow}
                </VemtapText>
              </Pressable>
            </View>
            <VemtapText
              accessibilityRole="header"
              variant="headingXl"
              className="text-heading-xl text-text"
            >
              {strings.glowProfile.name}
            </VemtapText>
            <VemtapText variant="labelMd" tone="secondary">
              {strings.glowProfile.category}
            </VemtapText>
            <View className="flex-row flex-wrap items-center gap-2">
              <View className="flex-row items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1">
                <Icon name="star" size={16} color={colors.warning} />
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {strings.glowProfile.rating}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {strings.glowProfile.reviewCountLabel}
                </VemtapText>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
                <VemtapText variant="labelSm" className="font-sans-medium text-text">
                  {strings.glowProfile.openNow}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {strings.glowProfile.closesAt}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-start gap-1.5">
              <Icon name="locationOn" size={18} color={colors.primary} />
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                {strings.glowProfile.addressShort}
              </VemtapText>
            </View>
          </View>
        </View>

        <View className="mt-4 flex-row gap-3 px-6">
          <Button
            label={strings.glowProfile.viewDeals(glowProfileDeals.length)}
            className="min-w-0 flex-[1.4] shadow-md"
            leftIcon={<Icon name="localActivity" size={20} color={colors.surface} />}
            onPress={() => onOpenDeal(glowProfileDeals[0].id)}
          />
          <Button
            label={strings.glowProfile.directions}
            variant="secondary"
            fullWidth={false}
            className="min-w-0 flex-1"
            leftIcon={<Icon name="nearMe" size={20} color={colors.primary} />}
            onPress={() => Linking.openURL(directionsUrl).catch(() => undefined)}
          />
        </View>

        <View className="mt-7 bg-surface-subtle px-6 py-5">
          <VemtapText variant="headingSm" className="text-text">
            {strings.glowProfile.about}
          </VemtapText>
          <VemtapText
            variant="bodyMd"
            tone="secondary"
            className={`mt-1.5 ${aboutExpanded ? '' : 'line-clamp-2'}`}
          >
            {aboutExpanded
              ? strings.glowProfile.aboutFull
              : strings.glowProfile.aboutPreview}
          </VemtapText>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAboutExpanded(value => !value)}
            className="mt-1 self-start"
          >
            <VemtapText variant="labelMd" tone="brand">
              {aboutExpanded
                ? strings.glowProfile.showLess
                : strings.glowProfile.readMore}
            </VemtapText>
          </Pressable>
        </View>

        <View className="mt-7 gap-3 px-6">
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-2">
              <Icon name="loyalty" size={22} color={colors.primary} />
              <VemtapText variant="headingSm" className="text-text">
                {strings.glowProfile.activeDeals}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => onOpenDeal(glowProfileDeals[0].id)}
            >
              <VemtapText variant="labelMd" tone="brand">
                {strings.glowProfile.seeAllDeals(glowProfileDeals.length)}
              </VemtapText>
            </Pressable>
          </View>
          {glowProfileDeals.map(deal => (
            <CompactDealCard key={deal.id} deal={deal} onOpen={onOpenDeal} />
          ))}
        </View>

        <View className="mt-7">
          <View className="flex-row items-center justify-between px-6">
            <View className="flex-row items-center gap-2">
              <Icon name="spa" size={22} color={colors.primary} />
              <VemtapText variant="headingSm" className="text-text">
                {strings.glowProfile.popularServices}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onOpenServices}
              className="flex-row items-center"
            >
              <VemtapText variant="labelMd" tone="brand">
                {strings.glowProfile.seeAll}
              </VemtapText>
              <Icon name="forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 px-6 py-1"
          >
            {glowProfileServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                variant="compact"
                onPress={onOpenServices}
                onAction={onOpenServices}
              />
            ))}
          </ScrollView>
        </View>

        <View className="mt-7 gap-3 bg-surface-subtle px-6 py-5">
          <VemtapText variant="headingSm" className="text-text">
            {strings.glowProfile.connectWithSalon}
          </VemtapText>
          <ContactActionGrid
            phone="+2348000000000"
            whatsappUrl="https://wa.me"
            onInApp={onOpenInApp}
            onWebsite={() => undefined}
          />
        </View>

        <View className="mt-7 bg-surface-subtle px-6 py-5">
          <View className="mb-3 flex-row items-center justify-between">
            <VemtapText variant="headingSm" className="text-text">
              {strings.glowProfile.operatingHours}
            </VemtapText>
            <View className="rounded-full bg-badge-discount-bg px-2.5 py-0.5">
              <VemtapText variant="caption" className="text-badge-discount-text">
                {strings.glowProfile.openNowBadge}
              </VemtapText>
            </View>
          </View>
          <HoursList />
        </View>

        <View className="mt-7 px-6">
          <VemtapText variant="headingSm" className="text-text">
            {strings.glowProfile.location}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary" className="mb-3 mt-1">
            {strings.glowProfile.address}
          </VemtapText>
          <LocationMapView
            region={glowMapRegion}
            style={styles.map}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <View className="absolute inset-0 items-center justify-center">
              <View className="rounded bg-surface-canvas px-2 py-1 shadow-md">
                <VemtapText className="font-sans-bold text-caption text-text">
                  {strings.glowServices.merchantName}
                </VemtapText>
              </View>
              <Icon name="locationOn" size={34} color={colors.primary} />
            </View>
          </LocationMapView>
          <Button
            label={strings.glowProfile.openNavigation}
            variant="secondary"
            className="mt-3"
            leftIcon={<Icon name="myLocation" size={20} color={colors.primary} />}
            onPress={() => Linking.openURL(directionsUrl).catch(() => undefined)}
          />
        </View>

        <View className="mt-7 gap-3 px-6">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0">
              <VemtapText variant="headingSm" className="text-text">
                {strings.glowProfile.customerReviews}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {strings.glowProfile.reviewsSummary}
              </VemtapText>
            </View>
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map(star => (
                <Icon key={star} name="star" size={18} color={colors.warning} />
              ))}
            </View>
          </View>
          {strings.glowProfile.reviews.map(review => (
            <ReviewCard
              key={review.id}
              name={review.name}
              meta={review.meta}
              review={review.review}
            />
          ))}
        </View>
      </ScrollView>
      <DetailActionDockBar
        eyebrow={strings.glowProfile.specialOffer}
        value={strings.glowProfile.upToOff}
        action={strings.glowProfile.claimDeal}
        onAction={() => onOpenDeal(glowProfileDeals[0].id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: { height: 176 },
});
