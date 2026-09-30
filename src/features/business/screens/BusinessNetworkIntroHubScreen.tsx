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
  NetworkInfoBanner,
  NetworkMilestoneCard,
} from '@features/business/components/BusinessNetworkPrimitives';
import {
  nearbyMerchants,
  networkSubTabIcon,
  networkSubTabs,
} from '@features/business/data/businessNetworkData';

const copy = strings.businessNetworkIntroHub;

const tabs = networkSubTabs.map(label => ({
  key: label,
  label,
  icon: networkSubTabIcon[label],
}));

const benefitIcon: Record<string, import('@components/ui/Icon').IconName> = {
  visibility: 'locationOn',
  network: 'handshake',
  unlock: 'workspacePremium',
};

export interface BusinessNetworkIntroHubScreenProps {
  onBack?: () => void;
  onOpenHelp?: () => void;
  onOpenProfile?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onGetReferralLink?: () => void;
  onReadMore?: () => void;
  onOpenNearby?: (merchantId: string) => void;
}

/**
 * Business Network entry point: what the network is, how merchants joined this
 * week, the merchant's current network size, the immediate milestone, the three
 * benefits, the tier ladder teaser and nearby merchants.
 *
 * The design's own bottom tab bar is deliberately not rendered — the app shell
 * owns bottom navigation — so its category strip is a top sub-tab instead.
 */
export function BusinessNetworkIntroHubScreen({
  onBack,
  onOpenHelp,
  onOpenProfile,
  onOpenSubTab,
  onGetReferralLink,
  onReadMore,
  onOpenNearby,
}: BusinessNetworkIntroHubScreenProps) {
  const [subTab, setSubTab] = useState<string>(networkSubTabs[0]);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'help', label: copy.headerHelp, onPress: onOpenHelp },
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.getLinkCta}
            labelVariant="labelMd"
            onPress={onGetReferralLink}
            leftIcon={<Icon name="share" size={18} color={colors.surface} />}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.readMoreCta}
            onPress={onReadMore}
            className="min-h-10 flex-row items-center justify-center gap-1.5"
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={2}
            >
              {copy.readMoreCta}
            </VemtapText>
            <Icon name="forward" size={15} color={colors.primary} />
          </Pressable>
        </BusinessActionDock>
      }
    >
      <BusinessAnalyticsNav
        tabs={tabs}
        value={subTab}
        onChange={next => {
          setSubTab(next);
          onOpenSubTab?.(next);
        }}
        className="-mx-6"
      />

      <View className="mt-3 gap-2 rounded-card bg-surface p-4 shadow-sm">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="micro"
            className="font-sans-semibold uppercase tracking-wider text-primary"
            numberOfLines={1}
          >
            {copy.title}
          </VemtapText>
          <BusinessStatusPill label={copy.betaBadge} tone="brand" />
        </View>
        <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={2}>
          {copy.hero}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="leading-relaxed"
          numberOfLines={5}
        >
          {copy.body}
        </VemtapText>
      </View>

      <NetworkInfoBanner
        className="mt-3"
        icon="groupNetwork"
        title={copy.joinedValue}
        body={`${copy.joinedLabel} · ${copy.joinedDelta}`}
      />

      <BusinessPanel
        className="mt-3"
        title={copy.liveStatusTitle}
        icon="radar"
        badge={copy.liveStatusTier}
        badgeTone="neutral"
      >
        <View className="flex-row items-center gap-2.5">
          <BusinessIconWell icon="hub" tone="neutral" size="lg" />
          <View className="min-w-0 flex-1">
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {copy.networkTitle}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.networkValue}
            </VemtapText>
          </View>
        </View>
      </BusinessPanel>

      <View className="mt-3 gap-2 rounded-card border border-border bg-surface p-3">
        <View className="flex-row items-center gap-2">
          <Icon name="flag" size={17} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={2}
          >
            {copy.milestoneTitle}
          </VemtapText>
        </View>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="leading-relaxed"
          numberOfLines={3}
        >
          {`${copy.milestoneBody} `}
          <VemtapText variant="bodyMd" className="font-sans-semibold text-primary">
            {copy.milestoneHighlight}
          </VemtapText>
          {` ${copy.milestoneBodyEnd}`}
        </VemtapText>
      </View>

      <BusinessPanel className="mt-3" title={copy.whyTitle} icon="lightbulb">
        <View className="gap-2.5">
          {copy.benefits.map(benefit => (
            <View key={benefit.id} className="flex-row items-start gap-2.5">
              <BusinessIconWell icon={benefitIcon[benefit.id]} tone="brand" />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={2}
                >
                  {benefit.step}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  className="font-sans-medium"
                  numberOfLines={1}
                >
                  {benefit.title}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-1 leading-relaxed"
                  numberOfLines={4}
                >
                  {benefit.body}
                </VemtapText>
                {benefit.stat ? (
                  <View className="mt-1.5 flex-row items-center gap-1.5">
                    <Icon name="checkCircle" size={13} color={colors.badgeDiscountText} />
                    <VemtapText
                      variant="micro"
                      className="min-w-0 flex-1 text-badge-discount-text"
                      numberOfLines={2}
                    >
                      {benefit.stat}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title="Tier Perks" icon="workspacePremium">
        <View className="flex-row flex-wrap gap-2">
          {copy.tierPerks.map(perk => (
            <View
              key={perk.id}
              className="min-w-[30%] flex-1 items-center gap-1 rounded-field bg-surface-subtle p-2.5"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-surface">
                <VemtapText
                  variant="micro"
                  className="font-sans-bold text-primary"
                  numberOfLines={1}
                >
                  {perk.label}
                </VemtapText>
              </View>
              <VemtapText
                variant="caption"
                className="text-center font-sans-semibold"
                numberOfLines={2}
              >
                {perk.perk}
              </VemtapText>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <NetworkMilestoneCard
        className="mt-3"
        name={strings.networkMilestones.currentStatusValue}
        threshold={strings.myReferrals.growthValue}
        state="unlocked"
        icon="trophy"
        percent={100}
        verifiedCaption={strings.myBusinessNetwork.tierLabel}
        perks={[
          { text: 'Network Partner status' },
          { text: 'Partner badge on merchant profiles' },
        ]}
        onPress={onReadMore}
      />

      <BusinessPanel
        className="mt-3"
        title={copy.nearbyTitle}
        icon="locationOn"
        badge={strings.myBusinessNetwork.connectedCount.replace(
          '{count}',
          String(nearbyMerchants.length),
        )}
        badgeTone="neutral"
      >
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.nearbyBody}
        </VemtapText>
        <View className="gap-2">
          {nearbyMerchants.map(merchant => (
            <Pressable
              key={merchant.id}
              accessibilityRole="button"
              accessibilityLabel={merchant.name}
              onPress={onOpenNearby ? () => onOpenNearby(merchant.id) : undefined}
              className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5 active:bg-surface-container"
            >
              <BusinessIconWell icon="storefront" tone="neutral" size="sm" />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 font-sans-semibold"
                  numberOfLines={1}
                >
                  {merchant.name}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {`${merchant.distance} • ${merchant.category}`}
                </VemtapText>
              </View>
              <View className="shrink-0">
                <Icon name="forward" size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-3 flex-row items-center gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <Icon name="verifiedUser" size={14} color={colors.textTertiary} />
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {copy.complianceNote}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}
