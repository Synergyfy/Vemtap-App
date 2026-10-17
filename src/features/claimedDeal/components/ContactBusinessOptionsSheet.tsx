import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export type ContactOptionProps = {
  icon: IconName;
  title: string;
  description: string;
  recommended?: string;
  onPress: () => void;
};

export function ContactOption({
  icon,
  title,
  description,
  recommended,
  onPress,
}: ContactOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="w-full flex-row items-center justify-between rounded-xl border border-border bg-surface-subtle p-3 active:border-border-active active:bg-surface-container-high"
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-tint">
          <Icon name={icon} size={22} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              {title}
            </VemtapText>
            {recommended ? (
              <View className="rounded-full bg-primary px-1.5 py-0.5">
                <VemtapText className="font-sans-semibold text-caption uppercase text-primary-foreground">
                  {recommended}
                </VemtapText>
              </View>
            ) : null}
          </View>
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {description}
          </VemtapText>
        </View>
      </View>
      <Icon name="forward" size={20} color={colors.textTertiary} />
    </Pressable>
  );
}
