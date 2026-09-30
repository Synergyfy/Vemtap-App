import React, { useState } from 'react';
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
  dashboardConnections,
  dashboardSubTabs,
  networkBadges,
  networkGrowth,
  networkSubTabIcon,
} from '@features/business/data/businessNetworkData';

const copy = strings.businessNetworkDashboard;

const tabs = dashboardSubTabs.map(label => ({
  key: label,
  label,
  icon: networkSubTabIcon[label],
}));

export interface BusinessNetworkActiveDashboardScreenProps {
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
      title: copy.referralCardTitle.replace('{count}', networkGrowth.verifiedCount),
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

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
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

      <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-primary p-3">
        <View className="min-w-0 flex-1">
          <BusinessStatusPill label={copy.statusBadge} tone="success" />
          <View className="mt-1.5 flex-row items-baseline gap-1.5">
            <VemtapText
              variant="headingLg"
              className="font-sans-bold text-surface"
              numberOfLines={1}
            >
              {networkGrowth.verifiedCount}
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
        verifiedCount={networkGrowth.verifiedCount}
        tierName={networkGrowth.currentTierName}
        nextTierName={networkGrowth.nextTierName}
        remaining={networkGrowth.remaining}
        remainingTotal={networkGrowth.remainingTotal}
        percent={networkGrowth.percent}
        nextMilestoneBody={networkGrowth.nextMilestoneBody}
      />

      <BusinessPanel
        className="mt-3"
        title={copy.badgesTitle}
        icon="medal"
        badge={copy.badgesCount.replace('{count}', String(networkBadges.length))}
        badgeTone="brand"
      >
        <View className="flex-row flex-wrap gap-2">
          {networkBadges.map(badge => (
            <View
              key={badge.id}
              className="min-w-[45%] flex-1 flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5"
            >
              <BusinessIconWell icon={badge.icon} tone={badge.tone} size="sm" />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelSm"
                  className="min-w-0 font-sans-semibold"
                  numberOfLines={1}
                >
                  {badge.name}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {badge.meta}
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
          {dashboardConnections.map(connection => (
            <NetworkPartnerRow
              key={connection.id}
              name={connection.name}
              initials={connection.initials}
              subtitle="Verified partner"
              status="Active"
              statusTone="success"
              chevron
              onPress={() => onOpenConnection?.(connection.id)}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.connectionsAction.replace('{count}', '11')}
          onPress={onViewAllReferrals}
          className="min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container"
        >
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.connectionsAction.replace('{count}', '11')}
          </VemtapText>
          <Icon name="arrowForward" size={15} color={colors.text} />
        </Pressable>
      </BusinessPanel>

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
