import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';

const copy = strings.posCustomerLookupLoyalty;

export interface PosLoyaltyView {
  name: string;
  initials: string;
  phone: string;
  tier: string;
  balance: string;
  stats: { label: string; value: string }[];
  rewards: {
    id: string;
    title: string;
    cost: string;
    body: string;
    affordable: boolean;
  }[];
  attached: boolean;
}

export interface PosCustomerLookupLoyaltyScreenProps {
  view?: PosLoyaltyView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** The code issued for a reward, shown to the customer to redeem. */
  issued: { rewardId: string; code: string } | null;
  issuingRewardId?: string | null;
  onBack?: () => void;
  onChangeCustomer?: () => void;
  onIssueCode?: (rewardId: string) => void;
  onAttach?: () => void;
}

/** A customer's loyalty standing at the till and the rewards they can redeem now. */
export function PosCustomerLookupLoyaltyScreen({
  view,
  isLoading,
  isError,
  onRetry,
  issued,
  issuingRewardId,
  onBack,
  onChangeCustomer,
  onIssueCode,
  onAttach,
}: PosCustomerLookupLoyaltyScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        view && !view.attached ? (
          <BusinessActionDock>
            <Button
              label={copy.attachCta(view.name)}
              labelVariant="labelMd"
              onPress={onAttach}
              leftIcon={<Icon name="link" size={17} color={colors.surface} />}
            />
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
        ) : isLoading ? (
          <LoadingState label={copy.loading} />
        ) : (
          <EmptyState
            icon="loyalty"
            title={copy.empty.title}
            description={copy.empty.body}
            actionLabel={copy.findCta}
            onAction={onChangeCustomer}
          />
        )
      ) : (
        <>
          <View className="gap-3 rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-center gap-3">
              <BusinessInitialsAvatar initials={view.initials} size="lg" tone="brand" />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="headingSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {view.name}
                </VemtapText>
                <BusinessStatusPill
                  label={view.tier}
                  tone="brand"
                  className="mt-1 self-start"
                />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-1"
                  numberOfLines={1}
                >
                  {view.phone}
                </VemtapText>
              </View>
              <View className="shrink-0 items-end">
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {copy.balanceLabel}
                </VemtapText>
                <VemtapText
                  variant="headingSm"
                  className="font-sans-bold text-primary"
                  numberOfLines={1}
                >
                  {view.balance}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {copy.balanceUnit}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row gap-2">
              {view.stats.map(stat => (
                <View
                  key={stat.label}
                  className="min-w-0 flex-1 rounded-field bg-surface-subtle p-2"
                >
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {stat.label}
                  </VemtapText>
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {stat.value}
                  </VemtapText>
                </View>
              ))}
            </View>
            <Button
              label={copy.changeCta}
              labelVariant="labelSm"
              variant="secondary"
              size="sm"
              onPress={onChangeCustomer}
            />
          </View>

          <BusinessPanel
            className="mt-3"
            title={copy.rewardsTitle}
            icon="loyalty"
            badge={copy.rewardsBadge(
              view.rewards.filter(reward => reward.affordable).length,
            )}
            badgeTone="success"
          >
            {view.rewards.length === 0 ? (
              <VemtapText variant="caption" tone="secondary">
                {copy.noRewards}
              </VemtapText>
            ) : (
              <View className="gap-2">
                {view.rewards.map(reward => {
                  const code = issued?.rewardId === reward.id ? issued.code : null;
                  return (
                    <View
                      key={reward.id}
                      className="gap-1.5 rounded-field bg-surface-subtle p-2.5"
                    >
                      <View className="flex-row items-center justify-between gap-2">
                        <VemtapText
                          variant="labelMd"
                          className="min-w-0 flex-1 font-sans-semibold"
                          numberOfLines={2}
                        >
                          {reward.title}
                        </VemtapText>
                        <BusinessStatusPill
                          label={reward.cost}
                          tone={reward.affordable ? 'success' : 'neutral'}
                        />
                      </View>
                      <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                        {reward.body}
                      </VemtapText>
                      {code ? (
                        <View className="items-center gap-1 rounded-field bg-surface-tint p-2.5">
                          <VemtapText variant="micro" tone="secondary">
                            {copy.codeLabel}
                          </VemtapText>
                          <VemtapText
                            variant="headingLg"
                            className="font-sans-bold tracking-widest text-primary"
                          >
                            {code}
                          </VemtapText>
                          <VemtapText
                            variant="micro"
                            tone="tertiary"
                            className="text-center"
                          >
                            {copy.codeHint}
                          </VemtapText>
                        </View>
                      ) : reward.affordable ? (
                        <Button
                          label={copy.issueCta}
                          size="sm"
                          labelVariant="labelSm"
                          loading={issuingRewardId === reward.id}
                          onPress={() => onIssueCode?.(reward.id)}
                        />
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}
          </BusinessPanel>
        </>
      )}
    </BusinessScreenLayout>
  );
}
