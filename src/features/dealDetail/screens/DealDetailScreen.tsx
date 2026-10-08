import React, { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { LocationMapView } from '@components/shared/LocationMapView';
import {
  ClaimAuthModalSheet,
  ClaimConfirmationSheet,
  ClaimIdentitySheet,
  ClaimTermsSheet,
  DealCommentsSheet,
  DealShareSheet,
  GiftConfirmSheet,
  GiftDetailsSheet,
  RecipientDetailsSheet,
  RecipientSummarySheet,
  RecipientVerificationSheet,
  type ClaimDealData,
  type RecipientData,
} from '@features/dealDetail/components';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { navbarBottomShadow } from '@theme/shadows';
import type { AppStackParamList } from '@navigation/types';
import { useDealDetail } from '@features/dealDetail/hooks/useDealDetail';
import { useOfferClaim } from '@features/dealDetail/hooks/useOfferClaim';
import { useDealReaction } from '@features/deals/hooks/useDealEngagementActions';
import { useDealEngagement } from '@features/deals/hooks/usePublicOffers';
import { LoadingState } from '@components/shared/LoadingState';
import { EmptyState } from '@components/shared/EmptyState';
import { useAuthStore, selectIsAuthenticated } from '@store/authStore';
import { businesses } from '@features/discover/data/discoverData';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'DealDetail'>;
type ClaimFlowStep =
  | 'confirmation'
  | 'auth'
  | 'identity'
  | 'recipient'
  | 'verification'
  | 'summary'
  | 'selfIdentity'
  | 'selfVerification'
  | 'gift'
  | 'giftConfirm'
  | 'terms'
  | null;

const apoRegion = {
  latitude: 9.0765,
  longitude: 7.3986,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

type DealDetailProps = {
  title: string;
  badge: string;
  /** Absent when the offer has no known end date; the row is then omitted. */
  endsIn?: string;
  distance: string;
  location: string;
  price: string;
  priceWas: string;
  save: string;
  description: string;
  address: string;
  likes: number;
  comments: number;
};

export function DealDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [claimStep, setClaimStep] = useState<ClaimFlowStep>(null);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const [claimingAs, setClaimingAs] = useState('john@email.com');
  const [recipient, setRecipient] = useState<RecipientData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [giftRecipient, setGiftRecipient] = useState<RecipientData & { message: string }>(
    {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
    },
  );

  // Fictional deals resolve locally; real ones come from the API. Until one
  // resolves there is no deal to render, and showing a stand-in would be
  // presenting invented prices as if they were the merchant's.
  const detail = useDealDetail(route.params.dealId);
  const deal = detail.status === 'resolved' ? detail.deal : undefined;

  /**
   * Only a real offer can be claimed: the claim endpoints are keyed by offer UUID
   * and the app's fictional deals do not exist server-side.
   */
  const isLiveOffer =
    deal?.businessCode !== undefined &&
    !deal.id.startsWith('urban-grill') &&
    !deal.id.startsWith('glow-');
  const claim = useOfferClaim(route.params.dealId);

  /**
   * Real like toggle with optimistic updates and auth gating.
   * For fictional deals the hook still works but the API will 401/404;
   * the hook handles `needsAuth` so the UI can prompt sign-in.
   */
  const reaction = useDealReaction(route.params.dealId);
  const engagement = useDealEngagement(route.params.dealId);

  /**
   * The fictional Discover businesses are reached by id prefix. A real offer has
   * no such prefix and instead carries the merchant's 9-character code, which
   * is what the public business endpoint is keyed by — so the merchant link
   * works for real offers instead of silently doing nothing.
   */
  const seedBusinessId = route.params.dealId.startsWith('urban-grill')
    ? 'urban-grill'
    : route.params.dealId.startsWith('glow-')
      ? 'glow-serenity'
      : route.params.dealId.includes('sky-lounge')
        ? 'sky-lounge'
        : route.params.dealId.startsWith('sole-district')
          ? 'sole-district'
          : route.params.dealId.startsWith('cafe-neo')
            ? 'cafe-neo'
            : null;
  const seedBusiness = businesses.find(item => item.id === seedBusinessId);
  const details: DealDetailProps | null = deal
    ? {
        title: deal.title,
        badge: deal.badge,
        // Real countdown, or nothing. This was a hardcoded "Ends in 3 days".
        endsIn: deal.endsIn,
        distance: deal.distance,
        location: deal.location,
        price: deal.price,
        priceWas: deal.priceWas,
        save: deal.save,
        description: deal.description,
        address: deal.address,
        // Engagement cache is the one number every screen shares; fall back to
        // the payload while it loads (and for seed deals with no endpoint).
        likes: engagement.data?.likesCount ?? deal.likes,
        comments: deal.comments,
      }
    : null;

  const handleShare = useCallback(() => {
    setShareVisible(true);
  }, []);

  const handleOpenBusiness = useCallback(() => {
    // A fictional deal links to its bundled Discover profile; a real offer links
    // to the merchant's public profile, fetched by code.
    if (deal?.businessCode) {
      navigation.navigate('Tabs', {
        screen: 'Discover',
        params: {
          screen: 'BusinessProfile',
          params: { code: deal.businessCode },
        },
      });
      return;
    }
    if (seedBusiness) {
      navigation.navigate('Tabs', {
        screen: 'Discover',
        params: {
          screen: 'BusinessProfile',
          params: { business: seedBusiness },
        },
      });
    }
  }, [deal?.businessCode, seedBusiness, navigation]);

  const handleClaim = useCallback(() => {
    if (claimed) {
      navigation.navigate('MyClaimedDeal', { dealId: route.params.dealId });
      return;
    }
    setClaimStep('confirmation');
  }, [claimed, route.params.dealId, navigation]);

  /**
   * Marks the offer claimed. For a real offer this only proceeds once the API
   * has verified the emailed code and issued a claim code — previously it set the
   * flag unconditionally, so a user could "claim" a promotion that was never
   * issued.
   */
  const completeClaim = useCallback(() => {
    const verified = claim.status.phase === 'claimed';
    if (isLiveOffer && !verified) {
      setClaimStep('selfIdentity');
      return;
    }
    setClaimed(true);
    setClaimStep(null);
    navigation.navigate('DealClaimedSuccess', {
      dealId: route.params.dealId,
      claimCode:
        verified && claim.status.phase === 'claimed' ? claim.status.claimCode : undefined,
    });
  }, [isLiveOffer, claim.status, route.params.dealId, navigation]);

  // A verified code is the success moment for a real claim; there is nothing
  // left for the user to confirm afterwards.
  useEffect(() => {
    if (claim.status.phase === 'claimed') {
      setClaimed(true);
      setClaimStep(null);
      navigation.navigate('DealClaimedSuccess', {
        dealId: route.params.dealId,
        claimCode: claim.status.claimCode,
      });
    }
  }, [claim.status, navigation, route.params.dealId]);

  // Loading, gone, or broken: say so instead of inventing an offer to fill the
  // page. These branches come after every hook so hook order never changes.
  if (detail.status !== 'resolved' || !deal || !details) {
    return (
      <View className="flex-1 bg-background">
        <SafeAreaView edges={['top']} className="bg-surface" />
        {detail.status === 'loading' ? (
          <LoadingState label={strings.common.loading} />
        ) : (
          <EmptyState
            icon="search"
            title={
              detail.status === 'notFound'
                ? strings.errors.notFound
                : strings.errors.server
            }
            description={strings.dealDetail.unavailableBody}
            actionLabel={detail.status === 'notFound' ? undefined : strings.common.retry}
            onAction={detail.status === 'notFound' ? undefined : detail.retry}
            className="mt-16"
          />
        )}
      </View>
    );
  }

  const claimData: ClaimDealData = {
    title: details.title,
    merchant: deal.merchant.split(' • ')[0],
    price: details.price,
    priceWas: details.priceWas,
    save: details.save,
    badge: details.badge,
    image: deal.image,
    endsIn: details.endsIn,
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-surface" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-80 overflow-hidden bg-surface-container-low">
          <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
          <View style={styles.heroScrim} />
          <View style={[styles.heroUtilities, { top: insets.top + 12 }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
              style={styles.utilityButton}
            >
              <Icon name="backIos" size={20} color={colors.text} />
            </Pressable>
            <View style={styles.utilityGroup}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share deal"
                onPress={handleShare}
                style={styles.utilityButton}
              >
                <Icon name="share" size={20} color={colors.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Like deal"
                accessibilityState={{ selected: reaction.liked }}
                onPress={reaction.toggle}
                style={styles.likePill}
              >
                <Icon
                  name={reaction.liked ? 'favoriteFilled' : 'favorite'}
                  size={20}
                  color={reaction.liked ? colors.error : colors.text}
                />
                <VemtapText
                  className="font-sans-semibold text-label-sm"
                  style={{ color: reaction.liked ? colors.error : colors.text }}
                >
                  {details.likes}
                </VemtapText>
              </Pressable>
            </View>
          </View>
          <View style={styles.heroBadges}>
            <View style={styles.row}>
              <View style={styles.discountBadge}>
                <VemtapText className="font-sans-bold text-label-md text-badge-discount-text">
                  {details.badge}
                </VemtapText>
              </View>
              {details.endsIn ? (
                <View style={styles.timerBadge}>
                  <Icon name="schedule" size={14} color={colors.inverseOnSurface} />
                  <VemtapText className="text-caption text-inverse-on-surface">
                    {details.endsIn}
                  </VemtapText>
                </View>
              ) : null}
            </View>
            <View style={styles.hotBadge}>
              <Icon name="fire" size={16} color={colors.tertiaryContainer} />
              <VemtapText className="font-sans-semibold text-caption text-text">
                Hot Deal
              </VemtapText>
            </View>
          </View>
        </View>

        <View className="px-6 pt-6">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open business page for ${deal.merchant.split(' • ')[0]}`}
            onPress={handleOpenBusiness}
            style={styles.merchantRow}
          >
            <View style={styles.merchantAvatar}>
              <Icon name="restaurant" size={24} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <View style={styles.row}>
                <VemtapText
                  variant="labelMd"
                  className="shrink-0 font-sans-bold text-text"
                  numberOfLines={1}
                >
                  {deal.merchant.split(' • ')[0]}
                </VemtapText>
                <Icon name="verified" size={18} color={colors.primary} />
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                Restaurant • {details.distance} away • {details.location}
              </VemtapText>
            </View>
            <View style={styles.profileButton}>
              <Icon name="forward" size={18} color={colors.secondary} />
            </View>
          </Pressable>

          <VemtapText
            accessibilityRole="header"
            variant="headingXl"
            className="mt-4 text-heading-xl text-text"
          >
            {details.title}
          </VemtapText>
          <View style={styles.priceRow}>
            <VemtapText className="font-sans-bold text-display-mobile text-text">
              {details.price}
            </VemtapText>
            <VemtapText className="text-body-md text-text-tertiary line-through">
              {details.priceWas}
            </VemtapText>
            <View style={styles.saveBadge}>
              <VemtapText className="font-sans-semibold text-label-sm text-primary">
                {details.save}
              </VemtapText>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attributeContent}
            className="mt-4"
          >
            {details.endsIn ? (
              <AttributePill icon="schedule" label={details.endsIn} />
            ) : null}
            <AttributePill icon="storefront" label="Dine-in & Takeout" />
            <AttributePill icon="person" label="1 Claim / Person" />
          </ScrollView>

          <View style={styles.engagementCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Like deal"
              onPress={reaction.toggle}
              style={styles.engagementButton}
            >
              <Icon
                name={reaction.liked ? 'favoriteFilled' : 'favorite'}
                size={18}
                color={reaction.liked ? colors.error : colors.textSecondary}
              />
              <VemtapText className="font-sans-semibold text-label-md text-text-secondary">
                {details.likes}
              </VemtapText>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open comments"
              onPress={() => setCommentsVisible(true)}
              style={styles.engagementButton}
            >
              <Icon name="comment" size={18} color={colors.textSecondary} />
              <VemtapText className="font-sans-semibold text-label-md text-text-secondary">
                {details.comments}
              </VemtapText>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share deal"
              onPress={handleShare}
              style={styles.engagementButton}
            >
              <Icon name="share" size={18} color={colors.textSecondary} />
              <VemtapText className="font-sans-semibold text-label-md text-text-secondary">
                Share
              </VemtapText>
            </Pressable>
          </View>

          <View style={styles.card}>
            <VemtapText variant="headingSm" className="text-text">
              About this deal
            </VemtapText>
            <VemtapText
              variant="bodyMd"
              tone="secondary"
              className="mt-1"
              numberOfLines={expanded ? undefined : 2}
            >
              {details.description}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpanded(value => !value)}
              style={styles.readMoreButton}
            >
              <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                {expanded ? 'Show less' : 'Read more'}
              </VemtapText>
              <Icon
                name={expanded ? 'expandMore' : 'expandMore'}
                size={14}
                color={colors.primary}
              />
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.locationHeader}>
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                Location & Hours
              </VemtapText>
              <View style={styles.openBadge}>
                <VemtapText className="font-sans-medium text-caption text-badge-discount-text">
                  Open Now
                </VemtapText>
              </View>
            </View>
            <LocationMapView
              region={apoRegion}
              style={styles.mapPanel}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <View style={styles.addressBadge}>
                <Icon name="locationOn" size={16} color={colors.primary} />
                <VemtapText
                  className="font-sans-medium text-caption text-text"
                  numberOfLines={1}
                >
                  {details.address}
                </VemtapText>
              </View>
            </LocationMapView>
          </View>

          <View style={styles.infoRows}>
            <InfoRow
              icon="verifiedUser"
              iconBackground="bg-surface-tint"
              title="How to Claim"
              subtitle="Show dynamic QR code at billing counter"
              onPress={() => navigation.navigate('HowToClaim', { dealId: deal.id })}
            />
            <InfoRow
              icon="info"
              iconBackground="bg-surface-container"
              title="Terms & Conditions"
              subtitle="Valid 12 PM - 4 PM weekdays only"
              onPress={() =>
                navigation.navigate('DealTermsConditions', { dealId: deal.id })
              }
            />
          </View>

          <View style={styles.guarantee}>
            <Icon name="checkCircle" size={16} color={colors.badgeDiscountText} />
            <VemtapText variant="caption" tone="tertiary" className="text-center">
              VEMTAP verified discount guarantee
            </VemtapText>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.claimBar,
          navbarBottomShadow,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Button
          label={claimed ? 'Claimed! View in Wallet' : 'Claim Deal'}
          leftIcon={
            <Icon
              name={claimed ? 'checkCircle' : 'badge'}
              size={20}
              color={colors.surface}
            />
          }
          onPress={handleClaim}
        />
        <View style={styles.claimHint}>
          <Icon name="info" size={13} color={colors.primary} />
          <VemtapText variant="caption" tone="secondary" className="text-center">
            {strings.deals.claimFlow.claimHint}
          </VemtapText>
        </View>
      </View>

      <ClaimConfirmationSheet
        visible={claimStep === 'confirmation'}
        onClose={() => setClaimStep(null)}
        onConfirm={() => setClaimStep(isAuthenticated ? 'identity' : 'auth')}
        deal={claimData}
      />
      <ClaimAuthModalSheet
        visible={claimStep === 'auth'}
        onClose={() => setClaimStep(null)}
        onContinue={() => setClaimStep('identity')}
        deal={claimData}
      />
      <ClaimIdentitySheet
        visible={claimStep === 'identity'}
        onClose={() => setClaimStep(null)}
        onForMe={() => {
          // A real offer goes through the real OTP flow: the API only issues a
          // claim once an emailed code is verified. Fictional deals have no server
          // record to claim, so they keep the local walkthrough.
          if (isLiveOffer) {
            claim.reset();
            setClaimStep('selfIdentity');
            return;
          }
          setClaimingAs('john@email.com');
          setClaimStep('terms');
        }}
        onGift={() => setClaimStep('gift')}
        onRecipient={() => setClaimStep('recipient')}
        deal={claimData}
      />
      <RecipientDetailsSheet
        visible={claimStep === 'recipient'}
        onClose={() => setClaimStep(null)}
        onBack={() => setClaimStep('identity')}
        onContinue={data => {
          setRecipient(data);
          setClaimingAs(data.email);
          setClaimStep('verification');
        }}
      />
      <RecipientDetailsSheet
        visible={claimStep === 'selfIdentity'}
        onClose={() => setClaimStep(null)}
        onBack={() => setClaimStep('identity')}
        title={strings.deals.claimFlow.selfClaimIdentityTitle}
        onContinue={async data => {
          setRecipient(data);
          setClaimingAs(data.email);
          await claim.requestCode(data);
          setClaimStep('selfVerification');
        }}
      />
      <RecipientVerificationSheet
        visible={claimStep === 'selfVerification'}
        onClose={() => setClaimStep(null)}
        onBack={() => setClaimStep('selfIdentity')}
        email={recipient.email}
        title={strings.deals.claimFlow.verifySelfTitle}
        heading={strings.deals.claimFlow.verifySelfHeading}
        bodyCopy={strings.deals.claimFlow.verifySelfBody}
        codeHint={strings.deals.claimFlow.enterCodeRange}
        submitLabel={strings.deals.claimFlow.verifyContinue}
        // The claim OTP is 4–6 characters, verified live, so the field must not
        // insist on the recipient flow's fixed six.
        minimumDigits={4}
        busy={claim.status.phase === 'verifying'}
        errorMessage={claim.status.phase === 'error' ? claim.status.message : undefined}
        // Optional on the sheet: when `onSubmitCode` is supplied it replaces
        // `onContinue`, so this is intentionally unused.
        onContinue={() => undefined}
        onSubmitCode={async codeText => {
          await claim.submitCode(codeText);
        }}
      />
      <RecipientVerificationSheet
        visible={claimStep === 'verification'}
        onClose={() => setClaimStep(null)}
        onBack={() => setClaimStep('recipient')}
        onContinue={() => setClaimStep('summary')}
        email={recipient.email}
      />
      <RecipientSummarySheet
        visible={claimStep === 'summary'}
        onClose={() => setClaimStep(null)}
        onEdit={() => setClaimStep('recipient')}
        onContinue={() => setClaimStep('terms')}
        recipient={recipient}
        deal={claimData}
      />
      <GiftDetailsSheet
        visible={claimStep === 'gift'}
        onClose={() => setClaimStep(null)}
        onContinue={data => {
          setGiftRecipient(data);
          setClaimingAs(data.email);
          setClaimStep('giftConfirm');
        }}
        deal={claimData}
      />
      <GiftConfirmSheet
        visible={claimStep === 'giftConfirm'}
        onClose={() => setClaimStep(null)}
        onBack={() => setClaimStep('gift')}
        onConfirm={() => {
          setClaimStep(null);
          navigation.navigate('GiftDealSentSuccess', {
            dealId: deal.id,
            recipient: giftRecipient,
          });
        }}
        recipient={giftRecipient}
        deal={claimData}
      />
      <ClaimTermsSheet
        visible={claimStep === 'terms'}
        onClose={() => setClaimStep(null)}
        onComplete={completeClaim}
        deal={claimData}
        claimingAs={claimingAs}
      />

      <DealCommentsSheet
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        dealTitle={details.title}
        merchant={deal.merchant.split(' • ')[0]}
        commentCount={details.comments}
        // Fictional seed offers have no server row — the sheet keeps demo copy.
        offerId={isLiveOffer ? route.params.dealId : undefined}
      />
      <DealShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        deal={deal}
        shareUrl={`https://vemtap.com/deals/${deal.id}`}
      />
    </View>
  );
}

function AttributePill({
  icon,
  label,
}: {
  icon: 'schedule' | 'storefront' | 'person';
  label: string;
}) {
  return (
    <View style={styles.attributePill}>
      <Icon name={icon} size={16} color={colors.primary} />
      <VemtapText className="text-label-sm text-text-secondary">{label}</VemtapText>
    </View>
  );
}

function InfoRow({
  icon,
  iconBackground,
  title,
  subtitle,
  onPress,
}: {
  icon: 'verifiedUser' | 'info';
  iconBackground: 'bg-surface-tint' | 'bg-surface-container';
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.infoRow}>
      <View style={styles.row}>
        <View
          style={[
            styles.infoIcon,
            {
              backgroundColor:
                iconBackground === 'bg-surface-tint'
                  ? colors.surfaceTint
                  : colors.surfaceContainer,
            },
          ]}
        >
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold text-text">
            {title}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary">
            {subtitle}
          </VemtapText>
        </View>
      </View>
      <Icon name="forward" size={20} color={colors.outline} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 18, 32, 0.22)',
  },
  heroUtilities: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  utilityGroup: { flexDirection: 'row', gap: 8 },
  utilityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  likePill: {
    height: 40,
    minWidth: 40,
    borderRadius: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  heroBadges: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  discountBadge: {
    borderRadius: 999,
    backgroundColor: colors.badgeDiscountBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(41, 48, 64, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  merchantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  saveBadge: {
    borderRadius: 999,
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  attributeContent: { gap: 8, paddingVertical: 4, paddingRight: 8 },
  attributePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  card: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 16,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    minHeight: 44,
    marginTop: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openBadge: {
    borderRadius: 999,
    backgroundColor: colors.badgeDiscountBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  mapPanel: {
    height: 112,
    borderRadius: 8,
    marginTop: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressBadge: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  infoRows: { gap: 8, marginTop: 16 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 16,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engagementCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 8,
  },
  engagementButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  divider: { width: 1, height: 20, backgroundColor: colors.surfaceContainer },
  guarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    marginBottom: 8,
  },
  claimBar: { backgroundColor: colors.surface, paddingHorizontal: 24, paddingTop: 12 },
  claimHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
});
