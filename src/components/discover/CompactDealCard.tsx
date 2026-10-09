import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { formatNaira, type UrbanDeal } from '@features/discover/data/urbanGrillData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

interface CompactDealCardProps {
  deal: UrbanDeal;
  onOpen: (dealId: string) => void;
}

export function CompactDealCard({ deal, onOpen }: CompactDealCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen(deal.id)}
      className="w-full flex-row gap-3 rounded-2xl border border-border bg-surface-canvas p-3.5 shadow-md active:scale-[0.99]"
    >
      <View className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-container">
        <Image
          source={{ uri: deal.imageUri }}
          accessibilityLabel={deal.imageAlt}
          className="h-full w-full"
          resizeMode="cover"
        />
        <View className="absolute left-1.5 top-1.5 rounded-md bg-badge-discount-bg px-1.5 py-0.5">
          <VemtapText className="font-sans-bold text-caption text-badge-discount-text">
            {deal.discount}
          </VemtapText>
        </View>
      </View>
      <View className="min-w-0 flex-1 justify-between py-0.5">
        <View className="min-w-0">
          <View className="flex-row items-center gap-1">
            <Icon name="schedule" size={14} color={colors.tertiary} />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {deal.timing}
            </VemtapText>
          </View>
          <VemtapText
            variant="labelMd"
            className="mt-1 font-sans-semibold text-text"
            numberOfLines={2}
          >
            {deal.title}
          </VemtapText>
        </View>
        <View className="mt-2 w-full flex-row items-center gap-2">
          <View className="min-w-0 flex-1">
            <VemtapText variant="headingSm" className="text-text">
              {formatNaira(deal.price)}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" className="line-through">
              {formatNaira(deal.originalPrice)}
            </VemtapText>
          </View>
          <View className="ml-auto shrink-0">
            <Button
              label={strings.urbanProfile.claim}
              size="sm"
              fullWidth={false}
              className="min-h-8 rounded-xl px-4 shadow-sm"
              onPress={() => onOpen(deal.id)}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
