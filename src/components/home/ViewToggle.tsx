import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export type DealsViewMode = 'list' | 'grid';

export interface ViewToggleProps {
  mode: DealsViewMode;
  onChange: (mode: DealsViewMode) => void;
  listLabel: string;
  gridLabel: string;
  /** sm = home w-7/h-7 · md = deals feed w-8/h-8 */
  size?: 'sm' | 'md';
}

export function ViewToggle({
  mode,
  onChange,
  listLabel,
  gridLabel,
  size = 'sm',
}: ViewToggleProps) {
  const btn = size === 'md' ? 'h-8 w-8' : 'h-7 w-7';

  return (
    <View className="flex-row items-center rounded-lg border border-border bg-surface-container-low p-0.5">
      <Pressable
        testID="deals-view-toggle-list"
        accessibilityRole="button"
        accessibilityLabel={listLabel}
        accessibilityState={{ selected: mode === 'list' }}
        onPress={() => onChange('list')}
        hitSlop={{ top: 8, right: 0, bottom: 8, left: 0 }}
        className={cn(
          btn,
          'items-center justify-center rounded-md shadow-xs',
          mode === 'list' ? 'bg-surface-canvas' : null,
        )}
      >
        <Icon
          name="listView"
          size={18}
          color={mode === 'list' ? colors.primary : colors.textTertiary}
        />
      </Pressable>
      <Pressable
        testID="deals-view-toggle-grid"
        accessibilityRole="button"
        accessibilityLabel={gridLabel}
        accessibilityState={{ selected: mode === 'grid' }}
        onPress={() => onChange('grid')}
        hitSlop={{ top: 8, right: 0, bottom: 8, left: 0 }}
        className={cn(
          btn,
          'items-center justify-center rounded-md shadow-xs',
          mode === 'grid' ? 'bg-surface-canvas' : null,
        )}
      >
        <Icon
          name="gridView"
          size={18}
          color={mode === 'grid' ? colors.primary : colors.textTertiary}
        />
      </Pressable>
    </View>
  );
}
