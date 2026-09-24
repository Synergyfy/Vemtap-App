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
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { CompactDealCard } from '@components/discover/CompactDealCard';
import { ContactActionGrid } from '@components/discover/ContactActionGrid';
import { DetailActionDockBar } from '@components/discover/DetailActionDockBar';
import { HoursList } from '@components/discover/HoursList';
import { ProfilePageHeader } from '@components/discover/ProfilePageHeader';
import { ReviewCard } from '@components/discover/ReviewCard';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { LocationMapView } from '@components/shared/LocationMapView';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  formatNaira,
  urbanCover,
  urbanMapRegion,
  urbanProducts,
  urbanProfileDeals,
  urbanReviews,
} from '@features/discover/data/urbanGrillData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface UrbanGrillProfileProps {
  onBack: () => void;
  onOpenCatalogue: () => void;
  onOpenMenu: () => void;
  onOpenAllDeals: () => void;
  onOpenDeal: (dealId: string) => void;
  onOpenInApp?: () => void;
  onOpenWebsite?: () => void;
}

export function UrbanGrillProfileScreen({
  onBack,
  onOpenCatalogue,
  onOpenMenu,
  onOpenAllDeals,
  onOpenDeal,
  onOpenInApp = () => undefined,
  onOpenWebsite = () => undefined,
}: UrbanGrillProfileProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const popular = urbanProducts.slice(0, 3);
  const phone = '+2348000000000';
  const whatsappUrl = 'https://wa.me';
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(strings.urbanProfile.address)}`;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-surface-canvas">
      <ProfilePageHeader
        title={strings.urbanProfile.businessProfile}
        onBack={onBack}
        right={
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanProfile.bookmark}
              onPress={() => setBookmarked(value => !value)}
              className="h-11 w-11 items-center justify-center"
            >
              <Icon name="bookmark" size={22} color={colors.text} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanProfile.share}
              onPress={() => {
                Share.share({ message: strings.urbanProfile.name }).catch(
                  () => undefined,
                );
              }}
              className="h-11 w-11 items-center justify-center"
            >
              <Icon name="share" size={22} color={colors.text} />
            </Pressable>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Icon name="person" size={18} color={colors.surface} />
            </View>
          </>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-screen self-center pb-3"
      >
        <View className="relative h-[210px] w-full overflow-hidden bg-surface-container">
          <Image
            source={{ uri: urbanCover.uri }}
            accessibilityLabel={urbanCover.alt}
            className="h-full w-full"
            resizeMode="cover"
          />
          <View className="absolute inset-x-0 bottom-0 h-28 bg-surface-dark/60" />
          <View className="absolute right-4 top-4 flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanProfile.bookmark}
              onPress={() => setBookmarked(value => !value)}
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
                Share.share({ message: strings.urbanProfile.name }).catch(
                  () => undefined,
                );
              }}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-canvas shadow-sm"
            >
              <Icon name="share" size={20} color={colors.text} />
            </Pressable>
          </View>
          <View className="absolute bottom-3 right-4 flex-row items-center gap-1.5 rounded-full bg-surface-dark/70 px-3 py-1">
            <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
            <VemtapText variant="caption" tone="inverse">
              {strings.urbanProfile.verifiedPartner}
            </VemtapText>
          </View>
        </View>

        <View className="-mt-7 px-6">
          <View className="gap-3 rounded-2xl border border-border bg-surface-canvas p-5 shadow-md">
            <View className="flex-row items-start justify-between gap-3">
              <View className="relative -mt-10 h-16 w-16 shrink-0">
                <Image
                  source={{ uri: urbanCover.uri }}
                  accessibilityLabel={urbanCover.alt}
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
              {strings.urbanProfile.name}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary">
              {strings.urbanProfile.category}
            </VemtapText>
            <View className="flex-row flex-wrap items-center gap-2">
              <View className="flex-row items-center gap-1 rounded-lg bg-surface-muted px-2.5 py-1">
                <Icon name="star" size={16} color={colors.tertiary} />
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {strings.urbanProfile.rating}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {strings.urbanProfile.reviewCount}
                </VemtapText>
              </View>
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
                {strings.urbanProfile.addressShort}
              </VemtapText>
            </View>
          </View>
        </View>

        <View className="mt-4 flex-row gap-3 px-6">
          <Button
            label={strings.urbanProfile.viewDeals(urbanProfileDeals.length)}
            className="min-w-0 flex-[1.4] shadow-md"
            leftIcon={<Icon name="localOffer" size={20} color={colors.surface} />}
            onPress={onOpenAllDeals}
          />
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
              {strings.urbanProfile.aboutCopy}
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
              <Icon
                name={aboutExpanded ? 'expandMore' : 'expandMore'}
                size={16}
                color={colors.primary}
              />
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
                  {urbanProfileDeals.length}
                </VemtapText>
              </View>
            </View>
            <Pressable accessibilityRole="button" onPress={onOpenAllDeals}>
              <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
                {strings.urbanProfile.seeAllDeals(urbanProfileDeals.length)}
              </VemtapText>
            </Pressable>
          </View>
          {urbanProfileDeals.slice(0, 2).map(deal => (
            <CompactDealCard key={deal.id} deal={deal} onOpen={onOpenDeal} />
          ))}
        </View>

        <View className="mt-7">
          <View className="flex-row items-center justify-between px-6">
            <VemtapText variant="headingSm" className="text-text">
              {strings.urbanProfile.popularMenu}
            </VemtapText>
            <Pressable accessibilityRole="button" onPress={onOpenMenu}>
              <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
                {strings.urbanProfile.seeAll}
              </VemtapText>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 px-6 py-1"
          >
            {popular.map(product => (
              <Pressable
                key={product.id}
                accessibilityRole="button"
                onPress={onOpenCatalogue}
                className="w-40 shrink-0 rounded-2xl border border-border bg-surface-canvas p-2.5 shadow-md"
              >
                <Image
                  source={{ uri: product.imageUri }}
                  accessibilityLabel={product.imageAlt}
                  className="mb-2 h-28 w-full rounded-xl bg-surface-container"
                  resizeMode="cover"
                />
                <VemtapText variant="labelMd" className="truncate text-text">
                  {product.name}
                </VemtapText>
                <View className="mt-1 flex-row items-center justify-between">
                  <VemtapText variant="labelMd" className="font-sans-bold text-text">
                    {formatNaira(product.price)}
                  </VemtapText>
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-surface-tint">
                    <Icon name="plus" size={16} color={colors.primary} />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="mt-7 px-6">
          <ContactActionGrid
            phone={phone}
            whatsappUrl={whatsappUrl}
            onInApp={onOpenInApp}
            onWebsite={onOpenWebsite}
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
                  {strings.urbanProfile.address}
                </VemtapText>
              </View>
            </View>
            <LocationMapView
              region={urbanMapRegion}
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

        <View className="mt-6 gap-3 px-6">
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-2">
              <VemtapText variant="headingSm" className="text-text">
                {strings.urbanProfile.reviewsTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary">
                ★ {strings.urbanProfile.rating} {strings.urbanProfile.reviewCount}
              </VemtapText>
            </View>
            <Pressable accessibilityRole="button">
              <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
                {strings.urbanProfile.seeAllReviews(142)}
              </VemtapText>
            </Pressable>
          </View>
          <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface-canvas p-4 shadow-md">
            <View className="flex-row items-center gap-3">
              <VemtapText className="font-sans-bold text-heading-md text-text">
                {strings.urbanProfile.rating}
              </VemtapText>
              <View>
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Icon key={star} name="star" size={18} color={colors.tertiary} />
                  ))}
                </View>
                <VemtapText variant="caption" tone="secondary">
                  {strings.urbanProfile.verifiedOrders(142)}
                </VemtapText>
              </View>
            </View>
            <Icon name="verified" size={28} color={colors.outline} />
          </View>
          {urbanReviews.map(review => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </View>
      </ScrollView>
      <DetailActionDockBar
        eyebrow={strings.urbanProfile.specialOffer}
        value={strings.urbanProfile.upToOff}
        action={strings.urbanProfile.claimDeal}
        onAction={() => onOpenDeal(urbanProfileDeals[0].id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: { height: 144 },
});
