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
  /**
   * Owns the horizontal gutter on the scroller. On by default so a chip row
   * never renders flush against the screen edge; pass `false` only when the
   * parent already pads the same 24pt (Home, inside its `px-6` content).
   */
  horizontalGutter?: boolean;
}

export function CategoryChips({
  categories,
  activeCategory,
  onChangeCategory,
  horizontalGutter = true,
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
      contentContainerClassName={cn(
        'items-center gap-2 py-1',
        horizontalGutter && 'px-6',
      )}
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
