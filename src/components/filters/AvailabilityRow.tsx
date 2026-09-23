import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface AvailabilityRowProps {
  icon: IconName;
  title: string;
  subtitle: string;
  selected: boolean;
  onToggle: () => void;
}

export function AvailabilityRow({
  icon,
  title,
  subtitle,
  selected,
  onToggle,
}: AvailabilityRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={title}
      onPress={onToggle}
      className="flex-row items-center justify-between rounded-xl bg-surface-canvas p-3 shadow-sm active:scale-[0.99]"
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View
          className={cn(
            'h-10 w-10 items-center justify-center rounded-full',
            selected ? 'bg-surface-tint-blue' : 'bg-surface-container',
          )}
        >
          <Icon
            name={icon}
            size={20}
            color={selected ? colors.primary : colors.textSecondary}
          />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText className="font-sans-semibold text-label-md text-text">
            {title}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </VemtapText>
        </View>
      </View>
      <View
        className={cn(
          'h-6 w-6 items-center justify-center rounded-md',
          selected ? 'bg-primary-container' : 'bg-surface-container',
        )}
      >
        <Icon name="check" size={18} color={selected ? '#FFFFFF' : 'transparent'} />
      </View>
    </Pressable>
  );
}
