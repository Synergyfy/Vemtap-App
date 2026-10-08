import React, { useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContactActionGrid } from '@components/discover/ContactActionGrid';
import { DetailActionDockBar } from '@components/discover/DetailActionDockBar';
import { HoursList } from '@components/discover/HoursList';
import { ProfilePageHeader } from '@components/discover/ProfilePageHeader';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { LocationMapView } from '@components/shared/LocationMapView';
import { LoadingState } from '@components/shared/LoadingState';
import { EmptyState } from '@components/shared/EmptyState';
import { usePublicBusinessProfile } from '@features/discover/hooks/usePublicBusinessProfile';
import {
  useBusinessSaveStatus,
  useToggleBusinessSave,
} from '@features/accountHub/hooks/useSavedHub';
import type { LiveBusinessProfile } from '@features/discover/utils/liveBusinessMapper';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import type { BusinessProfileSummary } from '@features/discover/data/discoverData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(Image, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });

export interface BusinessProfileScreenProps {
  /**
   * A bundled Discover business. Mutually exclusive with `code`, which is how a
   * real offer reaches its merchant: the live offer carries the merchant's
   * 9-character code and the profile is fetched from the public endpoint.
   */
  business?: BusinessProfileSummary;
  code?: string;
  onBack: () => void;
  onOpenDeal?: (dealId: string) => void;
  onOpenInApp?: () => void;
}

const mapRegion = {
  latitude: 9.0765,
  longitude: 7.3986,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

export function BusinessProfileScreen({
  business: bundledBusiness,
  code,
  onBack,
  onOpenDeal = () => undefined,
  onOpenInApp = () => undefined,
}: BusinessProfileScreenProps) {
  const [bundledBookmarked, setBundledBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);

  const live = usePublicBusinessProfile(code);
  const business = (bundledBusiness ??
    (live.status === 'resolved' ? live.business : undefined)) as
    LiveBusinessProfile | undefined;

  /**
   * A real merchant saves to the account (`POST /businesses/:id/save`); the
   * bundled Discover businesses have no server id and keep the local toggle.
   */
  const liveBusinessId = live.status === 'resolved' ? live.business.id : null;
  const liveSaveStatus = useBusinessSaveStatus(liveBusinessId);
  const toggleBusinessSave = useToggleBusinessSave();
  const bookmarked = liveBusinessId
    ? (liveSaveStatus.data?.isSaved ?? false)
    : bundledBookmarked;
  const toggleBookmark = () => {
    if (liveBusinessId) toggleBusinessSave.mutate(liveBusinessId);
    else setBundledBookmarked(value => !value);
  };

  // Loading and failure come before the page so a merchant with no data yet
  // shows an honest state rather than a blank profile.
  if (!business) {
    return (
      <SafeAreaView edges={[]} className="flex-1 bg-surface-canvas">
        {live.status === 'loading' ? (
          <LoadingState label={strings.common.loading} />
        ) : (
          <EmptyState
            icon="search"
            title={
              live.status === 'notFound' ? strings.errors.notFound : strings.errors.server
            }
            description={strings.businessProfile.unavailableBody}
            actionLabel={live.status === 'notFound' ? undefined : strings.common.retry}
            onAction={live.status === 'notFound' ? undefined : live.retry}
            className="mt-16"
          />
        )}
      </SafeAreaView>
    );
  }

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    business.location,
  )}`;
  /**
   * The merchant's own description when there is one. The generated sentence is
   * the fallback for the bundled businesses, which have no description field.
   */
  const aboutCopy =
    business.description ??
    `Discover ${business.category.toLowerCase()} at ${business.name}. Enjoy curated offers and convenient service at ${business.location}.`;

  /**
   * A real business has no public rating source and no per-business offer count,
   * so those rows are omitted rather than rendered empty or filled with a
   * plausible number. The bundled Discover businesses keep both.
   */
  const hasRating = business.rating !== '';
  const hasActiveDeals = business.activeDealLabel !== '';

  /** A real merchant's own contact details; the bundled ones are hardcoded. */
  const livePhone = business.phone ?? business.whatsappNumber;

  /** Centre the map on the merchant when it has real coordinates. */
  const region =
    business.latitude !== undefined && business.longitude !== undefined
      ? {
          latitude: business.latitude,
          longitude: business.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }
      : mapRegion;
  return (
    <SafeAreaView edges={[]} className="flex-1 bg-surface-canvas">
      <ProfilePageHeader
        title={strings.urbanProfile.businessProfile}
        onBack={onBack}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.discoverFeed.bookmarkBusiness(business.name)}
            accessibilityState={{ selected: bookmarked }}
            onPress={toggleBookmark}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-canvas shadow-sm"
          >
            <Icon
              name="bookmark"
              size={20}
              color={bookmarked ? colors.primary : colors.text}
            />
          </Pressable>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-screen self-center pb-3"
      >
        <View className="relative h-[210px] w-full overflow-hidden bg-surface-container">
          <Image
            source={{ uri: business.imageUri }}
            accessibilityLabel={business.imageAlt}
            className="h-full w-full"
            resizeMode="cover"
          />
          <View className="absolute inset-x-0 bottom-0 h-28 bg-surface-dark/60" />
          <View className="absolute right-4 top-4 flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.discoverFeed.bookmarkBusiness(business.name)}
              accessibilityState={{ selected: bookmarked }}
              onPress={toggleBookmark}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-canvas shadow-sm"
            >
              <Icon
                name="bookmark"
                size={20}
                color={bookmarked ? colors.primary : colors.text}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanProfile.share}
              onPress={() => {
                Share.share({ message: business.name }).catch(() => undefined);
              }}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-canvas shadow-sm"
            >
              <Icon name="share" size={20} color={colors.text} />
            </Pressable>
          </View>
          <View className="absolute bottom-3 right-4 flex-row items-center gap-1.5 rounded-full bg-surface-dark/70 px-3 py-1">
            <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
            <VemtapText variant="caption" tone="inverse">
              {business.status.label}
            </VemtapText>
          </View>
        </View>

        <View className="-mt-7 px-6">
          <View className="gap-3 rounded-2xl border border-border bg-surface-canvas p-5 shadow-md">
            <View className="flex-row items-start justify-between gap-3">
              <View className="relative -mt-10 h-16 w-16 shrink-0">
                <Image
                  source={{ uri: business.imageUri }}
                  accessibilityLabel={business.imageAlt}
                  className="h-full w-full rounded-2xl bg-surface-canvas"
                />
                <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-primary-container">
                  <Icon name="check" size={15} color={colors.surface} />
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setFollowing(value => !value)}
                className="flex-row items-center gap-1.5 rounded-full bg-surface-tint px-3.5 py-1.5"
              >
                <Icon
                  name={following ? 'check' : 'plus'}
                  size={16}
                  color={following ? colors.badgeDiscountText : colors.primary}
                />
                <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                  {following
                    ? strings.urbanProfile.following
                    : strings.urbanProfile.follow}
                </VemtapText>
              </Pressable>
            </View>
            <VemtapText
              accessibilityRole="header"
              variant="headingLg"
              className="text-heading-lg text-text"
            >
              {business.name}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary">
              {business.category}
            </VemtapText>
            <View className="flex-row flex-wrap items-center gap-2">
              {hasRating ? (
                <View className="flex-row items-center gap-1 rounded-lg bg-surface-muted px-2.5 py-1">
                  <Icon name="star" size={16} color={colors.tertiary} />
                  <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                    {business.rating}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {strings.discoverFeed.reviewCount(business.reviews)}
                  </VemtapText>
                </View>
              ) : null}
              <View className="flex-row items-center gap-1 rounded-lg bg-badge-discount-bg px-2.5 py-1">
                <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
                <VemtapText variant="labelSm" className="text-badge-discount-text">
                  {strings.urbanProfile.openNow}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Icon name="distance" size={18} color={colors.primary} />
              <VemtapText variant="labelSm" tone="secondary">
                {business.location}
              </VemtapText>
            </View>
          </View>
        </View>

        <View className="mt-4 flex-row gap-3 px-6">
          {hasActiveDeals ? (
            <Button
              label={business.activeDealLabel}
              className="min-w-0 flex-[1.4] shadow-md"
              leftIcon={<Icon name="localOffer" size={20} color={colors.surface} />}
              onPress={() => onOpenDeal(business.id)}
            />
          ) : null}
          <Button
            label={strings.urbanProfile.directions}
            variant="secondary"
            fullWidth={false}
            className="min-w-0 flex-1"
            leftIcon={<Icon name="nearMe" size={20} color={colors.primary} />}
            onPress={() => {
              Linking.openURL(directionsUrl).catch(() => undefined);
            }}
          />
        </View>

        <View className="mt-6 px-6">
          <View className="rounded-2xl border border-border bg-surface-canvas p-4 shadow-md">
            <VemtapText variant="headingSm" className="text-text">
              {strings.urbanProfile.about}
            </VemtapText>
            <VemtapText
              variant="bodyMd"
              tone="secondary"
              className={`mt-1.5 ${aboutExpanded ? '' : 'line-clamp-2'}`}
            >
              {aboutCopy}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAboutExpanded(value => !value)}
              className="mt-1 flex-row items-center gap-0.5"
            >
              <VemtapText variant="labelMd" tone="brand" className="font-sans-medium">
                {aboutExpanded
                  ? strings.urbanProfile.showLess
                  : strings.urbanProfile.readMore}
              </VemtapText>
              <Icon name="expandMore" size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View className="mt-7 gap-3 px-6">
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-2">
              <VemtapText variant="headingSm" className="text-text">
                {strings.urbanProfile.activeDeals}
              </VemtapText>
              <View className="rounded-full bg-primary px-2 py-0.5">
                <VemtapText variant="caption" tone="inverse">
                  1
                </VemtapText>
              </View>
            </View>
            <Pressable accessibilityRole="button" onPress={() => onOpenDeal(business.id)}>
              <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
                {strings.urbanProfile.seeAllDeals(1)}
              </VemtapText>
            </Pressable>
          </View>
          {hasActiveDeals ? (
            <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface-canvas p-3.5 shadow-md">
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {business.activeDealLabel}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {strings.discoverFeed.realTimePerks}
                </VemtapText>
              </View>
              <Icon name="offer" size={20} color={colors.primary} />
            </View>
          ) : null}
        </View>

        <View className="mt-7 px-6">
          <ContactActionGrid
            phone={livePhone ?? '+2348000000000'}
            whatsappUrl={
              livePhone
                ? `https://wa.me/${livePhone.replace(/[^\d]/g, '')}`
                : 'https://wa.me'
            }
            onInApp={onOpenInApp}
            onWebsite={() => undefined}
          />
        </View>
        <View className="mt-6 px-6">
          <HoursList />
        </View>

        <View className="mt-6 gap-3 px-6">
          <View className="rounded-2xl border border-border bg-surface-canvas p-4 shadow-md">
            <View className="flex-row gap-2">
              <Icon name="locationOn" size={20} color={colors.primary} />
              <View className="min-w-0">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {strings.urbanProfile.location}
                </VemtapText>
                <VemtapText variant="bodyMd" tone="secondary">
                  {business.location}
                </VemtapText>
              </View>
            </View>
            <LocationMapView
              region={region}
              style={styles.map}
              scrollEnabled={false}
              zoomEnabled={false}
            />
            <Button
              label={strings.urbanProfile.openNavigation}
              variant="secondary"
              leftIcon={<Icon name="nearMe" size={18} color={colors.primary} />}
              onPress={() => {
                Linking.openURL(directionsUrl).catch(() => undefined);
              }}
            />
          </View>
        </View>

        {/* No public business-rating endpoint, so a real merchant has no rating to
            show. Omitting the whole section is honest; rendering "★ " with no
            number would not be. */}
        {hasRating ? (
          <View className="mt-6 gap-3 px-6">
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-row items-center gap-2">
                <VemtapText variant="headingSm" className="text-text">
                  {strings.urbanProfile.reviewsTitle}
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  ★ {business.rating} {strings.discoverFeed.reviewCount(business.reviews)}
                </VemtapText>
              </View>
              <Pressable accessibilityRole="button">
                <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
                  {strings.urbanProfile.seeAllReviews(business.reviews)}
                </VemtapText>
              </Pressable>
            </View>
            <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface-canvas p-4 shadow-md">
              <View className="flex-row items-center gap-3">
                <VemtapText className="font-sans-bold text-heading-md text-text">
                  {business.rating}
                </VemtapText>
                <View>
                  <View className="flex-row">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Icon key={star} name="star" size={18} color={colors.tertiary} />
                    ))}
                  </View>
                  <VemtapText variant="caption" tone="secondary">
                    {strings.urbanProfile.verifiedOrders(business.reviews)}
                  </VemtapText>
                </View>
              </View>
              <Icon name="verified" size={28} color={colors.outline} />
            </View>
          </View>
        ) : null}
      </ScrollView>
      <DetailActionDockBar
        eyebrow={strings.urbanProfile.specialOffer}
        value={strings.urbanProfile.upToOff}
        action={strings.urbanProfile.claimDeal}
        onAction={() => onOpenDeal(business.id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: { height: 144 },
});
