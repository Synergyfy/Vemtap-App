import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';

cssInterop(Pressable, { className: 'style' });

const copy = strings.servicesCategories;

export interface CategoryManagementRow {
  id: string;
  title: string;
  count: string;
  type: string;
  accent: 'brand' | 'neutral' | 'tertiary';
  icon: string;
}

const categoryAccent: Record<CategoryManagementRow['accent'], string> = {
  brand: 'bg-surface-tint',
  neutral: 'bg-surface-container',
  tertiary: 'bg-tertiary-fixed',
};

const categoryAccentIcon: Record<CategoryManagementRow['accent'], string> = {
  brand: colors.primary,
  neutral: colors.secondary,
  tertiary: colors.tertiaryContainer,
};

export interface CatalogueCategoryRowProps {
  category: CategoryManagementRow;
  /** Each action renders only when its handler is supplied. */
  onReorder?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
}

/**
 * One catalogue category: accent icon, title, item-count badge and type, with
 * optional reorder / edit / archive actions. Shared by the Services &
 * Categories manager and the Central Catalogue's Categories tab.
 */
export function CatalogueCategoryRow({
  category,
  onReorder,
  onEdit,
  onArchive,
}: CatalogueCategoryRowProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm">
      {onReorder ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${copy.reorderLabel} ${category.title}`}
          onPress={onReorder}
          hitSlop={6}
          className="shrink-0 rounded-lg p-1 active:bg-surface-subtle"
        >
          <Icon name="drag" size={19} color={colors.textTertiary} />
        </Pressable>
      ) : null}
      <View
        className={`h-9 w-9 shrink-0 items-center justify-center rounded-lg ${categoryAccent[category.accent]}`}
      >
        <Icon
          name={category.icon as IconName}
          size={19}
          color={categoryAccentIcon[category.accent]}
        />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {category.title}
        </VemtapText>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          {category.count ? (
            <>
              <View className="rounded bg-surface-container px-1.5 py-0.5">
                <VemtapText variant="micro" tone="secondary">
                  {category.count}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="tertiary">
                •
              </VemtapText>
            </>
          ) : null}
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {category.type}
          </VemtapText>
        </View>
      </View>
      {onEdit || onArchive ? (
        <View className="shrink-0 flex-row items-center">
          {onEdit ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${copy.editLabel} ${category.title}`}
              hitSlop={8}
              onPress={onEdit}
              className="min-h-9 justify-center px-2"
            >
              <VemtapText variant="labelSm" className="font-sans-medium text-primary">
                {copy.editLabel}
              </VemtapText>
            </Pressable>
          ) : null}
          {onArchive ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${copy.archiveLabel} ${category.title}`}
              hitSlop={8}
              onPress={onArchive}
              className="min-h-9 justify-center px-2"
            >
              <VemtapText variant="labelSm" tone="secondary">
                {copy.archiveLabel}
              </VemtapText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
