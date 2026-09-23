import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(View, { className: 'style' });

export interface TwoColumnGridProps<T> {
  items: readonly T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
}

export function TwoColumnGrid<T>({
  items,
  keyExtractor,
  renderItem,
}: TwoColumnGridProps<T>) {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }

  return (
    <View className="flex-col gap-3">
      {rows.map(row => (
        <View key={keyExtractor(row[0])} className="flex-row gap-3">
          {row.map(item => (
            <View key={keyExtractor(item)} className="min-w-0 flex-1">
              {renderItem(item)}
            </View>
          ))}
          {row.length === 1 ? <View className="min-w-0 flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
