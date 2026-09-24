import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface SectionHeaderProps {
  title: string;
  badge?: string;
  emoji?: string;
  seeAllLabel: string;
  onSeeAll?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function SectionHeader({
  title,
  badge,
  emoji,
  seeAllLabel,
  onSeeAll,
  className,
  children,
}: SectionHeaderProps) {
  return (
    <View
      accessibilityRole="header"
      className={cn('flex-row items-center justify-between gap-2', className)}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
        <VemtapText variant="headingSm" className="truncate text-text" numberOfLines={1}>
          {title}
        </VemtapText>
        {badge ? (
          <View className="shrink-0 rounded-full bg-primary-fixed px-2 py-0.5">
            <VemtapText className="font-sans-semibold text-caption text-primary">
              {badge}
            </VemtapText>
          </View>
        ) : null}
        {emoji ? <VemtapText className="text-body-md">{emoji}</VemtapText> : null}
      </View>
      <View className="shrink-0 flex-row items-center gap-2.5">
        {children}
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${seeAllLabel} ${title}`}
          disabled={!onSeeAll}
          onPress={onSeeAll}
          className="min-h-11 justify-center"
        >
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-label-md text-primary"
          >
            {seeAllLabel}
          </VemtapText>
        </Pressable>
      </View>
    </View>
  );
}
