import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });

export interface TwoColumnGridProps<T> {
  items: readonly T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  /** Extra spacing above the grid (e.g. under a section heading). */
  className?: string;
}

export function TwoColumnGrid<T>({
  items,
  keyExtractor,
  renderItem,
  className,
}: TwoColumnGridProps<T>) {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }

  return (
    <View className={cn('flex-col gap-3', className)}>
      {rows.map(row => (
        <View key={keyExtractor(row[0])} className="flex-row items-start gap-3">
          {row.map(item => (
            <View key={keyExtractor(item)} className="min-w-0 flex-1 self-start">
              {renderItem(item)}
            </View>
          ))}
          {row.length === 1 ? <View className="min-w-0 flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
