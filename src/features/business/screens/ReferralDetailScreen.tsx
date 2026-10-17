import React from 'react';
import { Pressable, View } from 'react-native';
import { ErrorState, LoadingState } from '@components/shared';
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
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import { VerificationTimelineRow } from '@features/business/components/VerificationPrimitives';
import type { ReferralDetailView } from '@features/business/utils/networkMappers';

const copy = strings.referralDetail;

export interface ReferralDetailScreenProps {
  view?: ReferralDetailView;
  isError?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  onShare?: () => void;
  onMoreOptions?: () => void;
  onSendMessage?: (referralId: string) => void;
  onViewBusiness?: (referralId: string) => void;
}

/**
 * A single referral: the business identity, the referral overview, whether it
 * counts toward milestones, and the onboarding timeline the referred business
 * has worked through. The timeline reuses the shared verification timeline row.
 */
export function ReferralDetailScreen({
  view,
  isError,
  onRetry,
  onBack,
  onShare,
  onMoreOptions,
  onSendMessage,
  onViewBusiness,
}: ReferralDetailScreenProps) {
  const rows = view
    ? [
        { label: copy.idLabel, value: view.code },
        { label: copy.statusLabel, value: view.status },
        { label: copy.referredOnLabel, value: view.referredOn },
        { label: copy.creditedToLabel, value: view.creditedTo },
      ]
    : [];

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
        view ? (
          <BusinessActionDock>
            <Button
              label={copy.messageCta}
              labelVariant="labelMd"
              onPress={() => onSendMessage?.(view.id)}
              leftIcon={<Icon name="message" size={18} color={colors.surface} />}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.viewBusinessCta}
              onPress={onViewBusiness ? () => onViewBusiness(view.id) : undefined}
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
        ) : undefined
      }
    >
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
          <View className="gap-2 rounded-card bg-surface p-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <BusinessInitialsAvatar initials={view.initials} tone="brand" />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 font-sans-semibold"
                  numberOfLines={1}
                >
                  {view.name}
                </VemtapText>
                {view.subtitle ? (
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {view.subtitle}
                  </VemtapText>
                ) : null}
              </View>
              <BusinessStatusPill label={view.status} tone={view.tone} />
            </View>
          </View>

          <BusinessPanel
            className="mt-3"
            title={copy.overviewTitle}
            icon="clipboardCheck"
          >
            <View className="gap-1.5">
              {rows.map(row => (
                <View
                  key={row.label}
                  className="flex-row items-center justify-between gap-2"
                >
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {row.label}
                  </VemtapText>
                  <VemtapText
                    variant="labelSm"
                    className="min-w-0 flex-1 text-right font-sans-semibold"
                    numberOfLines={1}
                  >
                    {row.value}
                  </VemtapText>
                </View>
              ))}
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
                  {view.milestone}
                </VemtapText>
              </View>
            </View>

            <View className="flex-row items-start gap-1.5">
              <Icon
                name={view.verified ? 'verified' : 'hourglass'}
                size={14}
                color={view.verified ? colors.badgeDiscountText : colors.textTertiary}
              />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="caption"
                  className={
                    view.verified
                      ? 'font-sans-semibold text-badge-discount-text'
                      : 'font-sans-semibold'
                  }
                  numberOfLines={1}
                >
                  {view.verificationTitle}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
                  {view.verificationBody}
                </VemtapText>
              </View>
            </View>
          </BusinessPanel>

          <BusinessPanel
            className="mt-3"
            title={copy.timelineTitle}
            icon="timeline"
            badge={view.timelineSummary}
            badgeTone={view.timeline.every(step => step.done) ? 'success' : 'neutral'}
          >
            <View className="gap-3">
              {view.timeline.map((step, index) => (
                <VerificationTimelineRow
                  key={step.id}
                  title={step.label}
                  state={step.done ? 'done' : 'pending'}
                  meta={step.when}
                  markerIcon={step.done ? 'checkBold' : undefined}
                  showConnector={index < view.timeline.length - 1}
                />
              ))}
            </View>
          </BusinessPanel>

          <View className="mt-3 flex-row items-start gap-1.5 rounded-field bg-surface-subtle p-2.5">
            <Icon name="lock" size={14} color={colors.textTertiary} />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="min-w-0 flex-1"
              numberOfLines={2}
            >
              {copy.legalNote}
            </VemtapText>
          </View>
        </>
      )}
    </BusinessScreenLayout>
  );
}
