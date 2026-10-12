import React, { useState, useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Button } from '@components/ui/Button';
import { strings } from '@constants/strings';

export interface CategoryReorderItem {
  id: string;
  name: string;
}

export interface CategoryReorderSheetProps {
  visible: boolean;
  categories: CategoryReorderItem[];
  onClose: () => void;
  onSubmit: (orderedIds: string[]) => void;
}

/**
 * Bottom sheet for reordering categories via up/down buttons.
 * Swaps are applied locally and submitted on each move (optimistic).
 */
export function CategoryReorderSheet({
  visible,
  categories,
  onClose,
  onSubmit,
}: CategoryReorderSheetProps) {
  const [localOrder, setLocalOrder] = useState<CategoryReorderItem[]>([]);

  useEffect(() => {
    if (visible) {
      setLocalOrder([...categories]);
    }
  }, [visible, categories]);

  const move = (index: number, delta: number) => {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= localOrder.length) return;
    const next = [...localOrder];
    const [moved] = next.splice(index, 1);
    next.splice(newIndex, 0, moved);
    setLocalOrder(next);
    onSubmit(next.map(c => c.id));
  };

  const reorderTitle = strings.servicesCategories.reorderLabel;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={reorderTitle}
    >
      <View className="px-6 pb-6">
        {localOrder.length === 0 ? (
          <Text className="text-center text-muted py-8" accessibilityLabel="No categories to reorder">
            No categories yet
          </Text>
        ) : (
          <View className="gap-2">
            {localOrder.map((category, index) => (
              <View
                key={category.id}
                className="flex-row items-center justify-between px-2 py-2"
              >
                <Text className="flex-1 text-lg" numberOfLines={1}>
                  {category.name}
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    disabled={index === 0}
                    onPress={() => move(index, -1)}
                    accessibilityLabel="Move up"
                    accessibilityRole="button"
                    testID={`moveUp:${category.id}`}
                  >
                    <Text className="text-xl" aria-hidden={true}>▲</Text>
                  </Pressable>
                  <Pressable
                    disabled={index === localOrder.length - 1}
                    onPress={() => move(index, 1)}
                    accessibilityLabel="Move down"
                    accessibilityRole="button"
                    testID={`moveDown:${category.id}`}
                  >
                    <Text className="text-xl" aria-hidden={true}>▼</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
        <View className="flex-row gap-3 mt-4">
          <Button
            label="Cancel"
            variant="outline"
            fullWidth={false}
            className="flex-1"
            onPress={onClose}
          />
          <Button
            label="Done"
            variant="primary"
            fullWidth={false}
            className="flex-1"
            onPress={onClose}
          />
        </View>
      </View>
    </BottomSheet>
  );
}