import React, { useCallback, useState } from 'react';
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
import { navbarBottomShadow } from '@theme/shadows';
import type { AppStackParamList } from '@navigation/types';
import { resolveDeal } from '@features/dealDetail/data/dealResolver';
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
  endsIn: string;
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
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [claimStep, setClaimStep] = useState<ClaimFlowStep>(null);
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

  const deal = resolveDeal(route.params.dealId);
  const businessId = deal.id.startsWith('urban-grill')
    ? 'urban-grill'
    : deal.id.startsWith('glow-')
      ? 'glow-serenity'
      : deal.id.includes('sky-lounge')
        ? 'sky-lounge'
        : deal.id.startsWith('sole-district')
          ? 'sole-district'
          : deal.id.startsWith('cafe-neo')
            ? 'cafe-neo'
            : null;
  const business = businesses.find(item => item.id === businessId);
  const details: DealDetailProps = {
    title: deal.title,
    badge: deal.badge,
    endsIn: 'Ends in 3 days',
    distance: deal.distance,
    location: deal.location,
    price: deal.price,
    priceWas: deal.priceWas,
    save: deal.save,
    description: deal.description,
    address: deal.address,
    likes: deal.likes,
    comments: deal.comments,
  };

  const claimData: ClaimDealData = {
    title: details.title,
    merchant: deal.merchant.split(' • ')[0],
    price: details.price,
    priceWas: details.priceWas,
    save: details.save,
    badge: details.badge,
    image: deal.image,
  };

  const handleShare = useCallback(() => {
    setShareVisible(true);
  }, []);

  const handleOpenBusiness = useCallback(() => {
    if (business) {
      navigation.navigate('Tabs', {
        screen: 'Discover',
        params: {
          screen: 'BusinessProfile',
          params: { business },
        },
      });
    }
  }, [business, navigation]);

  const handleClaim = useCallback(() => {
    if (claimed) {
      navigation.navigate('MyClaimedDeal', { dealId: deal.id });
      return;
    }
    setClaimStep('confirmation');
  }, [claimed, deal.id, navigation]);

  const completeClaim = useCallback(() => {
    setClaimed(true);
    setClaimStep(null);
    navigation.navigate('DealClaimedSuccess', { dealId: deal.id });
  }, [deal.id, navigation]);

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
                accessibilityLabel="Save deal"
                accessibilityState={{ selected: saved }}
                onPress={() => setSaved(value => !value)}
                style={styles.utilityButton}
              >
                <Icon
                  name={saved ? 'favoriteFilled' : 'favorite'}
                  size={20}
                  color={saved ? colors.error : colors.text}
                />
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
              <View style={styles.timerBadge}>
                <Icon name="schedule" size={14} color={colors.inverseOnSurface} />
                <VemtapText className="text-caption text-inverse-on-surface">
                  {details.endsIn}
                </VemtapText>
              </View>
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
            <AttributePill icon="schedule" label={details.endsIn} />
            <AttributePill icon="storefront" label="Dine-in & Takeout" />
            <AttributePill icon="person" label="1 Claim / Person" />
          </ScrollView>

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

          <View style={styles.engagementCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Like deal"
              onPress={() => setLiked(value => !value)}
              style={styles.engagementButton}
            >
              <Icon
                name={liked ? 'favoriteFilled' : 'favorite'}
                size={18}
                color={liked ? colors.error : colors.textSecondary}
              />
              <VemtapText className="font-sans-semibold text-label-md text-text-secondary">
                {details.likes + (liked ? 1 : 0)}
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
            No payment required now • Claim to reserve
          </VemtapText>
        </View>
      </View>

      <ClaimConfirmationSheet
        visible={claimStep === 'confirmation'}
        onClose={() => setClaimStep(null)}
        onConfirm={() => setClaimStep('auth')}
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
