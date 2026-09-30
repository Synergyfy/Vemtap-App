import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import { BusinessAnalyticsNav } from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  NetworkGrowthSummary,
  NetworkInfoBanner,
  NetworkPartnerRow,
} from '@features/business/components/BusinessNetworkPrimitives';
import {
  networkGrowth,
  networkPartners,
  networkSubTabIcon,
  myNetworkSubTabs,
} from '@features/business/data/businessNetworkData';
import { strings } from '@constants/strings';

const copy = strings.myBusinessNetwork;

const tabs = myNetworkSubTabs.map(label => ({
  key: label,
  label,
  icon: networkSubTabIcon[label],
}));

export interface MyBusinessNetworkScreenProps {
  onBack?: () => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onCopyLink?: () => void;
  onShareLink?: () => void;
  onQuickShare?: (channelId: string) => void;
  onScan?: () => void;
  onOpenMilestones?: () => void;
  onOpenPartner?: (partnerId: string) => void;
  onViewAllPartners?: () => void;
  onOpenHowItWorks?: () => void;
}

/**
 * The merchant's own referral network: their link, quick-share channels, the
 * shared growth summary, recently connected partners and the verification note.
 *
 * The design's bottom tab bar is not rendered — the app shell owns it.
 */
export function MyBusinessNetworkScreen({
  onBack,
  onOpenSearch,
  onOpenProfile,
  onOpenSubTab,
  onCopyLink,
  onShareLink,
  onQuickShare,
  onScan,
  onOpenMilestones,
  onOpenPartner,
  onViewAllPartners,
  onOpenHowItWorks,
}: MyBusinessNetworkScreenProps) {
  const [subTab, setSubTab] = useState<string>(myNetworkSubTabs[0]);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'search', label: copy.headerSearch, onPress: onOpenSearch },
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.copyLinkCta}
            labelVariant="labelMd"
            onPress={onCopyLink}
            leftIcon={<Icon name="copy" size={18} color={colors.surface} />}
          />
          <Button
            label={copy.shareLinkCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={onShareLink}
          />
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center gap-1.5">
        <Icon name="verified" size={14} color={colors.badgeDiscountText} />
        <VemtapText
          variant="caption"
          className="min-w-0 flex-1 text-badge-discount-text"
          numberOfLines={1}
        >
          {copy.hubLabel}
        </VemtapText>
      </View>

      <BusinessAnalyticsNav
        tabs={tabs}
        value={subTab}
        onChange={next => {
          setSubTab(next);
          onOpenSubTab?.(next);
        }}
        className="-mx-6 mt-3"
      />

      <View className="mt-3 gap-1">
        <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={1}>
          {copy.title}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="leading-relaxed"
          numberOfLines={3}
        >
          {copy.body}
        </VemtapText>
      </View>

      <NetworkInfoBanner
        className="mt-3"
        icon="tapAndPlay"
        title={copy.scanTitle}
        onPress={onScan}
        accessibilityLabel={copy.scanTitle}
      />

      <BusinessPanel className="mt-3" title={copy.linkLabel} icon="link">
        <View className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-3">
          <View className="min-w-0 flex-1">
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {copy.linkLabel}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.referralLink}
            </VemtapText>
          </View>
          <BusinessStatusPill label={copy.linkStatus} tone="success" />
        </View>
        <View className="flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.copyLinkCta}
            onPress={onCopyLink}
            className="min-h-10 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container active:scale-95"
          >
            <Icon name="copy" size={15} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.copyLinkCta}
            </VemtapText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.shareLinkCta}
            onPress={onShareLink}
            className="min-h-10 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container active:scale-95"
          >
            <Icon name="share" size={15} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.shareLinkCta}
            </VemtapText>
          </Pressable>
        </View>
      </BusinessPanel>

      <View className="mt-3">
        <VemtapText
          variant="labelMd"
          className="mb-2 font-sans-semibold"
          numberOfLines={1}
        >
          {copy.quickShareTitle}
        </VemtapText>
        <View className="flex-row gap-2">
          {copy.shareChannels.map(channel => (
            <Pressable
              key={channel.id}
              accessibilityRole="link"
              accessibilityLabel={channel.label}
              onPress={onQuickShare ? () => onQuickShare(channel.id) : undefined}
              className="min-h-11 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface px-2 shadow-sm active:scale-95"
            >
              <Icon name={channel.icon} size={17} color={colors.primary} />
              <VemtapText
                variant="labelSm"
                className="min-w-0 font-sans-semibold"
                numberOfLines={1}
              >
                {channel.label}
              </VemtapText>
            </Pressable>
          ))}
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
        milestonesCta={copy.milestonesCta}
        onViewMilestones={onOpenMilestones}
      />

      <BusinessPanel
        className="mt-3"
        title={copy.connectedTitle}
        icon="accountCircle"
        badge={copy.connectedCount.replace('{count}', String(networkPartners.length))}
        badgeTone="success"
      >
        <View className="flex-row items-center gap-1.5">
          <Icon name="sync" size={13} color={colors.badgeDiscountText} />
          <VemtapText
            variant="micro"
            className="min-w-0 flex-1 text-badge-discount-text"
            numberOfLines={1}
          >
            {copy.connectedSync}
          </VemtapText>
        </View>
        <View className="gap-2">
          {networkPartners.map(partner => (
            <NetworkPartnerRow
              key={partner.id}
              name={partner.name}
              initials={partner.initials}
              subtitle={`${partner.district} • ${partner.category}`}
              meta={partner.meta}
              status={partner.status}
              statusTone="success"
              icon={partner.icon}
              chevron
              onPress={() => onOpenPartner?.(partner.id)}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.viewAllCta.replace(
            '{count}',
            String(networkPartners.length),
          )}
          onPress={onViewAllPartners}
          className="min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container"
        >
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.viewAllCta.replace('{count}', String(networkPartners.length))}
          </VemtapText>
          <Icon name="forward" size={15} color={colors.text} />
        </Pressable>
      </BusinessPanel>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.helpTitle}
        onPress={onOpenHowItWorks}
        className="mt-3 flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5"
      >
        <Icon name="info" size={16} color={colors.textTertiary} />
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" className="font-sans-semibold" numberOfLines={1}>
            {copy.helpTitle}
          </VemtapText>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
            {copy.helpBody}
          </VemtapText>
        </View>
        <View className="shrink-0">
          <Icon name="forward" size={16} color={colors.textTertiary} />
        </View>
      </Pressable>
    </BusinessScreenLayout>
  );
}
