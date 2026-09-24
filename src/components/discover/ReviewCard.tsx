import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });

interface ReviewCardProps {
  name: string;
  meta: string;
  review: string;
}

export function ReviewCard({ name, meta, review }: ReviewCardProps) {
  return (
    <View className="gap-2 rounded-2xl border border-border bg-surface-canvas p-3.5 shadow-md">
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-container">
            <Icon name="person" size={18} color={colors.primary} />
          </View>
          <View className="min-w-0">
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              {name}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {meta}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row gap-0.5">
          {[1, 2, 3, 4, 5].map(star => (
            <Icon key={star} name="star" size={14} color={colors.tertiary} />
          ))}
        </View>
      </View>
      <VemtapText variant="bodyMd" tone="secondary">
        {review}
      </VemtapText>
    </View>
  );
}
