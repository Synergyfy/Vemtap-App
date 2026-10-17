import React from 'react';
import { ErrorState, LoadingState } from '@components/shared';
import { Input } from '@components/ui/Input';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  NetworkInfoBanner,
  NetworkPartnerRow,
} from '@features/business/components/BusinessNetworkPrimitives';
import type { ReferralStatusFilter } from '@api/businessNetworkApi';
import type { ReferralsView } from '@features/business/utils/networkMappers';

const copy = strings.myReferrals;

export interface MyReferralsScreenProps {
  view?: ReferralsView;
  isError?: boolean;
  onRetry?: () => void;
  filter?: ReferralStatusFilter;
  search?: string;
  onChangeSearch?: (value: string) => void;
  onBack?: () => void;
  onOpenFilter?: () => void;
  onOpenProfile?: () => void;
  onApplyFilter?: (filterId: ReferralStatusFilter) => void;
  onOpenReferral?: (referralId: string) => void;
  onInvite?: () => void;
}

/**
 * The merchant's referral directory: growth summary, tier status, status
 * filters, a searchable list of every referral with its verification state, and
 * the attributed-ledger note.
 */
export function MyReferralsScreen({
  view,
  isError,
  onRetry,
  filter = 'all',
  search = '',
  onChangeSearch,
  onBack,
  onOpenFilter,
  onOpenProfile,
  onApplyFilter,
  onOpenReferral,
  onInvite,
}: MyReferralsScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'tune', label: copy.headerFilter, onPress: onOpenFilter },
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.inviteCta}
            labelVariant="labelMd"
            onPress={onInvite}
            leftIcon={<Icon name="personAdd" size={18} color={colors.surface} />}
          />
        </BusinessActionDock>
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
          <View className="flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm">
            <View className="min-w-0 flex-1">
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {copy.growthTitle}
              </VemtapText>
              <View className="flex-row items-baseline gap-1.5">
                <VemtapText
                  variant="headingLg"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {view.verified}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold text-badge-discount-text"
                  numberOfLines={1}
                >
                  {copy.growthVerified}
                </VemtapText>
              </View>
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {view.totalLine}
              </VemtapText>
              <VemtapText
                variant="micro"
                className="text-badge-discount-text"
                numberOfLines={1}
              >
                {view.conversion}
              </VemtapText>
            </View>
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
              <Icon name="hub" size={20} color={colors.primary} />
            </View>
          </View>

          <NetworkInfoBanner
            className="mt-3"
            icon="verifiedUser"
            title={copy.growthTitle}
            body={view.tierLine}
          />

          <BusinessChipScroller className="mt-3">
            {view.filters.map(item => (
              <BusinessCountChip
                key={item.key}
                label={item.label}
                count={item.count}
                selected={item.key === filter}
                onPress={() => onApplyFilter?.(item.key)}
              />
            ))}
          </BusinessChipScroller>

          <Input
            containerClassName="mt-3"
            value={search}
            onChangeText={value => onChangeSearch?.(value)}
            placeholder={copy.searchPlaceholder}
            accessibilityLabel={copy.searchLabel}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View className="mt-2 flex-row items-center justify-between gap-2 px-1">
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {view.results}
            </VemtapText>
          </View>

          <View className="mt-2 gap-2">
            {view.rows.map(referral => (
              <NetworkPartnerRow
                key={referral.id}
                name={referral.name}
                initials={referral.initials}
                subtitle={referral.subtitle}
                meta={referral.meta}
                status={referral.status}
                statusTone={referral.tone}
                icon={referral.icon}
                accessibilityLabel={referral.name}
                onPress={() => onOpenReferral?.(referral.id)}
              />
            ))}
          </View>

          {view.rows.length === 0 ? (
            <EmptyState
              icon="groupNetwork"
              variant="contained"
              title={copy.empty.title}
              description={copy.empty.body}
            />
          ) : null}
        </>
      )}

      <View className="mt-3 flex-row items-start gap-2 rounded-field bg-surface-subtle p-2.5">
        <Icon name="verifiedUser" size={14} color={colors.textTertiary} />
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" className="font-sans-semibold" numberOfLines={2}>
            {copy.ledgerTitle}
          </VemtapText>
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="mt-0.5"
            numberOfLines={3}
          >
            {copy.ledgerBody}
          </VemtapText>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}
