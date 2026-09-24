import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });

interface DetailActionDockBarProps {
  eyebrow: string;
  value: string;
  action: string;
  icon?: React.ReactNode;
  onAction: () => void;
}

export function DetailActionDockBar({
  eyebrow,
  value,
  action,
  icon,
  onAction,
}: DetailActionDockBarProps) {
  return (
    <SafeAreaView
      edges={['bottom']}
      className="border-t border-border bg-surface px-4 pt-3"
    >
      <View className="w-full max-w-screen flex-row items-center justify-between gap-3 self-center pb-2">
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="secondary">
            {eyebrow}
          </VemtapText>
          <VemtapText
            variant="headingSm"
            className="text-heading-sm text-text"
            numberOfLines={1}
          >
            {value}
          </VemtapText>
        </View>
        <Button
          label={action}
          fullWidth={false}
          className="min-h-12 shrink-0 px-5 shadow-md"
          leftIcon={
            icon ?? <Icon name="localActivity" size={20} color={colors.surface} />
          }
          onPress={onAction}
        />
      </View>
    </SafeAreaView>
  );
}
