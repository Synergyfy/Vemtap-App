import React, { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

export interface SecuritySettingRowProps {
  icon: IconName;
  title: string;
  subtitle: string;
  meta?: string;
  badge?: string;
  value?: string;
  switchInitialValue?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  last?: boolean;
}

export function SecuritySettingRow({
  icon,
  title,
  subtitle,
  meta,
  badge,
  value,
  switchInitialValue,
  onPress,
  onValueChange,
  last = false,
}: SecuritySettingRowProps) {
  const [enabled, setEnabled] = useState(switchInitialValue ?? false);
  const content = (
    <View className="min-w-0 flex-1">
      <View className="flex-row items-center gap-1.5">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {title}
        </VemtapText>
        {badge ? (
          <View className="rounded-full bg-badge-discount-bg px-1.5 py-0.5">
            <VemtapText variant="micro" tone="success">
              {badge}
            </VemtapText>
          </View>
        ) : null}
      </View>
      <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
        {subtitle}
      </VemtapText>
      {meta ? (
        <VemtapText variant="caption" tone="brand">
          {meta}
        </VemtapText>
      ) : null}
    </View>
  );

  return (
    <View
      className={`min-h-16 flex-row items-center gap-3 px-4 py-3 ${last ? '' : 'border-b border-border'}`}
    >
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          className="min-w-0 flex-1 flex-row items-center gap-3"
        >
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-field bg-surface-tint-blue">
            <Icon name={icon} size={22} color={colors.primary} />
          </View>
          {content}
          <View className="shrink-0 flex-row items-center gap-1">
            {value ? (
              <VemtapText variant="caption" tone="brand">
                {value}
              </VemtapText>
            ) : null}
            <Icon name="forward" size={20} color={colors.textTertiary} />
          </View>
        </Pressable>
      ) : (
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-field bg-surface-tint-blue">
            <Icon name={icon} size={22} color={colors.primary} />
          </View>
          {content}
          {switchInitialValue !== undefined ? (
            <Switch
              accessibilityRole="switch"
              accessibilityLabel={title}
              value={enabled}
              onValueChange={next => {
                setEnabled(next);
                onValueChange?.(next);
              }}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={colors.surface}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}
