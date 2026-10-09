import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MetricTile,
  QuickAction,
  SectionLink,
} from '@features/accountHub/components/HubPrimitives';
import { ClaimedDealCard } from '@features/accountHub/components/ClaimedDealCard';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';
import { useLocationStore } from '@store/locationStore';
import {
  useLoyaltyAnalytics,
  useLoyaltyBalance,
  useLoyaltyLogs,
  useLoyaltyTier,
  useRewards,
} from '@features/accountHub/hooks/useLoyalty';
import { campaignsApi } from '@api/campaignsApi';
import { useActiveClaimsCount, useMyClaims } from '@features/myDeals/hooks/useMyClaims';
import {
  usePublicOffersFeed,
  useRecommendations,
} from '@features/deals/hooks/usePublicOffers';
import { useUnreadNotificationsCount } from '@features/business/hooks/useBusinessDashboardData';
import type { LoyaltyLog, LoyaltyTier, Reward } from '@api/loyaltyApi';
import { formatCompactNaira, formatPoints, formatWhen } from '@utils/formatters';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.customerDashboard;
const images = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgCwLd5w58QXLgV11MHD52EEti1eL21CVWe5XjaydFi7gB0n_HlN0ZRXV3yob4ZVn5VXviRWWZGYsv1AaFBYmLz5MGyZoBIQR2PaZJDI_Hy-6Q8Q2qX_UNm3TBcOS5Clrs17aHV0AbIlu45JooU-HWsPtb3bHzQbC2hp0eLB-F0K_mX7KOrm8At7tLg-OaWWH65X7PtLDGbNibqkIdLveIrO70jZrzaDghvLUUoFza5ZW1bMN8Ce0DQw',
};

type RewardsAvailability =
  | { state: 'loading' }
  | { state: 'ready'; count: number }
  | { state: 'zero' }
  | { state: 'unavailable' };

type LoyaltyLogsQuery = ReturnType<typeof useLoyaltyLogs>;

const activityIcons: Record<LoyaltyLog['type'], IconName> = {
  earned: 'localActivity',
  spent: 'qrCode',
  expired: 'historyOff',
  manual: 'rateReview',
};

function availabilityFor(
  rewards: { isError: boolean; isPending: boolean; data?: Reward[] },
  points: number | null,
  balanceError: boolean,
): RewardsAvailability {
  if (rewards.isError || balanceError) {
    return { state: 'unavailable' };
  }
  if (points === null) {
    return { state: 'loading' };
  }
  // No business context is no longer a zero state: the rewards query falls
  // back to the platform-wide list, which can legitimately be empty.
  if (rewards.isPending) {
    return { state: 'loading' };
  }
  const affordable = (rewards.data ?? []).filter(
    reward => reward.pointsRequired <= points,
  ).length;
  return affordable > 0 ? { state: 'ready', count: affordable } : { state: 'zero' };
}

export interface CustomerDashboardScreenProps {
  /** Renders the leading back control when the screen was pushed onto a stack. */
  onBack?: () => void;
  onLocation?: () => void;
  onNotifications?: () => void;
  onShop?: () => void;
  onOpenAccount?: () => void;
  onOpenDeal?: (dealId: string) => void;
  /** Opens the claimed-pass detail for a claim row from `GET /me/claims`. */
  onOpenClaim?: (claimId: string) => void;
  onOpenOffer?: (offerId: string) => void;
  onOpenRewards?: () => void;
  onOpenActivity?: () => void;
}

export function CustomerDashboardScreen({
  onBack,
  onLocation,
  onNotifications,
  onShop,
  onOpenAccount,
  onOpenDeal,
  onOpenClaim,
  onOpenOffer,
  onOpenRewards,
  onOpenActivity,
}: CustomerDashboardScreenProps) {
  const metricIcons = ['voucher', 'star', 'wallet'] as const;
  const quickIcons = ['explore', 'badge', 'qrCodeScanner', 'history'] as const;
  const me = useCurrentUserDisplay();
  const area = useLocationStore(state => state.area);

  const balance = useLoyaltyBalance(null);
  const analytics = useLoyaltyAnalytics();
  // Disabled until the balance resolves, so the query object is optional here.
  const tierQuery = useLoyaltyTier({ enabled: balance.isSuccess });
  const logs = useLoyaltyLogs(null, 1, 3);
  const feed = usePublicOffersFeed();
  // Featured campaign banner: copy and CTA only. The banners module has no
  // image field and stores a Tailwind gradient class, so the hero keeps its own
  // artwork and just adopts the banner's headline, body and button.
  const featuredBanner = useQuery({
    queryKey: ['campaigns', 'featured'],
    queryFn: () => campaignsApi.getFeaturedCampaigns(),
    staleTime: 300_000,
  });
  const banner = featuredBanner.data?.[0];
  // "Deals You May Like" prefers the ranked, already-claimed-filtered feed and
  // silently falls back to the public feed when that call is unavailable.
  const recommended = useRecommendations(10);
  const unread = useUnreadNotificationsCount();
  const unreadCount = unread.data ?? 0;

  const homeBusinessId = logs.data?.data.find(log => log.businessId)?.businessId ?? null;

  const rewards = useRewards({ businessId: homeBusinessId });

  const activeClaimsCount = useActiveClaimsCount();
  const activeClaims = useMyClaims('ACTIVE');
  const activeClaimsList = (activeClaims.data?.data ?? []).slice(0, 2);
  const points = balance.isSuccess ? (balance.data ?? 0) : null;
  const activeDealsMetric = activeClaimsCount.isSuccess
    ? String(activeClaimsCount.data ?? 0)
    : copy.metricUnavailable;
  const pointsMetric = points === null ? copy.metricUnavailable : formatPoints(points);
  const savedMetric = analytics.isSuccess
    ? formatCompactNaira(analytics.data?.totals?.netSavings ?? 0)
    : copy.metricUnavailable;
  const metricValues = [activeDealsMetric, pointsMetric, savedMetric];
  const availability = availabilityFor(rewards, points, balance.isError);
  const tier = tierQuery?.data;
  const recommendations = (
    recommended.hasRecommendations ? recommended.list : feed.feed.list
  ).slice(0, 2);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between bg-surface px-4 py-2"
        style={navbarBottomShadow}
      >
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.goBack}
            hitSlop={8}
            onPress={onBack}
            className="-ml-2 mr-1 h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-surface-container-low"
          >
            <Icon name="back" size={24} color={colors.surfaceDark} />
          </Pressable>
        ) : null}
        <View className="min-w-0 flex-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingSm"
            className="text-heading-sm"
            numberOfLines={1}
          >
            {copy.greetingFor(me.firstName)}
          </VemtapText>
          <Pressable
            accessibilityRole="button"
            onPress={onLocation}
            className="mt-0.5 flex-row items-center gap-1"
          >
            <Icon name="locationOn" size={17} color={colors.primary} />
            <VemtapText variant="labelMd" tone="secondary">
              {copy.locationFor(area)}
            </VemtapText>
            <Icon name="expandMore" size={15} color={colors.textTertiary} />
          </Pressable>
        </View>
        <View className="shrink-0 flex-row items-center gap-2">
          <HubIconButton icon="localMall" label={copy.shop} onPress={onShop} />
          <HubIconButton
            icon="notifications"
            label={copy.notifications}
            badge={unreadCount > 0 ? String(unreadCount) : undefined}
            onPress={onNotifications}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.account}
            onPress={onOpenAccount}
            className="relative h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-container-highest"
          >
            <Icon name="person" size={22} color={colors.secondary} />
            <View className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-badge-discount-text" />
          </Pressable>
        </View>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 pb-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative mx-4 mt-5 h-48 overflow-hidden rounded-card shadow-sm">
          <Image
            source={{ uri: images.hero }}
            className="h-full w-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', colors.surfaceDark]}
            locations={[0.25, 1]}
            className="absolute inset-0 p-4"
          >
            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-1 rounded-full bg-surface px-2 py-1">
                <Icon name="fire" size={14} color={colors.tertiaryContainer} />
                <VemtapText variant="caption" className="font-sans-semibold">
                  {copy.campaign}
                </VemtapText>
              </View>
              <View className="rounded-full bg-surface px-2 py-0.5">
                <VemtapText variant="caption">{copy.weekend}</VemtapText>
              </View>
            </View>
            <View className="mt-auto">
              <VemtapText variant="headingLg" className="text-heading-lg text-surface">
                {banner?.title ?? copy.campaignTitle}
              </VemtapText>
              <VemtapText
                variant="bodyMd"
                className="text-surface-container-highest"
                numberOfLines={1}
              >
                {banner?.description ?? copy.campaignBody}
              </VemtapText>
              <View className="mt-2 flex-row items-center justify-between">
                <Button
                  label={banner?.actionLabel ?? copy.exploreDeals}
                  labelVariant="labelSm"
                  size="sm"
                  fullWidth={false}
                  onPress={() => {
                    // A banner without a URL is a headline, not a link, so it
                    // falls back to the designed destination.
                    if (banner?.actionUrl) {
                      Linking.openURL(banner.actionUrl).catch(() => undefined);
                      return;
                    }
                    onOpenDeal?.('weekend-deals');
                  }}
                  rightIcon={
                    <Icon name="arrowForward" size={16} color={colors.surface} />
                  }
                />
                <View className="shrink-0 flex-row gap-1">
                  <View className="h-1.5 w-5 rounded-full bg-surface" />
                  <View className="h-1.5 w-1.5 rounded-full bg-surface opacity-50" />
                  <View className="h-1.5 w-1.5 rounded-full bg-surface opacity-50" />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
        <View className="gap-2 px-4">
          <View className="flex-row justify-between">
            <VemtapText variant="bodyMd" className="font-sans-semibold">
              {copy.activity}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary">
              {copy.sync}
            </VemtapText>
          </View>
          <View className="flex-row gap-2">
            {copy.metrics.map((label, index) => (
              <MetricTile
                key={label}
                value={metricValues[index]}
                label={label}
                icon={metricIcons[index]}
                tone={index === 0 ? 'primary' : index === 1 ? 'tertiary' : 'success'}
              />
            ))}
          </View>
        </View>
        <View className="gap-2 px-4">
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold uppercase tracking-wider text-text-secondary"
          >
            {copy.quickActions}
          </VemtapText>
          <View className="flex-row gap-2">
            {copy.actions.map((label, index) => (
              <QuickAction
                key={label}
                icon={quickIcons[index]}
                label={label}
                onPress={
                  index === 1
                    ? onOpenRewards
                    : index === 0
                      ? () => onOpenDeal?.('explore')
                      : index === 3
                        ? onOpenActivity
                        : undefined
                }
              />
            ))}
          </View>
        </View>
        <View className="gap-3 px-4">
          <View className="flex-row items-center justify-between">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.activeDeals}
            </VemtapText>
            <SectionLink
              label={copy.viewAllDeals}
              onPress={() => onOpenDeal?.('my-deals')}
            />
          </View>
          {activeClaims.isLoading ? (
            <LoadingState label={strings.common.loading} />
          ) : activeClaims.isError ? (
            <ErrorState onRetry={() => activeClaims.refetch()} />
          ) : activeClaimsList.length > 0 ? (
            <View className="gap-3">
              {activeClaimsList.map(claim => (
                <ClaimedDealCard
                  key={claim.id}
                  claim={claim}
                  onOpen={() => onOpenClaim?.(claim.id)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              variant="contained"
              icon="voucher"
              title={copy.activeEmpty.title}
              description={copy.activeEmpty.body}
            />
          )}
        </View>
        <RewardsCard
          points={points}
          tier={tier}
          availability={availability}
          onOpen={onOpenRewards}
        />
        <ActivityLedger logs={logs} onOpen={onOpenActivity} />
        <View className="gap-3 px-4">
          <View className="flex-row items-center justify-between">
            <VemtapText variant="bodyMd" className="font-sans-semibold">
              {copy.mayLike}
            </VemtapText>
            <Icon name="autoAwesome" size={20} color={colors.primary} />
          </View>
          <VemtapText variant="caption" tone="secondary">
            {copy.mayLikeBodyFor(area)}
          </VemtapText>
          {recommended.isLoading && !feed.isLoading ? (
            <LoadingState label={strings.common.loading} />
          ) : feed.isError && !recommended.hasRecommendations ? (
            <EmptyState
              variant="contained"
              icon="cloudOff"
              title={strings.common.error}
              actionLabel={strings.common.retry}
              onAction={feed.refetch}
            />
          ) : recommendations.length === 0 ? (
            <EmptyState
              variant="contained"
              icon="autoAwesome"
              title={copy.recommendationsEmpty.title}
              description={copy.recommendationsEmpty.body}
            />
          ) : (
            <View className="flex-row gap-2">
              {recommendations.map(item => (
                <Recommendation
                  key={item.id}
                  image={item.image.uri}
                  discount={item.leftBadge.label}
                  distance={item.location}
                  business={item.merchant}
                  title={item.title}
                  price={item.price}
                  old={item.priceWas}
                  onPress={() => onOpenOffer?.(item.id)}
                />
              ))}
            </View>
          )}
          <Button
            label={copy.exploreAreaFor(area)}
            labelVariant="labelMd"
            variant="secondary"
            rightIcon={<Icon name="arrowForward" size={18} color={colors.primary} />}
            onPress={() => onOpenDeal?.('deals-apo')}
          />
        </View>
        <View className="items-center">
          <View className="flex-row items-center gap-1">
            <Icon name="verifiedUser" size={14} color={colors.primary} />
            <VemtapText variant="caption" tone="tertiary">
              {copy.guarantee}
            </VemtapText>
          </View>
          <VemtapText variant="micro" className="text-text-tertiary">
            {strings.app.tagline}
          </VemtapText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HubIconButton({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: IconName;
  label: string;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="relative h-10 w-10 items-center justify-center rounded-full bg-surface-subtle shadow-sm"
    >
      <Icon name={icon} size={20} color={colors.surfaceDark} />
      {badge ? (
        <View className="absolute right-0 top-0 h-4 min-w-4 items-center justify-center rounded-full bg-error px-1">
          <VemtapText variant="micro" className="text-surface">
            {badge}
          </VemtapText>
        </View>
      ) : null}
    </Pressable>
  );
}

function RewardsCard({
  points,
  tier,
  availability,
  onOpen,
}: {
  points: number | null;
  /** Server-authoritative tier from `GET /loyalty/points/tier`. */
  tier?: LoyaltyTier;
  availability: RewardsAvailability;
  onOpen?: () => void;
}) {
  // Tier and progress come from the API (see `loyaltyTierSchema`). While the
  // request is in flight — or if it fails — the bar renders empty rather than
  // guessing from a local threshold table.
  const progressPercent = tier?.progressPercent ?? 0;
  const nextTier = tier?.nextTier ?? null;
  const barStyle: StyleProp<ViewStyle> = {
    width: `${Math.round(progressPercent)}%`,
  };
  const progressLabel =
    points === null || !tier
      ? copy.metricUnavailable
      : nextTier
        ? copy.progressTo(nextTier)
        : copy.progressComplete;
  const progressValue =
    points === null || !tier
      ? copy.metricUnavailable
      : nextTier
        ? copy.progressValue(formatPoints(points), formatPoints(tier.pointsToNext ?? 0))
        : copy.balanceFor(formatPoints(points));
  const availabilityLine =
    availability.state === 'loading'
      ? strings.common.loading
      : availability.state === 'unavailable'
        ? copy.rewardsUnavailable
        : availability.state === 'ready'
          ? copy.rewardsAvailableFor(availability.count)
          : copy.rewardsZero;

  return (
    <View className="mx-4 gap-3 rounded-card bg-surface p-4 shadow-sm">
      <View className="flex-row justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Icon name="loyalty" size={20} color={colors.tertiaryContainer} />
          <VemtapText variant="bodyMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.rewards}
          </VemtapText>
        </View>
        <View className="shrink-0">
          <SectionLink label={copy.viewRewards} onPress={onOpen} />
        </View>
      </View>
      <View className="flex-row items-center justify-between gap-2 rounded-card bg-surface-subtle p-3">
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.tierStatus}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {points === null || !tier?.tier
              ? copy.metricUnavailable
              : copy.tierFor(tier.tier)}
          </VemtapText>
        </View>
        <View className="shrink-0 items-end">
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.balance}
          </VemtapText>
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-tertiary"
            numberOfLines={1}
          >
            {points === null
              ? copy.metricUnavailable
              : copy.balanceFor(formatPoints(points))}
          </VemtapText>
        </View>
      </View>
      <View className="gap-1.5">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1"
            numberOfLines={1}
          >
            {progressLabel}
          </VemtapText>
          <VemtapText
            variant="caption"
            className="shrink-0 font-sans-semibold"
            numberOfLines={1}
          >
            {progressValue}
          </VemtapText>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-surface-container">
          <View style={barStyle} className="h-full rounded-full bg-primary" />
        </View>
      </View>
      <View className="flex-row items-center justify-between gap-2">
        <VemtapText
          variant="caption"
          className={`min-w-0 flex-1 ${
            availability.state === 'unavailable'
              ? 'text-text-tertiary'
              : 'text-badge-discount-text'
          }`}
          numberOfLines={1}
        >
          {availabilityLine}
        </VemtapText>
        <Pressable accessibilityRole="button" onPress={onOpen} className="shrink-0">
          <VemtapText variant="labelSm" tone="brand">
            {copy.claim}
          </VemtapText>
        </Pressable>
      </View>
    </View>
  );
}

function ActivityLedger({
  logs,
  onOpen,
}: {
  logs: LoyaltyLogsQuery;
  onOpen?: () => void;
}) {
  const rows = logs.data?.data ?? [];
  return (
    <View className="gap-3 px-4">
      <View className="flex-row justify-between">
        <VemtapText variant="bodyMd" className="font-sans-semibold">
          {copy.recent}
        </VemtapText>
        <SectionLink label={copy.viewActivity} onPress={onOpen} />
      </View>
      {logs.isLoading ? (
        <LoadingState label={strings.common.loading} />
      ) : logs.isError ? (
        <EmptyState
          variant="contained"
          icon="cloudOff"
          title={strings.common.error}
          actionLabel={strings.common.retry}
          onAction={logs.refetch}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          variant="contained"
          icon="localActivity"
          title={copy.activityEmpty.title}
          description={copy.activityEmpty.body}
        />
      ) : (
        <View className="overflow-hidden rounded-card bg-surface shadow-sm">
          {rows.map(row => {
            const debit = row.type === 'spent' || row.type === 'expired';
            const when = formatWhen(row.createdAt);
            const subtitle = row.reason ? `${row.reason} • ${when}` : when;
            return (
              <View
                key={row.id}
                className="flex-row items-start justify-between gap-3 border-b border-border p-3 last:border-b-0"
              >
                <View className="min-w-0 flex-1 flex-row items-center gap-3">
                  <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-tint-blue">
                    <Icon
                      name={activityIcons[row.type]}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View className="min-w-0">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {copy.activityTitles[row.type]}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {subtitle}
                    </VemtapText>
                  </View>
                </View>
                <VemtapText
                  variant="labelSm"
                  className={`w-28 shrink-0 self-start pt-0.5 text-right ${
                    debit ? 'text-text-tertiary' : 'text-badge-discount-text'
                  }`}
                  numberOfLines={1}
                >
                  {copy.activityDelta(formatPoints(row.points), debit)}
                </VemtapText>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function Recommendation({
  image,
  discount,
  distance,
  business,
  title,
  price,
  old,
  onPress,
}: {
  image: string;
  discount: string;
  distance: string;
  business: string;
  title: string;
  price: string;
  old?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-w-0 flex-1 overflow-hidden rounded-card bg-surface shadow-sm"
    >
      <View className="relative h-28">
        <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
        <View className="absolute left-2 top-2 rounded-full bg-badge-discount-bg px-2 py-0.5">
          <VemtapText variant="micro" className="font-sans-bold text-badge-discount-text">
            {discount}
          </VemtapText>
        </View>
      </View>
      <View className="gap-1 p-2">
        <VemtapText variant="micro" tone="tertiary">
          {distance}
        </VemtapText>
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {business}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {title}
        </VemtapText>
        <View className="flex-row items-baseline gap-1">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {price}
          </VemtapText>
          {old ? (
            <VemtapText variant="micro" tone="tertiary" className="line-through">
              {old}
            </VemtapText>
          ) : null}
          <Icon name="plus" size={16} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}
