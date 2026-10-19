import React, { useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '@components/shared';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessAnalyticsNav } from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  NetworkGrowthSummary,
  NetworkPartnerRow,
} from '@features/business/components/BusinessNetworkPrimitives';
import {
  dashboardSubTabs,
  networkSubTabIcon,
} from '@features/business/data/businessNetworkData';
import type { NetworkHubView } from '@features/business/utils/networkMappers';

const copy = strings.businessNetworkDashboard;

const tabs = dashboardSubTabs.map(label => ({
  key: label,
  label,
  icon: networkSubTabIcon[label],
}));

export interface BusinessNetworkActiveDashboardScreenProps {
  view?: NetworkHubView;
  isError?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onShareLink?: () => void;
  onOpenConnection?: (connectionId: string) => void;
  onViewAllReferrals?: () => void;
  onOpenMilestones?: () => void;
  onOpenHowItWorks?: () => void;
}

/**
 * The signed-in network dashboard: verified-referral count, progress to the next
 * tier, earned badges, recent connections and the routes into the referral
 * directory, milestones and guide.
 *
 * The design's own bottom tab bar is not rendered — the app shell owns it — so
 * its category strip is a top sub-tab instead.
 */
export function BusinessNetworkActiveDashboardScreen({
  view,
  isError,
  onRetry,
  onBack,
  onOpenProfile,
  onOpenSubTab,
  onShareLink,
  onOpenConnection,
  onViewAllReferrals,
  onOpenMilestones,
  onOpenHowItWorks,
}: BusinessNetworkActiveDashboardScreenProps) {
  const [subTab, setSubTab] = useState<string>(dashboardSubTabs[0]);

  const cards: {
    id: string;
    icon: import('@components/ui/Icon').IconName;
    title: string;
    body: string;
    onPress?: () => void;
  }[] = [
    {
      id: 'referrals',
      icon: 'groupNetwork',
      title: copy.referralCardTitle.replace('{count}', view?.growth.verifiedCount ?? '0'),
      body: copy.referralCardBody,
      onPress: onViewAllReferrals,
    },
    {
      id: 'milestones',
      icon: 'trophy',
      title: copy.milestonesCardTitle,
      body: copy.milestonesCardBody,
      onPress: onOpenMilestones,
    },
    {
      id: 'guide',
      icon: 'help',
      title: copy.howCardTitle,
      body: copy.howCardBody,
      onPress: onOpenHowItWorks,
    },
  ];

  const badges = (view?.milestones ?? []).filter(tier => tier.state !== 'locked');

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          {
            icon: 'accountCircle',
            label: strings.businessShell.profileLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.shareCta}
            labelVariant="labelMd"
            onPress={onShareLink}
            leftIcon={<Icon name="share" size={18} color={colors.surface} />}
          />
        </BusinessActionDock>
      }
    >
      <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
        {copy.headerSubtitle}
      </VemtapText>

      <BusinessAnalyticsNav
        tabs={tabs}
        value={subTab}
        onChange={next => {
          setSubTab(next);
          onOpenSubTab?.(next);
        }}
        className="-mx-6 mt-2"
      />

      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={copy.loading} />
        )
      ) : (
        <>
          <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-primary p-3">
            <View className="min-w-0 flex-1">
              <BusinessStatusPill label={copy.statusBadge} tone="success" />
              <View className="mt-1.5 flex-row items-baseline gap-1.5">
                <VemtapText
                  variant="headingLg"
                  className="font-sans-bold text-surface"
                  numberOfLines={1}
                >
                  {view.growth.verifiedCount}
                </VemtapText>
                <VemtapText variant="caption" className="text-surface" numberOfLines={1}>
                  {copy.verifiedLabel}
                </VemtapText>
              </View>
            </View>
            <View className="h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface">
              <Icon name="hub" size={24} color={colors.primary} />
            </View>
          </View>

          <NetworkGrowthSummary
            className="mt-3"
            verifiedCount={view.growth.verifiedCount}
            tierName={view.growth.tierName}
            nextTierName={view.growth.nextTierName}
            remaining={view.growth.remaining}
            remainingTotal={view.growth.remainingTotal}
            percent={view.growth.percent}
            nextMilestoneBody={view.growth.nextMilestoneBody}
          />

          <BusinessPanel
            className="mt-3"
            title={copy.badgesTitle}
            icon="medal"
            badge={copy.badgesCount.replace('{count}', String(badges.length))}
            badgeTone="brand"
          >
            <View className="flex-row flex-wrap gap-2">
              {badges.length === 0 ? (
                <VemtapText variant="caption" tone="tertiary">
                  {copy.badgesEmpty}
                </VemtapText>
              ) : null}
              {badges.map(badge => (
                <View
                  key={badge.id}
                  className="min-w-[45%] flex-1 flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5"
                >
                  <BusinessIconWell
                    icon={badge.icon}
                    tone={badge.state === 'active' ? 'brand' : 'tertiary'}
                    size="sm"
                  />
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelSm"
                      className="min-w-0 font-sans-semibold"
                      numberOfLines={1}
                    >
                      {badge.name}
                    </VemtapText>
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {badge.threshold}
                    </VemtapText>
                  </View>
                </View>
              ))}
            </View>
          </BusinessPanel>

          <BusinessPanel
            className="mt-3"
            title={copy.connectionsTitle}
            icon="accountCircle"
            badge={copy.connectionsBadge}
            badgeTone="neutral"
          >
            <View className="gap-2">
              {view.recent.length === 0 ? (
                <EmptyState
                  icon="groupNetwork"
                  variant="contained"
                  title={copy.empty.title}
                  description={copy.empty.body}
                />
              ) : null}
              {view.recent.map(connection => (
                <NetworkPartnerRow
                  key={connection.id}
                  name={connection.name}
                  initials={connection.initials}
                  subtitle={connection.subtitle || connection.meta}
                  status={connection.status}
                  statusTone={connection.tone}
                  chevron
                  onPress={() => onOpenConnection?.(connection.id)}
                />
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.connectionsAction.replace(
                '{count}',
                String(view.total),
              )}
              onPress={onViewAllReferrals}
              className="min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container"
            >
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.connectionsAction.replace('{count}', String(view.total))}
              </VemtapText>
              <Icon name="arrowForward" size={15} color={colors.text} />
            </Pressable>
          </BusinessPanel>
        </>
      )}

      <View className="mt-3 gap-2">
        {cards.map(card => (
          <Pressable
            key={card.id}
            accessibilityRole="button"
            accessibilityLabel={card.title}
            onPress={card.onPress}
            className="flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
          >
            <BusinessIconWell icon={card.icon} tone="brand" size="lg" />
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {card.title}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                {card.body}
              </VemtapText>
            </View>
            <View className="shrink-0">
              <Icon name="forward" size={18} color={colors.textTertiary} />
            </View>
          </Pressable>
        ))}
      </View>

      <View className="mt-3 flex-row items-center gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <Icon name="verifiedUser" size={14} color={colors.textTertiary} />
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {copy.footerNote}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}
