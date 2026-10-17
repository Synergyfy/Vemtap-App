import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { EmptyState } from '@components/shared';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import type { RedemptionFeedRowView } from '@features/business/utils/loyaltyMappers';

cssInterop(View, { className: 'style' });

const copy = strings.loyaltyRewards;

export interface BusinessPointFeedProps {
  /** Rows straight from the point ledger, newest first. */
  rows: readonly RedemptionFeedRowView[];
}

/**
 * Recent point movements — the "Recent Member Redemptions" list on the rewards
 * catalogue and the Activity tab on the programme screen are the same ledger
 * (`GET /loyalty/points/business-logs`) in two places, so they share this row
 * treatment and the same empty wording rather than drifting apart.
 *
 * The ledger is OWNER/ADMIN only, so an empty list is a legitimate answer for a
 * manager: the panel says nothing has happened yet instead of surfacing a 403
 * they cannot act on.
 */
export function BusinessPointFeed({ rows }: BusinessPointFeedProps) {
  if (!rows.length) {
    return (
      <EmptyState
        variant="contained"
        title={copy.feedEmptyTitle}
        description={copy.feedEmptyBody}
      />
    );
  }

  return (
    <View className="gap-1">
      {rows.map(row => (
        <View key={row.id} className="flex-row items-center gap-3 py-1">
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {row.initials}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" numberOfLines={1}>
              {row.name}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone={row.positive ? 'brand' : 'secondary'}
              numberOfLines={1}
            >
              {row.detail}
            </VemtapText>
          </View>
          <VemtapText variant="caption" tone="tertiary" className="shrink-0">
            {row.when}
          </VemtapText>
        </View>
      ))}
    </View>
  );
}
