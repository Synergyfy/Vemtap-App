import React from 'react';
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
import { VerificationTimelineRow } from '@features/business/components/VerificationPrimitives';
import {
  featuredReferralId,
  referralTimeline,
  referrals,
  referralStatusLabel,
} from '@features/business/data/businessNetworkData';

const copy = strings.referralDetail;

const referral = referrals.find(item => item.id === featuredReferralId) ?? referrals[0];

export interface ReferralDetailScreenProps {
  referralId?: string;
  onBack?: () => void;
  onShare?: () => void;
  onMoreOptions?: () => void;
  onSendMessage?: (referralId: string) => void;
  onViewBusiness?: (referralId: string) => void;
}

/**
 * A single referral: the business identity, the referral overview, the credited
 * milestone, the four-step timeline and the mutual perks now active between the
 * two businesses. The timeline reuses the shared verification timeline row.
 */
export function ReferralDetailScreen({
  referralId,
  onBack,
  onShare,
  onMoreOptions,
  onSendMessage,
  onViewBusiness,
}: ReferralDetailScreenProps) {
  const record = referrals.find(item => item.id === referralId) ?? referral;

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'share', label: copy.headerShare, onPress: onShare },
          { icon: 'more', label: copy.headerMore, onPress: onMoreOptions },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.messageCta}
            labelVariant="labelMd"
            onPress={() => onSendMessage?.(record.id)}
            leftIcon={<Icon name="message" size={18} color={colors.surface} />}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.viewBusinessCta}
            onPress={onViewBusiness ? () => onViewBusiness(record.id) : undefined}
            className="min-h-10 flex-row items-center justify-center gap-1.5"
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.viewBusinessCta}
            </VemtapText>
            <Icon name="openInNew" size={15} color={colors.primary} />
          </Pressable>
        </BusinessActionDock>
      }
    >
      <View className="gap-2 rounded-card bg-surface p-4 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
            <Icon name={record.icon} size={24} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={1}
              >
                {record.name}
              </VemtapText>
              <Icon name="checkBold" size={15} color={colors.badgeDiscountText} />
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {record.category}
            </VemtapText>
          </View>
          <BusinessStatusPill label={referralStatusLabel[record.status]} tone="success" />
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="locationOn" size={14} color={colors.textTertiary} />
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="min-w-0 flex-1"
            numberOfLines={1}
          >
            {`${record.district}, Abuja, Nigeria`}
          </VemtapText>
        </View>
      </View>

      <BusinessPanel className="mt-3" title={copy.overviewTitle} icon="clipboardCheck">
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.idLabel}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              className="shrink-0 font-sans-semibold"
              numberOfLines={1}
            >
              {`${copy.idLabel} ${record.refId}`}
            </VemtapText>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.statusLabel}
            </VemtapText>
            <View className="flex-row items-center gap-1.5">
              <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
              <VemtapText
                variant="labelSm"
                className="shrink-0 font-sans-semibold text-badge-discount-text"
                numberOfLines={1}
              >
                {referralStatusLabel[record.status]}
              </VemtapText>
            </View>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.referredOnLabel}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              className="shrink-0 font-sans-semibold"
              numberOfLines={1}
            >
              {record.joined.replace('Joined ', '')}
            </VemtapText>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.creditedToLabel}
            </VemtapText>
            <VemtapText
              variant="labelSm"
              className="min-w-0 flex-1 text-right font-sans-semibold"
              numberOfLines={1}
            >
              {copy.creditedToValue}
            </VemtapText>
          </View>
        </View>

        <View className="mt-1 flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-3">
          <BusinessIconWell icon="trophy" tone="brand" size="sm" />
          <View className="min-w-0 flex-1">
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {copy.milestoneLabel}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {strings.myBusinessNetwork.tierLabel}
            </VemtapText>
          </View>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Icon name="verified" size={14} color={colors.badgeDiscountText} />
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 text-badge-discount-text"
            numberOfLines={2}
          >
            {`${copy.verificationTitle} • ${copy.verificationBody}`}
          </VemtapText>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.timelineTitle}
        icon="timeline"
        badge={copy.timelineSubtitle}
        badgeTone="success"
      >
        <View className="gap-3">
          {referralTimeline.map((step, index) => (
            <VerificationTimelineRow
              key={step.id}
              title={step.title}
              state="done"
              meta={`${step.when}${step.reference ? ` · ${step.reference}` : ''}`}
              body={step.body}
              markerIcon="checkBold"
              showConnector={index < referralTimeline.length - 1}
            />
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.perksTitle}
        icon="star"
        badge={copy.perksSubtitle}
        badgeTone="brand"
      >
        <View className="gap-2">
          {copy.perks.map(perk => (
            <View
              key={perk.id}
              className="flex-row items-start gap-2.5 rounded-field bg-surface-subtle p-2.5"
            >
              <BusinessIconWell icon={perk.icon} tone="brand" size="sm" />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={2}
                >
                  {perk.title}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-0.5"
                  numberOfLines={3}
                >
                  {perk.body}
                </VemtapText>
              </View>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-3 flex-row items-start gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <Icon name="lock" size={14} color={colors.textTertiary} />
        <View className="min-w-0 flex-1">
          <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
            {copy.legalNote}
          </VemtapText>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {copy.legalVersion}
          </VemtapText>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}
