import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { TwoColumnGrid } from '@components/shared/TwoColumnGrid';
import { strings } from '@constants/strings';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { colors } from '@theme/colors';
import {
  BusinessInlineAction,
  BusinessProductImage,
  BusinessSectionHeading,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import { BusinessBranchSwitcher } from '@features/business/components/BusinessBranchSwitcher';
import {
  activityPercents,
  activityPointLabels,
  countPendingClaims,
  countUnreadMessages,
  formatCompactNaira,
  formatNaira,
  formatUpdatedAgo,
  pickStat,
  toStatNumber,
  useBusinessDashboard,
  useBusinessSubscription,
  useMyBusiness,
  useNewOrdersCount,
  usePendingClaims,
  usePosDashboard,
  useUnreadNotificationsCount,
} from '@features/business/hooks/useBusinessDashboardData';
import { useActiveBranch } from '@features/business/hooks/useActiveBranch';
import { navbarBottomShadow } from '@theme/shadows';
import { cn } from '@utils/cn';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.businessDashboard;

export interface BusinessDashboardOverviewScreenProps {
  onOpenAnalytics?: () => void;
  onOpenOrders?: () => void;
  onOpenMessages?: () => void;
  onOpenClaims?: () => void;
  onOpenPosSync?: () => void;
  onOpenScanner?: () => void;
  onOpenPos?: () => void;
  onCreateDeal?: () => void;
  onAddProduct?: () => void;
  onBoostDeal?: () => void;
  onAddBranch?: () => void;
  onManageLocations?: () => void;
  onOpenReport?: () => void;
}

export function BusinessDashboardOverviewScreen({
  onOpenAnalytics,
  onOpenOrders,
  onOpenMessages,
  onOpenClaims,
  onOpenPosSync,
  onOpenScanner,
  onOpenPos,
  onCreateDeal,
  onAddProduct,
  onBoostDeal,
  onAddBranch,
  onManageLocations,
  onOpenReport,
}: BusinessDashboardOverviewScreenProps) {
  const myBusiness = useMyBusiness();
  // One persisted active branch shared by Overview, Orders and More; the hook
  // falls back to the designed list while the business query is offline.
  const { branches, activeBranchId, setActiveBranch } = useActiveBranch();
  const changeBranch = setActiveBranch;

  // The dashboard/POS endpoints require a branchId, so they wait for the
  // business payload rather than firing a request the API will reject.
  const branchReady = myBusiness.isSuccess && Boolean(activeBranchId);
  const dashboard = useBusinessDashboard(activeBranchId, branchReady);
  const pos = usePosDashboard(activeBranchId, branchReady);
  const unread = useUnreadNotificationsCount();
  const newOrders = useNewOrdersCount();
  const claims = usePendingClaims();

  const stats = dashboard.data?.stats;
  const statsLive = dashboard.isSuccess;
  /** A tile reads the live stat when the query answered, else the design copy. */
  const metricValue = (
    keys: readonly string[],
    fallback: string,
    format: (value: number) => string = value => value.toLocaleString('en-US'),
  ): string => {
    if (!statsLive) return fallback;
    const value = pickStat(stats, keys);
    return value === undefined ? copy.emptyValue : format(value);
  };
  /** Deltas are live when the payload publishes one; otherwise design copy. */
  const deltaLabel = (value: unknown): string | undefined => {
    const delta = toStatNumber(value);
    if (delta === undefined) return undefined;
    return `${delta > 0 ? '+' : ''}${delta}%`;
  };
  const metricDelta = (fallback: string, liveValue?: unknown): string | undefined =>
    statsLive ? deltaLabel(liveValue) : fallback;

  const posRevenue = pos.isSuccess ? toStatNumber(pos.data?.revenue) : undefined;
  const posTxns = pos.isSuccess ? toStatNumber(pos.data?.transactionCount) : undefined;
  /** Once POS answers, its values are authoritative — "—" beats fake takings. */
  const posAmountLabel = !pos.isSuccess
    ? copy.posAmount
    : posRevenue !== undefined
      ? formatNaira(posRevenue)
      : copy.emptyValue;
  const posTxnsLabel = !pos.isSuccess
    ? copy.posTxns
    : posTxns !== undefined
      ? copy.posTxnsFor(posTxns)
      : copy.emptyValue;

  const ordersCount = newOrders.data;
  const messagesCount = dashboard.data
    ? countUnreadMessages(dashboard.data.messages)
    : undefined;
  const claimsCount = claims.data ? countPendingClaims(claims.data) : undefined;
  /** Branch devices reporting anything other than `active` need a sync. */
  const offlineDeviceCount = dashboard.isSuccess
    ? (dashboard.data?.devices ?? []).filter(
        device => String(device.status ?? '').toLowerCase() !== 'active',
      ).length
    : undefined;
  /** Rows whose live count is known and zero disappear instead of lying. */
  const activityRows = copy.activity.flatMap(row => {
    const count =
      row.id === 'orders'
        ? ordersCount
        : row.id === 'messages'
          ? messagesCount
          : row.id === 'claims'
            ? claimsCount
            : row.id === 'pos'
              ? offlineDeviceCount
              : undefined;
    if (count !== undefined && count <= 0) return [];
    const title =
      count === undefined
        ? row.title
        : row.id === 'orders'
          ? copy.activityOrdersTitle(count)
          : row.id === 'messages'
            ? copy.activityMessagesTitle(count)
            : row.id === 'claims'
              ? copy.activityClaimsTitle(count)
              : copy.activityDevicesTitle(count);
    const body =
      row.id === 'pos' && count !== undefined ? copy.activityDevicesBody : row.body;
    return [{ ...row, title, body }];
  });
  const knownCounts = [ordersCount, messagesCount, claimsCount, offlineDeviceCount];
  const knownTotal = knownCounts.reduce<number>((sum, count) => sum + (count ?? 0), 0);
  const activityBadge =
    knownCounts.every(count => count !== undefined) && knownTotal === 0
      ? null
      : knownCounts.every(count => count !== undefined)
        ? copy.activityBadgeFor(knownTotal)
        : copy.activityBadge;

  const liveActivity = activityPercents(dashboard.data?.activityData);
  const dayValues = liveActivity ?? [...copy.weekDayValues];
  const dayLabels = activityPointLabels(dashboard.data?.activityData) ?? [
    ...copy.weekDays,
  ];
  const peakIndex = dayValues.indexOf(Math.max(...dayValues));
  const chartPeak = liveActivity
    ? copy.weekChartPeakFor(dayLabels[peakIndex] ?? '')
    : copy.weekChartPeak;

  /** `weekly` carries the last 7 days of visits, claims and POS revenue. */
  const weekly = dashboard.data?.weekly;
  const weeklyStats = (() => {
    if (!statsLive || !weekly) return copy.weekStats.map(stat => ({ ...stat }));
    const visits = toStatNumber(weekly.visits);
    const weeklyClaims = toStatNumber(weekly.claims);
    const revenue = toStatNumber(weekly.revenue);
    return copy.weekStats.map(stat => {
      if (stat.id === 'views') {
        return {
          ...stat,
          value: visits === undefined ? copy.emptyValue : visits.toLocaleString('en-US'),
          delta: deltaLabel(stats?.visitorsDelta),
        };
      }
      if (stat.id === 'claims') {
        return {
          ...stat,
          value:
            weeklyClaims === undefined
              ? copy.emptyValue
              : weeklyClaims.toLocaleString('en-US'),
          delta: deltaLabel(stats?.claimsDelta),
        };
      }
      return {
        ...stat,
        value: revenue === undefined ? copy.emptyValue : formatCompactNaira(revenue),
        delta: deltaLabel(stats?.revenueDelta),
      };
    });
  })();

  /** Rules-based insights replace the designed recommendation cards. */
  const liveInsights = (dashboard.data?.insights ?? [])
    .filter(insight => insight.title && insight.message)
    .map(insight => ({
      id: insight.id || insight.title,
      title: insight.title,
      body: insight.message,
      cta: copy.recommendationsCta,
      badge: insight.priority === 'high' ? copy.recommendationsHighBadge : undefined,
    }));
  const recommendations = liveInsights.length > 0 ? liveInsights : copy.recommendations;

  const updatedAgo = formatUpdatedAgo(dashboard.data?.generatedAt);
  const overviewMeta = updatedAgo ? copy.overviewMetaFor(updatedAgo) : copy.overviewMeta;

  /** Trial window / plan name for the status pill under the navbar. */
  const subscription = useBusinessSubscription();
  const trialLabel = (() => {
    const sub = subscription.data;
    if (!subscription.isSuccess || !sub) return copy.growthTrial;
    if (sub.isTrial && sub.trialEndsAt) {
      const end = Date.parse(sub.trialEndsAt);
      if (Number.isFinite(end)) {
        const days = Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
        return copy.growthTrialFor(days);
      }
    }
    return sub.plan?.name?.trim() ? sub.plan.name : copy.growthTrial;
  })();

  const businessName = myBusiness.data?.name ?? copy.pageTitle;
  const businessLogo = myBusiness.data?.logoUrl || undefined;
  const profileBranch = myBusiness.data?.branches?.find(
    branch => branch.id === activeBranchId,
  );
  const locationLabel =
    profileBranch?.city || profileBranch?.address || copy.locationLabel;
  const isVerified = myBusiness.data?.isVerified === true;
  const unreadCount = unread.data ?? 0;

  // Dense hub: many rows read at a glance, so the subtree (navbar included)
  // uses the compact type density rather than per-row size overrides.
  return (
    <TypeDensityProvider density="compact">
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <View
          className="flex-row items-center justify-between gap-2 bg-surface px-4 pb-3 pt-2"
          style={navbarBottomShadow}
        >
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <VemtapText
                accessibilityRole="header"
                variant="headingSm"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={1}
              >
                {businessName}
              </VemtapText>
              {isVerified ? (
                <Icon name="verified" size={17} color={colors.primary} />
              ) : null}
            </View>
            <View className="flex-row items-center gap-1">
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 flex-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {locationLabel}
              </VemtapText>
              <Icon name="expandMore" size={14} color={colors.textSecondary} />
            </View>
          </View>
          <View className="shrink-0 flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.notifications}
              onPress={onOpenMessages}
              className="relative h-9 w-9 items-center justify-center"
            >
              <Icon name="notifications" size={21} color={colors.text} />
              {unreadCount > 0 ? (
                <View className="absolute right-0.5 top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-error px-1">
                  <VemtapText
                    variant="micro"
                    className="font-sans-bold text-primary-foreground"
                  >
                    {unreadCount}
                  </VemtapText>
                </View>
              ) : null}
            </Pressable>
            <View className="h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary">
              {businessLogo ? (
                <BusinessProductImage
                  source={{ uri: businessLogo }}
                  alt={`${businessName} logo`}
                  className="h-full w-full"
                />
              ) : (
                <Icon name="person" size={18} color={colors.surface} />
              )}
            </View>
          </View>
        </View>

        <ScrollView
          className="w-full max-w-screen flex-1 self-center"
          contentContainerClassName="w-full gap-4 px-6 pb-8 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap items-center gap-2">
            {isVerified ? (
              <View className="flex-row items-center gap-1.5 rounded-full bg-badge-discount-bg px-2.5 py-1">
                <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold text-badge-discount-text"
                >
                  {copy.verifiedBusiness}
                </VemtapText>
              </View>
            ) : null}
            <View className="flex-row items-center gap-1.5 rounded-full bg-surface-tint-blue px-2.5 py-1">
              <Icon name="schedule" size={14} color={colors.primary} />
              <VemtapText variant="caption" tone="brand" className="font-sans-semibold">
                {trialLabel}
              </VemtapText>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.growthTipTitle}
            onPress={onBoostDeal}
            className="overflow-hidden rounded-card shadow-md active:scale-[0.99]"
          >
            <LinearGradient
              colors={[colors.primaryContainer, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="gap-3 p-4"
            >
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-center gap-1.5 rounded-full bg-surface/20 px-2.5 py-1">
                  <Icon name="bolt" size={14} color={colors.surface} />
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold uppercase text-surface"
                  >
                    {copy.growthTipLabel}
                  </VemtapText>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-surface" />
                  <View className="h-1.5 w-1.5 rounded-full bg-surface/60" />
                  <View className="h-1.5 w-1.5 rounded-full bg-surface/60" />
                </View>
              </View>
              <View>
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold text-surface"
                  numberOfLines={2}
                >
                  {copy.growthTipTitle}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  className="mt-1 text-surface"
                  numberOfLines={2}
                >
                  {copy.growthTipBody}
                </VemtapText>
              </View>
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-center gap-1.5 rounded-lg bg-surface px-3 py-2">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-primary"
                  >
                    {copy.growthTipCta}
                  </VemtapText>
                  <Icon name="rocket" size={14} color={colors.primary} />
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Icon name="trendingUp" size={16} color={colors.surface} />
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-surface"
                  >
                    {copy.growthTipRoi}
                  </VemtapText>
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          <View className="flex-row items-center justify-between gap-2">
            <BusinessBranchSwitcher
              branches={branches}
              activeBranchId={activeBranchId ?? undefined}
              onChangeBranch={changeBranch}
              suffix={copy.branchLiveSuffix}
              trailingLabel={copy.allBranches}
              onAddBranch={onAddBranch}
            />
          </View>

          <View className="mt-1">
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0">
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  {copy.overviewTitle}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {overviewMeta}
                </VemtapText>
              </View>
              <BusinessInlineAction
                label={copy.analyticsCta}
                icon="insights"
                onPress={onOpenAnalytics}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <MetricTile
              icon="visibility"
              label={copy.metrics.views}
              value={metricValue(
                ['totalViews', 'views', 'profileViews', 'impressions', 'dealViews'],
                copy.metrics.viewsValue,
              )}
              delta={metricDelta(copy.metrics.viewsDelta, stats?.visitorsDelta)}
            />
            <MetricTile
              icon="groupAdd"
              label={copy.metrics.customers}
              value={metricValue(
                [
                  'newVisitors',
                  'totalVisitors',
                  'customers',
                  'newCustomers',
                  'totalCustomers',
                  'customersCount',
                  'uniqueCustomers',
                  'visitors',
                ],
                copy.metrics.customersValue,
              )}
              delta={metricDelta(copy.metrics.customersDelta, stats?.visitorsDelta)}
            />
          </View>
          <View className="flex-row gap-3">
            <MetricTile
              icon="localOffer"
              label={copy.metrics.dealsClaimed}
              value={metricValue(
                [
                  'dealsClaimed',
                  'claims',
                  'totalClaims',
                  'claimsCount',
                  'redemptions',
                  'redeemed',
                ],
                copy.metrics.dealsClaimedValue,
              )}
              delta={metricDelta(copy.metrics.dealsClaimedDelta, stats?.claimsDelta)}
            />
            <MetricTile
              icon="shoppingBag"
              label={copy.metrics.ordersBookings}
              value={metricValue(
                [
                  'ordersVolume',
                  'ordersRevenue',
                  'ordersBookingsVolume',
                  'revenue',
                  'totalRevenue',
                  'ordersValue',
                ],
                copy.metrics.ordersBookingsVolume,
                value => `${formatCompactNaira(value)}${copy.ordersVolumeSuffix}`,
              )}
              tone="muted"
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.posTitle}
            onPress={onOpenPos}
            className="flex-row items-center gap-3 rounded-card bg-surface p-4 shadow-sm"
          >
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-fixed">
              <Icon name="pointOfSale" size={20} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
                {copy.posTitle}
              </VemtapText>
              <View className="mt-0.5 flex-row flex-wrap items-baseline gap-2">
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  {posAmountLabel}
                </VemtapText>
                <View className="rounded-full bg-badge-discount-bg px-1.5 py-0.5">
                  <VemtapText variant="micro" className="text-badge-discount-text">
                    {posTxnsLabel}
                  </VemtapText>
                </View>
              </View>
            </View>
            <Icon name="arrowForward" size={18} color={colors.textTertiary} />
          </Pressable>

          <View className="mt-3 gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.activityTitle}
              </VemtapText>
              {activityBadge !== null ? (
                <View className="rounded-full bg-tertiary-fixed px-2 py-0.5">
                  <VemtapText
                    variant="micro"
                    className="font-sans-semibold text-tertiary"
                  >
                    {activityBadge}
                  </VemtapText>
                </View>
              ) : null}
            </View>
            {activityRows.map(item => (
              <View
                key={item.id}
                className="flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm"
              >
                <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container">
                  <Icon
                    name={
                      item.id === 'orders'
                        ? 'receipt'
                        : item.id === 'messages'
                          ? 'message'
                          : item.id === 'claims'
                            ? 'confirmation'
                            : 'sync'
                    }
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {item.title}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {item.body}
                  </VemtapText>
                </View>
                <BusinessInlineAction
                  label={item.cta}
                  onPress={
                    item.id === 'orders'
                      ? onOpenOrders
                      : item.id === 'messages'
                        ? onOpenMessages
                        : item.id === 'claims'
                          ? onOpenClaims
                          : onOpenPosSync
                  }
                />
              </View>
            ))}
          </View>

          <View className="mt-3 gap-3">
            <View className="flex-row items-center gap-2">
              <Icon name="bolt" size={18} color={colors.primary} />
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.shortcutsTitle}
              </VemtapText>
            </View>
            <TwoColumnGrid
              items={copy.shortcuts}
              keyExtractor={item => item.id}
              renderItem={item => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  onPress={
                    item.id === 'scan'
                      ? onOpenScanner
                      : item.id === 'pos'
                        ? onOpenPos
                        : item.id === 'deal'
                          ? onCreateDeal
                          : item.id === 'product'
                            ? onAddProduct
                            : item.id === 'messages'
                              ? onOpenMessages
                              : onBoostDeal
                  }
                  className="gap-1.5 rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-tint">
                    <Icon name={item.icon as IconName} size={20} color={colors.primary} />
                  </View>
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={2}
                  >
                    {item.title}
                  </VemtapText>
                  <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                    {item.body}
                  </VemtapText>
                </Pressable>
              )}
            />
          </View>

          <SetupCard className="mt-3 gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <BusinessSectionHeading title={copy.weekTitle} icon="trendingUp" />
              <BusinessInlineAction label={copy.weekCta} onPress={onOpenReport} />
            </View>
            <View className="flex-row gap-2">
              {weeklyStats.map(stat => (
                <View key={stat.id} className="min-w-0 flex-1 gap-0.5">
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {stat.label}
                  </VemtapText>
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {stat.value}
                  </VemtapText>
                  {stat.delta ? (
                    <View className="flex-row items-center gap-0.5">
                      <Icon name="trendingUp" size={12} color={colors.success} />
                      <VemtapText variant="micro" className="text-success">
                        {stat.delta}
                      </VemtapText>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
            <View className="gap-2">
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {copy.weekChartTitle}
                </VemtapText>
                <VemtapText variant="micro" tone="brand" numberOfLines={1}>
                  {chartPeak}
                </VemtapText>
              </View>
              <View className="h-24 flex-row items-end gap-1.5">
                {dayValues.map((value, index) => {
                  const isPeak = index === peakIndex;
                  const isToday = index === dayValues.length - 1;
                  return (
                    <View
                      key={dayLabels[index] ?? index}
                      className="min-w-0 flex-1 items-center gap-1"
                    >
                      <View
                        className={cn(
                          'w-full rounded-t-md',
                          isToday
                            ? 'bg-primary'
                            : isPeak
                              ? 'bg-primary-fixed'
                              : 'bg-surface-container-high',
                        )}
                        style={{ height: `${value}%` }}
                      />
                      <VemtapText
                        variant="micro"
                        tone={isToday ? 'brand' : 'tertiary'}
                        numberOfLines={1}
                      >
                        {dayLabels[index]}
                      </VemtapText>
                    </View>
                  );
                })}
              </View>
            </View>
          </SetupCard>

          <View className="mt-3 gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.recommendationsTitle}
              </VemtapText>
              <View className="rounded-full bg-surface-tint px-2 py-0.5">
                <VemtapText variant="micro" className="text-primary">
                  {copy.recommendationsBadge}
                </VemtapText>
              </View>
            </View>
            {recommendations.map(item => (
              <SetupCard key={item.id} className="gap-2">
                <View className="flex-row items-start gap-2.5">
                  <View className="h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-tint">
                    <Icon
                      name={item.id === 'branch' ? 'addBusiness' : 'localOffer'}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View className="min-w-0 flex-1 gap-0.5">
                    <VemtapText
                      variant={item.id === 'branch' ? 'labelMd' : 'headingSm'}
                      className="font-sans-semibold"
                      numberOfLines={2}
                    >
                      {item.title}
                    </VemtapText>
                    {item.badge ? (
                      <View className="self-start rounded-full bg-badge-discount-bg px-1.5 py-0.5">
                        <VemtapText
                          variant="micro"
                          className="font-sans-semibold text-badge-discount-text"
                        >
                          {item.badge}
                        </VemtapText>
                      </View>
                    ) : null}
                    <VemtapText variant="caption" tone="secondary">
                      {item.body}
                    </VemtapText>
                  </View>
                </View>
                <BusinessInlineAction
                  label={item.cta}
                  icon={item.id === 'branch' ? 'addLocation' : 'bolt'}
                  onPress={item.id === 'branch' ? onAddBranch : onBoostDeal}
                />
              </SetupCard>
            ))}
            <BusinessInlineAction label={copy.viewAll} onPress={onManageLocations} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </TypeDensityProvider>
  );
}

function MetricTile({
  icon,
  label,
  value,
  delta,
  tone = 'default',
}: {
  icon: IconName;
  label: string;
  value: string;
  delta?: string;
  tone?: 'default' | 'muted';
}) {
  return (
    <View className="min-w-0 flex-1 gap-2 rounded-card bg-surface p-3 shadow-sm">
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-row items-center gap-1.5">
          <Icon name={icon} size={16} color={colors.textSecondary} />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {label}
          </VemtapText>
        </View>
        {delta ? (
          <View className="shrink-0 flex-row items-center gap-0.5">
            <Icon name="trendingUp" size={12} color={colors.success} />
            <VemtapText variant="micro" className="text-success">
              {delta}
            </VemtapText>
          </View>
        ) : null}
      </View>
      <VemtapText
        variant="labelMd"
        className={tone === 'muted' ? 'text-text' : 'font-sans-semibold'}
        numberOfLines={1}
      >
        {value}
      </VemtapText>
    </View>
  );
}
