import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessActionDock,
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';

const copy = strings.posCustomerLookupActive;

export interface MatchedCustomerView {
  id: string;
  name: string;
  initials: string;
  phone: string;
  tier: string;
  points: string;
  stats: { id: string; label: string; value: string; note: string }[];
  lastVisit: string;
  rewards: {
    id: string;
    title: string;
    body: string;
    badge: string;
    affordable: boolean;
  }[];
}

export interface PosCustomerLookupActiveScreenProps {
  search: string;
  /** Null while nothing matches the search. */
  match: MatchedCustomerView | null;
  isSearching?: boolean;
  ticketLabel: string;
  onBack?: () => void;
  onSearchChange?: (text: string) => void;
  onOpenRewards?: () => void;
  onAttach?: () => void;
  onViewReceipts?: () => void;
  onSendWhatsApp?: () => void;
}

/** The attach surface for the active checkout: find the patron, see standing and perks, attach. */
export function PosCustomerLookupActiveScreen({
  search,
  match,
  isSearching,
  ticketLabel,
  onBack,
  onSearchChange,
  onOpenRewards,
  onAttach,
  onViewReceipts,
  onSendWhatsApp,
}: PosCustomerLookupActiveScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack, subtitle: ticketLabel }}
      contentContainerClassName="pb-8"
      footer={
        match ? (
          <BusinessActionDock>
            <Button
              label={copy.attachCta(match.name)}
              labelVariant="labelMd"
              onPress={onAttach}
              leftIcon={<Icon name="link" size={17} color={colors.surface} />}
            />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="text-center"
              numberOfLines={2}
            >
              {copy.attachHint}
            </VemtapText>
          </BusinessActionDock>
        ) : undefined
      }
    >
      <Input
        placeholder={copy.searchPlaceholder}
        accessibilityLabel={copy.searchPlaceholder}
        value={search}
        onChangeText={onSearchChange}
        keyboardType="phone-pad"
        leadingIcon={<Icon name="search" size={18} color={colors.textTertiary} />}
      />

      {isSearching && !match ? <LoadingState className="mt-6" /> : null}

      {!isSearching && !match ? (
        <EmptyState
          className="mt-3"
          icon="person"
          variant="contained"
          title={search.trim() ? copy.empty.title : copy.prompt.title}
          description={search.trim() ? copy.empty.body : copy.prompt.body}
        />
      ) : null}

      {match ? (
        <>
          <View className="mt-3 flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.matchedLabel}
            </VemtapText>
          </View>

          <View className="mt-2 gap-3 rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-center gap-3">
              <BusinessInitialsAvatar
                initials={match.initials}
                size="lg"
                tone="brand"
                badgeIcon="verified"
              />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="headingSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {match.name}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {match.phone}
                </VemtapText>
                <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
                  <BusinessStatusPill label={match.tier} tone="brand" />
                  <BusinessStatusPill label={match.points} tone="success" />
                </View>
              </View>
            </View>
            <View className="flex-row gap-2">
              {match.stats.map(stat => (
                <View
                  key={stat.id}
                  className="min-w-0 flex-1 rounded-field bg-surface-subtle p-2"
                >
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {stat.label}
                  </VemtapText>
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {stat.value}
                  </VemtapText>
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {stat.note}
                  </VemtapText>
                </View>
              ))}
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {match.lastVisit}
            </VemtapText>
          </View>

          <BusinessPanel
            className="mt-3"
            title={copy.perksTitle}
            icon="localOffer"
            badge={copy.perksBadge(
              match.rewards.filter(reward => reward.affordable).length,
            )}
            badgeTone="success"
          >
            {match.rewards.length ? (
              <View className="gap-2">
                {match.rewards.map(reward => (
                  <View
                    key={reward.id}
                    className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5"
                  >
                    <BusinessIconWell
                      icon="loyalty"
                      tone={reward.affordable ? 'success' : 'neutral'}
                      size="sm"
                    />
                    <View className="min-w-0 flex-1">
                      <VemtapText
                        variant="labelSm"
                        className="font-sans-semibold"
                        numberOfLines={1}
                      >
                        {reward.title}
                      </VemtapText>
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
                        {reward.body}
                      </VemtapText>
                    </View>
                    <BusinessStatusPill
                      label={reward.badge}
                      tone={reward.affordable ? 'success' : 'neutral'}
                    />
                  </View>
                ))}
                <BusinessInlineAction
                  label={copy.rewardsCta}
                  icon="arrowForward"
                  onPress={onOpenRewards}
                />
              </View>
            ) : (
              <VemtapText variant="caption" tone="secondary">
                {copy.noRewards}
              </VemtapText>
            )}
          </BusinessPanel>

          <View className="mt-3 flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.receiptsCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onViewReceipts}
              />
            </View>
            {match.phone ? (
              <View className="min-w-0 flex-1">
                <Button
                  label={copy.whatsappCta}
                  labelVariant="labelSm"
                  variant="secondary"
                  onPress={onSendWhatsApp}
                />
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </BusinessScreenLayout>
  );
}
