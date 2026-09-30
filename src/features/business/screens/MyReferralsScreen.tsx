import React, { useState } from 'react';
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
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  NetworkInfoBanner,
  NetworkPartnerRow,
} from '@features/business/components/BusinessNetworkPrimitives';
import {
  networkPartners,
  referrals,
  referralStatusLabel,
  referralStatusTone,
  type ReferralStatus,
} from '@features/business/data/businessNetworkData';

const copy = strings.myReferrals;

const filters: { id: ReferralStatus | 'all'; label: string; count?: string }[] = [
  { id: 'all', label: copy.filters.all, count: '11' },
  { id: 'verified', label: copy.filters.verified, count: copy.filterCounts.verified },
  { id: 'pending', label: copy.filters.pending, count: copy.filterCounts.pending },
  {
    id: 'registered',
    label: copy.filters.registered,
    count: copy.filterCounts.registered,
  },
  { id: 'invited', label: copy.filters.invited, count: copy.filterCounts.invited },
];

export interface MyReferralsScreenProps {
  onBack?: () => void;
  onOpenFilter?: () => void;
  onOpenProfile?: () => void;
  onApplyFilter?: (filterId: string) => void;
  onSearch?: (query: string) => void;
  onOpenReferral?: (referralId: string) => void;
  onInvite?: () => void;
}

/**
 * The merchant's referral directory: growth summary, tier status, status
 * filters, a searchable list of every referral with its verification state, and
 * the attributed-ledger note.
 */
export function MyReferralsScreen({
  onBack,
  onOpenFilter,
  onOpenProfile,
  onApplyFilter,
  onSearch,
  onOpenReferral,
  onInvite,
}: MyReferralsScreenProps) {
  const [filter, setFilter] = useState<string>('all');
  const [query] = useState('');

  const visible = referrals.filter(referral => {
    if (filter !== 'all' && referral.status !== filter) return false;
    if (query && !referral.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

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
      <View className="flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm">
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.growthTitle}
          </VemtapText>
          <View className="flex-row items-baseline gap-1.5">
            <VemtapText variant="headingLg" className="font-sans-bold" numberOfLines={1}>
              {copy.growthValue}
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
            {copy.growthTotal.replace('{total}', '11')}
          </VemtapText>
          <VemtapText
            variant="micro"
            className="text-badge-discount-text"
            numberOfLines={1}
          >
            {copy.growthConversion.replace('{percent}', '63')}
          </VemtapText>
        </View>
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
          <Icon name="hub" size={20} color={colors.primary} />
        </View>
      </View>

      <NetworkInfoBanner
        className="mt-3"
        icon="verifiedUser"
        title={copy.tierBadge}
        body={copy.tierRemaining.replace('{count}', '3')}
      />

      <BusinessChipScroller className="mt-3">
        {filters.map(item => (
          <BusinessCountChip
            key={item.id}
            label={item.label}
            count={item.count}
            selected={item.id === filter}
            onPress={() => {
              setFilter(item.id);
              onApplyFilter?.(item.id);
            }}
          />
        ))}
      </BusinessChipScroller>

      <BusinessSearchTrigger
        className="mt-3"
        placeholder={copy.searchPlaceholder}
        onPress={onSearch ? () => onSearch(query) : undefined}
        onFilterPress={onOpenFilter}
        filterLabel={copy.headerFilter}
      />

      <View className="mt-2 flex-row items-center justify-between gap-2 px-1">
        <VemtapText
          variant="caption"
          tone="secondary"
          className="min-w-0 flex-1"
          numberOfLines={1}
        >
          {copy.resultsLabel.replace('{count}', String(visible.length))}
        </VemtapText>
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="shrink-0"
          numberOfLines={1}
        >
          {`${networkPartners.length} synced`}
        </VemtapText>
      </View>

      <View className="mt-2 gap-2">
        {visible.map(referral => (
          <NetworkPartnerRow
            key={referral.id}
            name={referral.name}
            initials={referral.initials}
            subtitle={`${referral.district} • ${referral.category}`}
            meta={`${referral.joined} • ${referral.note}`}
            status={referralStatusLabel[referral.status]}
            statusTone={referralStatusTone[referral.status]}
            icon={referral.icon}
            chevron
            accessibilityLabel={`${referral.name} ${referral.refId}`}
            onPress={() => onOpenReferral?.(referral.id)}
          />
        ))}
      </View>

      {visible.length === 0 ? (
        <EmptyState
          icon="groupNetwork"
          variant="contained"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : null}

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

      <View className="mt-2 flex-row items-center justify-between gap-2">
        <BusinessStatusPill label={copy.growthVerified} tone="success" />
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="shrink-0"
          numberOfLines={1}
        >
          {copy.growthTotal.replace('{total}', '11')}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}
