import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';
import { ViewToggle, type DealsViewMode } from '@components/home/ViewToggle';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });

export interface DealsResultsRowProps {
  mode: DealsViewMode;
  onChangeMode: (mode: DealsViewMode) => void;
  variant: 'featured' | 'standard';
  count: number;
  countLabel?: string;
}

export function DealsResultsRow({
  mode,
  onChangeMode,
  variant,
  count,
  countLabel,
}: DealsResultsRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-2">
      {variant === 'featured' ? (
        <View className="min-w-0 flex-1 flex-row flex-wrap items-baseline gap-1.5">
          <VemtapText
            variant="labelMd"
            className="font-sans-bold text-text"
            numberOfLines={1}
          >
            {strings.deals.dealsInTitle(strings.deals.location)}
          </VemtapText>
          <VemtapText className="font-sans-medium text-caption text-text-tertiary">
            {countLabel ?? strings.deals.dealsInCount(count)}
          </VemtapText>
        </View>
      ) : (
        <VemtapText variant="labelSm" tone="secondary" className="font-sans-medium">
          {strings.deals.showingDeals(count)}
        </VemtapText>
      )}
      <ViewToggle
        mode={mode}
        onChange={onChangeMode}
        listLabel={strings.deals.listView}
        gridLabel={strings.deals.gridView}
        size="md"
      />
    </View>
  );
}
