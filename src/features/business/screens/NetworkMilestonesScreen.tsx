import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessIconWell } from '@features/business/components/BusinessOpsPrimitives';
import { BusinessAnalyticsNav } from '@features/business/components/BusinessAnalyticsPrimitives';
import { NetworkMilestoneCard } from '@features/business/components/BusinessNetworkPrimitives';
import {
  milestoneSubTabs,
  networkGrowth,
  networkSubTabIcon,
  networkMilestones,
} from '@features/business/data/businessNetworkData';

const copy = strings.networkMilestones;

const tabs = milestoneSubTabs.map(label => ({
  key: label,
  label,
  icon: networkSubTabIcon[label],
}));

export interface NetworkMilestonesScreenProps {
  onBack?: () => void;
  onOpenInfo?: () => void;
  onOpenProfile?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onOpenMilestone?: (milestoneId: string) => void;
}

/**
 * The network growth ladder: current status, then every milestone tier with its
 * verification threshold, state and the perks it unlocks. Renders entirely
 * through the shared milestone card so this screen and the dashboard agree.
 */
export function NetworkMilestonesScreen({
  onBack,
  onOpenInfo,
  onOpenProfile,
  onOpenSubTab,
  onOpenMilestone,
}: NetworkMilestonesScreenProps) {
  const [subTab, setSubTab] = useState<string>(milestoneSubTabs[1]);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'info', label: copy.headerInfo, onPress: onOpenInfo },
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
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

      <View className="mt-3 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Icon name="trophy" size={17} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.ladderTitle}
          </VemtapText>
        </View>
        <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={2}>
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

      <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
        <BusinessIconWell icon="workspacePremium" tone="brand" size="lg" />
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.currentStatusLabel}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.currentStatusValue}
          </VemtapText>
        </View>
        <BusinessStatusPill
          label={`${networkGrowth.verifiedCount} ${copy.verifiedCountLabel}`}
          tone="success"
        />
      </View>

      <View className="mt-3 gap-2">
        {networkMilestones.map(milestone => (
          <NetworkMilestoneCard
            key={milestone.id}
            name={milestone.name}
            threshold={milestone.threshold}
            state={milestone.state}
            icon={milestone.icon}
            tierNote={milestone.tierNote}
            progressNote={milestone.progressNote}
            percent={milestone.percent}
            verifiedCaption={milestone.verifiedCaption}
            perks={milestone.perks}
            onPress={() => onOpenMilestone?.(milestone.id)}
          />
        ))}
      </View>
    </BusinessScreenLayout>
  );
}
