import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(Pressable, { className: 'style' });

export interface CategoryChipsProps {
  categories: readonly string[];
  activeCategory?: string;
  onChangeCategory?: (category: string) => void;
}

export function CategoryChips({
  categories,
  activeCategory,
  onChangeCategory,
}: CategoryChipsProps) {
  const [internalActive, setInternalActive] = useState(categories[0] ?? '');
  const active = activeCategory ?? internalActive;

  const selectCategory = (category: string) => {
    if (activeCategory === undefined) {
      setInternalActive(category);
    }
    onChangeCategory?.(category);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-1"
      contentContainerClassName="items-center gap-2 py-1"
    >
      {categories.map(category => {
        const isActive = category === active;
        return (
          <Pressable
            key={category}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => selectCategory(category)}
            className={cn(
              'h-9 shrink-0 items-center justify-center rounded-full px-4 shadow-sm',
              isActive ? 'bg-primary-container' : 'bg-surface-container-lowest',
            )}
          >
            <VemtapText
              variant="labelMd"
              className={cn(
                isActive ? 'font-sans-semibold text-primary-foreground' : 'text-text',
              )}
            >
              {category}
            </VemtapText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
