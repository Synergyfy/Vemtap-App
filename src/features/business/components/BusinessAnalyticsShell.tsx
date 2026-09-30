import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { strings } from '@constants/strings';
import {
  BusinessScreenLayout,
  type BusinessHeaderProps,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessAnalyticsNav,
  BusinessDateRange,
  businessAnalyticsTabs,
} from '@features/business/components/BusinessAnalyticsPrimitives';

const { actions } = strings.businessIntelligence;

export interface BusinessAnalyticsShellProps {
  /** Screen title shown in the header. */
  title: string;
  header?: Partial<BusinessHeaderProps>;
  /** Active analytics surface key (business · customers · deals · locations · pos). */
  tab: string;
  onTabChange: (key: string) => void;
  range: string;
  onRangeChange: (value: string) => void;
  onBack?: () => void;
  onMoreOptions?: () => void;
  onOpenFilters?: () => void;
  onExport?: () => void;
  /** Renders under the nav strip, before the date range (e.g. a scope banner). */
  banner?: ReactNode;
  children: ReactNode;
}

/**
 * Shared chrome for every VEMTAP Intelligence surface: header, the five-way
 * analytics nav (Business · Customers · Deals · Locations · POS), the date-range
 * scroller and the Filter/Export actions. The five analytics screens are thin
 * compositions on top of this so they can never disagree on their chrome.
 */
export function BusinessAnalyticsShell({
  title,
  header,
  tab,
  onTabChange,
  range,
  onRangeChange,
  onBack,
  onMoreOptions,
  onOpenFilters,
  onExport,
  banner,
  children,
}: BusinessAnalyticsShellProps) {
  return (
    <BusinessScreenLayout
      header={{
        title,
        onBack: onBack ?? (() => undefined),
        actionLabel: actions.more,
        onAction: onMoreOptions,
        showAvatar: true,
        ...header,
      }}
      contentContainerClassName="pb-8"
    >
      {banner}
      <BusinessAnalyticsNav
        tabs={businessAnalyticsTabs}
        value={tab}
        onChange={onTabChange}
        activeMarker="dot"
      />
      <View className="mt-3 flex-row items-center gap-2">
        <BusinessDateRange
          value={range}
          options={strings.businessIntelligence.dateRanges}
          onChange={onRangeChange}
          className="min-w-0 flex-1"
        />
        {onOpenFilters ? (
          <Button
            label={actions.filters}
            labelVariant="labelSm"
            variant="secondary"
            size="sm"
            fullWidth={false}
            onPress={onOpenFilters}
            leftIcon={<Icon name="tune" size={15} color={undefined} />}
          />
        ) : null}
        {onExport ? (
          <Button
            label={actions.export}
            labelVariant="labelSm"
            variant="secondary"
            size="sm"
            fullWidth={false}
            onPress={onExport}
            leftIcon={<Icon name="download" size={15} color={undefined} />}
          />
        ) : null}
      </View>
      {children}
    </BusinessScreenLayout>
  );
}
